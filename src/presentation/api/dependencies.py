"""FastAPI dependencies for dependency injection."""

from functools import lru_cache
from typing import Generator, Optional

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from src.infrastructure.config.settings import get_settings
from src.infrastructure.auth import decode_access_token

security = HTTPBearer()
settings = get_settings()
from src.infrastructure.persistence.mongodb.connection import get_database
from src.infrastructure.persistence.mongodb.article_repository_impl import (
    MongoDBArticleRepository,
)
from src.application.services.article_service import ArticleService
from src.application.services.portfolio_service import PortfolioService
from src.application.services.chat_service import ChatService


# Singleton instances
_portfolio_service: PortfolioService | None = None
_chat_service: ChatService | None = None


def get_article_repository() -> MongoDBArticleRepository:
    """Get article repository instance."""
    db = get_database()
    return MongoDBArticleRepository(db["articles"])


def get_article_service() -> ArticleService:
    """Get article service instance."""
    return ArticleService(
        article_repository=get_article_repository(),
    )


def get_portfolio_service() -> PortfolioService:
    """Get or create the portfolio service singleton."""
    global _portfolio_service
    if _portfolio_service is None:
        _portfolio_service = PortfolioService(
            github_token=settings.github_token,
            github_username=settings.github_username,
        )
    return _portfolio_service


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
) -> dict:
    """Get the current authenticated user from JWT token."""
    token = credentials.credentials
    payload = decode_access_token(token)

    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return payload


async def get_current_admin(
    current_user: dict = Depends(get_current_user),
) -> dict:
    """Require the current user to be an admin."""
    if not current_user.get("is_admin", False):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user


def get_chat_service() -> ChatService:
    """Get or create the chat service singleton."""
    global _chat_service
    if _chat_service is None:
        _chat_service = ChatService()
    return _chat_service
