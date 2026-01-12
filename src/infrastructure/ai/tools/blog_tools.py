"""Tools for the Blog Explainer Agent."""

from langchain_core.tools import tool

from src.infrastructure.ai.mcp.mongodb_client import get_mongodb_article_client


@tool
async def get_all_blog_articles() -> str:
    """Get a list of all published blog articles.

    Returns:
        Formatted list of all blog articles with titles, summaries, and tags
    """
    client = get_mongodb_article_client()
    articles = await client.get_all_articles(published_only=True)

    if not articles:
        return "No blog articles found."

    formatted: list[str] = [f"**Blog Articles** ({len(articles)} total)\n"]

    for article in articles:
        tags = ", ".join(article["tags"]) if article["tags"] else "None"
        summary = article["summary"][:200] if article["summary"] else "No summary"
        if len(article.get("summary", "")) > 200:
            summary += "..."

        formatted.append(
            f"### {article['title']}\n"
            f"- Slug: {article['slug']}\n"
            f"- Tags: {tags}\n"
            f"- Summary: {summary}\n"
            f"- Created: {article['created_at'][:10] if article['created_at'] else 'Unknown'}\n"
        )

    return "\n".join(formatted)


@tool
async def get_article_content(slug: str) -> str:
    """Get the full content of a specific blog article.

    Args:
        slug: The URL slug of the article

    Returns:
        Full article content with metadata
    """
    client = get_mongodb_article_client()
    article = await client.get_article_by_slug(slug)

    if not article:
        return f"Article with slug '{slug}' not found."

    tags = ", ".join(article["tags"]) if article["tags"] else "None"

    return (
        f"# {article['title']}\n\n"
        f"**Tags:** {tags}\n"
        f"**Created:** {article['created_at'][:10] if article['created_at'] else 'Unknown'}\n\n"
        f"## Summary\n{article['summary']}\n\n"
        f"## Content\n{article['content']}"
    )


@tool
async def search_blog_articles(query: str, tags: list[str] | None = None) -> str:
    """Search blog articles by text query and/or tags.

    Args:
        query: Search text to find in title, summary, or content
        tags: Optional list of tags to filter by

    Returns:
        List of matching articles
    """
    client = get_mongodb_article_client()
    articles = await client.search_articles(query=query, tags=tags)

    if not articles:
        search_desc = f"query='{query}'"
        if tags:
            search_desc += f", tags={tags}"
        return f"No articles found matching {search_desc}."

    formatted: list[str] = [f"**Search Results** ({len(articles)} articles found)\n"]

    for article in articles:
        article_tags = ", ".join(article["tags"]) if article["tags"] else "None"
        summary = article["summary"][:150] if article["summary"] else "No summary"
        if len(article.get("summary", "")) > 150:
            summary += "..."

        formatted.append(
            f"### {article['title']}\n"
            f"- Slug: {article['slug']}\n"
            f"- Tags: {article_tags}\n"
            f"- Summary: {summary}\n"
        )

    return "\n".join(formatted)


@tool
async def get_recent_articles(count: int = 5) -> str:
    """Get the most recently published blog articles.

    Args:
        count: Number of recent articles to retrieve (default 5)

    Returns:
        List of recent articles
    """
    client = get_mongodb_article_client()
    articles = await client.get_recent_articles(limit=count)

    if not articles:
        return "No recent articles found."

    formatted: list[str] = [f"**Recent Articles** (latest {len(articles)})\n"]

    for article in articles:
        tags = ", ".join(article["tags"]) if article["tags"] else "None"
        summary = article["summary"][:150] if article["summary"] else "No summary"
        if len(article.get("summary", "")) > 150:
            summary += "..."

        formatted.append(
            f"### {article['title']}\n"
            f"- Slug: {article['slug']}\n"
            f"- Tags: {tags}\n"
            f"- Created: {article['created_at'][:10] if article['created_at'] else 'Unknown'}\n"
            f"- Summary: {summary}\n"
        )

    return "\n".join(formatted)


@tool
async def get_articles_by_tag(tag: str) -> str:
    """Get all blog articles with a specific tag.

    Args:
        tag: Tag to filter by

    Returns:
        List of articles with the specified tag
    """
    client = get_mongodb_article_client()
    articles = await client.get_articles_by_tag(tag)

    if not articles:
        return f"No articles found with tag '{tag}'."

    formatted: list[str] = [f"**Articles tagged '{tag}'** ({len(articles)} articles)\n"]

    for article in articles:
        tags = ", ".join(article["tags"]) if article["tags"] else "None"
        summary = article["summary"][:150] if article["summary"] else "No summary"

        formatted.append(
            f"### {article['title']}\n"
            f"- Slug: {article['slug']}\n"
            f"- Tags: {tags}\n"
            f"- Summary: {summary}\n"
        )

    return "\n".join(formatted)
