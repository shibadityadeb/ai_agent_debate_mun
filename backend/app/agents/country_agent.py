"""Country agent representing a UN member state."""

from typing import Dict, List

from app.agents.base_agent import BaseAgent
from app.llm.llm_client import LLMClient


class CountryAgent(BaseAgent):
    """Country participant agent with identity-based prompts."""

    def __init__(self, country_profile: Dict[str, object], llm_client: LLMClient):
        """Initialize CountryAgent with profile and LLM client."""
        self.country_profile = country_profile
        system_prompt = self._build_system_prompt(country_profile)

        super().__init__(
            name=country_profile.get("name", "Unknown Country"),
            system_prompt=system_prompt,
            llm_client=llm_client,
        )

    @staticmethod
    def _format_goals(goals: List[str]) -> str:
        return "\n".join(f"- {goal}" for goal in goals)

    @classmethod
    def _build_system_prompt(cls, profile: Dict[str, object]) -> str:
        name = profile.get("name", "Unknown")
        stance = profile.get("stance", "Neutral stance")
        tone = profile.get("tone", "Diplomatic")
        goals = profile.get("goals", [])

        if not isinstance(goals, list):
            goals = [str(goals)]

        goal_block = cls._format_goals(goals)

        return (
            f"You are the official delegate of {name} in a United Nations debate. "
            f"Your role is to represent your country’s interests with clarity and strategy.\n\n"
            f"Country identity: {name}\n"
            f"Political stance: {stance}\n"
            f"Tone: {tone}\n"
            f"Strategic goals:\n{goal_block}\n\n"
            "Follow these guidelines:\n"
            "- Speak diplomatically and respectfully.\n"
            "- Defend national interest thoughtfully.\n"
            "- Be strategic, not generic.\n"
            "- Maintain character and do not break role.\n"
        )

    async def act(self, context: str) -> str:
        """Generate a response for given context using inherited BaseAgent behavior."""
        return await super().act(context)

