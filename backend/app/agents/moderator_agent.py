"""Moderator agent for debate moderation."""
from app.agents.base_agent import BaseAgent
from app.llm.llm_client import LLMClient


class ModeratorAgent(BaseAgent):
    """Moderation logic stub."""

    def __init__(self, llm_client: LLMClient, name: str = "Moderator"):
        system_prompt = (
            "You are the UN debate moderator. "
            "Your role is to synthesize the positions of all countries, identify points of agreement and disagreement, "
            "and suggest a path forward that respects all viewpoints while finding common ground. "
            "Be fair, thoughtful, and diplomatic."
        )
        super().__init__(name=name, system_prompt=system_prompt, llm_client=llm_client)

    async def act(self, context: str) -> str:
        """Moderate the debate by synthesizing positions."""
        return await super().act(context)
