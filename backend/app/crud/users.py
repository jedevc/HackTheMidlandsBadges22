from sqlalchemy.orm import Session

from .. import models
from ..utils import SHORTCODE_BADGE, SHORTCODE_BADGE_CODE, SHORTCODE_USER, Token


def create_user(db: Session, name: str, email: str) -> models.User:
    db_user = models.User(name=name, email=email)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def update_user(
    db: Session, db_user: models.User, name: str | None = None, email: str | None = None
) -> models.User:
    if name is not None:
        db_user.name = name
    if email is not None:
        db_user.email = email
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user


def delete_user(db: Session, db_user: models.User):
    db.delete(db_user)
    db.commit()


def get_users(db: Session, limit: int = 10, offset: int = 0) -> list[models.User]:
    return db.query(models.User).offset(offset).limit(limit).all()


def get_user(db: Session, user_id: str) -> models.User | None:
    token = Token.parse(user_id)
    if token is None:
        return None

    if token.shortcode == SHORTCODE_USER:
        return db.query(models.User).filter(models.User.id == token.core).first()
    elif token.shortcode == SHORTCODE_BADGE:
        return (
            db.query(models.User)
            .join(models.Badge)
            .filter(models.Badge.id == token.core)
            .first()
        )
    elif token.shortcode == SHORTCODE_BADGE_CODE:
        return (
            db.query(models.User)
            .join(models.Badge)
            .join(models.BadgeCode)
            .filter(models.BadgeCode.id == token.core)
            .first()
        )

    return None
