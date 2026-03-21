import sys
from pathlib import Path
import asyncio
from app.llm.llm_client import LLMClient
from app.agents.country_agent import CountryAgent

sys.path.append(str(Path(__file__).resolve().parents[1]))
from dotenv import load_dotenv

load_dotenv(dotenv_path=Path(__file__).resolve().parents[1] / '.env')

async def main():
    llm = LLMClient(model="openai/gpt-5.4-mini")
    profile = {
        "name": "India",
        "stance": "Supports AI regulation but emphasizes sovereignty",
        "tone": "Diplomatic and balanced",
        "goals": [
            "Protect national innovation",
            "Promote global south",
            "Avoid western dominance",
        ],
    }
    agent = CountryAgent(profile, llm)
    resp = await agent.act("Discuss your position on global AI ethics.")
    print("Response:", resp)

if __name__ == "__main__":
    asyncio.run(main())