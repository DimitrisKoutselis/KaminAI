"""Pydantic schemas for chat API."""

from typing import Literal

from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    """A single chat message."""

    role: Literal["user", "assistant"] = Field(
        description="The role of the message sender"
    )
    content: str = Field(description="The message content")


class ChatRequest(BaseModel):
    """Request body for chat endpoint."""

    message: str = Field(
        description="The user's message",
        min_length=1,
        max_length=5000,
    )
    conversation_history: list[ChatMessage] = Field(
        default_factory=list,
        description="Previous messages in the conversation",
    )


class ChatResponse(BaseModel):
    """Response body for chat endpoint."""

    response: str = Field(description="The assistant's response")


class IndexStatsResponse(BaseModel):
    """Response body for index stats endpoint."""

    total_documents: int = Field(description="Total number of indexed documents")
    projects: list[str] = Field(description="List of indexed project names")
    file_types: list[str] = Field(description="List of indexed file types")


class IndexResponse(BaseModel):
    """Response body for indexing endpoint."""

    repositories_indexed: int = Field(description="Number of repositories indexed")
    total_files: int = Field(description="Total number of files indexed")
    repositories: list[str] = Field(description="Names of indexed repositories")
