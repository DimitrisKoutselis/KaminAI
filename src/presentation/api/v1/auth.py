from fastapi import APIRouter, HTTPException, status, Depends

from src.application.services.auth_service import AuthService
from src.infrastructure.config.settings import get_settings
from src.presentation.schemas.auth import LoginRequest, LoginResponse, UserResponse
from src.presentation.api.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


def get_auth_service() -> AuthService:
    return AuthService()


@router.post("/login", response_model=LoginResponse)
async def login(
    request: LoginRequest,
    auth_service: AuthService = Depends(get_auth_service),
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

    # Get settings for profile info
    settings = get_settings()

    # Decode token to get user info
    payload = await auth_service.validate_token(token)

    return LoginResponse(
        access_token=token,
        username=payload["username"] if payload else request.username,
        is_admin=payload["is_admin"] if payload else False,
        first_name=settings.admin_first_name,
        last_name=settings.admin_last_name,
        nickname=settings.admin_nickname,
        birthday=settings.admin_birthday,
        display_name=settings.admin_display_name,
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: dict = Depends(get_current_user),
):
    """Get current authenticated user info."""
    settings = get_settings()

    return UserResponse(
        username=current_user["username"],
        is_admin=current_user["is_admin"],
        first_name=settings.admin_first_name,
        last_name=settings.admin_last_name,
        nickname=settings.admin_nickname,
        birthday=settings.admin_birthday,
        display_name=settings.admin_display_name,
    )
