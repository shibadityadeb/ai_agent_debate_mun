import asyncio
import logging
import os
import random
from typing import TYPE_CHECKING, Awaitable, Callable, Dict, List, Optional

from app.agents.country_agent import CountryAgent
from app.agents.judge_agent import JudgeAgent
from app.agents.moderator_agent import ModeratorAgent
from app.core.timeout import OperationTimeoutError, run_with_timeout
from app.memory.context_builder import build_context
from app.memory.state_store import DebateMessage, DebateState

if TYPE_CHECKING:
    from app.mcp.retriever import Retriever


logger = logging.getLogger(__name__)


class DebateOrchestrator:
    def __init__(
        self,
        agents: List[CountryAgent],
        moderator: ModeratorAgent,
        judge: JudgeAgent,
        state: DebateState,
        retriever: Optional[Retriever] = None,
        max_rebuttal_rounds: int = 2,
        step_timeout_seconds: float = 20.0,
        max_agent_steps: Optional[int] = None,
        event_callback: Optional[Callable[[str, Dict[str, object]], Awaitable[None] | None]] = None,
    ):
        self.agents = agents
        self.moderator = moderator
        self.judge = judge
        self.state = state
        self.logger = logger
        retrieval_enabled = os.getenv("ENABLE_TOPIC_RETRIEVAL", "false").lower() == "true"
        if retriever is not None:
            self.retriever = retriever
        elif retrieval_enabled:
            from app.mcp.retriever import Retriever

            self.retriever = Retriever()
        else:
            self.retriever = None
        self.max_rebuttal_rounds = max(0, int(max_rebuttal_rounds))
        self.step_timeout_seconds = max(1.0, float(step_timeout_seconds))
        default_agent_steps = len(self.agents) * (1 + self.max_rebuttal_rounds) + 2
        self.max_agent_steps = max(default_agent_steps, int(max_agent_steps or default_agent_steps))
        self.event_callback = event_callback
        self.completed_agent_steps = 0

        if self.moderator is None:
            raise ValueError("Moderator agent must be initialized")
        if self.judge is None:
            raise ValueError("Judge agent must be initialized")

    def initialize_debate(self, topic: str, countries: List[str]) -> None:
        """Initialize debate state."""
        self.state.topic = topic
        self.state.countries = list(countries)
        self.state.current_round = "opening"
        self.state.history = []
        self.state.resolution = None
        self.state.judgement = None
        self.state.votes = {}
        self.completed_agent_steps = 0

    async def _emit(self, event_name: str, payload: Dict[str, object]) -> None:
        if self.event_callback is None:
            return
        result = self.event_callback(event_name, payload)
        if asyncio.iscoroutine(result):
            await result

    def _reserve_step(self, actor_name: str, phase: str) -> None:
        self.completed_agent_steps += 1
        if self.completed_agent_steps > self.max_agent_steps:
            raise RuntimeError(
                f"Agent step budget exceeded at {actor_name}:{phase}. "
                f"Max allowed steps: {self.max_agent_steps}"
            )

    async def _ask_agent(self, agent, context: str):
        result = agent.act(context)
        if asyncio.iscoroutine(result):
            result = await run_with_timeout(
                result,
                timeout_seconds=self.step_timeout_seconds,
                operation_name=f"{agent.name}:{self.state.current_round}",
                logger=self.logger,
            )
        return result

    def _normalize_response(self, response) -> str:
        if isinstance(response, dict):
            return response.get("content") or response.get("text") or str(response)
        return str(response)

    async def _generate_agent_message(
        self,
        agent: CountryAgent,
        phase: str,
        retrieved_context: str = "",
        persist: bool = True,
    ) -> str:
        """Generate a single agent message and optionally store it."""
        self._reserve_step(agent.name, phase)
        self.logger.info("Generating agent message", extra={"agent": agent.name, "phase": phase})
        await self._emit("agent_started", {"agent": agent.name, "phase": phase})
        context = build_context(
            self.state,
            agent.name,
            phase,
            retrieved_context=retrieved_context,
        )
        try:
            response = await self._ask_agent(agent, context)
            text = self._normalize_response(response)
        except OperationTimeoutError as exc:
            self.logger.warning(
                "Agent timed out",
                extra={"agent": agent.name, "phase": phase, "error": str(exc)},
            )
            text = f"[Timed out after {self.step_timeout_seconds:.0f}s while generating {phase}]"
        except Exception as exc:
            self.logger.exception(
                "Agent failed",
                extra={"agent": agent.name, "phase": phase},
            )
            text = f"[Generation failed during {phase}: {exc}]"

        self.logger.info(
            "Agent message generated",
            extra={"agent": agent.name, "phase": phase, "preview": text[:120]},
        )
        if persist:
            self.state.history.append(DebateMessage(agent=agent.name, role=phase, content=text))
        await self._emit(
            "agent_completed",
            {"agent": agent.name, "phase": phase, "content": text, "history_size": len(self.state.history)},
        )
        return text

    async def run_opening_round(self) -> None:
        """Run opening statements in parallel to reduce latency."""
        self.state.current_round = "opening"
        await self._emit("phase_started", {"phase": "opening"})
        retrieved_context = self.retriever.get_context(self.state.topic) if self.retriever else ""

        responses = await asyncio.gather(
            *[
                self._generate_agent_message(agent, "opening", retrieved_context, persist=False)
                for agent in self.agents
            ]
        )

        for agent, text in zip(self.agents, responses):
            self.state.history.append(DebateMessage(agent=agent.name, role="opening", content=text))
        await self._emit("phase_completed", {"phase": "opening", "history_size": len(self.state.history)})

    async def run_rebuttal_round(self, rounds: int = 1) -> None:
        """Run rebuttal rounds sequentially so each agent sees prior responses."""
        retrieved_context = self.retriever.get_context(self.state.topic) if self.retriever else ""

        for round_index in range(rounds):
            phase = f"rebuttal-{round_index + 1}"
            self.state.current_round = phase
            self.logger.info("Starting rebuttal round", extra={"phase": phase})
            await self._emit("phase_started", {"phase": phase})

            for agent in self.agents:
                await self._generate_agent_message(agent, phase, retrieved_context)
            await self._emit("phase_completed", {"phase": phase, "history_size": len(self.state.history)})

    async def run_resolution_phase(self) -> None:
        """Generate final resolution from moderator."""
        self.state.current_round = "resolution"
        self._reserve_step(self.moderator.name, "resolution")
        self.logger.info("Running moderator phase")
        await self._emit("phase_started", {"phase": "resolution"})
        retrieved_context = self.retriever.get_context(self.state.topic) if self.retriever else ""
        context = build_context(
            self.state,
            "moderator",
            "resolution",
            retrieved_context=retrieved_context,
        )
        try:
            response = await run_with_timeout(
                self.moderator.act(context),
                timeout_seconds=self.step_timeout_seconds,
                operation_name="moderator:resolution",
                logger=self.logger,
            )
            text = self._normalize_response(response)
        except OperationTimeoutError:
            text = f"[Moderator timed out after {self.step_timeout_seconds:.0f}s]"
        except Exception as exc:
            self.logger.exception("Moderator failed during resolution")
            text = f"[Moderator failed during resolution: {exc}]"

        self.state.resolution = text
        self.state.history.append(DebateMessage(agent="Moderator", role="resolution", content=text))
        self.logger.info("Moderator resolution generated", extra={"preview": text[:120]})
        await self._emit(
            "agent_completed",
            {"agent": "Moderator", "phase": "resolution", "content": text, "history_size": len(self.state.history)},
        )
        await self._emit("phase_completed", {"phase": "resolution", "history_size": len(self.state.history)})

    async def run_voting_phase(self) -> None:
        """Each agent votes yes/no/abstain on the resolution."""
        self.state.current_round = "voting"
        await self._emit("phase_started", {"phase": "voting"})
        voted: Dict[str, str] = {}

        for agent in self.agents:
            choice = random.choice(["yes", "no", "abstain"])
            voted[agent.name] = choice
            self.state.history.append(DebateMessage(agent=agent.name, role="vote", content=choice))
            self.logger.info("Vote recorded", extra={"agent": agent.name, "vote": choice})
            await self._emit(
                "agent_completed",
                {"agent": agent.name, "phase": "vote", "content": choice, "history_size": len(self.state.history)},
            )

        self.state.votes = voted
        await self._emit("phase_completed", {"phase": "voting", "history_size": len(self.state.history)})

    async def run_judging_phase(self) -> Dict[str, str]:
        """Judge evaluates the debate and returns score and reasoning."""
        self.state.current_round = "judging"
        self._reserve_step(self.judge.name, "judging")
        self.logger.info("Running judging phase")
        await self._emit("phase_started", {"phase": "judging"})
        retrieved_context = self.retriever.get_context(self.state.topic) if self.retriever else ""
        context = build_context(
            self.state,
            "judge",
            "judging",
            retrieved_context=retrieved_context,
        )
        try:
            response = await run_with_timeout(
                self.judge.act(context),
                timeout_seconds=self.step_timeout_seconds,
                operation_name="judge:judging",
                logger=self.logger,
            )
            text = self._normalize_response(response)
        except OperationTimeoutError:
            text = '{"reasoning":"Judge timed out","scores":{},"winner":"Pending"}'
        except Exception as exc:
            self.logger.exception("Judge failed during judging")
            text = f'{{"reasoning":"Judge failed: {str(exc).replace(chr(34), chr(39))}","scores":{{}},"winner":"Pending"}}'

        decision = {
            "score": "undecided",
            "reasoning": text,
        }
        self.state.judgement = text
        self.state.history.append(DebateMessage(agent="Judge", role="judging", content=text))
        self.logger.info("Judge output generated", extra={"preview": text[:120]})
        await self._emit(
            "agent_completed",
            {"agent": "Judge", "phase": "judging", "content": text, "history_size": len(self.state.history)},
        )
        await self._emit("phase_completed", {"phase": "judging", "history_size": len(self.state.history)})
        return decision

    async def run_full_debate(self) -> DebateState:
        """Run full debate sequence and return final state."""
        self.logger.info(
            "Starting full debate",
            extra={"topic": self.state.topic, "countries": self.state.countries},
        )
        await self._emit("debate_started", {"topic": self.state.topic, "countries": self.state.countries})

        if self.retriever:
            try:
                await self.retriever.fetch_and_store(self.state.topic)
            except Exception as error:
                self.logger.warning("Context retrieval failed: %s", error)
                await self._emit("retrieval_failed", {"error": str(error)})

        await self.run_opening_round()
        await self.run_rebuttal_round(rounds=self.max_rebuttal_rounds)
        await self.run_resolution_phase()
        await self.run_voting_phase()
        await self.run_judging_phase()
        await self._emit("debate_completed", {"history_size": len(self.state.history)})
        self.logger.info(
            "Full debate completed",
            extra={"history_size": len(self.state.history), "votes": self.state.votes},
        )
        return self.state
