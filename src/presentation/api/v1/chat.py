"""Chat API endpoints."""

import json

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse

from src.application.services.chat_service import ChatService
from src.application.services.user_service import UserService
from src.presentation.api.dependencies import (
    get_chat_service,
    get_current_admin,
    get_current_user,
    get_user_service,
)
from src.presentation.schemas.chat_schemas import (
    ChatRequest,
    ChatResponse,
    IndexStatsResponse,
    IndexResponse,
)

router = APIRouter(prefix="/chat", tags=["chat"])


async def check_message_limit(
    current_user: dict,
    user_service: UserService,
) -> None:
    """Check if user can send a message. Raises HTTPException if limit reached."""
    is_admin = current_user.get("is_admin", False)
    if is_admin:
        return  # Admin has unlimited messages

    user_id = current_user["sub"]
    can_send = await user_service.can_send_message(user_id)
    if not can_send:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Message limit reached. Maximum 5 messages allowed.",
        )


@router.post("/", response_model=ChatResponse)
async def send_message(
    request: ChatRequest,
    chat_service: ChatService = Depends(get_chat_service),
    user_service: UserService = Depends(get_user_service),
    current_user: dict = Depends(get_current_user),
) -> ChatResponse:
    """Send a message and get a response (non-streaming). Requires authentication."""
    # Check message limit
    await check_message_limit(current_user, user_service)

    try:
        conversation_history = [
            {"role": msg.role, "content": msg.content}
            for msg in request.conversation_history
        ]

        response = await chat_service.send_message(
            message=request.message,
            conversation_history=conversation_history,
        )

        # Increment message count for non-admin users
        if not current_user.get("is_admin", False):
            await user_service.increment_message_count(current_user["sub"])

        return ChatResponse(response=response)

    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Chat error: {str(e)}")


@router.post("/stream")
async def send_message_stream(
    request: ChatRequest,
    chat_service: ChatService = Depends(get_chat_service),
    user_service: UserService = Depends(get_user_service),
    current_user: dict = Depends(get_current_user),
) -> StreamingResponse:
    """Send a message and stream the response using SSE. Requires authentication."""
    # Check message limit before starting stream
    await check_message_limit(current_user, user_service)

    # Increment message count for non-admin users at the start
    # (we count the attempt, not just successful completions)
    if not current_user.get("is_admin", False):
        await user_service.increment_message_count(current_user["sub"])

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
