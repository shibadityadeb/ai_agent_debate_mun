"""LLM client wrapper for Groq chat completions API."""

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
        self.timeout = timeout_seconds

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

        try:
            async with httpx.AsyncClient(timeout=httpx.Timeout(self.timeout)) as client:
                for attempt in range(3):
                    response = await client.post(
                        self.GROQ_URL,
                        json=payload,
                        headers=headers,
                    )

                    if response.status_code == 429:
                        logger.warning("Groq rate limit hit on attempt %s/3: %s", attempt + 1, response.text)
                        if attempt < 2:
                            await asyncio.sleep(3)
                            continue
                        print("LLM ERROR:", response.text)
                        return "Error: Rate limit exceeded"

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
            logger.error("Groq request timed out: %s", exc)
            print("LLM ERROR: request timed out")
            return "Error: Request timed out"
        except httpx.HTTPStatusError as exc:
            status = exc.response.status_code
            body = exc.response.text
            logger.error("Groq HTTP error %s: %s", status, body)
            print("LLM ERROR:", body)
            return f"Error: Groq HTTP {status}"
        except httpx.RequestError as exc:
            logger.error("Groq network request failed: %s", exc)
            print("LLM ERROR: network request failed")
            return "Error: Network request failed"
        except (ValueError, KeyError, IndexError, RuntimeError) as exc:
            logger.error("Groq response parse error: %s", exc)
            print("LLM ERROR:", str(exc))
            return "Error: Failed to parse model response"
