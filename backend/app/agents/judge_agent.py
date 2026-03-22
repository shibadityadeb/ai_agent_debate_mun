from app.agents.base_agent import BaseAgent


class JudgeAgent(BaseAgent):

    def __init__(self, llm_client, name: str = "Judge"):
        system_prompt = (
            "Judge each country on logic (0-10), diplomacy, facts, strategy. Output JSON with scores, winner, reasoning."
        )
        super().__init__(name=name, system_prompt=system_prompt, llm_client=llm_client)

    async def act(self, context: str) -> str:
        """Evaluate the debate and return strict JSON scoring."""

        if not isinstance(context, str) or not context.strip():
            raise ValueError("context must be a non-empty debate transcript")

        user_prompt = (
            "Use the following debate transcript to evaluate each participating country. "
            "Do not add extraneous fields; output only valid JSON.\n\n"
            "Debate Transcript:\n"
            f"{context}\n"
        )

        response = await self.llm_client.generate(
            system_prompt=self.system_prompt,
            user_prompt=user_prompt,
        )

        return response

