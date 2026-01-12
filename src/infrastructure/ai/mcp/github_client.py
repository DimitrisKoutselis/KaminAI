"""GitHub MCP client for repository access."""

import asyncio
import base64
from typing import Any

import httpx

from src.infrastructure.config.settings import get_settings


class GitHubClient:
    """Client for interacting with GitHub API to fetch repository data."""

    SUPPORTED_EXTENSIONS = {
        ".py",
        ".js",
        ".ts",
        ".tsx",
        ".jsx",
        ".java",
        ".go",
        ".rs",
        ".cpp",
        ".c",
        ".h",
        ".hpp",
        ".cs",
        ".rb",
        ".php",
        ".swift",
        ".kt",
        ".scala",
        ".md",
        ".txt",
        ".json",
        ".yaml",
        ".yml",
        ".toml",
        ".xml",
        ".html",
        ".css",
        ".scss",
        ".sql",
        ".sh",
        ".bash",
        ".dockerfile",
        ".env.example",
    }

    IGNORED_DIRS = {
        "node_modules",
        "__pycache__",
        ".git",
        ".venv",
        "venv",
        "env",
        ".env",
        "dist",
        "build",
        ".next",
        ".nuxt",
        "target",
        "vendor",
        ".idea",
        ".vscode",
        "coverage",
        ".pytest_cache",
        ".mypy_cache",
        ".ruff_cache",
    }

    def __init__(self) -> None:
        settings = get_settings()
        self.token = settings.github_token
        self.username = settings.github_username
        self.base_url = "https://api.github.com"

    def _get_headers(self) -> dict[str, str]:
        """Get headers for GitHub API requests."""
        headers = {
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
        }
        if self.token:
            headers["Authorization"] = f"Bearer {self.token}"
        return headers

    async def get_repositories(self) -> list[dict[str, Any]]:
        """Fetch all public repositories for the configured user."""
        if not self.username:
            return []

        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/users/{self.username}/repos",
                headers=self._get_headers(),
                params={
                    "type": "public",
                    "sort": "updated",
                    "per_page": 100,
                },
            )

            if response.status_code != 200:
                print(f"Failed to fetch repositories: {response.status_code}")
                return []

            repos = response.json()
            return [
                {
                    "name": repo["name"],
                    "full_name": repo["full_name"],
                    "description": repo["description"],
                    "html_url": repo["html_url"],
                    "language": repo["language"],
                    "default_branch": repo["default_branch"],
                    "topics": repo.get("topics", []),
                }
                for repo in repos
                if not repo["fork"]
            ]

    async def get_repository_tree(
        self, repo_name: str, branch: str = "main"
    ) -> list[dict[str, Any]]:
        """Fetch the file tree for a repository."""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/repos/{self.username}/{repo_name}/git/trees/{branch}",
                headers=self._get_headers(),
                params={"recursive": "1"},
            )

            if response.status_code != 200:
                if branch == "main":
                    return await self.get_repository_tree(repo_name, "master")
                print(f"Failed to fetch tree for {repo_name}: {response.status_code}")
                return []

            data = response.json()
            return [
                item
                for item in data.get("tree", [])
                if item["type"] == "blob" and self._should_index_file(item["path"])
            ]

    async def get_file_content(self, repo_name: str, file_path: str) -> str | None:
        """Fetch the content of a specific file."""
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/repos/{self.username}/{repo_name}/contents/{file_path}",
                headers=self._get_headers(),
            )

            if response.status_code != 200:
                return None

            data = response.json()
            if data.get("encoding") == "base64":
                try:
                    content = base64.b64decode(data["content"]).decode("utf-8")
                    return content
                except (UnicodeDecodeError, ValueError):
                    return None

            return None

    async def index_repository(
        self, repo_name: str, branch: str = "main"
    ) -> list[dict[str, Any]]:
        """Index all code files in a repository."""
        tree = await self.get_repository_tree(repo_name, branch)

        if not tree:
            return []

        indexed_files: list[dict[str, Any]] = []

        batch_size = 10
        for i in range(0, len(tree), batch_size):
            batch = tree[i : i + batch_size]
            tasks = [self.get_file_content(repo_name, item["path"]) for item in batch]
            contents = await asyncio.gather(*tasks)

            for item, content in zip(batch, contents):
                if content is None:
                    continue

                if len(content) > 50000:
                    continue

                path_parts = item["path"].rsplit("/", 1)
                folder_path = path_parts[0] if len(path_parts) > 1 else ""
                file_name = path_parts[-1]
                file_ext = "." + file_name.rsplit(".", 1)[-1] if "." in file_name else ""

                indexed_files.append(
                    {
                        "content": content,
                        "project_name": repo_name,
                        "folder_path": folder_path,
                        "file_name": file_name,
                        "file_type": file_ext,
                        "file_url": f"https://github.com/{self.username}/{repo_name}/blob/{branch}/{item['path']}",
                    }
                )

        return indexed_files

    def _should_index_file(self, path: str) -> bool:
        """Check if a file should be indexed based on path and extension."""
        path_lower = path.lower()

        for ignored in self.IGNORED_DIRS:
            if f"/{ignored}/" in f"/{path_lower}/":
                return False

        if path_lower.endswith("package-lock.json"):
            return False
        if path_lower.endswith("yarn.lock"):
            return False
        if path_lower.endswith("poetry.lock"):
            return False
        if path_lower.endswith("uv.lock"):
            return False

        file_name = path.rsplit("/", 1)[-1].lower()

        if file_name == "dockerfile":
            return True

        ext = "." + file_name.rsplit(".", 1)[-1] if "." in file_name else ""
        return ext in self.SUPPORTED_EXTENSIONS


_github_client: GitHubClient | None = None


def get_github_client() -> GitHubClient:
    """Get the singleton GitHub client instance."""
    global _github_client
    if _github_client is None:
        _github_client = GitHubClient()
    return _github_client
