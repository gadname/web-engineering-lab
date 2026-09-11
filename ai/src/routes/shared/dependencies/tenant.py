from uuid import UUID

from fastapi import Header

from src.shared.errors.codes import VALIDATION_ERROR_CODES
from src.shared.exceptions.route_exception import RouteException


def get_tenant_id(x_tenant_id: str | None = Header(default=None, alias="X-Tenant-ID")) -> UUID:
    """テナント文脈。api と同じく X-Tenant-ID ヘッダで受ける.

    ここでは所属の検証をしない（所属の真実は api が持つ）。
    サービス間で所属を確かめる仕組み（api への問い合わせ、または JWT のクレーム）は次の段階で足す。
    """
    if not x_tenant_id:
        raise RouteException(VALIDATION_ERROR_CODES.REQUEST.TENANT_HEADER_MISSING)
    try:
        return UUID(x_tenant_id)
    except ValueError as e:
        raise RouteException(VALIDATION_ERROR_CODES.REQUEST.INVALID) from e
