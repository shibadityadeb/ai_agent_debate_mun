"""Debate routing endpoints."""

from __future__ import annotations

import logging
from typing import List, Optional

from fastapi import APIRouter, HTTPException, Response, status
from pydantic import BaseModel

from app.core.countries import COUNTRY_PROFILES
from app.services.debate_jobs import debate_job_manager


router = APIRouter(prefix="/debate", tags=["Debate"])
logger = logging.getLogger(__name__)


class DebateRequest(BaseModel):
    topic: str
    countries: Optional[List[str]] = None


def _normalize_countries(countries: Optional[List[str]]) -> List[str]:
    selected = countries or list(COUNTRY_PROFILES.keys())[:3]
    return [country.strip() for country in selected if isinstance(country, str) and country.strip()]


@router.get("/")
async def get_debate_status():
    """Get latest debate status."""
    latest_job = await debate_job_manager.get_latest_job()
    return {
        "status": latest_job.status if latest_job else "idle",
        "job_id": latest_job.job_id if latest_job else None,
    }


@router.get("/current")
async def get_current_debate():
    """Get the most recent debate job."""
    latest_job = await debate_job_manager.get_latest_job()
    if latest_job is None:
        return {"status": "idle", "job": None}
    return {"status": latest_job.status, "job": latest_job.model_dump()}


@router.post("/start")
async def start_debate(request: DebateRequest):
    """Create a debate job without waiting for completion."""
    if not request.topic or not request.topic.strip():
        raise HTTPException(status_code=400, detail="Topic is required")

    countries = _normalize_countries(request.countries)
    if not countries:
        raise HTTPException(status_code=400, detail="At least one country is required")

    job = await debate_job_manager.create_job(request.topic.strip(), countries)
    await debate_job_manager.start_job(job.job_id)

    logger.info("Accepted debate job %s for topic %s", job.job_id, request.topic)
    return {
        "success": True,
        "job_id": job.job_id,
        "status": job.status,
        "phase": job.phase,
        "topic": job.topic,
        "countries": job.countries,
        "message": "Debate job accepted for background processing",
    }


@router.post("/run", status_code=status.HTTP_202_ACCEPTED)
async def run_debate(request: DebateRequest, response: Response):
    """Queue the debate in the background and return immediately."""
    start_payload = await start_debate(request)
    response.status_code = status.HTTP_202_ACCEPTED
    return start_payload


@router.get("/{job_id}/status")
async def get_job_status(job_id: str):
    """Return current status for a debate job."""
    job = await debate_job_manager.get_job(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Debate job not found")

    return {
        "job_id": job.job_id,
        "status": job.status,
        "phase": job.phase,
        "progress": job.progress,
        "topic": job.topic,
        "countries": job.countries,
        "error": job.error,
        "created_at": job.created_at,
        "updated_at": job.updated_at,
        "completed_at": job.completed_at,
        "logs": job.logs[-20:],
    }


@router.get("/{job_id}/messages")
async def get_job_messages(job_id: str):
    """Return accumulated messages for a debate job."""
    job = await debate_job_manager.get_job(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Debate job not found")
    return {
        "job_id": job.job_id,
        "status": job.status,
        "phase": job.phase,
        "history": job.history,
    }


@router.get("/{job_id}/result")
async def get_job_result(job_id: str, response: Response):
    """Return debate result once the background job is complete."""
    job = await debate_job_manager.get_job(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Debate job not found")

    if job.status in {"queued", "running"}:
        response.status_code = status.HTTP_202_ACCEPTED
        return {
            "success": False,
            "job_id": job.job_id,
            "status": job.status,
            "phase": job.phase,
            "progress": job.progress,
        }

    if job.status in {"failed", "timed_out"}:
        raise HTTPException(status_code=500, detail=job.error or f"Debate job {job.status}")

    return {
        "success": True,
        "job_id": job.job_id,
        "status": job.status,
        "history": job.history,
        "final_state": job.final_state,
    }
