"""FAISS vector store for code repository indexing."""

import os
import pickle
from pathlib import Path
from typing import Any

import faiss
import numpy as np
from langchain_google_genai import GoogleGenerativeAIEmbeddings

from src.infrastructure.config.settings import get_settings


class CodeDocument:
    """Represents an indexed code file."""

    def __init__(
        self,
        content: str,
        project_name: str,
        folder_path: str,
        file_name: str,
        file_type: str,
        file_url: str,
    ):
        self.content = content
        self.project_name = project_name
        self.folder_path = folder_path
        self.file_name = file_name
        self.file_type = file_type
        self.file_url = file_url

    def to_dict(self) -> dict[str, Any]:
        return {
            "content": self.content,
            "project_name": self.project_name,
            "folder_path": self.folder_path,
            "file_name": self.file_name,
            "file_type": self.file_type,
            "file_url": self.file_url,
        }

    @classmethod
    def from_dict(cls, data: dict[str, Any]) -> "CodeDocument":
        return cls(
            content=data["content"],
            project_name=data["project_name"],
            folder_path=data["folder_path"],
            file_name=data["file_name"],
            file_type=data["file_type"],
            file_url=data["file_url"],
        )


class FAISSVectorStore:
    """FAISS-based vector store for semantic code search."""

    def __init__(self) -> None:
        settings = get_settings()
        self.embeddings = GoogleGenerativeAIEmbeddings(
            model=f"models/{settings.gemini_embedding_model}",
            google_api_key=settings.google_api_key,
        )
        self.dimension = settings.embedding_dimension
        self.index_path = Path(settings.faiss_index_path)
        self.index: faiss.IndexFlatIP | None = None
        self.documents: list[CodeDocument] = []
        self._initialized = False

    async def initialize(self) -> None:
        """Initialize the vector store, loading existing index if available."""
        if self._initialized:
            return

        self.index_path.mkdir(parents=True, exist_ok=True)

        index_file = self.index_path / "index.faiss"
        docs_file = self.index_path / "documents.pkl"

        if index_file.exists() and docs_file.exists():
            self.index = faiss.read_index(str(index_file))
            with open(docs_file, "rb") as f:
                docs_data = pickle.load(f)
                self.documents = [CodeDocument.from_dict(d) for d in docs_data]
            print(f"Loaded FAISS index with {len(self.documents)} documents")
        else:
            self.index = faiss.IndexFlatIP(self.dimension)
            self.documents = []
            print("Created new empty FAISS index")

        self._initialized = True

    async def add_documents(self, documents: list[CodeDocument]) -> None:
        """Add documents to the vector store."""
        if not self._initialized:
            await self.initialize()

        if not documents:
            return

        texts = [doc.content for doc in documents]
        embeddings = await self._get_embeddings(texts)

        faiss.normalize_L2(embeddings)

        if self.index is not None:
            self.index.add(embeddings)
        self.documents.extend(documents)

        await self._save_index()

    async def search(
        self,
        query: str,
        k: int = 5,
        project_name: str | None = None,
        file_type: str | None = None,
    ) -> list[dict[str, Any]]:
        """Search for similar documents with optional metadata filtering."""
        if not self._initialized:
            await self.initialize()

        if not self.documents or self.index is None:
            return []

        query_embedding = await self._get_embeddings([query])
        faiss.normalize_L2(query_embedding)

        search_k = min(k * 10, len(self.documents))
        distances, indices = self.index.search(query_embedding, search_k)

        results: list[dict[str, Any]] = []
        for dist, idx in zip(distances[0], indices[0]):
            if idx == -1:
                continue

            doc = self.documents[idx]

            if project_name and doc.project_name != project_name:
                continue
            if file_type and doc.file_type != file_type:
                continue

            results.append(
                {
                    **doc.to_dict(),
                    "score": float(dist),
                }
            )

            if len(results) >= k:
                break

        return results

    async def clear(self) -> None:
        """Clear all documents from the store."""
        self.index = faiss.IndexFlatIP(self.dimension)
        self.documents = []
        await self._save_index()

    async def get_stats(self) -> dict[str, Any]:
        """Get statistics about the vector store."""
        if not self._initialized:
            await self.initialize()

        projects: set[str] = set()
        file_types: set[str] = set()

        for doc in self.documents:
            projects.add(doc.project_name)
            file_types.add(doc.file_type)

        return {
            "total_documents": len(self.documents),
            "projects": list(projects),
            "file_types": list(file_types),
        }

    async def _get_embeddings(self, texts: list[str]) -> np.ndarray:
        """Get embeddings for a list of texts."""
        embeddings = await self.embeddings.aembed_documents(texts)
        return np.array(embeddings, dtype=np.float32)

    async def _save_index(self) -> None:
        """Save the index and documents to disk."""
        if self.index is None:
            return

        index_file = self.index_path / "index.faiss"
        docs_file = self.index_path / "documents.pkl"

        faiss.write_index(self.index, str(index_file))
        with open(docs_file, "wb") as f:
            docs_data = [doc.to_dict() for doc in self.documents]
            pickle.dump(docs_data, f)


_vector_store: FAISSVectorStore | None = None


def get_vector_store() -> FAISSVectorStore:
    """Get the singleton vector store instance."""
    global _vector_store
    if _vector_store is None:
        _vector_store = FAISSVectorStore()
    return _vector_store
