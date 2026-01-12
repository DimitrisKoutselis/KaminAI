"""Agent tools for the multi-agent chat system."""

from src.infrastructure.ai.tools.repo_tools import (
    search_code,
    search_in_project,
    list_projects,
    get_project_files,
    get_file_content,
    get_repository_info,
)
from src.infrastructure.ai.tools.blog_tools import (
    get_all_blog_articles,
    get_article_content,
    search_blog_articles,
    get_recent_articles,
    get_articles_by_tag,
)

REPO_TOOLS = [search_code, search_in_project, list_projects, get_project_files, get_file_content, get_repository_info]
BLOG_TOOLS = [
    get_all_blog_articles,
    get_article_content,
    search_blog_articles,
    get_recent_articles,
    get_articles_by_tag,
]

__all__ = [
    "search_code",
    "search_in_project",
    "list_projects",
    "get_project_files",
    "get_file_content",
    "get_repository_info",
    "get_all_blog_articles",
    "get_article_content",
    "search_blog_articles",
    "get_recent_articles",
    "get_articles_by_tag",
    "REPO_TOOLS",
    "BLOG_TOOLS",
]
