
from fastapi import APIRouter, Depends
from typing import List
from src.application.services.portfolio_service import PortfolioService
from src.presentation.api.dependencies import get_portfolio_service
from src.presentation.schemas.portfolio_schemas import Project

router = APIRouter()

@router.get("/portfolio/projects", response_model=List[Project])
async def get_projects(
    portfolio_service: PortfolioService = Depends(get_portfolio_service),
):
    """
    Get the list of public projects.
    """
    return await portfolio_service.get_projects()
