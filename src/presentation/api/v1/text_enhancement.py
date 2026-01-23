"""Text Enhancement API endpoints."""

import json

from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse

from src.application.services.text_enhancement_service import TextEnhancementService
from src.presentation.api.dependencies import (
    get_text_enhancement_service,
    get_current_admin,
)
from src.presentation.schemas.text_enhancement_schemas import (
    GrammarCheckRequest,
    GrammarCheckResponse,
    GrammarIssue,
    RefineRequest,
    RefineResponse,
    RefineSuggestion,
    IssueSeverity,
    SuggestionCategory,
)

router = APIRouter(prefix="/text-enhancement", tags=["text-enhancement"])


@router.post("/grammar-check", response_model=GrammarCheckResponse)
async def check_grammar(
    request: GrammarCheckRequest,
    service: TextEnhancementService = Depends(get_text_enhancement_service),
    _: dict = Depends(get_current_admin),
) -> GrammarCheckResponse:
    """Check text for grammar issues.

    Requires admin authentication.
    """
    try:
        result = await service.check_grammar(
            text=request.text,
            field_name=request.field_name or "content",
        )

        # Convert raw issues to GrammarIssue models
        issues = [
            GrammarIssue(
                position=issue["position"],
                length=issue["length"],
                message=issue["message"],
                suggestions=issue.get("suggestions", []),
                severity=IssueSeverity(issue.get("severity", "warning")),
                original_text=issue["original_text"],
            )
            for issue in result["issues"]
        ]

        return GrammarCheckResponse(
            issues=issues,
            checked_text=result["checked_text"],
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Grammar check failed: {str(e)}",
        )


@router.post("/refine", response_model=RefineResponse)
async def refine_article(
    request: RefineRequest,
    service: TextEnhancementService = Depends(get_text_enhancement_service),
    _: dict = Depends(get_current_admin),
) -> RefineResponse:
    """Analyze an article and provide improvement suggestions.

    Requires admin authentication.
    """
    try:
        result = await service.refine_article(
            title=request.title,
            summary=request.summary,
            content=request.content,
            tags=request.tags,
        )

        # Convert raw suggestions to RefineSuggestion models
        suggestions = [
            RefineSuggestion(
                category=SuggestionCategory(s["category"]),
                original=s["original"],
                suggested=s["suggested"],
                explanation=s["explanation"],
                field=s["field"],
            )
            for s in result["suggestions"]
        ]

        return RefineResponse(
            suggestions=suggestions,
            overall_score=result["overall_score"],
            summary=result["summary"],
        )

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Article refinement failed: {str(e)}",
        )


@router.post("/refine/stream")
async def refine_article_stream(
    request: RefineRequest,
    service: TextEnhancementService = Depends(get_text_enhancement_service),
    _: dict = Depends(get_current_admin),
) -> StreamingResponse:
    """Stream article refinement suggestions using SSE.

    Requires admin authentication.

    Yields chunks with types: 'progress', 'suggestion', 'score', 'summary', 'done', 'error'
    """

    async def event_generator():
        try:
            async for chunk in service.refine_article_stream(
                title=request.title,
                summary=request.summary,
                content=request.content,
                tags=request.tags,
            ):
                yield f"data: {chunk}\n\n"

        except Exception as e:
            error_data = json.dumps({"type": "error", "data": str(e)})
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
