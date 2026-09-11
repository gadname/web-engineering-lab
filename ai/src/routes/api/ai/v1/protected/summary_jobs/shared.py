from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from src.domains.summary_job import JobStatus, SummaryJob


class SummaryJobResponseSchema(BaseModel):
    """レスポンスの形。JSON は camelCase（alias）、Python は snake_case."""

    model_config = ConfigDict(extra="forbid", populate_by_name=True)

    id: UUID
    tenant_id: UUID = Field(alias="tenantId")
    project_id: UUID = Field(alias="projectId")
    status: JobStatus
    summary: str | None = None
    error_message: str | None = Field(default=None, alias="errorMessage")
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")

    @classmethod
    def from_domain(cls, job: SummaryJob) -> "SummaryJobResponseSchema":
        return cls(
            id=job.id,
            tenant_id=job.tenant_id,
            project_id=job.project_id,
            status=job.status,
            summary=job.summary,
            error_message=job.error_message,
            created_at=job.created_at,
            updated_at=job.updated_at,
        )
