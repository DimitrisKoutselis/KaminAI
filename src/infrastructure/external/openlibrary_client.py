"""Open Library API client for book lookups."""

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


class OpenLibraryClient:
    """Client for Open Library API (no API key required)."""

    BASE_URL = "https://openlibrary.org"
    COVERS_URL = "https://covers.openlibrary.org"

    def __init__(self):
        self._client: Optional[httpx.AsyncClient] = None

    async def _get_client(self) -> httpx.AsyncClient:
        if self._client is None:
            self._client = httpx.AsyncClient(timeout=10.0)
        return self._client

    async def close(self) -> None:
        if self._client:
            await self._client.aclose()
            self._client = None

    async def search(self, title: str, media_type: str = "book", year: Optional[str] = None) -> Optional[MediaInfo]:
        """Search for a book by title."""
        if media_type != "book":
            return None

        try:
            client = await self._get_client()
            params = {
                "title": title,
                "limit": 1,
                # Explicitly request fields including subject (required since Jan 2025 API change)
                "fields": "key,title,first_publish_year,cover_i,subject",
            }

            response = await client.get(f"{self.BASE_URL}/search.json", params=params)
            response.raise_for_status()
            data = response.json()

            if data.get("docs"):
                result = data["docs"][0]
                key = result.get("key", "")  # e.g., "/works/OL123W"
                work_id = key.split("/")[-1] if key else None

                # Get cover image
                cover_id = result.get("cover_i")
                poster_url = f"{self.COVERS_URL}/b/id/{cover_id}-L.jpg" if cover_id else None

                # Get publication year
                publish_year = result.get("first_publish_year")

                # Extract subjects as keywords
                subjects = result.get("subject", [])
                keywords = subjects[:20] if subjects else None  # Limit to 20 subjects

                return MediaInfo(
                    external_id=work_id or str(result.get("_version_", "")),
                    title=result.get("title", title),
                    year=str(publish_year) if publish_year else None,
                    poster_url=poster_url,
                    external_url=f"{self.BASE_URL}{key}" if key else f"{self.BASE_URL}/search?title={title}",
                    keywords=keywords,
                )
            return None
        except Exception as e:
            logger.error(f"Open Library search error: {e}")
            return None
