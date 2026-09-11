from .base_exception import BaseException


class RepositoryException(BaseException):
    """永続化層の失敗（接続断・SQL エラー）."""


class OptimisticLockException(RepositoryException):
    """楽観ロックの競合。別プロセスが先に更新した。リトライで回復しうる."""
