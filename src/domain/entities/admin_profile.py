"""Admin profile entity for managing site owner information."""

from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import List, Optional


@dataclass
class ContactLink:
    """A single contact/social link."""

    platform: str  # e.g., "github", "email", "linkedin"
    url: str  # e.g., "https://github.com/user", "mailto:..."
    label: str  # Display label, e.g., "GitHub", "Email Me"

    def to_dict(self) -> dict:
        return {"platform": self.platform, "url": self.url, "label": self.label}

    @classmethod
    def from_dict(cls, data: dict) -> "ContactLink":
        return cls(
            platform=data["platform"],
            url=data["url"],
            label=data["label"],
        )


@dataclass
class WorkExperience:
    """A single work experience entry."""

    company: str
    role: str
    start_date: str  # YYYY-MM format
    end_date: Optional[str]  # YYYY-MM or None if current
    description: str
    is_current: bool = False

    def to_dict(self) -> dict:
        return {
            "company": self.company,
            "role": self.role,
            "start_date": self.start_date,
            "end_date": self.end_date,
            "description": self.description,
            "is_current": self.is_current,
        }

    @classmethod
    def from_dict(cls, data: dict) -> "WorkExperience":
        return cls(
            company=data["company"],
            role=data["role"],
            start_date=data["start_date"],
            end_date=data.get("end_date"),
            description=data["description"],
            is_current=data.get("is_current", False),
        )


@dataclass
class AboutSection:
    """A content section for the About page."""

    id: str  # e.g., "introduction", "journey", "philosophy"
    title: str  # Section heading
    content: str  # Markdown content

    def to_dict(self) -> dict:
        return {"id": self.id, "title": self.title, "content": self.content}

    @classmethod
    def from_dict(cls, data: dict) -> "AboutSection":
        return cls(
            id=data["id"],
            title=data["title"],
            content=data["content"],
        )


@dataclass
class CurrentlyItem:
    """An item representing what the admin is currently doing."""

    category: str  # "reading", "watching", "playing", "working_on"
    title: str
    subtitle: Optional[str] = None  # e.g., author for books, platform for games
    url: Optional[str] = None  # Link to the item
    image_url: Optional[str] = None  # Cover image

    def to_dict(self) -> dict:
        return {
            "category": self.category,
            "title": self.title,
            "subtitle": self.subtitle,
            "url": self.url,
            "image_url": self.image_url,
        }

    @classmethod
    def from_dict(cls, data: dict) -> "CurrentlyItem":
        return cls(
            category=data["category"],
            title=data["title"],
            subtitle=data.get("subtitle"),
            url=data.get("url"),
            image_url=data.get("image_url"),
        )


@dataclass
class AdminProfile:
    """Domain entity for the admin profile (singleton)."""

    id: str
    username: str
    hashed_password: str

    first_name: str
    last_name: str
    nickname: str
    birthday: Optional[str]

    bio: str
    skills: List[str]
    work_experience: List[WorkExperience]
    about_sections: List[AboutSection]
    contact_links: List[ContactLink]

    created_at: datetime
    updated_at: datetime

    currently: List["CurrentlyItem"] = field(default_factory=list)

    SINGLETON_ID: str = field(default="admin", init=False, repr=False)

    @property
    def display_name(self) -> str:
        """Return nickname if set, otherwise 'FirstName LastName'."""
        if self.nickname:
            return self.nickname
        parts = [self.first_name, self.last_name]
        return " ".join(p for p in parts if p)

    @classmethod
    def create(
        cls,
        username: str,
        hashed_password: str,
        first_name: str = "",
        last_name: str = "",
        nickname: str = "",
        birthday: Optional[str] = None,
        bio: str = "",
        skills: Optional[List[str]] = None,
        work_experience: Optional[List[WorkExperience]] = None,
        about_sections: Optional[List[AboutSection]] = None,
        contact_links: Optional[List[ContactLink]] = None,
        currently: Optional[List["CurrentlyItem"]] = None,
    ) -> "AdminProfile":
        """Factory method to create a new admin profile."""
        now = datetime.now(timezone.utc)
        return cls(
            id="admin",
            username=username,
            hashed_password=hashed_password,
            first_name=first_name,
            last_name=last_name,
            nickname=nickname,
            birthday=birthday,
            bio=bio,
            skills=skills or [],
            work_experience=work_experience or [],
            about_sections=about_sections or [],
            contact_links=contact_links or [],
            currently=currently or [],
            created_at=now,
            updated_at=now,
        )

    def update(
        self,
        first_name: Optional[str] = None,
        last_name: Optional[str] = None,
        nickname: Optional[str] = None,
        birthday: Optional[str] = None,
        bio: Optional[str] = None,
        skills: Optional[List[str]] = None,
        work_experience: Optional[List[WorkExperience]] = None,
        about_sections: Optional[List[AboutSection]] = None,
        contact_links: Optional[List[ContactLink]] = None,
        currently: Optional[List["CurrentlyItem"]] = None,
    ) -> None:
        """Update profile fields."""
        if first_name is not None:
            self.first_name = first_name
        if last_name is not None:
            self.last_name = last_name
        if nickname is not None:
            self.nickname = nickname
        if birthday is not None:
            self.birthday = birthday
        if bio is not None:
            self.bio = bio
        if skills is not None:
            self.skills = skills
        if work_experience is not None:
            self.work_experience = work_experience
        if about_sections is not None:
            self.about_sections = about_sections
        if contact_links is not None:
            self.contact_links = contact_links
        if currently is not None:
            self.currently = currently

        self.updated_at = datetime.now(timezone.utc)

    def update_credentials(
        self,
        username: Optional[str] = None,
        hashed_password: Optional[str] = None,
    ) -> None:
        """Update username and/or password."""
        if username is not None:
            self.username = username
        if hashed_password is not None:
            self.hashed_password = hashed_password

        self.updated_at = datetime.now(timezone.utc)

    def to_dict(self) -> dict:
        """Convert entity to dictionary for persistence."""
        return {
            "id": self.id,
            "username": self.username,
            "hashed_password": self.hashed_password,
            "first_name": self.first_name,
            "last_name": self.last_name,
            "nickname": self.nickname,
            "birthday": self.birthday,
            "bio": self.bio,
            "skills": self.skills,
            "work_experience": [we.to_dict() for we in self.work_experience],
            "about_sections": [s.to_dict() for s in self.about_sections],
            "contact_links": [cl.to_dict() for cl in self.contact_links],
            "currently": [c.to_dict() for c in self.currently],
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }

    @classmethod
    def from_dict(cls, data: dict) -> "AdminProfile":
        """Create entity from dictionary."""
        return cls(
            id=data["id"],
            username=data["username"],
            hashed_password=data["hashed_password"],
            first_name=data.get("first_name", ""),
            last_name=data.get("last_name", ""),
            nickname=data.get("nickname", ""),
            birthday=data.get("birthday"),
            bio=data.get("bio", ""),
            skills=data.get("skills", []),
            work_experience=[
                WorkExperience.from_dict(we) for we in data.get("work_experience", [])
            ],
            about_sections=[
                AboutSection.from_dict(s) for s in data.get("about_sections", [])
            ],
            contact_links=[
                ContactLink.from_dict(cl) for cl in data.get("contact_links", [])
            ],
            currently=[
                CurrentlyItem.from_dict(c) for c in data.get("currently", [])
            ],
            created_at=data["created_at"],
            updated_at=data["updated_at"],
        )
