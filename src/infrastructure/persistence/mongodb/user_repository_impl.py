"""MongoDB implementation of UserRepository."""

from datetime import datetime
from typing import Optional

from motor.motor_asyncio import AsyncIOMotorCollection
from pymongo import ReturnDocument

from src.domain.entities.user import User
from src.domain.repositories.user_repository import UserRepository


class MongoDBUserRepository(UserRepository):
    """MongoDB implementation of the user repository."""

    def __init__(self, collection: AsyncIOMotorCollection):
        self._collection = collection

    async def get_by_id(self, user_id: str) -> Optional[User]:
        """Get a user by their ID."""
        doc = await self._collection.find_one({"_id": user_id})
        return self._to_entity(doc) if doc else None

    async def get_by_username(self, username: str) -> Optional[User]:
        """Get a user by their username."""
        doc = await self._collection.find_one({"username": username})
        return self._to_entity(doc) if doc else None

    async def create(self, user: User) -> User:
        """Create a new user."""
        doc = {
            "_id": user.id,
            "username": user.username,
            "hashed_password": user.hashed_password,
            "is_admin": user.is_admin,
            "message_count": user.message_count,
            "email": user.email,
            "created_at": user.created_at,
            "updated_at": user.updated_at,
        }
        await self._collection.insert_one(doc)
        return user

    async def update(self, user: User) -> User:
        """Update an existing user."""
        doc = {
            "_id": user.id,
            "username": user.username,
            "hashed_password": user.hashed_password,
            "is_admin": user.is_admin,
            "message_count": user.message_count,
            "email": user.email,
            "created_at": user.created_at,
            "updated_at": user.updated_at,
        }
        await self._collection.replace_one({"_id": user.id}, doc)
        return user

    async def exists_by_username(self, username: str) -> bool:
        """Check if a username already exists."""
        count = await self._collection.count_documents({"username": username}, limit=1)
        return count > 0

    async def increment_message_count(self, user_id: str) -> Optional[User]:
        """Increment the message count for a user and return the updated user."""
        result = await self._collection.find_one_and_update(
            {"_id": user_id},
            {
                "$inc": {"message_count": 1},
                "$set": {"updated_at": datetime.utcnow()},
            },
            return_document=ReturnDocument.AFTER,
        )
        return self._to_entity(result) if result else None

    def _to_entity(self, doc: dict) -> User:
        """Convert MongoDB document to User entity."""
        return User(
            id=doc["_id"],
            username=doc["username"],
            hashed_password=doc["hashed_password"],
            is_admin=doc.get("is_admin", False),
            message_count=doc.get("message_count", 0),
            email=doc.get("email"),
            created_at=doc.get("created_at", datetime.utcnow()),
            updated_at=doc.get("updated_at", datetime.utcnow()),
        )
