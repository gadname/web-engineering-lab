from fastapi import APIRouter

from . import ai

router = APIRouter()

prefix = "/api"
router.include_router(ai.router, prefix=prefix)
