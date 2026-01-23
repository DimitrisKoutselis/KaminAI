"""API v1 router aggregator."""

from fastapi import APIRouter

from src.presentation.api.v1.health import router as health_router
from src.presentation.api.v1.articles import router as articles_router
from src.presentation.api.v1.auth import router as auth_router
from src.presentation.api.v1.portfolio import router as portfolio_router
from src.presentation.api.v1.uploads import router as uploads_router
from src.presentation.api.v1.chat import router as chat_router
from src.presentation.api.v1.leaderboard import router as leaderboard_router
from src.presentation.api.v1.profile import router as profile_router
from src.presentation.api.v1.text_enhancement import router as text_enhancement_router

api_router = APIRouter()

api_router.include_router(health_router)
api_router.include_router(auth_router)
api_router.include_router(articles_router)
api_router.include_router(portfolio_router)
api_router.include_router(uploads_router)
api_router.include_router(chat_router)
api_router.include_router(leaderboard_router)
api_router.include_router(profile_router)
api_router.include_router(text_enhancement_router)
