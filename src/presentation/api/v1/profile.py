"""API routes for admin profile management."""

from fastapi import APIRouter, Depends, HTTPException, status

from src.presentation.schemas.admin_profile_schemas import (
    PublicProfileResponse,
    AdminProfileResponse,
    UpdateProfileRequest,
    UpdateCredentialsRequest,
)
from src.presentation.api.dependencies import (
    get_current_admin,
    get_admin_profile_service,
)
from src.application.services.admin_profile_service import AdminProfileService

router = APIRouter(prefix="/profile", tags=["Profile"])


@router.get("", response_model=PublicProfileResponse)
async def get_public_profile(
    profile_service: AdminProfileService = Depends(get_admin_profile_service),
):
    """Get public profile data for About page (no auth required)."""
    profile_data = await profile_service.get_public_profile()
    return PublicProfileResponse(**profile_data)


@router.get("/admin", response_model=AdminProfileResponse)
async def get_admin_profile(
    current_admin: dict = Depends(get_current_admin),
    profile_service: AdminProfileService = Depends(get_admin_profile_service),
):
    """Get full profile data (admin only)."""
    profile_data = await profile_service.get_admin_profile()
    return AdminProfileResponse(**profile_data)


@router.put("/admin", response_model=AdminProfileResponse)
async def update_profile(
    request: UpdateProfileRequest,
    current_admin: dict = Depends(get_current_admin),
    profile_service: AdminProfileService = Depends(get_admin_profile_service),
):
    """Update profile content (admin only)."""
    work_experience = None
    if request.work_experience is not None:
        work_experience = [we.model_dump() for we in request.work_experience]

    about_sections = None
    if request.about_sections is not None:
        about_sections = [s.model_dump() for s in request.about_sections]

    contact_links = None
    if request.contact_links is not None:
        contact_links = [cl.model_dump() for cl in request.contact_links]

    currently = None
    if request.currently is not None:
        currently = [c.model_dump() for c in request.currently]

    await profile_service.update_profile(
        first_name=request.first_name,
        last_name=request.last_name,
        nickname=request.nickname,
        birthday=request.birthday,
        bio=request.bio,
        skills=request.skills,
        work_experience=work_experience,
        about_sections=about_sections,
        contact_links=contact_links,
        currently=currently,
    )

    profile_data = await profile_service.get_admin_profile()
    return AdminProfileResponse(**profile_data)


@router.put("/admin/credentials", response_model=AdminProfileResponse)
async def update_credentials(
    request: UpdateCredentialsRequest,
    current_admin: dict = Depends(get_current_admin),
    profile_service: AdminProfileService = Depends(get_admin_profile_service),
):
    """Update username/password (admin only)."""
    try:
        await profile_service.update_credentials(
            current_password=request.current_password,
            username=request.username,
            new_password=request.new_password,
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )

    profile_data = await profile_service.get_admin_profile()
    return AdminProfileResponse(**profile_data)
