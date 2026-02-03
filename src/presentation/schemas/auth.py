from typing import Optional
from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    username: str
    password: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    username: str
    is_admin: bool
    first_name: str = ""
    last_name: str = ""
    nickname: str = ""
    birthday: str = ""
    display_name: str = ""


class UserResponse(BaseModel):
    username: str
    is_admin: bool
    first_name: str = ""
    last_name: str = ""
    nickname: str = ""
    birthday: str = ""
    display_name: str = ""


class RegisterRequest(BaseModel):
    username: str = Field(
        min_length=3,
        max_length=30,
        pattern=r"^[a-zA-Z0-9_]+$",
        description="Username (3-30 alphanumeric characters or underscores)",
    )
    password: str = Field(
        min_length=8,
        description="Password (minimum 8 characters)",
    )
    email: Optional[str] = Field(
        default=None,
        description="Optional email address",
    )


class RegisterResponse(BaseModel):
    id: str
    username: str
    message: str = "Registration successful"


class MessageLimitResponse(BaseModel):
    remaining_messages: int
    max_messages: int
    is_unlimited: bool
