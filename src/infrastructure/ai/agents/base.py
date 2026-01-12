"""Base configuration and utilities for AI agents."""

from typing import TypedDict, Annotated, Sequence
from enum import Enum

from langchain_core.messages import BaseMessage
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph.message import add_messages

from src.infrastructure.config.settings import get_settings


class AgentType(str, Enum):
    """Types of agents in the system."""

    ORCHESTRATOR = "orchestrator"
    REPO_INVESTIGATOR = "repo_investigator"
    BLOG_EXPLAINER = "blog_explainer"
    RESPONSE_GENERATOR = "response_generator"


class ChatState(TypedDict):
    """State shared across agents in the graph."""

    messages: Annotated[Sequence[BaseMessage], add_messages]
    next_agent: str
    agent_output: str
    conversation_history: list[dict]


def get_llm(temperature: float = 0.7) -> ChatGoogleGenerativeAI:
    """Get a configured LLM instance."""
    settings = get_settings()
    return ChatGoogleGenerativeAI(
        model=settings.gemini_model,
        google_api_key=settings.google_api_key,
        temperature=temperature,
        convert_system_message_to_human=True,
    )


def load_bio_context() -> str:
    """Load the bio context from file."""
    settings = get_settings()
    try:
        with open(settings.bio_file_path, "r", encoding="utf-8") as f:
            return f.read()
    except FileNotFoundError:
        return "I am Dimitris Koutselis, a software developer."
