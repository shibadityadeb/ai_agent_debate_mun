"""Builds contextual system prompt for debate agents."""

from typing import Dict, List, Optional

from app.memory.state_store import DebateMessage, DebateState


def _format_message(message: DebateMessage) -> str:
    return f"* {message.agent} ({message.role}): {message.content}"


def _truncate_text(text: str, max_chars: int) -> str:
    if len(text) <= max_chars:
        return text
    return text[: max_chars - 3].rstrip() + "..."


def build_context(
    state: DebateState,
    agent_name: str,
    phase: str,
    retrieved_context: str = "",
    relationships: Optional[Dict[str, Dict[str, List[str]]]] = None,
    history_limit: int = 6,
    max_length: int = 1200,
) -> str:
    """Generate agent prompt context from debate state."""
    phase_label = phase.capitalize()
    normalized_agent_name = agent_name.lower()

    if normalized_agent_name == "judge":
      messages = list(state.history[-6:])
    else:
      messages = list(state.history[-4:])

    if phase_label.lower() == "rebuttal":
        messages = [message for message in messages if message.agent.lower() != normalized_agent_name]

    recent = messages[-history_limit:]

    history_lines: List[str] = ["Recent Discussion:"]
    if recent:
        for msg in recent:
            history_lines.append(_format_message(msg))
    else:
        history_lines.append("* No prior messages yet.")

    instructions = [
        "Instructions:",
        "- Stay in character as your assigned country delegate.",
        "- Be strategic and defend national interests.",
        "- Respond to others in the debate and build on their points.",
    ]

    sections = [
        f"Debate Topic: {state.topic}",
        f"Phase: {phase_label}",
        "",
    ]

    sections += history_lines

    if relationships:
        alliances = relationships.get("alliances", {})
        conflicts = relationships.get("conflicts", {})

        sections.append("")
        sections.append("ALLIANCES:")
        if alliances:
            for country, allies in alliances.items():
                for ally in allies:
                    sections.append(f"- {country} supports {ally}")
        else:
            sections.append("- No explicit alliances detected.")

        sections.append("")
        sections.append("CONFLICTS:")
        if conflicts:
            for country, opponents in conflicts.items():
                for opponent in opponents:
                    sections.append(f"- {country} opposes {opponent}")
        else:
            sections.append("- No explicit conflicts detected.")

    if retrieved_context:
        sections += ["", "REAL-WORLD CONTEXT:", retrieved_context]

    sections += ["", *instructions]

    context = "\n".join(sections)
    return _truncate_text(context, max_length)
