from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import crud, models, schemas
from .helpers import PERMISSION_EXCEPTION, badge, badge_code, permissions

router = APIRouter()


@router.get("/badges", tags=["badges"], response_model=list[schemas.Badge])
async def read_badges(
    offset: int = 0,
    limit: int = 10,
    db: Session = Depends(crud.get_db),
    permissions: schemas.Permissions = Depends(permissions),
) -> list[models.Badge]:
    if not permissions.badges.can_enumerate():
        raise PERMISSION_EXCEPTION
    return crud.get_badges(db, offset=offset, limit=limit)


@router.get("/badges/{badge_id}", tags=["badges"], response_model=schemas.Badge)
async def read_badge(badge: models.Badge = Depends(badge)) -> models.Badge:
    return badge


@router.post("/badges", tags=["badges"], response_model=schemas.Badge)
async def create_badge(
    db: Session = Depends(crud.get_db),
    permissions: schemas.Permissions = Depends(permissions),
) -> models.Badge:
    if not permissions.badges.can_create():
        raise PERMISSION_EXCEPTION
    return crud.create_badge(db)


@router.delete("/badges", tags=["badges"])
async def delete_badge(
    badge: models.Badge = Depends(badge),
    db: Session = Depends(crud.get_db),
    permissions: schemas.Permissions = Depends(permissions),
):
    if not permissions.badges.can_write(badge.id):
        raise PERMISSION_EXCEPTION
    return crud.delete_badge(db, badge)


@router.get(
    "/badges/{badge_id}/codes", tags=["badges"], response_model=list[schemas.BadgeCode]
)
async def read_badge_codes(
    badge: models.Badge = Depends(badge),
) -> list[models.BadgeCode]:
    return badge.codes


@router.get(
    "/badges/{badge_id}/codes/{code_id}",
    tags=["badges"],
    response_model=schemas.BadgeCode,
)
async def read_badge_code(
    badge_code: models.BadgeCode = Depends(badge_code),
) -> models.BadgeCode:
    return badge_code


@router.post(
    "/badges/{badge_id}/codes", tags=["badges"], response_model=schemas.BadgeCode
)
async def create_badge_code(
    badge: models.Badge = Depends(badge),
    db: Session = Depends(crud.get_db),
    permissions: schemas.Permissions = Depends(permissions),
) -> models.BadgeCode:
    if not permissions.badges.can_write(badge.id):
        raise PERMISSION_EXCEPTION
    return crud.create_badge_code(db, badge)


@router.delete("/badges/{badge_id}/codes/{code_id}", tags=["badges"])
async def delete_badge_code(
    badge_code: models.BadgeCode = Depends(badge_code),
    db: Session = Depends(crud.get_db),
    permissions: schemas.Permissions = Depends(permissions),
):
    if not permissions.badges.can_write(badge_code.badge.id):
        raise PERMISSION_EXCEPTION
    return crud.delete_badge_code(db, badge_code)
