"""Portfolio service for fetching GitHub repositories."""

import httpx
from typing import List, Dict, Any
from datetime import datetime, timedelta


class PortfolioService:
    """Service for fetching and caching GitHub repository data."""

    def __init__(self, github_token: str = "", github_username: str = ""):
        """Initialize the portfolio service.

        Args:
            github_token: GitHub personal access token (optional, for higher rate limits)
            github_username: GitHub username to fetch repositories for
        """
        self.github_token = github_token
        self.github_username = github_username
        self._cache: List[Dict[str, Any]] | None = None
        self._cache_time: datetime | None = None

    async def get_projects(self) -> List[Dict[str, Any]]:
        """Get public repositories for the configured GitHub user.

        Returns:
            List of repository data dictionaries
        """
        if (
            self._cache
            and self._cache_time
            and (datetime.now() - self._cache_time) < timedelta(hours=1)
        ):
            return self._cache

        projects = await self._fetch_repositories()
        self._cache = projects
        self._cache_time = datetime.now()
        return projects

    async def _fetch_repositories(self) -> List[Dict[str, Any]]:
        """Fetch repositories from GitHub API.

        Returns:
            List of repository data dictionaries
        """
        if not self.github_username:
            return []

        headers = {
            "Accept": "application/vnd.github+json",
            "X-GitHub-Api-Version": "2022-11-28",
        }
        if self.github_token:
            headers["Authorization"] = f"Bearer {self.github_token}"

        url = f"https://api.github.com/users/{self.github_username}/repos"
        params = {
            "type": "public",
            "sort": "updated",
            "per_page": 100,
        }

        async with httpx.AsyncClient() as client:
            response = await client.get(url, headers=headers, params=params)
            if response.status_code != 200:
                return []

            repos = response.json()
            return [
                {
                    "name": repo["name"],
                    "description": repo["description"],
                    "url": repo["html_url"],
                    "language": repo["language"],
                    "stars": repo["stargazers_count"],
                    "forks": repo["forks_count"],
                    "updated_at": repo["updated_at"],
                    "topics": repo.get("topics", []),
                }
                for repo in repos
                if not repo["fork"]  # Exclude forked repos
            ]
