"""Timeout helpers for long-running async operations."""

from __future__ import annotations

import asyncio
import logging
from typing import Awaitable, TypeVar


T = TypeVar("T")


class OperationTimeoutError(TimeoutError):
    """Raised when an async operation exceeds its allotted timeout."""


async def run_with_timeout(
    awaitable: Awaitable[T],
    timeout_seconds: float,
    operation_name: str,
    logger: logging.Logger | None = None,
) -> T:
    """Run an awaitable with a hard timeout."""
    try:
        return await asyncio.wait_for(awaitable, timeout=timeout_seconds)
    except asyncio.TimeoutError as exc:
        if logger:
            logger.error(
                "Operation timed out",
                extra={
                    "operation": operation_name,
                    "timeout_seconds": timeout_seconds,
                },
            )
        raise OperationTimeoutError(
            f"{operation_name} exceeded timeout of {timeout_seconds:.1f}s"
        ) from exc
