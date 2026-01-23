from fastapi import APIRouter, HTTPException, status, Depends

from src.application.services.auth_service import AuthService
from src.application.services.admin_profile_service import AdminProfileService
from src.presentation.schemas.auth import LoginRequest, LoginResponse, UserResponse
from src.presentation.api.dependencies import (
    get_current_user,
    get_admin_profile_repository,
    get_admin_profile_service,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


def get_auth_service() -> AuthService:
    return AuthService(profile_repository=get_admin_profile_repository())


@router.post("/login", response_model=LoginResponse)
async def login(
    request: LoginRequest,
    auth_service: AuthService = Depends(get_auth_service),
    profile_service: AdminProfileService = Depends(get_admin_profile_service),
):
    """Authenticate user and return JWT token."""
    success, token = await auth_service.authenticate(
        request.username, request.password
    )

    if not success or not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    profile = await profile_service.get_profile()

    payload = await auth_service.validate_token(token)

    return LoginResponse(
        access_token=token,
        username=payload["username"] if payload else request.username,
        is_admin=payload["is_admin"] if payload else False,
        first_name=profile.first_name,
        last_name=profile.last_name,
        nickname=profile.nickname,
        birthday=profile.birthday or "",
        display_name=profile.display_name,
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: dict = Depends(get_current_user),
    profile_service: AdminProfileService = Depends(get_admin_profile_service),
):
    """Get current authenticated user info."""
    profile = await profile_service.get_profile()

    return UserResponse(
        username=current_user["username"],
        is_admin=current_user["is_admin"],
        first_name=profile.first_name,
        last_name=profile.last_name,
        nickname=profile.nickname,
        birthday=profile.birthday or "",
        display_name=profile.display_name,
    )
