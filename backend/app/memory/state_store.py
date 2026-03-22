"""State store for debate memory."""

from typing import Dict, List, Optional

from pydantic import BaseModel, Field


class DebateMessage(BaseModel):
    agent: str
    role: str
    content: str


class DebateState(BaseModel):
    topic: str
    countries: List[str]
    current_round: str
    history: List[DebateMessage] = Field(default_factory=list)
    resolution: Optional[str] = None
    judgement: Optional[str] = None
    votes: Dict[str, str] = Field(default_factory=dict)


class StateStore:
    """In-memory debate state store."""

    def __init__(self, state: Optional[DebateState] = None):
        self.state = state or DebateState(
            topic="",
            countries=[],
            current_round="",
        )

    def add_message(self, agent: str, role: str, content: str) -> None:
        """Add a new message to debate history."""
        self.state.history.append(DebateMessage(agent=agent, role=role, content=content))

    def get_recent_messages(self, limit: int = 5) -> List[DebateMessage]:
        """Return the most recent messages up to the given limit."""
        return list(self.state.history[-limit:])

    def get_messages_excluding(self, agent_name: str) -> List[DebateMessage]:
        """Return all messages not authored by the given agent."""
        return [m for m in self.state.history if m.agent != agent_name]

    def save(self, state: DebateState) -> None:
        """Save debate state in-memory."""
        self.state = state

    def load(self) -> DebateState:
        """Load debate state from in-memory store."""
        return self.state
