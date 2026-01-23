"""Leaderboard Explainer Agent - Handles questions about media rankings and preferences."""

from langchain_core.messages import HumanMessage

from src.infrastructure.ai.agents.base import ChatState, AgentType, get_llm
from src.infrastructure.persistence.mongodb.connection import get_database
from src.infrastructure.persistence.mongodb.media_review_repository_impl import (
    MongoDBMediaReviewRepository,
)
from src.infrastructure.ai.tools.blog_tools import (
    search_blog_articles,
    get_article_content,
)


async def get_leaderboard_context() -> str:
    """Fetch the leaderboard data and format it as context for the LLM."""
    try:
        db = get_database()
        repository = MongoDBMediaReviewRepository(db["media_reviews"])

        all_reviews = await repository.list_all(limit=100)

        if not all_reviews:
            return "The leaderboard is currently empty. No media has been rated yet."

        leaderboard = {
            "games": [],
            "movies": [],
            "series": [],
            "books": [],
        }

        for review in all_reviews:
            if review.media_type == "game":
                leaderboard["games"].append(review)
            elif review.media_type == "movie":
                leaderboard["movies"].append(review)
            elif review.media_type == "series":
                leaderboard["series"].append(review)
            elif review.media_type == "book":
                leaderboard["books"].append(review)

        context_parts = ["Here is my personal media leaderboard with my ratings:\n"]

        if leaderboard["games"]:
            context_parts.append("## Video Games:")
            for i, review in enumerate(leaderboard["games"], 1):
                year_str = f" ({review.year})" if review.year else ""
                article_ref = f" [from article: {review.article_slug}]" if review.article_slug else ""
                context_parts.append(f"  {i}. {review.title}{year_str} - {review.rating}/10{article_ref}")
            context_parts.append("")

        if leaderboard["movies"]:
            context_parts.append("## Movies:")
            for i, review in enumerate(leaderboard["movies"], 1):
                year_str = f" ({review.year})" if review.year else ""
                article_ref = f" [from article: {review.article_slug}]" if review.article_slug else ""
                context_parts.append(f"  {i}. {review.title}{year_str} - {review.rating}/10{article_ref}")
            context_parts.append("")

        if leaderboard["series"]:
            context_parts.append("## TV Series:")
            for i, review in enumerate(leaderboard["series"], 1):
                year_str = f" ({review.year})" if review.year else ""
                article_ref = f" [from article: {review.article_slug}]" if review.article_slug else ""
                context_parts.append(f"  {i}. {review.title}{year_str} - {review.rating}/10{article_ref}")
            context_parts.append("")

        if leaderboard["books"]:
            context_parts.append("## Books:")
            for i, review in enumerate(leaderboard["books"], 1):
                year_str = f" ({review.year})" if review.year else ""
                article_ref = f" [from article: {review.article_slug}]" if review.article_slug else ""
                context_parts.append(f"  {i}. {review.title}{year_str} - {review.rating}/10{article_ref}")
            context_parts.append("")

        total = len(all_reviews)
        context_parts.append(f"Total items rated: {total}")
        context_parts.append(f"  - Games: {len(leaderboard['games'])}")
        context_parts.append(f"  - Movies: {len(leaderboard['movies'])}")
        context_parts.append(f"  - Series: {len(leaderboard['series'])}")
        context_parts.append(f"  - Books: {len(leaderboard['books'])}")

        return "\n".join(context_parts), all_reviews

    except Exception as e:
        return f"Unable to fetch leaderboard data: {str(e)}", []


async def get_relevant_blog_content(user_message: str, reviews: list) -> str:
    """Search blog articles for relevant review content based on the user's question."""
    try:
        blog_context_parts = []

        search_results = await search_blog_articles.ainvoke({"query": user_message})
        if search_results and "No articles found" not in search_results:
            blog_context_parts.append(f"**Related blog articles:**\n{search_results}")

        if reviews:
            seen_slugs = set()
            for review in reviews[:5]:  # Top 5 overall
                if review.article_slug and review.article_slug not in seen_slugs:
                    seen_slugs.add(review.article_slug)
                    try:
                        article_content = await get_article_content.ainvoke(
                            {"slug": review.article_slug}
                        )
                        if article_content and "not found" not in article_content.lower():
                            blog_context_parts.append(
                                f"\n**Full review article for '{review.title}':**\n{article_content}"
                            )
                    except Exception:
                        pass

        return "\n\n---\n\n".join(blog_context_parts) if blog_context_parts else ""

    except Exception as e:
        return f"Error fetching blog content: {str(e)}"


LEADERBOARD_EXPLAINER_PROMPT = """You are analyzing a question about Dimitris's media preferences, favorites, or rankings.
You have access to his personal leaderboard which contains his ratings for video games, movies, TV series, and books.
You also have access to the actual blog articles where he wrote detailed reviews explaining his opinions.

Here is the leaderboard data (ratings):
{leaderboard_context}

{blog_context}

User's question: {message}

IMPORTANT INSTRUCTIONS:
- ONLY use information from the leaderboard data and blog articles provided above
- DO NOT make up opinions, ratings, or reviews that are not in the data
- If asked about "the best" or "favorite", refer to the highest-rated items in the leaderboard
- If asked about a specific title, check if it's in the leaderboard and quote from the blog review if available
- If the requested item isn't in the leaderboard, say "I haven't reviewed that yet" - don't invent an opinion
- When explaining WHY something is rated highly, use quotes or references from the actual blog article content
- Be specific and cite the actual ratings and review content

Provide your analysis based ONLY on the data provided above:"""


async def leaderboard_explainer_node(state: ChatState) -> ChatState:
    """Leaderboard Explainer node that handles questions about media rankings and preferences."""
    messages = state["messages"]

    last_message = None
    for msg in reversed(messages):
        if isinstance(msg, HumanMessage):
            last_message = msg.content
            break

    if not last_message:
        return {
            **state,
            "agent_output": "I can help you with questions about my media rankings and favorites.",
            "next_agent": AgentType.RESPONSE_GENERATOR.value,
        }

    leaderboard_result = await get_leaderboard_context()

    if isinstance(leaderboard_result, tuple):
        leaderboard_context, reviews = leaderboard_result
    else:
        leaderboard_context = leaderboard_result
        reviews = []

    blog_context = ""
    if reviews:
        blog_content = await get_relevant_blog_content(last_message, reviews)
        if blog_content:
            blog_context = f"\nHere are the detailed blog articles with full reviews:\n{blog_content}"

    llm = get_llm(temperature=0.3)

    prompt = LEADERBOARD_EXPLAINER_PROMPT.format(
        leaderboard_context=leaderboard_context,
        blog_context=blog_context,
        message=last_message,
    )

    response = await llm.ainvoke([HumanMessage(content=prompt)])

    return {
        **state,
        "agent_output": response.content,
        "next_agent": AgentType.RESPONSE_GENERATOR.value,
    }
