from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import crud, models, schemas
from .apps import app
from .badges import badge

router = APIRouter()


@router.get("/apps/{app_id}/store/_", tags=["storage"])
async def read_top_level(
    app: models.App = Depends(app),
    db: Session = Depends(crud.get_db),
) -> dict[str, str]:
    if store := crud.get_store(db, app):
        return store.data
    return {}


@router.get("/apps/{app_id}/store/_/{key}", tags=["storage"])
async def read_top_level_key(
    key: str,
    app: models.App = Depends(app),
    db: Session = Depends(crud.get_db),
) -> str | None:
    if store := crud.get_store(db, app):
        return store.data.get(key)
    return None


@router.put("/apps/{app_id}/store/_/{key}", tags=["storage"])
async def write_top_level_key(
    key: str,
    value: str,
    app: models.App = Depends(app),
    db: Session = Depends(crud.get_db),
):
    store = crud.get_store(db, app)
    if store is None:
        store = crud.create_store(db, app)
    store.data[key] = value
    db.add(store)
    db.commit()


@router.delete("/apps/{app_id}/store/_/{key}", tags=["storage"])
async def delete_top_level_key(
    key: str,
    app: models.App = Depends(app),
    db: Session = Depends(crud.get_db),
):
    store = crud.get_store(db, app)
    if store and key in store.data:
        store.data.pop(key)
        db.add(store)
        db.commit()


@router.get("/apps/{app_id}/store/{badge_id}", tags=["storage"])
async def read_badge_level(
    app: models.App = Depends(app),
    badge: models.Badge = Depends(badge),
    db: Session = Depends(crud.get_db),
) -> dict[str, str]:
    if store := crud.get_store(db, app, badge):
        return store.data
    return {}


@router.get("/apps/{app_id}/store/{badge_id}/{key}", tags=["storage"])
async def read_badge_level_key(
    key: str,
    app: models.App = Depends(app),
    badge: models.Badge = Depends(badge),
    db: Session = Depends(crud.get_db),
) -> str | None:
    if store := crud.get_store(db, app, badge):
        return store.data.get(key)
    return None


@router.put("/apps/{app_id}/store/{badge_id}/{key}", tags=["storage"])
async def write_badge_level_key(
    key: str,
    value: str,
    app: models.App = Depends(app),
    badge: models.Badge = Depends(badge),
    db: Session = Depends(crud.get_db),
):
    store = crud.get_store(db, app, badge)
    if store is None:
        store = crud.create_store(db, app, badge)
    store.data[key] = value
    db.add(store)
    db.commit()


@router.delete("/apps/{app_id}/store/{badge_id}/{key}", tags=["storage"])
async def delete_badge_level(
    key: str,
    app: models.App = Depends(app),
    badge: models.Badge = Depends(badge),
    db: Session = Depends(crud.get_db),
):
    store = crud.get_store(db, app, badge)
    if store and key in store.data:
        store.data.pop(key)
        db.add(store)
        db.commit()
