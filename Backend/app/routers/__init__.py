from .auth import router as auth_router
from .dashboard import router as dashboard_router
from .patients import router as patients_router
from .assessments import router as assessments_router
from .reports import router as reports_router

__all__ = [
    "auth_router",
    "dashboard_router",
    "patients_router",
    "assessments_router",
    "reports_router",
]
