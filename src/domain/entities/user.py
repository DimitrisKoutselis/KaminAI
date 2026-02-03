from dataclasses import dataclass, field
from datetime import datetime
from typing import ClassVar, Optional
import uuid


@dataclass
class User:
    MAX_MESSAGES: ClassVar[int] = 5

    id: str
    username: str
    hashed_password: str
    is_admin: bool = False
    message_count: int = 0
    email: Optional[str] = None
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)

    @classmethod
    def create(
        cls,
        username: str,
        hashed_password: str,
        is_admin: bool = False,
        email: Optional[str] = None,
    ) -> "User":
        now = datetime.utcnow()
        return cls(
            id=str(uuid.uuid4()),
            username=username,
            hashed_password=hashed_password,
            is_admin=is_admin,
            message_count=0,
            email=email,
            created_at=now,
            updated_at=now,
        )

    def can_send_message(self) -> bool:
        """Check if user can send a message (admin has unlimited)."""
        return self.is_admin or self.message_count < self.MAX_MESSAGES

    def increment_message_count(self) -> None:
        """Increment the message count and update timestamp."""
        self.message_count += 1
        self.updated_at = datetime.utcnow()

    def get_remaining_messages(self) -> int:
        """Get remaining messages (-1 for unlimited/admin)."""
        if self.is_admin:
            return -1
        return max(0, self.MAX_MESSAGES - self.message_count)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "username": self.username,
            "hashed_password": self.hashed_password,
            "is_admin": self.is_admin,
            "message_count": self.message_count,
            "email": self.email,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }

    @classmethod
    def from_dict(cls, data: dict) -> "User":
        return cls(
            id=data["id"],
            username=data["username"],
            hashed_password=data["hashed_password"],
            is_admin=data.get("is_admin", False),
            message_count=data.get("message_count", 0),
            email=data.get("email"),
            created_at=data.get("created_at", datetime.utcnow()),
            updated_at=data.get("updated_at", datetime.utcnow()),
        )
