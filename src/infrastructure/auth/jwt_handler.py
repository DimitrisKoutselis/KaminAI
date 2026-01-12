import jwt
from datetime import datetime, timedelta
from typing import Optional

from src.infrastructure.config.settings import get_settings


def create_access_token(user_id: str, username: str, is_admin: bool) -> str:
    """Create a JWT access token."""
    settings = get_settings()

    payload = {
        "sub": user_id,
        "username": username,
        "is_admin": is_admin,
        "exp": datetime.utcnow() + timedelta(hours=settings.jwt_expiration_hours),
        "iat": datetime.utcnow(),
    }

    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def decode_access_token(token: str) -> Optional[dict]:
    """Decode and validate a JWT access token."""
    settings = get_settings()

    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )
        return payload
    except jwt.ExpiredSignatureError:
        return None
    except jwt.InvalidTokenError:
        return None
