"""Text Enhancement Service - Orchestrates grammar checking and article refinement."""

from typing import AsyncGenerator, List

from src.infrastructure.ai.agents.article_refiner import (
    check_grammar,
    refine_article,
    refine_article_stream,
)


class TextEnhancementService:
    """Service for text enhancement operations including grammar checking and article refinement."""

    async def check_grammar(self, text: str, field_name: str = "content") -> dict:
        """Check text for grammar issues.

        Args:
            text: The text to check
            field_name: Context about which field this is (e.g., "title", "content")

        Returns:
            Dictionary with 'issues' list and 'checked_text'
        """
        issues = await check_grammar(text, field_name)

        return {
            "issues": issues,
            "checked_text": text,
        }

    async def refine_article(
        self,
        title: str,
        summary: str,
        content: str,
        tags: List[str],
    ) -> dict:
        """Analyze an article and provide improvement suggestions.

        Args:
            title: Article title
            summary: Article summary
            content: Article content in markdown
            tags: List of article tags

        Returns:
            Dictionary with suggestions, overall_score, and summary
        """
        return await refine_article(title, summary, content, tags)

    async def refine_article_stream(
        self,
        title: str,
        summary: str,
        content: str,
        tags: List[str],
    ) -> AsyncGenerator[str, None]:
        """Stream article refinement suggestions.

        Args:
            title: Article title
            summary: Article summary
            content: Article content in markdown
            tags: List of article tags

        Yields:
            JSON strings for each chunk of the response
        """
        async for chunk in refine_article_stream(title, summary, content, tags):
            yield chunk
