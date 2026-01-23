"""Article Refiner Agent - Provides grammar checking and article improvement suggestions."""

import json
import re
from typing import AsyncGenerator, List

from langchain_core.messages import HumanMessage

from src.infrastructure.ai.agents.base import get_llm


GRAMMAR_CHECK_PROMPT = """You are a professional editor and grammar expert. Analyze the following text for grammar, spelling, punctuation, and style issues.

Text to analyze:
---
{text}
---

Field context: {field_name}

Return your analysis as a JSON array of issues. Each issue should have:
- position: character index where the issue starts (0-based)
- length: length of the problematic text
- message: clear description of the issue
- suggestions: array of 1-3 suggested corrections
- severity: "error" for definite mistakes, "warning" for likely issues, "info" for style suggestions
- original_text: the exact text that has the issue

Focus on:
1. Spelling errors
2. Grammar mistakes (subject-verb agreement, tense consistency, etc.)
3. Punctuation errors
4. Awkward phrasing
5. Redundancy

Return ONLY a valid JSON array, no other text. Example format:
[
  {{
    "position": 0,
    "length": 5,
    "message": "Possible spelling error",
    "suggestions": ["their", "there"],
    "severity": "error",
    "original_text": "thier"
  }}
]

If no issues are found, return an empty array: []"""


REFINE_ARTICLE_PROMPT = """You are a professional editor and writing coach. Analyze the following article and provide improvement suggestions.

Article Title: {title}

Article Summary: {summary}

Article Content (Markdown):
---
{content}
---

Tags: {tags}

Analyze this article and provide suggestions for improvement across these categories:
1. **STYLE**: Writing style, word choice, sentence variety
2. **STRUCTURE**: Organization, flow, paragraph structure, logical progression
3. **CLARITY**: Clear communication, avoiding ambiguity, precision
4. **TONE**: Consistency, appropriate voice for the audience
5. **ENGAGEMENT**: Reader interest, hooks, compelling elements

For each suggestion, provide:
- category: one of "style", "structure", "clarity", "tone", "engagement"
- original: the exact text that could be improved (keep it brief, 1-2 sentences max)
- suggested: your improved version
- explanation: brief explanation of why this improves the text
- field: which field this applies to ("title", "summary", or "content")

Also provide:
- overall_score: a quality score from 0-10
- summary: a brief (2-3 sentences) summary of the article's strengths and main areas for improvement

Return your analysis as valid JSON with this structure:
{{
  "suggestions": [...],
  "overall_score": 7.5,
  "summary": "..."
}}

Provide 3-8 actionable suggestions. Focus on the most impactful improvements.
Return ONLY valid JSON, no other text."""


async def check_grammar(text: str, field_name: str = "content") -> List[dict]:
    """Check text for grammar issues using AI.

    Args:
        text: The text to check
        field_name: Optional context about which field this is (e.g., "title", "content")

    Returns:
        List of grammar issues with position, message, suggestions, and severity
    """
    if not text or not text.strip():
        return []

    llm = get_llm(temperature=0.1)  # Low temperature for consistent analysis

    prompt = GRAMMAR_CHECK_PROMPT.format(
        text=text,
        field_name=field_name or "general text",
    )

    response = await llm.ainvoke([HumanMessage(content=prompt)])

    try:
        # Extract JSON from the response
        content = response.content.strip()
        # Handle potential markdown code blocks
        if content.startswith("```"):
            content = re.sub(r"```(?:json)?\s*", "", content)
            content = content.rstrip("`")

        issues = json.loads(content)

        # Validate the structure
        validated_issues = []
        for issue in issues:
            if all(key in issue for key in ["position", "length", "message", "original_text"]):
                validated_issues.append({
                    "position": int(issue.get("position", 0)),
                    "length": int(issue.get("length", 1)),
                    "message": str(issue.get("message", "")),
                    "suggestions": issue.get("suggestions", []),
                    "severity": issue.get("severity", "warning"),
                    "original_text": str(issue.get("original_text", "")),
                })

        return validated_issues

    except (json.JSONDecodeError, KeyError, TypeError):
        # If parsing fails, return empty list
        return []


async def refine_article(
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
    llm = get_llm(temperature=0.3)  # Balanced for creative suggestions

    prompt = REFINE_ARTICLE_PROMPT.format(
        title=title,
        summary=summary,
        content=content,
        tags=", ".join(tags) if tags else "none",
    )

    response = await llm.ainvoke([HumanMessage(content=prompt)])

    try:
        content_str = response.content.strip()
        # Handle potential markdown code blocks
        if content_str.startswith("```"):
            content_str = re.sub(r"```(?:json)?\s*", "", content_str)
            content_str = content_str.rstrip("`")

        result = json.loads(content_str)

        # Validate and normalize the structure
        suggestions = []
        for s in result.get("suggestions", []):
            suggestions.append({
                "category": s.get("category", "clarity"),
                "original": s.get("original", ""),
                "suggested": s.get("suggested", ""),
                "explanation": s.get("explanation", ""),
                "field": s.get("field", "content"),
            })

        return {
            "suggestions": suggestions,
            "overall_score": float(result.get("overall_score", 5.0)),
            "summary": result.get("summary", "Analysis complete."),
        }

    except (json.JSONDecodeError, KeyError, TypeError) as e:
        # Return a default response on error
        return {
            "suggestions": [],
            "overall_score": 5.0,
            "summary": f"Unable to analyze article: {str(e)}",
        }


async def refine_article_stream(
    title: str,
    summary: str,
    content: str,
    tags: List[str],
) -> AsyncGenerator[str, None]:
    """Stream article refinement suggestions.

    Yields JSON chunks for each suggestion, then score, then summary.

    Args:
        title: Article title
        summary: Article summary
        content: Article content in markdown
        tags: List of article tags

    Yields:
        JSON strings for each chunk of the response
    """
    llm = get_llm(temperature=0.3)

    prompt = REFINE_ARTICLE_PROMPT.format(
        title=title,
        summary=summary,
        content=content,
        tags=", ".join(tags) if tags else "none",
    )

    # Collect the full response for parsing
    full_response = ""

    async for chunk in llm.astream([HumanMessage(content=prompt)]):
        if chunk.content:
            full_response += chunk.content
            # Yield progress indicator
            yield json.dumps({"type": "progress", "data": len(full_response)})

    # Parse the complete response
    try:
        content_str = full_response.strip()
        if content_str.startswith("```"):
            content_str = re.sub(r"```(?:json)?\s*", "", content_str)
            content_str = content_str.rstrip("`")

        result = json.loads(content_str)

        # Stream each suggestion individually
        for suggestion in result.get("suggestions", []):
            yield json.dumps({
                "type": "suggestion",
                "data": {
                    "category": suggestion.get("category", "clarity"),
                    "original": suggestion.get("original", ""),
                    "suggested": suggestion.get("suggested", ""),
                    "explanation": suggestion.get("explanation", ""),
                    "field": suggestion.get("field", "content"),
                },
            })

        # Stream the score
        yield json.dumps({
            "type": "score",
            "data": float(result.get("overall_score", 5.0)),
        })

        # Stream the summary
        yield json.dumps({
            "type": "summary",
            "data": result.get("summary", "Analysis complete."),
        })

    except (json.JSONDecodeError, KeyError, TypeError) as e:
        yield json.dumps({
            "type": "error",
            "data": f"Unable to parse analysis: {str(e)}",
        })

    # Signal completion
    yield json.dumps({"type": "done", "data": None})
