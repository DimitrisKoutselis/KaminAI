"""MongoDB connection management."""

from typing import Optional

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from src.infrastructure.config import settings


_client: Optional[AsyncIOMotorClient] = None
_database: Optional[AsyncIOMotorDatabase] = None


async def init_mongodb() -> None:
    """Initialize MongoDB connection."""
    global _client, _database
    _client = AsyncIOMotorClient(settings.mongodb_uri)
    _database = _client[settings.mongodb_database]

    await _client.admin.command("ping")
    print(f"Connected to MongoDB: {settings.mongodb_database}")


async def close_mongodb() -> None:
    """Close MongoDB connection."""
    global _client, _database
    if _client:
        _client.close()
        _client = None
        _database = None
        print("MongoDB connection closed")


def get_database() -> AsyncIOMotorDatabase:
    """Get the database instance."""
    if _database is None:
        raise RuntimeError("MongoDB not initialized. Call init_mongodb() first.")
    return _database


def get_client() -> AsyncIOMotorClient:
    """Get the client instance."""
    if _client is None:
        raise RuntimeError("MongoDB not initialized. Call init_mongodb() first.")
    return _client
