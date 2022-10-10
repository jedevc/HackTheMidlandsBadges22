from .badges import router as badge_router
from .onboarding import router as onboarding_router
from .status import router as status_router
from .storage import router as storage_router
from .tokens import router as tokens_router
from .users import router as user_router

routers = [
    badge_router,
    onboarding_router,
    status_router,
    storage_router,
    tokens_router,
    user_router,
]

__all__ = [
    "routers",
    "badge_router",
    "onboarding_router",
    "status_router",
    "storage_router",
    "tokens_router",
    "user_router",
]
