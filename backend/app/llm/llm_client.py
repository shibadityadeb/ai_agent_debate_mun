"""LLM client wrapper for Anthropic Claude API."""

import os
import logging
from typing import Optional

import httpx


logger = logging.getLogger(__name__)


class LLMClient:
    """Anthropic Claude LLM client."""

    ANTHROPIC_URL = "https://api.anthropic.com/v1/messages"

    def __init__(
        self,
        api_key: Optional[str] = None,
        model: str = "claude-3-haiku-20240307",
        timeout_seconds: float = 30.0,
    ):
        """Initialize LLMClient for Claude.

        Args:
            api_key: API key for Anthropic. Falls back to ANTHROPIC_API_KEY env var.
            model: Model name to use (default: claude-3-5-sonnet-20241022).
            timeout_seconds: Request timeout in seconds.
        """
        self.api_key = api_key or os.getenv("ANTHROPIC_API_KEY")
        if not self.api_key:
            raise ValueError("ANTHROPIC_API_KEY is required")

        self.model = model or os.getenv("ANTHROPIC_MODEL") or "claude-3-haiku-20240307"
        if not self.model:
            raise ValueError("Model is required via model argument or ANTHROPIC_MODEL")

        self.timeout = timeout_seconds

    async def generate(self, system_prompt: str, user_prompt: str) -> str:
        """Generate text completion using Claude.

        Args:
            system_prompt: System-level instruction for the model.
            user_prompt: User message to generate content from.

        Returns:
            str: Generated response text.

        Raises:
            RuntimeError: When the API response indicates an error or invalid data.
        """
        headers = {
            "x-api-key": self.api_key,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        }

        payload = {
            "model": self.model,
            "max_tokens": 1024,
            "system": system_prompt,
            "messages": [
                {"role": "user", "content": user_prompt},
            ],
        }

        logger.debug("Claude request payload: %s", payload)

        try:
            async with httpx.AsyncClient(timeout=httpx.Timeout(self.timeout)) as client:
                response = await client.post(
                    self.ANTHROPIC_URL,
                    json=payload,
                    headers=headers,
                )

            response.raise_for_status()
            data = response.json()
            logger.debug("Claude response: %s", data)

            content = data.get("content")
            if not content or not isinstance(content, list):
                raise RuntimeError("Claude response does not contain content array")

            first_block = content[0]
            if first_block.get("type") != "text":
                raise RuntimeError("Claude response first block is not text type")

            text = first_block.get("text")
            if not isinstance(text, str):
                raise RuntimeError("Claude response does not contain text")

            return text.strip()


        except httpx.TimeoutException as exc:
            logger.error("Claude request timed out: %s", exc)
            raise RuntimeError("Claude request timed out") from exc
        except httpx.HTTPStatusError as exc:
            status = exc.response.status_code
            body = exc.response.text
            logger.error("Claude HTTP error %s: %s", status, body)

            if status == 401:
                raise RuntimeError(
                    "Claude API authentication failed: verify ANTHROPIC_API_KEY is valid"
                ) from exc
            if status == 400:
                raise RuntimeError(
                    f"Claude API bad request: {body}"
                ) from exc

            raise RuntimeError(f"Claude HTTP error {status}: {body}") from exc
        except httpx.RequestError as exc:
            logger.error("Claude request error: %s", exc)
            raise RuntimeError("Claude network request failed") from exc
        except ValueError as exc:
            logger.error("Claude response parse error: %s", exc)
            raise RuntimeError("Failed to parse Claude response") from exc

