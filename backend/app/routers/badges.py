from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import crud, models, schemas

router = APIRouter()


async def badge(badge_id: str, db: Session = Depends(crud.get_db)) -> models.Badge:
    badge = crud.get_badge(db, badge_id)
    if not badge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Badge not found"
        )
    return badge


async def badge_code(
    badge_id: str, code_id: str, db: Session = Depends(crud.get_db)
) -> models.BadgeCode:
    badge_code = crud.get_badge_code(db, badge_id, code_id)
    if not badge_code:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Badge code not found"
        )
    return badge_code


@router.get("/badges", tags=["badges"], response_model=list[schemas.Badge])
async def read_badges(
    offset: int = 0, limit: int = 10, db: Session = Depends(crud.get_db)
) -> list[models.Badge]:
    return crud.get_badges(db, offset=offset, limit=limit)


@router.get("/badges/{badge_id}", tags=["badges"], response_model=schemas.Badge)
async def read_badge(badge: models.Badge = Depends(badge)) -> models.Badge:
    return badge


@router.post("/badges", tags=["badges"], response_model=schemas.Badge)
async def create_badge(
    user_id: str, db: Session = Depends(crud.get_db)
) -> models.Badge:
    user = crud.get_user(db, user_id)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )

    return crud.create_badge(db, user)


@router.delete("/badges", tags=["badges"])
async def delete_badge(
    badge: models.Badge = Depends(badge), db: Session = Depends(crud.get_db)
):
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
    badge: models.Badge = Depends(badge), db: Session = Depends(crud.get_db)
) -> models.BadgeCode:
    return crud.create_badge_code(db, badge)


@router.delete("/badges/{badge_id}/codes/{code_id}", tags=["badges"])
async def delete_badge_code(
    badge_code: models.BadgeCode = Depends(badge_code),
    db: Session = Depends(crud.get_db),
):
    return crud.delete_badge_code(db, badge_code)
