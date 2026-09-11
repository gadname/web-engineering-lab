from .base_exception import BaseException


class DomainException(BaseException):
    """ドメイン層（集約・値オブジェクト）の不変条件違反."""
