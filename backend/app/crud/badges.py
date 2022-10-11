from sqlalchemy.orm import Session

from .. import models
from ..utils import Token


def create_badge(db: Session, user: models.User | None = None) -> models.Badge:
    db_badge = models.Badge(user=user, claimed=user is not None)
    db.add(db_badge)
    db.commit()
    db.refresh(db_badge)
    return db_badge


def delete_badge(db: Session, db_badge: models.Badge):
    db.delete(db_badge)
    db.commit()


def get_badges(db: Session, limit: int = 10, offset: int = 0) -> list[models.Badge]:
    return db.query(models.Badge).offset(offset).limit(limit).all()


def get_badge(db: Session, badge_id: str) -> models.Badge | None:
    token = Token.parse(badge_id)
    if token is None:
        return None

    if token.shortcode == "bdg":
        return db.query(models.Badge).filter(models.Badge.id == token.core).first()
    elif token.shortcode == "bdc":
        return (
            db.query(models.Badge)
            .join(models.BadgeCode)
            .filter(models.BadgeCode.id == token.core)
            .first()
        )

    return None


def create_badge_code(db: Session, badge: models.Badge) -> models.BadgeCode:
    db_badge_code = models.BadgeCode(badge=badge)
    db.add(db_badge_code)
    db.commit()
    db.refresh(db_badge_code)
    return db_badge_code


def get_badge_code(
    db: Session, badge_id: str, badge_code_id: str
) -> models.BadgeCode | None:
    badge = get_badge(db, badge_id)
    if badge is None:
        return None

    token = Token.parse(badge_code_id)
    if token is None:
        return None

    if token.shortcode == "bdc":
        return (
            db.query(models.BadgeCode)
            .join(models.Badge)
            .filter(models.BadgeCode.id == token.core, models.Badge.id == badge.id)
            .first()
        )

    return None


def delete_badge_code(db: Session, db_badge_code: models.BadgeCode):
    db.delete(db_badge_code)
    db.commit()
