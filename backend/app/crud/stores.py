from sqlalchemy.orm import Session

from .. import models
from ..utils import Token


def get_store(db: Session, badge: models.Badge | None = None) -> models.Store | None:
    q = db.query(models.Store)
    if badge:
        q = q.filter(models.Store.badge_id == badge.id)
    return q.first()


def create_store(db: Session, badge: models.Badge | None = None) -> models.Store:
    db_store = models.Store(badge=badge, data={})
    db.add(db_store)
    db.flush()
    db.refresh(db_store)
    return db_store
