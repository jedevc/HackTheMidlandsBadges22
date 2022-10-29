from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import crud, models, schemas
from .helpers import badge, badge_code, permissions

router = APIRouter()


@router.get("/badges", tags=["badges"], response_model=list[schemas.Badge])
async def read_badges(
    offset: int = 0,
    limit: int = 10,
    db: Session = Depends(crud.get_db),
    permissions: schemas.Permissions = Depends(
        permissions(lambda p: p.badges.can_enumerate())
    ),
) -> list[models.Badge]:
    return crud.get_badges(db, offset=offset, limit=limit)


@router.get("/badges/{badge_id}", tags=["badges"], response_model=schemas.Badge)
async def read_badge(
    badge: models.Badge = Depends(badge(lambda p, b: p.badges.can_read(b)))
) -> models.Badge:
    return badge


@router.post("/badges", tags=["badges"], response_model=schemas.Badge)
async def create_badge(
    db: Session = Depends(crud.get_db),
    permissions: schemas.Permissions = Depends(
        permissions(lambda p: p.badges.can_create())
    ),
) -> models.Badge:
    badge = crud.create_badge(db)
    db.commit()
    return badge


@router.put("/badges/{badge_id}", tags=["badges"], response_model=schemas.Badge)
async def replace_badge(
    badge_data: schemas.BadgeCreate,
    badge: models.Badge = Depends(badge(lambda p, b: p.badges.can_write(b))),
    db: Session = Depends(crud.get_db),
) -> models.Badge:
    badge = crud.update_badge(db, badge, claimed=badge_data.claimed)
    db.commit()
    return badge


@router.patch("/badges/{badge_id}", tags=["badges"], response_model=schemas.Badge)
async def update_badge(
    badge_data: schemas.BadgeUpdate,
    badge: models.Badge = Depends(badge(lambda p, b: p.badges.can_write(b))),
    db: Session = Depends(crud.get_db),
) -> models.Badge:
    badge = crud.update_badge(db, badge, claimed=badge_data.claimed)
    db.commit()
    return badge


@router.delete("/badges/{badge_id}", tags=["badges"])
async def delete_badge(
    badge: models.Badge = Depends(badge(lambda p, b: p.badges.can_write(b))),
    db: Session = Depends(crud.get_db),
):
    crud.delete_badge(db, badge)
    db.commit()


@router.get(
    "/badges/{badge_id}/codes", tags=["badges"], response_model=list[schemas.BadgeCode]
)
async def read_badge_codes(
    badge: models.Badge = Depends(badge(lambda p, b: p.badges.can_read(b))),
) -> list[models.BadgeCode]:
    return badge.codes


@router.get(
    "/badges/{badge_id}/codes/{code_id}",
    tags=["badges"],
    response_model=schemas.BadgeCode,
)
async def read_badge_code(
    badge_code: models.BadgeCode = Depends(
        badge_code(lambda p, b: p.badges.can_read(b))
    ),
) -> models.BadgeCode:
    return badge_code


@router.post(
    "/badges/{badge_id}/codes", tags=["badges"], response_model=schemas.BadgeCode
)
async def create_badge_code(
    badge: models.Badge = Depends(badge(lambda p, b: p.badges.can_write(b))),
    db: Session = Depends(crud.get_db),
) -> models.BadgeCode:
    code = crud.create_badge_code(db, badge)
    db.commit()
    return code


@router.delete("/badges/{badge_id}/codes/{code_id}", tags=["badges"])
async def delete_badge_code(
    badge_code: models.BadgeCode = Depends(
        badge_code(lambda p, b: p.badges.can_write(b))
    ),
    db: Session = Depends(crud.get_db),
):
    crud.delete_badge_code(db, badge_code)
    db.commit()
