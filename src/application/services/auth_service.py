from typing import Optional, Tuple

from src.infrastructure.config.settings import get_settings
from src.infrastructure.auth import (
    verify_password,
    create_access_token,
)
from src.domain.repositories.admin_profile_repository import AdminProfileRepository
from src.domain.repositories.user_repository import UserRepository


class AuthService:
    """Service for handling authentication."""

    def __init__(
        self,
        profile_repository: Optional[AdminProfileRepository] = None,
        user_repository: Optional[UserRepository] = None,
    ):
        self._settings = get_settings()
        self._profile_repository = profile_repository
        self._user_repository = user_repository

    async def authenticate(
        self, username: str, password: str
    ) -> Tuple[bool, Optional[str]]:
        """
        Authenticate a user with username and password.
        Returns (success, token) tuple.

        Authentication order:
        1. Check admin profile (database)
        2. Check admin env vars (fallback)
        3. Check regular users
        """
        # 1. Try admin profile authentication
        if self._profile_repository:
            profile = await self._profile_repository.get()
            if profile and profile.username == username:
                if verify_password(password, profile.hashed_password):
                    token = create_access_token(
                        user_id="admin",
                        username=profile.username,
                        is_admin=True,
                    )
                    return True, token
                # Admin username matched but wrong password
                return False, None

        # 2. Try env vars admin (fallback)
        if (
            username == self._settings.admin_username
            and password == self._settings.admin_password
        ):
            token = create_access_token(
                user_id="admin",
                username=username,
                is_admin=True,
            )
            return True, token

        # 3. Try regular user authentication
        if self._user_repository:
            user = await self._user_repository.get_by_username(username)
            if user and verify_password(password, user.hashed_password):
                token = create_access_token(
                    user_id=user.id,
                    username=user.username,
                    is_admin=False,
                )
                return True, token

        return False, None

    async def validate_token(self, token: str) -> Optional[dict]:
        """Validate a JWT token and return the payload if valid."""
        from src.infrastructure.auth import decode_access_token

        return decode_access_token(token)
