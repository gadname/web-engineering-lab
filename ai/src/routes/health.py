from fastapi import APIRouter, status
from pydantic import BaseModel, Field

from src.routes.shared import API_TAGS

router = APIRouter(tags=[API_TAGS["HEALTH"]])


class HealthResponse(BaseModel):
    status: str = Field(description="サービスの状態")


@router.get("/health", response_model=HealthResponse, status_code=status.HTTP_200_OK, summary="ヘルスチェック")
async def health_check() -> HealthResponse:
    return HealthResponse(status="ok")
