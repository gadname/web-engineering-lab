from uuid import uuid4

import pytest

from src.domains.summary_job import InputText, JobStatus, SummaryJob
from src.domains.summary_job.value_objects import INPUT_TEXT_MAX_LENGTH
from src.shared.exceptions.domain_exception import DomainException


def build_job() -> SummaryJob:
    return SummaryJob.create(tenant_id=uuid4(), project_id=uuid4(), user_id="u1", input_text=InputText(value="hello"))


class TestInputText:
    def test_前後の空白を除いて保持する(self) -> None:
        assert InputText(value="  hello  ").value == "hello"

    def test_空はTEXT_EMPTY(self) -> None:
        with pytest.raises(DomainException) as e:
            InputText(value="   ")
        assert e.value.error_code == "SUMMARY_JOB.VALIDATION.TEXT_EMPTY"

    def test_上限超えはTEXT_TOO_LONGで文言に上限が入る(self) -> None:
        with pytest.raises(DomainException) as e:
            InputText(value="a" * (INPUT_TEXT_MAX_LENGTH + 1))
        assert e.value.error_code == "SUMMARY_JOB.VALIDATION.TEXT_TOO_LONG"
        assert str(INPUT_TEXT_MAX_LENGTH) in e.value.user_message


class TestSummaryJob:
    def test_createはpendingで始まりversionは1(self) -> None:
        job = build_job()
        assert job.status == JobStatus.PENDING
        assert job.version == 1

    def test_pending_processing_completedの順に進み元は変わらない(self) -> None:
        job = build_job()
        processing = job.start()
        completed = processing.complete("summary")
        assert job.status == JobStatus.PENDING
        assert processing.status == JobStatus.PROCESSING
        assert completed.status == JobStatus.COMPLETED
        assert completed.summary == "summary"
        assert completed == job  # 同じ ID なら同一の集約

    @pytest.mark.parametrize(
        ("action", "job"),
        [
            ("complete", build_job()),  # pending から complete はできない
            ("start", build_job().start()),  # processing から start はできない
            ("fail", build_job().start().complete("s")),  # 終端からは fail できない
        ],
    )
    def test_不正な遷移はINVALID_TRANSITION(self, action: str, job: SummaryJob) -> None:
        with pytest.raises(DomainException) as e:
            getattr(job, action)("x") if action in ("complete", "fail") else getattr(job, action)()
        assert e.value.error_code == "SUMMARY_JOB.VALIDATION.INVALID_TRANSITION"
