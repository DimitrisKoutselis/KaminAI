"""FastAPI application entry point."""

from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.trustedhost import TrustedHostMiddleware
from starlette.types import ASGIApp, Receive, Scope, Send

from src.infrastructure.config.settings import get_settings

settings = get_settings()
from src.infrastructure.persistence.mongodb.connection import init_mongodb, close_mongodb
from src.presentation.api.v1.router import api_router
from src.infrastructure.ai.graph.chat_graph import get_chat_graph


class ProxyHeadersMiddleware:
    """Middleware to handle X-Forwarded-Proto and other proxy headers."""

    def __init__(self, app: ASGIApp) -> None:
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] == "http":
            # Check for X-Forwarded-Proto header from reverse proxy
            headers = dict(scope.get("headers", []))
            if b"x-forwarded-proto" in headers:
                scheme = headers[b"x-forwarded-proto"].decode()
                scope["scheme"] = scheme

            # Check for X-Forwarded-For header
            if b"x-forwarded-for" in headers:
                # Keep the original client IP
                pass

        await self.app(scope, receive, send)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager for startup and shutdown."""
    print(f"Starting {settings.app_name}...")
    await init_mongodb()

    if settings.google_api_key:
        print("Initializing AI chat system...")
        try:
            chat_graph = get_chat_graph()
            await chat_graph.initialize()
            print("AI chat system initialized successfully!")
        except Exception as e:
            print(f"Warning: Failed to initialize AI chat system: {e}")
    else:
        print("Skipping AI chat initialization (no GOOGLE_API_KEY configured)")

    print(f"{settings.app_name} started successfully!")

    yield

    print(f"Shutting down {settings.app_name}...")
    await close_mongodb()
    print(f"{settings.app_name} shut down complete.")


app = FastAPI(
    title=settings.app_name,
    description="Personal blog and portfolio website",
    version="1.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(ProxyHeadersMiddleware)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=f"/api/{settings.api_version}")


@app.get("/")
async def root():
    """Root endpoint."""
    return {
        "name": settings.app_name,
        "version": "1.0.0",
        "docs": "/docs",
        "api": f"/api/{settings.api_version}",
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "src.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug,
    )
