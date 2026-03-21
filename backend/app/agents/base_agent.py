"""Base agent abstraction for multi-agent debate system."""

from __future__ import annotations

from typing import Any

from app.llm.llm_client import LLMClient


class BaseAgent:
    """Generic agent interface for language model driven agents."""

    def __init__(self, name: str, system_prompt: str, llm_client: LLMClient):
        """Initialize base agent.

        Args:
            name: Unique agent name.
            system_prompt: System prompt to drive agent behavior.
            llm_client: Asynchronous LLM client instance.
        """
        self.name = name
        self.system_prompt = system_prompt
        self.llm_client = llm_client

    async def act(self, context: str) -> str:
        """Produce agent output for given context using the LLM client.

        Args:
            context: Dynamic context / prompt for the agent.

        Returns:
            str: Generated agent response text.
        """
        response = await self.llm_client.generate(
            system_prompt=self.system_prompt,
            user_prompt=context,
        )
        return response

