"""Service for managing pinned GitHub repositories."""

from typing import List, Optional, Dict, Any
from uuid import UUID

from src.domain.entities.pinned_repo import PinnedRepo
from src.domain.repositories.pinned_repo_repository import PinnedRepoRepository
from src.application.services.portfolio_service import PortfolioService


class PinnedRepoService:
    """Application service for pinned repository operations."""

    def __init__(
        self,
        pinned_repo_repository: PinnedRepoRepository,
        portfolio_service: PortfolioService,
    ):
        self._repo = pinned_repo_repository
        self._portfolio_service = portfolio_service

    async def get_pinned_repos(self) -> List[PinnedRepo]:
        """Get all pinned repos ordered by display order."""
        return await self._repo.get_all()

    async def get_available_repos(self) -> List[Dict[str, Any]]:
        """Get all GitHub repos that can be pinned (not already pinned)."""
        all_repos = await self._portfolio_service.get_projects()
        pinned = await self._repo.get_all()
        pinned_names = {p.repo_name for p in pinned}

        return [
            {**repo, "is_pinned": repo["name"] in pinned_names}
            for repo in all_repos
        ]

    async def pin_repo(self, repo_name: str, display_name: Optional[str] = None) -> PinnedRepo:
        """Pin a GitHub repository.

        Args:
            repo_name: The name of the repository to pin
            display_name: Optional custom display name

        Returns:
            The created PinnedRepo entity

        Raises:
            ValueError: If the repo is already pinned or doesn't exist
        """
        existing = await self._repo.get_by_repo_name(repo_name)
        if existing:
            raise ValueError(f"Repository '{repo_name}' is already pinned")

        all_repos = await self._portfolio_service.get_projects()
        repo_data = next((r for r in all_repos if r["name"] == repo_name), None)

        if not repo_data:
            raise ValueError(f"Repository '{repo_name}' not found")

        count = await self._repo.count()

        pinned_repo = PinnedRepo.create(
            repo_name=repo_name,
            display_name=display_name or repo_name,
            description=repo_data.get("description"),
            url=repo_data["url"],
            language=repo_data.get("language"),
            stars=repo_data.get("stars", 0),
            forks=repo_data.get("forks", 0),
            topics=repo_data.get("topics", []),
            order=count,
        )

        return await self._repo.create(pinned_repo)

    async def unpin_repo(self, repo_id: UUID) -> bool:
        """Unpin a repository.

        Args:
            repo_id: The ID of the pinned repo to remove

        Returns:
            True if deleted, False if not found
        """
        return await self._repo.delete(repo_id)

    async def reorder_repos(self, repo_ids: List[UUID]) -> List[PinnedRepo]:
        """Reorder pinned repos.

        Args:
            repo_ids: List of repo IDs in the desired order

        Returns:
            Updated list of pinned repos
        """
        for order, repo_id in enumerate(repo_ids):
            repo = await self._repo.get_by_id(repo_id)
            if repo:
                repo.update_order(order)
                await self._repo.update(repo)

        return await self._repo.get_all()

    async def refresh_repo_data(self) -> List[PinnedRepo]:
        """Refresh pinned repos with latest data from GitHub.

        Returns:
            Updated list of pinned repos
        """
        pinned = await self._repo.get_all()
        all_repos = await self._portfolio_service.get_projects()
        repo_map = {r["name"]: r for r in all_repos}

        for repo in pinned:
            if repo.repo_name in repo_map:
                github_data = repo_map[repo.repo_name]
                repo.update_from_github(
                    description=github_data.get("description"),
                    stars=github_data.get("stars", 0),
                    forks=github_data.get("forks", 0),
                    topics=github_data.get("topics", []),
                )
                await self._repo.update(repo)

        return await self._repo.get_all()
