"""In-memory async job handling for debate execution."""

from __future__ import annotations

import asyncio
import logging
import os
from datetime import datetime, timedelta, timezone
from typing import Any, Dict, List, Optional
from uuid import uuid4

from pydantic import BaseModel, Field

from app.agents.country_agent import CountryAgent
from app.agents.judge_agent import JudgeAgent
from app.agents.moderator_agent import ModeratorAgent
from app.core.countries import COUNTRY_PROFILES
from app.core.orchestrator import DebateOrchestrator
from app.core.timeout import OperationTimeoutError, run_with_timeout
from app.llm.llm_client import LLMClient
from app.memory.state_store import DebateState


logger = logging.getLogger(__name__)


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class DebateJob(BaseModel):
    job_id: str
    topic: str
    countries: List[str]
    status: str
    phase: str = "queued"
    progress: float = 0.0
    created_at: datetime = Field(default_factory=utcnow)
    updated_at: datetime = Field(default_factory=utcnow)
    completed_at: Optional[datetime] = None
    history: List[Dict[str, Any]] = Field(default_factory=list)
    final_state: Optional[Dict[str, Any]] = None
    error: Optional[str] = None
    logs: List[str] = Field(default_factory=list)


class DebateJobManager:
    """Tracks async debate jobs in-memory."""

    def __init__(self) -> None:
        self.jobs: Dict[str, DebateJob] = {}
        self.tasks: Dict[str, asyncio.Task] = {}
        self.lock = asyncio.Lock()
        self.latest_job_id: Optional[str] = None
        self.job_timeout_seconds = float(os.getenv("DEBATE_JOB_TIMEOUT_SECONDS", "45"))
        self.step_timeout_seconds = float(os.getenv("DEBATE_STEP_TIMEOUT_SECONDS", "15"))
        self.max_rebuttal_rounds = int(os.getenv("DEBATE_MAX_REBUTTAL_ROUNDS", "2"))
        self.max_agent_steps = int(os.getenv("DEBATE_MAX_AGENT_STEPS", "24"))
        self.job_retention_minutes = int(os.getenv("DEBATE_JOB_RETENTION_MINUTES", "30"))

    async def create_job(self, topic: str, countries: List[str]) -> DebateJob:
        job = DebateJob(
            job_id=f"debate_{uuid4().hex[:12]}",
            topic=topic,
            countries=countries,
            status="queued",
        )
        async with self.lock:
            self.jobs[job.job_id] = job
            self.latest_job_id = job.job_id
        logger.info("Created debate job %s", job.job_id)
        return job

    async def start_job(self, job_id: str) -> None:
        task = asyncio.create_task(self._run_job(job_id), name=f"debate-job-{job_id}")
        async with self.lock:
            self.tasks[job_id] = task

    async def _append_log(self, job_id: str, message: str) -> None:
        async with self.lock:
            job = self.jobs[job_id]
            timestamp = utcnow().isoformat(timespec="seconds")
            job.logs.append(f"{timestamp} {message}")
            job.updated_at = utcnow()
            if len(job.logs) > 100:
                job.logs = job.logs[-100:]

    async def _update_job(self, job_id: str, **updates: Any) -> DebateJob:
        async with self.lock:
            job = self.jobs[job_id]
            for key, value in updates.items():
                setattr(job, key, value)
            job.updated_at = utcnow()
            return job

    async def handle_orchestrator_event(self, job_id: str, event_name: str, payload: Dict[str, object]) -> None:
        phase = str(payload.get("phase") or payload.get("agent") or event_name)
        progress_map = {
            "queued": 0.05,
            "opening": 0.2,
            "rebuttal-1": 0.4,
            "rebuttal-2": 0.6,
            "resolution": 0.78,
            "voting": 0.88,
            "judging": 0.96,
        }

        if event_name == "agent_completed":
            content = str(payload.get("content") or "")
            agent = str(payload.get("agent") or "Unknown")
            phase = str(payload.get("phase") or "message")
            async with self.lock:
                job = self.jobs[job_id]
                job.history.append(
                    {
                        "agent": agent,
                        "country": agent,
                        "role": phase,
                        "phase": phase,
                        "content": content,
                        "round": len(job.history) + 1,
                        "flag": COUNTRY_PROFILES.get(agent, {}).get("flag", "🌍"),
                        "color": COUNTRY_PROFILES.get(agent, {}).get("color", "#38bdf8"),
                    }
                )
                job.phase = phase
                job.progress = max(job.progress, progress_map.get(phase, job.progress))
                job.updated_at = utcnow()
            await self._append_log(job_id, f"{agent} completed {phase}")
            return

        job = await self.get_job(job_id)
        current_progress = job.progress if job else 0.0
        await self._update_job(
            job_id,
            phase=phase,
            progress=max(progress_map.get(phase, 0.1), current_progress),
            status="running" if event_name != "debate_completed" else "completed",
        )
        await self._append_log(job_id, f"{event_name}: {phase}")

    async def _run_job(self, job_id: str) -> None:
        llm: Optional[LLMClient] = None
        try:
            job = await self._update_job(job_id, status="running", phase="initializing", progress=0.05, error=None)
            await self._append_log(job_id, "Initializing debate job")

            llm = LLMClient()
            agents = [
                CountryAgent(COUNTRY_PROFILES.get(country, {"name": country}), llm)
                for country in job.countries
            ]
            moderator = ModeratorAgent(llm)
            judge = JudgeAgent(llm)
            state = DebateState(topic=job.topic, countries=job.countries, current_round="opening")

            orchestrator = DebateOrchestrator(
                agents=agents,
                moderator=moderator,
                judge=judge,
                state=state,
                max_rebuttal_rounds=self.max_rebuttal_rounds,
                step_timeout_seconds=self.step_timeout_seconds,
                max_agent_steps=self.max_agent_steps,
                event_callback=lambda event_name, payload: self.handle_orchestrator_event(
                    job_id, event_name, payload
                ),
            )
            orchestrator.initialize_debate(job.topic, job.countries)

            final_state = await run_with_timeout(
                orchestrator.run_full_debate(),
                timeout_seconds=self.job_timeout_seconds,
                operation_name=f"debate-job:{job_id}",
                logger=logger,
            )

            result = {
                "success": True,
                "history": list(self.jobs[job_id].history),
                "final_state": {
                    "resolution": final_state.resolution,
                    "judgement": final_state.judgement,
                    "votes": final_state.votes,
                    "topic": final_state.topic,
                },
            }
            await self._update_job(
                job_id,
                status="completed",
                phase="completed",
                progress=1.0,
                completed_at=utcnow(),
                final_state=result["final_state"],
            )
            await self._append_log(job_id, "Debate job completed successfully")
        except OperationTimeoutError as exc:
            await self._update_job(
                job_id,
                status="timed_out",
                phase="timed_out",
                completed_at=utcnow(),
                error=str(exc),
            )
            await self._append_log(job_id, f"Job timed out: {exc}")
            logger.error("Debate job %s timed out: %s", job_id, exc)
        except Exception as exc:
            await self._update_job(
                job_id,
                status="failed",
                phase="failed",
                completed_at=utcnow(),
                error=str(exc),
            )
            await self._append_log(job_id, f"Job failed: {exc}")
            logger.exception("Debate job %s failed", job_id)
        finally:
            if llm is not None:
                await llm.aclose()
            async with self.lock:
                self.tasks.pop(job_id, None)
            await self.cleanup_expired_jobs()

    async def cleanup_expired_jobs(self) -> None:
        cutoff = utcnow() - timedelta(minutes=self.job_retention_minutes)
        async with self.lock:
            expired_ids = [
                job_id
                for job_id, job in self.jobs.items()
                if job.completed_at is not None and job.completed_at < cutoff
            ]
            for job_id in expired_ids:
                self.jobs.pop(job_id, None)
                self.tasks.pop(job_id, None)

    async def get_job(self, job_id: str) -> Optional[DebateJob]:
        async with self.lock:
            job = self.jobs.get(job_id)
            return job.model_copy(deep=True) if job else None

    async def get_latest_job(self) -> Optional[DebateJob]:
        async with self.lock:
            if self.latest_job_id is None:
                return None
            job = self.jobs.get(self.latest_job_id)
            return job.model_copy(deep=True) if job else None


debate_job_manager = DebateJobManager()
