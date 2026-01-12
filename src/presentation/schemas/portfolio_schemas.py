
from pydantic import BaseModel, HttpUrl
from typing import List, Optional

class Project(BaseModel):
    name: str
    description: Optional[str] = None
    url: HttpUrl
    language: Optional[str] = None
    stars: int
    forks: int
    updated_at: str
    topics: List[str]

class Projects(BaseModel):
    projects: List[Project]

