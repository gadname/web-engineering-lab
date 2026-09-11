from uuid import UUID

from fastapi import APIRouter, Depends, status
from pydantic import BaseModel, ConfigDict, Field

from src.domains.summary_job.value_objects import INPUT_TEXT_MAX_LENGTH
from src.infrastructures.adapters.job_queue import JobQueueProducerFactory
from src.infrastructures.repositories.summary_job import SummaryJobRepositoryFactory
from src.infrastructures.shared.clients.postgres import PostgresClientFactory
from src.routes.api.ai.v1.protected.summary_jobs.shared import SummaryJobResponseSchema
from src.routes.shared import API_TAGS
from src.routes.shared.dependencies import get_current_user_id, get_tenant_id
from src.usecases.summary_jobs import CreateSummaryJobCommand, CreateSummaryJobUsecase

router = APIRouter(tags=[API_TAGS["SUMMARY_JOBS"]])


class CreateSummaryJobBodySchema(BaseModel):
    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    project_id: UUID = Field(alias="projectId")
    # 形式の上限は値オブジェクトと同じ値。ルートで先に弾き 422 で返す
    text: str = Field(min_length=1, max_length=INPUT_TEXT_MAX_LENGTH)


@router.post(
    "/summary-jobs",
    response_model=SummaryJobResponseSchema,
    response_model_by_alias=True,
    status_code=status.HTTP_202_ACCEPTED,
    summary="要約ジョブを作成する（非同期）",
    description="ジョブを受け付けてすぐ返す。結果は GET /summary-jobs/{job_id} で取得する。",
)
async def create_summary_job(
    body: CreateSummaryJobBodySchema,
    user_id: str = Depends(get_current_user_id),
    tenant_id: UUID = Depends(get_tenant_id),
) -> SummaryJobResponseSchema:
    # 1 エンドポイント 1 ファイル。依存の組み立て → ユースケース実行 → レスポンス整形だけを行う
    postgres_client = PostgresClientFactory.create()
    usecase = CreateSummaryJobUsecase(
        repository=SummaryJobRepositoryFactory.create(postgres_client=postgres_client),
        job_queue=JobQueueProducerFactory.create(postgres_client=postgres_client),
        postgres_client=postgres_client,
    )
    job = await usecase.execute(
        CreateSummaryJobCommand(tenant_id=tenant_id, project_id=body.project_id, user_id=user_id, text=body.text)
    )
    return SummaryJobResponseSchema.from_domain(job)
