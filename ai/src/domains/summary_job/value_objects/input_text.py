from pydantic import field_validator

from src.domains.shared.domain_objects import ValueObject
from src.shared.errors.codes import SUMMARY_JOB_ERROR_CODES
from src.shared.errors.types import ErrorContext
from src.shared.exceptions.domain_exception import DomainException

# LLM の入力上限ではなく、無制限に長い入力で worker を専有させないための技術的上限
INPUT_TEXT_MAX_LENGTH = 5000


class InputText(ValueObject):
    value: str

    @field_validator("value")
    @classmethod
    def _validate(cls, value: str) -> str:
        trimmed = value.strip()
        if not trimmed:
            raise DomainException(SUMMARY_JOB_ERROR_CODES.VALIDATION.TEXT_EMPTY)
        if len(trimmed) > INPUT_TEXT_MAX_LENGTH:
            raise DomainException(
                SUMMARY_JOB_ERROR_CODES.VALIDATION.TEXT_TOO_LONG,
                ErrorContext(data={"max": INPUT_TEXT_MAX_LENGTH}),
            )
        return trimmed
