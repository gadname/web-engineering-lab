from fastapi import APIRouter

from .create_summary_job import router as create_router
from .get_summary_job import router as get_router

router = APIRouter()
router.include_router(create_router)
router.include_router(get_router)
