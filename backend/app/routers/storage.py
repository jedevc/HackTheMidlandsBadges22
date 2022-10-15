from fastapi import APIRouter, Depends, HTTPException, Request, status
from sqlalchemy.orm import Session

from .. import crud, models, schemas
from .badges import badge
from .helpers import PERMISSION_EXCEPTION, permissions

router = APIRouter()


@router.get("/store/_", tags=["storage"])
async def read_top_level(
    db: Session = Depends(crud.get_db),
    permissions: schemas.Permissions = Depends(permissions),
) -> list[schemas.KeyValue]:
    if not permissions.store.can_enumerate("_"):
        raise PERMISSION_EXCEPTION
    if store := crud.get_store(db):
        return [
            schemas.KeyValue(key=key, value=value) for key, value in store.data.items()
        ]
    return []


@router.get("/store/_/{key}", tags=["storage"])
async def read_top_level_key(
    key: str,
    db: Session = Depends(crud.get_db),
    permissions: schemas.Permissions = Depends(permissions),
) -> schemas.KeyValue | None:
    if not permissions.store.can_read("_", key):
        raise PERMISSION_EXCEPTION
    if store := crud.get_store(db):
        return schemas.KeyValue(key=key, value=store.data.get(key))
    return None


@router.put("/store/_/{key}", tags=["storage"])
async def write_top_level_key(
    key: str,
    value: schemas.Value,
    db: Session = Depends(crud.get_db),
    permissions: schemas.Permissions = Depends(permissions),
) -> schemas.KeyValue:
    if not permissions.store.can_write("_", key):
        raise PERMISSION_EXCEPTION
    store = crud.get_store(db)
    if store is None:
        store = crud.create_store(db)
    store.data[key] = value.value
    db.add(store)
    db.commit()
    return schemas.KeyValue(key=key, value=value.value)


@router.delete("/store/_/{key}", tags=["storage"])
async def delete_top_level_key(
    key: str,
    db: Session = Depends(crud.get_db),
    permissions: schemas.Permissions = Depends(permissions),
):
    if not permissions.store.can_write("_", key):
        raise PERMISSION_EXCEPTION
    store = crud.get_store(db)
    if store and key in store.data:
        store.data.pop(key)
        db.add(store)
        db.commit()


@router.get("/store/{badge_id}", tags=["storage"])
async def read_badge_level(
    badge: models.Badge = Depends(badge),
    db: Session = Depends(crud.get_db),
    permissions: schemas.Permissions = Depends(permissions),
) -> list[schemas.KeyValue]:
    if not permissions.store.can_enumerate(badge.id):
        raise PERMISSION_EXCEPTION
    if store := crud.get_store(db, badge):
        return [
            schemas.KeyValue(key=key, value=value) for key, value in store.data.items()
        ]
    return []


@router.get("/store/{badge_id}/{key}", tags=["storage"])
async def read_badge_level_key(
    key: str,
    badge: models.Badge = Depends(badge),
    db: Session = Depends(crud.get_db),
    permissions: schemas.Permissions = Depends(permissions),
) -> schemas.KeyValue | None:
    if not permissions.store.can_read(badge.id, key):
        raise PERMISSION_EXCEPTION
    if store := crud.get_store(db, badge):
        return schemas.KeyValue(key=key, value=store.data.get(key))
    return None


@router.put("/store/{badge_id}/{key}", tags=["storage"])
async def write_badge_level_key(
    key: str,
    value: schemas.Value,
    badge: models.Badge = Depends(badge),
    db: Session = Depends(crud.get_db),
    permissions: schemas.Permissions = Depends(permissions),
) -> schemas.KeyValue:
    if not permissions.store.can_write(badge.id, key):
        raise PERMISSION_EXCEPTION
    store = crud.get_store(db, badge)
    if store is None:
        store = crud.create_store(db, badge)
    store.data[key] = value.value
    db.add(store)
    db.commit()
    return schemas.KeyValue(key=key, value=value.value)


@router.delete("/store/{badge_id}/{key}", tags=["storage"])
async def delete_badge_level(
    key: str,
    badge: models.Badge = Depends(badge),
    db: Session = Depends(crud.get_db),
    permissions: schemas.Permissions = Depends(permissions),
):
    if not permissions.store.can_write(badge.id, key):
        raise PERMISSION_EXCEPTION
    store = crud.get_store(db, badge)
    if store and key in store.data:
        store.data.pop(key)
        db.add(store)
        db.commit()
