"""Review extraction agent for parsing media reviews from blog articles."""

import json
import logging
from dataclasses import dataclass
from typing import List, Optional

from langchain_core.messages import HumanMessage, SystemMessage

from src.infrastructure.ai.agents.base import get_llm

logger = logging.getLogger(__name__)


@dataclass
class ExtractedReview:
    """A review extracted from article content."""

    title: str
    media_type: str  # movie, series, game, book
    rating: float  # 1-10
    year: Optional[str] = None


EXTRACTION_PROMPT = """You are a media review extractor. Analyze the given article and extract ONLY the PRIMARY media (movie, TV series, game, or book) that the article is actually reviewing.

CRITICAL RULES:
1. Extract ONLY the main subject of the review - the media that the article is ABOUT
2. DO NOT extract media that is merely mentioned, referenced, or used as an example/comparison
3. The article must be a dedicated review OF that specific media item
4. There should typically be only ONE review per article (the main subject)
5. Only extract multiple items if the article is explicitly a "multi-review" comparing/reviewing several items together with individual ratings for each

How to identify the PRIMARY subject:
- Look at the article title - it usually names the media being reviewed
- The article dedicates significant content to describing, analyzing, and evaluating that specific media
- There is an explicit rating/verdict/score given specifically FOR that media
- The media is not just mentioned in passing or used as a comparison point

Rating formats to look for (ONLY for the primary subject):
- Explicit ratings: "8/10", "9 out of 10", "Rating: 8.5", "I give it a 7"
- Star ratings (convert: 4 stars = 8/10, 3.5 stars = 7/10, etc.)
- Letter grades (A+ = 10, A = 9.5, A- = 9, B+ = 8.5, B = 8, B- = 7.5, C+ = 7, C = 6.5, C- = 6, D = 5, F = 3)

For each review found, extract:
- title: The exact name of the movie/series/game/book
- media_type: One of "movie", "series", "game", "book"
- rating: A number from 1 to 10 (decimal allowed, e.g., 8.5)
- year: Release year if mentioned (optional)

Return your response as a JSON array. If no reviews are found, return an empty array [].

Example - An article titled "Persona 5 Royal Review" that mentions Parasite as an example:
- CORRECT: Extract only Persona 5 Royal (the main subject with the rating)
- WRONG: Also extract Parasite (merely mentioned as a comparison)

Example response:
[
  {"title": "Persona 5 Royal", "media_type": "game", "rating": 10, "year": "2020"}
]"""


async def extract_reviews_from_content(
    content: str,
    title: Optional[str] = None,
    summary: Optional[str] = None,
) -> List[ExtractedReview]:
    """Extract media reviews from article content using LLM.

    Args:
        content: The article body content
        title: The article title (provides context)
        summary: The article summary (provides context)

    Returns:
        List of extracted reviews
    """
    if not content or len(content.strip()) < 50:
        return []

    try:
        llm = get_llm(temperature=0.0)

        article_parts = []
        if title:
            article_parts.append(f"Title: {title}")
        if summary:
            article_parts.append(f"Summary: {summary}")
        article_parts.append(f"Content:\n{content}")

        full_article_text = "\n\n".join(article_parts)

        messages = [
            SystemMessage(content=EXTRACTION_PROMPT),
            HumanMessage(content=f"Article:\n\n{full_article_text}"),
        ]

        response = await llm.ainvoke(messages)
        response_text = response.content.strip()

        if "```json" in response_text:
            response_text = response_text.split("```json")[1].split("```")[0].strip()
        elif "```" in response_text:
            response_text = response_text.split("```")[1].split("```")[0].strip()

        reviews_data = json.loads(response_text)

        if not isinstance(reviews_data, list):
            logger.warning("LLM returned non-list response for review extraction")
            return []

        reviews = []
        for item in reviews_data:
            try:
                media_type = item.get("media_type", "").lower()
                if media_type not in {"movie", "series", "game", "book"}:
                    continue

                rating = float(item.get("rating", 0))
                if rating < 1 or rating > 10:
                    continue

                reviews.append(
                    ExtractedReview(
                        title=item.get("title", "").strip(),
                        media_type=media_type,
                        rating=rating,
                        year=item.get("year"),
                    )
                )
            except (ValueError, KeyError) as e:
                logger.warning(f"Skipping invalid review data: {e}")
                continue

        return reviews

    except json.JSONDecodeError as e:
        logger.error(f"Failed to parse LLM response as JSON: {e}")
        return []
    except Exception as e:
        logger.error(f"Error extracting reviews: {e}")
        return []
