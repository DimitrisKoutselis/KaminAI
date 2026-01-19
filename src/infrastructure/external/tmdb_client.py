"""TMDB (The Movie Database) API client for movies and series lookups."""

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


class TMDBClient:
    """Client for The Movie Database API."""

    BASE_URL = "https://api.themoviedb.org/3"
    IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500"

    def __init__(self, api_key: str):
        self.api_key = api_key
        self._client: Optional[httpx.AsyncClient] = None

    async def _get_client(self) -> httpx.AsyncClient:
        if self._client is None:
            self._client = httpx.AsyncClient(timeout=10.0)
        return self._client

    async def close(self) -> None:
        if self._client:
            await self._client.aclose()
            self._client = None

    async def _get_movie_keywords(self, movie_id: str) -> list[str]:
        """Fetch keywords for a movie."""
        try:
            client = await self._get_client()
            response = await client.get(
                f"{self.BASE_URL}/movie/{movie_id}/keywords",
                params={"api_key": self.api_key},
            )
            response.raise_for_status()
            data = response.json()
            return [kw["name"] for kw in data.get("keywords", [])]
        except Exception as e:
            logger.warning(f"Failed to fetch movie keywords: {e}")
            return []

    async def _get_tv_keywords(self, tv_id: str) -> list[str]:
        """Fetch keywords for a TV series."""
        try:
            client = await self._get_client()
            response = await client.get(
                f"{self.BASE_URL}/tv/{tv_id}/keywords",
                params={"api_key": self.api_key},
            )
            response.raise_for_status()
            data = response.json()
            return [kw["name"] for kw in data.get("results", [])]
        except Exception as e:
            logger.warning(f"Failed to fetch TV keywords: {e}")
            return []

    async def search_movie(self, title: str, year: Optional[str] = None) -> Optional[MediaInfo]:
        """Search for a movie by title."""
        try:
            client = await self._get_client()
            params = {
                "api_key": self.api_key,
                "query": title,
                "include_adult": "false",
            }
            if year:
                params["year"] = year

            response = await client.get(f"{self.BASE_URL}/search/movie", params=params)
            response.raise_for_status()
            data = response.json()

            if data.get("results"):
                result = data["results"][0]
                movie_id = str(result["id"])
                release_date = result.get("release_date", "")

                # Fetch keywords for this movie
                keywords = await self._get_movie_keywords(movie_id)

                return MediaInfo(
                    external_id=movie_id,
                    title=result["title"],
                    year=release_date[:4] if release_date else None,
                    poster_url=f"{self.IMAGE_BASE_URL}{result['poster_path']}" if result.get("poster_path") else None,
                    external_url=f"https://www.themoviedb.org/movie/{movie_id}",
                    keywords=keywords if keywords else None,
                )
            return None
        except Exception as e:
            logger.error(f"TMDB movie search error: {e}")
            return None

    async def search_tv(self, title: str, year: Optional[str] = None) -> Optional[MediaInfo]:
        """Search for a TV series by title."""
        try:
            client = await self._get_client()
            params = {
                "api_key": self.api_key,
                "query": title,
                "include_adult": "false",
            }
            if year:
                params["first_air_date_year"] = year

            response = await client.get(f"{self.BASE_URL}/search/tv", params=params)
            response.raise_for_status()
            data = response.json()

            if data.get("results"):
                result = data["results"][0]
                tv_id = str(result["id"])
                first_air = result.get("first_air_date", "")

                # Fetch keywords for this TV series
                keywords = await self._get_tv_keywords(tv_id)

                return MediaInfo(
                    external_id=tv_id,
                    title=result["name"],
                    year=first_air[:4] if first_air else None,
                    poster_url=f"{self.IMAGE_BASE_URL}{result['poster_path']}" if result.get("poster_path") else None,
                    external_url=f"https://www.themoviedb.org/tv/{tv_id}",
                    keywords=keywords if keywords else None,
                )
            return None
        except Exception as e:
            logger.error(f"TMDB TV search error: {e}")
            return None

    async def search(self, title: str, media_type: str, year: Optional[str] = None) -> Optional[MediaInfo]:
        """Search for media by type (movie or series)."""
        if media_type == "movie":
            return await self.search_movie(title, year)
        elif media_type == "series":
            return await self.search_tv(title, year)
        return None
