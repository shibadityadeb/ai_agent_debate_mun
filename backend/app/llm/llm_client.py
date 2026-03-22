"""LLM client wrapper for Groq chat completions API."""

from __future__ import annotations

import asyncio
import logging
import os
from typing import Optional

import httpx


logger = logging.getLogger(__name__)


class LLMClient:
    """Groq LLM client using the OpenAI-compatible chat completions API."""

    GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"

    def __init__(
        self,
        api_key: Optional[str] = None,
        model: Optional[str] = None,
        timeout_seconds: float = 30.0,
    ):
        """Initialize LLMClient for Groq."""
        self.api_key = api_key or os.getenv("GROQ_API_KEY")
        if not self.api_key:
            raise ValueError("GROQ_API_KEY is required")

        self.model = model or os.getenv("GROQ_MODEL") or "llama-3.1-8b-instant"
        self.timeout = float(os.getenv("GROQ_TIMEOUT_SECONDS", timeout_seconds))
        self.max_retries = max(1, int(os.getenv("GROQ_MAX_RETRIES", "2")))
        self._client = httpx.AsyncClient(
            timeout=httpx.Timeout(self.timeout),
            limits=httpx.Limits(max_keepalive_connections=20, max_connections=50),
        )

    async def aclose(self) -> None:
        """Close underlying HTTP resources."""
        await self._client.aclose()

    async def generate(self, system_prompt: str, user_prompt: str) -> str:
        """Generate text completion using Groq."""
        headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
        }

        payload = {
            "model": self.model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            "temperature": 0.5,
            "max_tokens": 80,
        }

        logger.debug("Groq request payload: %s", payload)

        for attempt in range(self.max_retries):
            try:
                response = await self._client.post(
                    self.GROQ_URL,
                    json=payload,
                    headers=headers,
                )

                if response.status_code == 429:
                    logger.warning(
                        "Groq rate limit hit on attempt %s/%s: %s",
                        attempt + 1,
                        self.max_retries,
                        response.text,
                    )
                    if attempt < self.max_retries - 1:
                        await asyncio.sleep(1)
                        continue
                    raise RuntimeError("Groq rate limit exceeded")

                response.raise_for_status()
                data = response.json()
                logger.debug("Groq response: %s", data)

                choices = data.get("choices")
                if not choices or not isinstance(choices, list):
                    raise RuntimeError("Groq response does not contain choices")

                message = choices[0].get("message", {})
                text = message.get("content")
                if not isinstance(text, str) or not text.strip():
                    raise RuntimeError("Groq response does not contain valid message content")

                return text.strip()
            except httpx.TimeoutException as exc:
                logger.error("Groq request timed out on attempt %s/%s", attempt + 1, self.max_retries)
                if attempt < self.max_retries - 1:
                    await asyncio.sleep(0.5)
                    continue
                raise TimeoutError("Groq request timed out") from exc
            except httpx.HTTPStatusError as exc:
                status = exc.response.status_code
                body = exc.response.text
                logger.error("Groq HTTP error %s: %s", status, body)
                raise RuntimeError(f"Groq HTTP {status}: {body}") from exc
            except httpx.RequestError as exc:
                logger.error("Groq network request failed: %s", exc)
                if attempt < self.max_retries - 1:
                    await asyncio.sleep(0.5)
                    continue
                raise RuntimeError("Groq network request failed") from exc
            except (ValueError, KeyError, IndexError, RuntimeError):
                raise

        raise RuntimeError("Groq completion failed after all retries")
