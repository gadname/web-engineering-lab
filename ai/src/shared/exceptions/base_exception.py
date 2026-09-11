from src.shared.errors.definitions import ERROR_DEFINITIONS
from src.shared.errors.messages import get_message
from src.shared.errors.types import ErrorContext


class BaseException(Exception):  # noqa: A001
    """アプリケーション例外の基底。error_code から status_code と文言を解決する.

    層ごとのサブクラス（Domain / Usecase / Repository / Infrastructure / Route）は
    「どの層で起きたか」をハンドラとログで区別するためのもので、振る舞いは同じ。
    """

    def __init__(self, error_code: str, context: ErrorContext | None = None) -> None:
        definition = ERROR_DEFINITIONS.get(error_code)
        if definition is None:
            raise ValueError(f"Error definition not found for code: {error_code}")
        self.error_code = error_code
        self.status_code = definition.status_code
        self.log_level = definition.log_level
        self.context = context or ErrorContext()
        self.user_message = get_message(definition.message_key, self.context.data)
        super().__init__(self.user_message)
        if self.context.cause is not None:
            self.__cause__ = self.context.cause

    @property
    def details(self) -> dict[str, object] | None:
        return self.context.data
