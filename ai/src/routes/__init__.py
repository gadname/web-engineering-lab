from fastapi import APIRouter

from . import api, health

router = APIRouter()
router.include_router(health.router)
router.include_router(api.router)
