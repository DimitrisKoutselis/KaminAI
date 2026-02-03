"""Service for user management operations."""

import re
from typing import Optional

from src.domain.entities.user import User
from src.domain.repositories.user_repository import UserRepository
from src.infrastructure.auth import hash_password


class UserService:
    """Service for handling user registration and management."""

    def __init__(self, user_repository: UserRepository):
        self._user_repository = user_repository

    async def register(
        self,
        username: str,
        password: str,
        email: Optional[str] = None,
    ) -> User:
        """
        Register a new user.

        Args:
            username: The desired username (3-30 alphanumeric characters)
            password: The password (minimum 8 characters)
            email: Optional email address

        Returns:
            The created user

        Raises:
            ValueError: If validation fails or username exists
        """
        # Validate username
        if not re.match(r"^[a-zA-Z0-9_]{3,30}$", username):
            raise ValueError(
                "Username must be 3-30 characters and contain only "
                "letters, numbers, and underscores"
            )

        # Validate password
        if len(password) < 8:
            raise ValueError("Password must be at least 8 characters")

        # Check if username already exists
        if await self._user_repository.exists_by_username(username):
            raise ValueError("Username already exists")

        # Create user
        hashed = hash_password(password)
        user = User.create(
            username=username,
            hashed_password=hashed,
            is_admin=False,
            email=email,
        )

        return await self._user_repository.create(user)

    async def get_by_id(self, user_id: str) -> Optional[User]:
        """Get a user by their ID."""
        return await self._user_repository.get_by_id(user_id)

    async def get_by_username(self, username: str) -> Optional[User]:
        """Get a user by their username."""
        return await self._user_repository.get_by_username(username)

    async def can_send_message(self, user_id: str) -> bool:
        """Check if a user can send a message."""
        user = await self._user_repository.get_by_id(user_id)
        if not user:
            return False
        return user.can_send_message()

    async def increment_message_count(self, user_id: str) -> Optional[User]:
        """Increment the message count for a user."""
        return await self._user_repository.increment_message_count(user_id)

    async def get_remaining_messages(self, user_id: str) -> int:
        """
        Get the number of remaining messages for a user.

        Returns:
            -1 for admin (unlimited), 0 or more for regular users
        """
        user = await self._user_repository.get_by_id(user_id)
        if not user:
            return 0
        return user.get_remaining_messages()
