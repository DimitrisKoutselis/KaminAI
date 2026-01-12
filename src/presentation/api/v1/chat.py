"""Chat API endpoints."""

import json

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse

from src.application.services.chat_service import ChatService
from src.presentation.api.dependencies import get_chat_service, get_current_admin
from src.presentation.schemas.chat_schemas import (
    ChatRequest,
    ChatResponse,
    IndexStatsResponse,
    IndexResponse,
)

router = APIRouter(prefix="/chat", tags=["chat"])


@router.post("/", response_model=ChatResponse)
async def send_message(
    request: ChatRequest,
    chat_service: ChatService = Depends(get_chat_service),
) -> ChatResponse:
    """Send a message and get a response (non-streaming)."""
    try:
        conversation_history = [
            {"role": msg.role, "content": msg.content}
            for msg in request.conversation_history
        ]

        response = await chat_service.send_message(
            message=request.message,
            conversation_history=conversation_history,
        )

        return ChatResponse(response=response)

    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")


@router.post("/stream")
async def send_message_stream(
    request: ChatRequest,
    chat_service: ChatService = Depends(get_chat_service),
) -> StreamingResponse:
    """Send a message and stream the response using SSE."""

    async def event_generator():
        try:
            conversation_history = [
                {"role": msg.role, "content": msg.content}
                for msg in request.conversation_history
            ]

            async for chunk in chat_service.send_message_stream(
                message=request.message,
                conversation_history=conversation_history,
            ):
                data = json.dumps({"content": chunk})
                yield f"data: {data}\n\n"

            yield f"data: {json.dumps({'done': True})}\n\n"

        except Exception as e:
            error_data = json.dumps({"error": str(e)})
            yield f"data: {error_data}\n\n"

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


@router.get("/index/stats", response_model=IndexStatsResponse)
async def get_index_stats(
    chat_service: ChatService = Depends(get_chat_service),
) -> IndexStatsResponse:
    """Get statistics about the indexed repositories."""
    try:
        stats = await chat_service.get_index_stats()
        return IndexStatsResponse(**stats)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error getting stats: {str(e)}")


@router.post("/index/repos", response_model=IndexResponse)
async def index_repositories(
    chat_service: ChatService = Depends(get_chat_service),
    _: dict = Depends(get_current_admin),
) -> IndexResponse:
    """Manually trigger repository re-indexing (admin only)."""
    try:
        result = await chat_service.index_repositories()
        return IndexResponse(**result)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Indexing error: {str(e)}")
