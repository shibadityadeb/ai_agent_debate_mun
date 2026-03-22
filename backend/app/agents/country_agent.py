"""Country agent representing a UN member state."""

from typing import Dict, List

from app.agents.base_agent import BaseAgent
from app.llm.llm_client import LLMClient


class CountryAgent(BaseAgent):
    """Country participant agent with identity-based prompts."""

    def __init__(self, country_profile: Dict[str, object], llm_client: LLMClient):
        """Initialize CountryAgent with profile and LLM client."""
        self.country_profile = country_profile
        self.aggression_level = self._normalize_level(country_profile.get("aggression_level", 0.5))
        self.cooperation_level = self._normalize_level(country_profile.get("cooperation_level", 0.5))
        system_prompt = self._build_system_prompt(country_profile)
        super().__init__(
            name=country_profile.get("name", "Unknown Country"),
            system_prompt=system_prompt,
            llm_client=llm_client,
        )

    @staticmethod
    def _normalize_level(value: object) -> float:
        try:
            level = float(value)
        except (TypeError, ValueError):
            level = 0.5
        return min(max(level, 0.0), 1.0)

    @staticmethod
    def _format_goals(goals: List[str]) -> str:
        return "\n".join(f"- {goal}" for goal in goals)

    @classmethod
    def _build_system_prompt(cls, profile: Dict[str, object]) -> str:
        name = profile.get("name", "Unknown")
        stance = profile.get("stance", "Neutral")
        tone = profile.get("tone", "Diplomatic")
        goals = profile.get("goals", [])
        if not isinstance(goals, list):
            goals = [str(goals)]
        goal_block = cls._format_goals(goals)
        return (
            f"Delegate of {name}. Stance: {stance}.\n"
            f"⚡ STRICT: 2-3 sentences max, 60 words. (1) State position. (2) Counter ONE arg. (3) Strategic end.\n"
            f"Zero filler. Every word adds value. Maximum impact, minimum words."
        )

    async def act(self, context: str) -> str:
        """Generate a response for given context using inherited BaseAgent behavior."""
        return await super().act(context)
