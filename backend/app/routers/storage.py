from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import crud, models, schemas
from .badges import badge

router = APIRouter()


@router.get("/store/_", tags=["storage"])
async def read_top_level(
    db: Session = Depends(crud.get_db),
) -> dict[str, str]:
    if store := crud.get_store(db):
        return store.data
    return {}


@router.get("/store/_/{key}", tags=["storage"])
async def read_top_level_key(
    key: str,
    db: Session = Depends(crud.get_db),
) -> str | None:
    if store := crud.get_store(db):
        return store.data.get(key)
    return None


@router.put("/store/_/{key}", tags=["storage"])
async def write_top_level_key(
    key: str,
    value: str,
    db: Session = Depends(crud.get_db),
):
    store = crud.get_store(db)
    if store is None:
        store = crud.create_store(db)
    store.data[key] = value
    db.add(store)
    db.commit()


@router.delete("/store/_/{key}", tags=["storage"])
async def delete_top_level_key(
    key: str,
    db: Session = Depends(crud.get_db),
):
    store = crud.get_store(db)
    if store and key in store.data:
        store.data.pop(key)
        db.add(store)
        db.commit()


@router.get("/store/{badge_id}", tags=["storage"])
async def read_badge_level(
    badge: models.Badge = Depends(badge),
    db: Session = Depends(crud.get_db),
) -> dict[str, str]:
    if store := crud.get_store(db, badge):
        return store.data
    return {}


@router.get("/store/{badge_id}/{key}", tags=["storage"])
async def read_badge_level_key(
    key: str,
    badge: models.Badge = Depends(badge),
    db: Session = Depends(crud.get_db),
) -> str | None:
    if store := crud.get_store(db, badge):
        return store.data.get(key)
    return None


@router.put("/store/{badge_id}/{key}", tags=["storage"])
async def write_badge_level_key(
    key: str,
    value: str,
    badge: models.Badge = Depends(badge),
    db: Session = Depends(crud.get_db),
):
    store = crud.get_store(db, badge)
    if store is None:
        store = crud.create_store(db, badge)
    store.data[key] = value
    db.add(store)
    db.commit()


@router.delete("/store/{badge_id}/{key}", tags=["storage"])
async def delete_badge_level(
    key: str,
    badge: models.Badge = Depends(badge),
    db: Session = Depends(crud.get_db),
):
    store = crud.get_store(db, badge)
    if store and key in store.data:
        store.data.pop(key)
        db.add(store)
        db.commit()
