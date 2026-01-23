"""Data transfer objects for admin profile operations."""

from dataclasses import dataclass
from typing import List, Optional


@dataclass
class ContactLinkDTO:
    """DTO for contact link data."""

    platform: str
    url: str
    label: str


@dataclass
class WorkExperienceDTO:
    """DTO for work experience data."""

    company: str
    role: str
    start_date: str
    end_date: Optional[str]
    description: str
    is_current: bool = False


@dataclass
class AboutSectionDTO:
    """DTO for about section data."""

    id: str
    title: str
    content: str


@dataclass
class CurrentlyItemDTO:
    """DTO for currently item data."""

    category: str  # "reading", "watching", "playing", "working_on"
    title: str
    subtitle: Optional[str] = None
    url: Optional[str] = None
    image_url: Optional[str] = None


@dataclass
class UpdateProfileDTO:
    """DTO for updating profile info (not credentials)."""

    first_name: Optional[str] = None
    last_name: Optional[str] = None
    nickname: Optional[str] = None
    birthday: Optional[str] = None
    bio: Optional[str] = None
    skills: Optional[List[str]] = None
    work_experience: Optional[List[WorkExperienceDTO]] = None
    about_sections: Optional[List[AboutSectionDTO]] = None
    contact_links: Optional[List[ContactLinkDTO]] = None
    currently: Optional[List[CurrentlyItemDTO]] = None


@dataclass
class UpdateCredentialsDTO:
    """DTO for updating username/password."""

    current_password: str
    username: Optional[str] = None
    new_password: Optional[str] = None
