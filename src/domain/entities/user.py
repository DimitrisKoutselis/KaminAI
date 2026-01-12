from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional
import uuid


@dataclass
class User:
    id: str
    username: str
    hashed_password: str
    is_admin: bool = False
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)

    @classmethod
    def create(
        cls,
        username: str,
        hashed_password: str,
        is_admin: bool = False,
    ) -> "User":
        now = datetime.utcnow()
        return cls(
            id=str(uuid.uuid4()),
            username=username,
            hashed_password=hashed_password,
            is_admin=is_admin,
            created_at=now,
            updated_at=now,
        )

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "username": self.username,
            "hashed_password": self.hashed_password,
            "is_admin": self.is_admin,
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
            created_at=data.get("created_at", datetime.utcnow()),
            updated_at=data.get("updated_at", datetime.utcnow()),
        )
