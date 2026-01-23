"""MongoDB implementation of AdminProfileRepository."""

from typing import Optional

from motor.motor_asyncio import AsyncIOMotorCollection

from src.domain.entities.admin_profile import (
    AdminProfile,
    ContactLink,
    WorkExperience,
    AboutSection,
    CurrentlyItem,
)
from src.domain.repositories.admin_profile_repository import AdminProfileRepository


class MongoDBAdminProfileRepository(AdminProfileRepository):
    """MongoDB implementation of the admin profile repository (singleton)."""

    PROFILE_ID = "admin"

    def __init__(self, collection: AsyncIOMotorCollection):
        self._collection = collection

    async def get(self) -> Optional[AdminProfile]:
        """Get the singleton admin profile."""
        doc = await self._collection.find_one({"_id": self.PROFILE_ID})
        return self._to_entity(doc) if doc else None

    async def save(self, profile: AdminProfile) -> None:
        """Save or update the admin profile."""
        doc = {
            "_id": self.PROFILE_ID,
            "username": profile.username,
            "hashed_password": profile.hashed_password,
            "first_name": profile.first_name,
            "last_name": profile.last_name,
            "nickname": profile.nickname,
            "birthday": profile.birthday,
            "bio": profile.bio,
            "skills": profile.skills,
            "work_experience": [we.to_dict() for we in profile.work_experience],
            "about_sections": [s.to_dict() for s in profile.about_sections],
            "contact_links": [cl.to_dict() for cl in profile.contact_links],
            "currently": [c.to_dict() for c in profile.currently],
            "created_at": profile.created_at,
            "updated_at": profile.updated_at,
        }
        await self._collection.replace_one({"_id": self.PROFILE_ID}, doc, upsert=True)

    async def exists(self) -> bool:
        """Check if admin profile exists in database."""
        count = await self._collection.count_documents({"_id": self.PROFILE_ID}, limit=1)
        return count > 0

    def _to_entity(self, doc: dict) -> AdminProfile:
        """Convert MongoDB document to AdminProfile entity."""
        return AdminProfile(
            id=doc["_id"],
            username=doc["username"],
            hashed_password=doc["hashed_password"],
            first_name=doc.get("first_name", ""),
            last_name=doc.get("last_name", ""),
            nickname=doc.get("nickname", ""),
            birthday=doc.get("birthday"),
            bio=doc.get("bio", ""),
            skills=doc.get("skills", []),
            work_experience=[
                WorkExperience.from_dict(we) for we in doc.get("work_experience", [])
            ],
            about_sections=[
                AboutSection.from_dict(s) for s in doc.get("about_sections", [])
            ],
            contact_links=[
                ContactLink.from_dict(cl) for cl in doc.get("contact_links", [])
            ],
            currently=[
                CurrentlyItem.from_dict(c) for c in doc.get("currently", [])
            ],
            created_at=doc["created_at"],
            updated_at=doc["updated_at"],
        )
