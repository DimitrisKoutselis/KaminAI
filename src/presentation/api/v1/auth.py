from fastapi import APIRouter, HTTPException, status, Depends

from src.application.services.auth_service import AuthService
from src.application.services.admin_profile_service import AdminProfileService
from src.application.services.user_service import UserService
from src.domain.entities.user import User
from src.presentation.schemas.auth import (
    LoginRequest,
    LoginResponse,
    UserResponse,
    RegisterRequest,
    RegisterResponse,
    MessageLimitResponse,
)
from src.presentation.api.dependencies import (
    get_current_user,
    get_admin_profile_repository,
    get_admin_profile_service,
    get_user_repository,
    get_user_service,
)

router = APIRouter(prefix="/auth", tags=["Authentication"])


def get_auth_service() -> AuthService:
    return AuthService(
        profile_repository=get_admin_profile_repository(),
        user_repository=get_user_repository(),
    )


@router.post("/register", response_model=RegisterResponse)
async def register(
    request: RegisterRequest,
    user_service: UserService = Depends(get_user_service),
):
    """Register a new user account."""
    try:
        user = await user_service.register(
            username=request.username,
            password=request.password,
            email=request.email,
        )
        return RegisterResponse(id=user.id, username=user.username)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
        )


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

    payload = await auth_service.validate_token(token)
    is_admin = payload["is_admin"] if payload else False

    # Get profile info only for admin users
    first_name = ""
    last_name = ""
    nickname = ""
    birthday = ""
    display_name = ""

    if is_admin:
        profile = await profile_service.get_profile()
        first_name = profile.first_name
        last_name = profile.last_name
        nickname = profile.nickname
        birthday = profile.birthday or ""
        display_name = profile.display_name

    return LoginResponse(
        access_token=token,
        username=payload["username"] if payload else request.username,
        is_admin=is_admin,
        first_name=first_name,
        last_name=last_name,
        nickname=nickname,
        birthday=birthday,
        display_name=display_name,
    )


@router.get("/me", response_model=UserResponse)
async def get_current_user_info(
    current_user: dict = Depends(get_current_user),
    profile_service: AdminProfileService = Depends(get_admin_profile_service),
):
    """Get current authenticated user info."""
    is_admin = current_user.get("is_admin", False)

    first_name = ""
    last_name = ""
    nickname = ""
    birthday = ""
    display_name = ""

    if is_admin:
        profile = await profile_service.get_profile()
        first_name = profile.first_name
        last_name = profile.last_name
        nickname = profile.nickname
        birthday = profile.birthday or ""
        display_name = profile.display_name

    return UserResponse(
        username=current_user["username"],
        is_admin=is_admin,
        first_name=first_name,
        last_name=last_name,
        nickname=nickname,
        birthday=birthday,
        display_name=display_name,
    )


@router.get("/me/message-limit", response_model=MessageLimitResponse)
async def get_message_limit(
    current_user: dict = Depends(get_current_user),
    user_service: UserService = Depends(get_user_service),
):
    """Get the current user's message limit status."""
    user_id = current_user["sub"]
    is_admin = current_user.get("is_admin", False)

    if is_admin:
        return MessageLimitResponse(
            remaining_messages=User.MAX_MESSAGES,
            max_messages=User.MAX_MESSAGES,
            is_unlimited=True,
        )

    remaining = await user_service.get_remaining_messages(user_id)
    return MessageLimitResponse(
        remaining_messages=remaining,
        max_messages=User.MAX_MESSAGES,
        is_unlimited=False,
    )
