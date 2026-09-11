from uuid import UUID

from fastapi import APIRouter, Depends, status

from src.infrastructures.repositories.summary_job import SummaryJobRepositoryFactory
from src.routes.api.ai.v1.protected.summary_jobs.shared import SummaryJobResponseSchema
from src.routes.shared import API_TAGS
from src.routes.shared.dependencies import get_current_user_id, get_tenant_id
from src.usecases.summary_jobs import GetSummaryJobCommand, GetSummaryJobUsecase

router = APIRouter(tags=[API_TAGS["SUMMARY_JOBS"]])


@router.get(
    "/summary-jobs/{job_id}",
    response_model=SummaryJobResponseSchema,
    response_model_by_alias=True,
    status_code=status.HTTP_200_OK,
    summary="要約ジョブの状態と結果を取得する",
)
async def get_summary_job(
    job_id: UUID,
    _user_id: str = Depends(get_current_user_id),
    tenant_id: UUID = Depends(get_tenant_id),
) -> SummaryJobResponseSchema:
    usecase = GetSummaryJobUsecase(repository=SummaryJobRepositoryFactory.create())
    job = await usecase.execute(GetSummaryJobCommand(job_id=job_id, tenant_id=tenant_id))
    return SummaryJobResponseSchema.from_domain(job)
