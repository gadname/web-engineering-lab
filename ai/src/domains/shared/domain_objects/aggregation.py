from typing import Any

from pydantic import BaseModel, ConfigDict

from src.shared.errors.codes import SYSTEM_ERROR_CODES
from src.shared.exceptions.domain_exception import DomainException


class Aggregation(BaseModel):
    """集約ルートの基底。不変で、識別子（id）で等しさを判定する.

    状態変更は `model_copy(update=...)` で新しいインスタンスを返す。
    永続化は Repository が担い、集約は DB を知らない。
    """

    model_config = ConfigDict(frozen=True, extra="forbid")

    def __eq__(self, other: Any) -> bool:
        if not isinstance(other, self.__class__):
            return False
        self_id = getattr(self, "id", None)
        other_id = getattr(other, "id", None)
        if self_id is None or other_id is None:
            raise DomainException(SYSTEM_ERROR_CODES.DOMAIN_RULE_VIOLATED)
        return self_id == other_id

    def __hash__(self) -> int:
        return hash((self.__class__, getattr(self, "id", None)))
