"""API endpoints for pinned GitHub repositories."""

from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status

from src.application.services.pinned_repo_service import PinnedRepoService
from src.presentation.api.dependencies import (
    get_pinned_repo_service,
    get_current_admin,
)
from src.presentation.schemas.pinned_repo_schemas import (
    PinnedRepoResponse,
    AvailableRepoResponse,
    PinRepoRequest,
    ReorderReposRequest,
)

router = APIRouter(prefix="/pinned-repos", tags=["pinned-repos"])


@router.get("", response_model=List[PinnedRepoResponse])
async def get_pinned_repos(
    service: PinnedRepoService = Depends(get_pinned_repo_service),
):
    """Get all pinned repositories (public endpoint)."""
    repos = await service.get_pinned_repos()
    return [
        PinnedRepoResponse(
            id=str(repo.id),
            repo_name=repo.repo_name,
            display_name=repo.display_name,
            description=repo.description,
            url=repo.url,
            language=repo.language,
            stars=repo.stars,
            forks=repo.forks,
            topics=repo.topics,
            order=repo.order,
            pinned_at=repo.pinned_at,
        )
        for repo in repos
    ]


@router.get("/available", response_model=List[AvailableRepoResponse])
async def get_available_repos(
    _: dict = Depends(get_current_admin),
    service: PinnedRepoService = Depends(get_pinned_repo_service),
):
    """Get all available GitHub repositories with pin status (admin only)."""
    repos = await service.get_available_repos()
    return [
        AvailableRepoResponse(
            name=repo["name"],
            description=repo.get("description"),
            url=repo["url"],
            language=repo.get("language"),
            stars=repo.get("stars", 0),
            forks=repo.get("forks", 0),
            updated_at=repo.get("updated_at", ""),
            topics=repo.get("topics", []),
            is_pinned=repo.get("is_pinned", False),
        )
        for repo in repos
    ]


@router.post("", response_model=PinnedRepoResponse, status_code=status.HTTP_201_CREATED)
async def pin_repo(
    request: PinRepoRequest,
    _: dict = Depends(get_current_admin),
    service: PinnedRepoService = Depends(get_pinned_repo_service),
):
    """Pin a GitHub repository (admin only)."""
    try:
        repo = await service.pin_repo(
            repo_name=request.repo_name,
            display_name=request.display_name,
        )
        return PinnedRepoResponse(
            id=str(repo.id),
            repo_name=repo.repo_name,
            display_name=repo.display_name,
            description=repo.description,
            url=repo.url,
            language=repo.language,
            stars=repo.stars,
            forks=repo.forks,
            topics=repo.topics,
            order=repo.order,
            pinned_at=repo.pinned_at,
        )
    except ValueError as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.delete("/{repo_id}", status_code=status.HTTP_204_NO_CONTENT)
async def unpin_repo(
    repo_id: str,
    _: dict = Depends(get_current_admin),
    service: PinnedRepoService = Depends(get_pinned_repo_service),
):
    """Unpin a repository (admin only)."""
    try:
        deleted = await service.unpin_repo(UUID(repo_id))
        if not deleted:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pinned repository not found",
            )
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid repository ID",
        )


@router.put("/reorder", response_model=List[PinnedRepoResponse])
async def reorder_repos(
    request: ReorderReposRequest,
    _: dict = Depends(get_current_admin),
    service: PinnedRepoService = Depends(get_pinned_repo_service),
):
    """Reorder pinned repositories (admin only)."""
    try:
        repo_ids = [UUID(rid) for rid in request.repo_ids]
        repos = await service.reorder_repos(repo_ids)
        return [
            PinnedRepoResponse(
                id=str(repo.id),
                repo_name=repo.repo_name,
                display_name=repo.display_name,
                description=repo.description,
                url=repo.url,
                language=repo.language,
                stars=repo.stars,
                forks=repo.forks,
                topics=repo.topics,
                order=repo.order,
                pinned_at=repo.pinned_at,
            )
            for repo in repos
        ]
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid repository ID format",
        )


@router.post("/refresh", response_model=List[PinnedRepoResponse])
async def refresh_repos(
    _: dict = Depends(get_current_admin),
    service: PinnedRepoService = Depends(get_pinned_repo_service),
):
    """Refresh pinned repos with latest GitHub data (admin only)."""
    repos = await service.refresh_repo_data()
    return [
        PinnedRepoResponse(
            id=str(repo.id),
            repo_name=repo.repo_name,
            display_name=repo.display_name,
            description=repo.description,
            url=repo.url,
            language=repo.language,
            stars=repo.stars,
            forks=repo.forks,
            topics=repo.topics,
            order=repo.order,
            pinned_at=repo.pinned_at,
        )
        for repo in repos
    ]
