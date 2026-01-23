"""IGDB (Internet Game Database) API client for game lookups."""

import logging
from dataclasses import dataclass
from typing import Optional

import httpx

logger = logging.getLogger(__name__)


@dataclass
class MediaInfo:
    """Information about a media item from external database."""

    external_id: str
    title: str
    year: Optional[str]
    poster_url: Optional[str]
    external_url: str
    keywords: Optional[list[str]] = None  # Keywords/tags from external database


class IGDBClient:
    """Client for IGDB API (via Twitch)."""

    AUTH_URL = "https://id.twitch.tv/oauth2/token"
    BASE_URL = "https://api.igdb.com/v4"

    def __init__(self, client_id: str, client_secret: str):
        self.client_id = client_id
        self.client_secret = client_secret
        self._client: Optional[httpx.AsyncClient] = None
        self._access_token: Optional[str] = None

    async def _get_client(self) -> httpx.AsyncClient:
        if self._client is None:
            self._client = httpx.AsyncClient(timeout=10.0)
        return self._client

    async def close(self) -> None:
        if self._client:
            await self._client.aclose()
            self._client = None

    async def _authenticate(self) -> Optional[str]:
        """Get OAuth token from Twitch."""
        if self._access_token:
            return self._access_token

        try:
            client = await self._get_client()
            response = await client.post(
                self.AUTH_URL,
                params={
                    "client_id": self.client_id,
                    "client_secret": self.client_secret,
                    "grant_type": "client_credentials",
                },
            )
            response.raise_for_status()
            data = response.json()
            self._access_token = data.get("access_token")
            return self._access_token
        except Exception as e:
            logger.error(f"IGDB authentication error: {e}")
            return None

    async def search(self, title: str, media_type: str = "game", year: Optional[str] = None) -> Optional[MediaInfo]:
        """Search for a game by title."""
        if media_type != "game":
            return None

        try:
            token = await self._authenticate()
            if not token:
                return None

            client = await self._get_client()
            headers = {
                "Client-ID": self.client_id,
                "Authorization": f"Bearer {token}",
            }

            query = f'search "{title}"; fields name, first_release_date, cover.image_id, url, themes.name, genres.name, keywords.name; limit 1;'

            response = await client.post(
                f"{self.BASE_URL}/games",
                headers=headers,
                content=query,
            )
            response.raise_for_status()
            data = response.json()

            if data:
                result = data[0]
                release_timestamp = result.get("first_release_date")
                year_str = None
                if release_timestamp:
                    from datetime import datetime

                    year_str = str(datetime.fromtimestamp(release_timestamp).year)

                cover_id = result.get("cover", {}).get("image_id") if isinstance(result.get("cover"), dict) else None
                poster_url = f"https://images.igdb.com/igdb/image/upload/t_cover_big/{cover_id}.jpg" if cover_id else None

                keywords: list[str] = []
                for theme in result.get("themes", []):
                    if isinstance(theme, dict) and theme.get("name"):
                        keywords.append(theme["name"])
                for genre in result.get("genres", []):
                    if isinstance(genre, dict) and genre.get("name"):
                        keywords.append(genre["name"])
                for kw in result.get("keywords", []):
                    if isinstance(kw, dict) and kw.get("name"):
                        keywords.append(kw["name"])

                return MediaInfo(
                    external_id=str(result["id"]),
                    title=result["name"],
                    year=year_str,
                    poster_url=poster_url,
                    external_url=result.get("url", f"https://www.igdb.com/games/{result['id']}"),
                    keywords=keywords if keywords else None,
                )
            return None
        except Exception as e:
            logger.error(f"IGDB search error: {e}")
            return None
