from fastapi import APIRouter

from . import summary_jobs

router = APIRouter()

prefix = "/protected"
router.include_router(summary_jobs.router, prefix=prefix)
