from .apps import router as app_router
from .badges import router as badge_router
from .devs import router as dev_router
from .email import router as email_router
from .status import router as status_router
from .storage import router as storage_router
from .users import router as user_router

routers = [
    app_router,
    badge_router,
    dev_router,
    email_router,
    status_router,
    storage_router,
    user_router,
]

__all__ = [
    "routers",
    "app_router",
    "badge_router",
    "dev_router",
    "email_router",
    "status_router",
    "storage_router",
    "user_router",
]
