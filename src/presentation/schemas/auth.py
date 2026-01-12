from typing import Optional
from pydantic import BaseModel


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
