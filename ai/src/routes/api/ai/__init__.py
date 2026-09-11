from fastapi import APIRouter

from . import v1

router = APIRouter()

prefix = "/ai"
router.include_router(v1.router, prefix=prefix)
