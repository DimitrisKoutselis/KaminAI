"""Pydantic schemas for text enhancement endpoints."""

from typing import List, Optional
from enum import Enum

from pydantic import BaseModel, Field


class IssueSeverity(str, Enum):
    """Severity level for grammar issues."""

    ERROR = "error"
    WARNING = "warning"
    INFO = "info"


class SuggestionCategory(str, Enum):
    """Category of refinement suggestion."""

    STYLE = "style"
    STRUCTURE = "structure"
    CLARITY = "clarity"
    TONE = "tone"
    ENGAGEMENT = "engagement"


class GrammarCheckRequest(BaseModel):
    """Request schema for grammar checking."""

    text: str = Field(..., min_length=1, description="Text to check for grammar issues")
    field_name: Optional[str] = Field(
        None, description="Optional field name for context (e.g., 'title', 'content')"
    )


class GrammarIssue(BaseModel):
    """A single grammar issue found in the text."""

    position: int = Field(..., description="Character position where the issue starts")
    length: int = Field(..., description="Length of the problematic text")
    message: str = Field(..., description="Description of the grammar issue")
    suggestions: List[str] = Field(
        default_factory=list, description="Suggested corrections"
    )
    severity: IssueSeverity = Field(
        default=IssueSeverity.WARNING, description="Severity of the issue"
    )
    original_text: str = Field(..., description="The original problematic text")


class GrammarCheckResponse(BaseModel):
    """Response schema for grammar checking."""

    issues: List[GrammarIssue] = Field(
        default_factory=list, description="List of grammar issues found"
    )
    checked_text: str = Field(..., description="The text that was checked")


class RefineRequest(BaseModel):
    """Request schema for article refinement."""

    title: str = Field(..., min_length=1, description="Article title")
    summary: str = Field(..., min_length=1, description="Article summary")
    content: str = Field(..., min_length=1, description="Article content in markdown")
    tags: List[str] = Field(default_factory=list, description="Article tags")


class RefineSuggestion(BaseModel):
    """A single refinement suggestion."""

    category: SuggestionCategory = Field(..., description="Category of the suggestion")
    original: str = Field(..., description="Original text that could be improved")
    suggested: str = Field(..., description="Suggested improvement")
    explanation: str = Field(..., description="Why this change would improve the text")
    field: str = Field(
        ..., description="Which field this applies to (title, summary, content)"
    )


class RefineResponse(BaseModel):
    """Response schema for article refinement."""

    suggestions: List[RefineSuggestion] = Field(
        default_factory=list, description="List of improvement suggestions"
    )
    overall_score: float = Field(
        ..., ge=0, le=10, description="Overall quality score (0-10)"
    )
    summary: str = Field(..., description="Summary of the article's strengths and areas for improvement")


class RefineStreamChunk(BaseModel):
    """A chunk of streaming refinement response."""

    type: str = Field(..., description="Type of chunk: 'suggestion', 'score', 'summary', 'done'")
    data: Optional[RefineSuggestion | float | str] = Field(
        None, description="The chunk data based on type"
    )
