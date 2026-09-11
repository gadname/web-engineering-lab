from typing import Any

from pydantic import BaseModel, ConfigDict


class ValueObject(BaseModel):
    """値オブジェクトの基底。不変（frozen）で、全フィールドの値で等しさを判定する."""

    model_config = ConfigDict(frozen=True, extra="forbid")

    def __eq__(self, other: Any) -> bool:
        if not isinstance(other, self.__class__):
            return False
        return super().__eq__(other)

    def __hash__(self) -> int:
        return hash((self.__class__, tuple(self.__dict__.items())))
