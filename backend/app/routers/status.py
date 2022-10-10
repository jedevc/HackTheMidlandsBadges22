from fastapi import APIRouter, Depends

from .. import schemas
from .helpers import permissions

router = APIRouter()


@router.get("/permissions", tags=["status"])
async def status_permissions(
    actual_permissions: schemas.Permissions = Depends(permissions),
) -> schemas.Permissions:
    return actual_permissions
