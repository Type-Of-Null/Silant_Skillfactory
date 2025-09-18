from fastapi import APIRouter

from .auth import router as auth_router
from .cars import router as cars_router
from .models import router as models_router
from .maintenance import router as maintenance_router
from .meta import router as meta_router

api_router = APIRouter(prefix="/api")

# keep paths identical to previous version under /api
api_router.include_router(auth_router)
api_router.include_router(cars_router)
api_router.include_router(models_router)
api_router.include_router(maintenance_router)
api_router.include_router(meta_router)
