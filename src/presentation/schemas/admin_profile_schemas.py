"""Pydantic schemas for admin profile API."""

from typing import List, Optional
from pydantic import BaseModel


class ContactLinkSchema(BaseModel):
    """Schema for contact/social link."""

    platform: str
    url: str
    label: str


class WorkExperienceSchema(BaseModel):
    """Schema for work experience entry."""

    company: str
    role: str
    start_date: str
    end_date: Optional[str] = None
    description: str
    is_current: bool = False


class AboutSectionSchema(BaseModel):
    """Schema for about page section."""

    id: str
    title: str
    content: str


class CurrentlyItemSchema(BaseModel):
    """Schema for currently item (what you're reading/watching/etc)."""

    category: str  # "reading", "watching", "playing", "working_on"
    title: str
    subtitle: Optional[str] = None
    url: Optional[str] = None
    image_url: Optional[str] = None


class PublicProfileResponse(BaseModel):
    """Public profile data for About page (no sensitive info)."""

    first_name: str
    last_name: str
    nickname: str
    display_name: str
    bio: str
    skills: List[str]
    work_experience: List[WorkExperienceSchema]
    about_sections: List[AboutSectionSchema]
    contact_links: List[ContactLinkSchema]
    currently: List[CurrentlyItemSchema]


class AdminProfileResponse(PublicProfileResponse):
    """Full profile data for admin (includes username, birthday)."""

    username: str
    birthday: Optional[str] = None


class UpdateProfileRequest(BaseModel):
    """Request to update profile content (not credentials)."""

    first_name: Optional[str] = None
    last_name: Optional[str] = None
    nickname: Optional[str] = None
    birthday: Optional[str] = None
    bio: Optional[str] = None
    skills: Optional[List[str]] = None
    work_experience: Optional[List[WorkExperienceSchema]] = None
    about_sections: Optional[List[AboutSectionSchema]] = None
    contact_links: Optional[List[ContactLinkSchema]] = None
    currently: Optional[List[CurrentlyItemSchema]] = None


class UpdateCredentialsRequest(BaseModel):
    """Request to update username/password."""

    current_password: str
    username: Optional[str] = None
    new_password: Optional[str] = None
