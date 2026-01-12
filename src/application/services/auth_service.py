from typing import Optional, Tuple

from src.infrastructure.config.settings import get_settings
from src.infrastructure.auth import (
    verify_password,
    create_access_token,
)


class AuthService:
    """Service for handling authentication."""

    def __init__(self):
        self._settings = get_settings()

    async def authenticate(
        self, username: str, password: str
    ) -> Tuple[bool, Optional[str]]:
        """
        Authenticate a user with username and password.
        Returns (success, token) tuple.
        """
        # Check against configured admin credentials
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

        return False, None

    async def validate_token(self, token: str) -> Optional[dict]:
        """Validate a JWT token and return the payload if valid."""
        from src.infrastructure.auth import decode_access_token

        return decode_access_token(token)
