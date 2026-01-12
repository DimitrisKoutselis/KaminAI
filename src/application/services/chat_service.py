"""Chat service for handling AI chat operations."""

from typing import AsyncGenerator

from src.infrastructure.ai.graph.chat_graph import ChatGraph, get_chat_graph


class ChatService:
    """Service for AI chat operations."""

    def __init__(self, chat_graph: ChatGraph | None = None) -> None:
        self._chat_graph = chat_graph

    @property
    def chat_graph(self) -> ChatGraph:
        """Get the chat graph instance."""
        if self._chat_graph is None:
            self._chat_graph = get_chat_graph()
        return self._chat_graph

    async def initialize(self) -> None:
        """Initialize the chat service and underlying AI system."""
        await self.chat_graph.initialize()

    async def send_message(
        self,
        message: str,
        conversation_history: list[dict] | None = None,
    ) -> str:
        """Send a message and get a response.

        Args:
            message: The user's message
            conversation_history: Optional list of previous messages in format
                [{"role": "user"|"assistant", "content": "..."}]

        Returns:
            The AI assistant's response
        """
        return await self.chat_graph.chat(
            message=message,
            conversation_history=conversation_history,
        )

    async def send_message_stream(
        self,
        message: str,
        conversation_history: list[dict] | None = None,
    ) -> AsyncGenerator[str, None]:
        """Send a message and stream the response.

        Args:
            message: The user's message
            conversation_history: Optional list of previous messages

        Yields:
            Chunks of the AI assistant's response
        """
        async for chunk in self.chat_graph.chat_stream(
            message=message,
            conversation_history=conversation_history,
        ):
            yield chunk

    async def index_repositories(self) -> dict:
        """Manually trigger repository re-indexing.

        Returns:
            Statistics about the indexing operation
        """
        return await self.chat_graph.index_repositories()

    async def get_index_stats(self) -> dict:
        """Get statistics about the indexed repositories.

        Returns:
            Statistics about indexed documents
        """
        from src.infrastructure.ai.vectorstore.faiss_store import get_vector_store

        vector_store = get_vector_store()
        return await vector_store.get_stats()
