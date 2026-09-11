from fastapi import APIRouter

from . import protected

router = APIRouter()

prefix = "/v1"
router.include_router(protected.router, prefix=prefix)
