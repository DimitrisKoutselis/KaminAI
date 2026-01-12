"""Tools for the Repo Investigator Agent."""

from typing import Any

from langchain_core.tools import tool

from src.infrastructure.ai.vectorstore.faiss_store import get_vector_store
from src.infrastructure.ai.mcp.github_client import get_github_client


@tool
async def search_code(
    query: str,
    project_name: str | None = None,
    file_type: str | None = None,
    num_results: int = 5,
) -> str:
    """Search for code snippets in the indexed repositories.

    Args:
        query: Natural language query describing what code to find
        project_name: Optional filter by project/repository name
        file_type: Optional filter by file extension (e.g., ".py", ".ts")
        num_results: Number of results to return (default 5)

    Returns:
        Formatted string with matching code snippets and their metadata
    """
    vector_store = get_vector_store()
    results = await vector_store.search(
        query=query,
        k=num_results,
        project_name=project_name,
        file_type=file_type,
    )

    if not results:
        return "No matching code found for the query."

    formatted_results: list[str] = []
    for i, result in enumerate(results, 1):
        content_preview = result["content"][:2000]
        if len(result["content"]) > 2000:
            content_preview += "\n... (truncated)"

        formatted_results.append(
            f"**Result {i}**\n"
            f"- Project: {result['project_name']}\n"
            f"- File: {result['folder_path']}/{result['file_name']}\n"
            f"- Type: {result['file_type']}\n"
            f"- URL: {result['file_url']}\n"
            f"- Relevance Score: {result['score']:.3f}\n"
            f"\n```{result['file_type'].lstrip('.')}\n{content_preview}\n```\n"
        )

    return "\n".join(formatted_results)


@tool
async def list_projects() -> str:
    """List all indexed GitHub projects/repositories.

    Returns:
        Formatted string with project names and statistics
    """
    vector_store = get_vector_store()
    stats = await vector_store.get_stats()

    if stats["total_documents"] == 0:
        return "No projects have been indexed yet."

    projects = stats["projects"]
    file_types = stats["file_types"]

    return (
        f"**Indexed Projects ({len(projects)} total)**\n"
        f"Projects: {', '.join(sorted(projects))}\n\n"
        f"**Statistics**\n"
        f"- Total files indexed: {stats['total_documents']}\n"
        f"- File types: {', '.join(sorted(file_types))}"
    )


@tool
async def get_project_files(project_name: str, file_type: str | None = None) -> str:
    """Get a list of files in a specific project.

    Args:
        project_name: Name of the project/repository
        file_type: Optional filter by file extension

    Returns:
        Formatted list of files in the project
    """
    vector_store = get_vector_store()

    files: list[dict[str, Any]] = []
    for doc in vector_store.documents:
        if doc.project_name.lower() == project_name.lower():
            if file_type is None or doc.file_type == file_type:
                files.append(
                    {
                        "path": f"{doc.folder_path}/{doc.file_name}",
                        "type": doc.file_type,
                    }
                )

    if not files:
        return f"No files found for project '{project_name}'."

    unique_files = list({f["path"]: f for f in files}.values())
    unique_files.sort(key=lambda x: x["path"])

    formatted = [f"**Files in {project_name}** ({len(unique_files)} files)\n"]
    for f in unique_files[:50]:
        formatted.append(f"- {f['path']} ({f['type']})")

    if len(unique_files) > 50:
        formatted.append(f"\n... and {len(unique_files) - 50} more files")

    return "\n".join(formatted)


@tool
async def get_file_content(project_name: str, file_path: str) -> str:
    """Get the full content of a specific file from an indexed project.

    Args:
        project_name: Name of the project/repository
        file_path: Path to the file within the project (e.g., "src/main.py")

    Returns:
        The full content of the file
    """
    vector_store = get_vector_store()

    for doc in vector_store.documents:
        doc_path = f"{doc.folder_path}/{doc.file_name}".lstrip("/")
        if doc.project_name.lower() == project_name.lower() and (
            doc_path == file_path or doc_path.endswith(file_path) or file_path.endswith(doc_path)
        ):
            return (
                f"**File: {doc.file_name}**\n"
                f"- Project: {doc.project_name}\n"
                f"- Path: {doc.folder_path}/{doc.file_name}\n"
                f"- URL: {doc.file_url}\n\n"
                f"```{doc.file_type.lstrip('.')}\n{doc.content}\n```"
            )

    return f"File '{file_path}' not found in project '{project_name}'."


@tool
async def get_repository_info() -> str:
    """Get information about all GitHub repositories for the user.

    Returns:
        Formatted information about repositories including descriptions and languages
    """
    github_client = get_github_client()
    repos = await github_client.get_repositories()

    if not repos:
        return "No repositories found."

    formatted: list[str] = [f"**GitHub Repositories** ({len(repos)} total)\n"]

    for repo in repos:
        desc = repo["description"] or "No description"
        lang = repo["language"] or "Unknown"
        topics = ", ".join(repo["topics"]) if repo["topics"] else "None"

        formatted.append(
            f"### {repo['name']}\n"
            f"- Description: {desc}\n"
            f"- Language: {lang}\n"
            f"- Topics: {topics}\n"
            f"- URL: {repo['html_url']}\n"
        )

    return "\n".join(formatted)


@tool
async def search_in_project(project_name: str, query: str, num_results: int = 10) -> str:
    """Search for code within a specific project only.

    Args:
        project_name: Name of the project/repository to search in
        query: Natural language query describing what code to find
        num_results: Number of results to return (default 10)

    Returns:
        Formatted string with matching code snippets from that project
    """
    vector_store = get_vector_store()
    results = await vector_store.search(
        query=query,
        k=num_results,
        project_name=project_name,
    )

    if not results:
        return f"No matching code found in project '{project_name}' for the query."

    formatted_results: list[str] = []
    for i, result in enumerate(results, 1):
        content_preview = result["content"][:3000]
        if len(result["content"]) > 3000:
            content_preview += "\n... (truncated)"

        formatted_results.append(
            f"**Result {i}**\n"
            f"- File: {result['folder_path']}/{result['file_name']}\n"
            f"- Type: {result['file_type']}\n"
            f"- URL: {result['file_url']}\n"
            f"\n```{result['file_type'].lstrip('.')}\n{content_preview}\n```\n"
        )

    return "\n".join(formatted_results)
