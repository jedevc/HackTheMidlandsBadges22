from typing import Any

from sqlalchemy.orm import Session

from .. import models
from ..utils import SHORTCODE_TOKEN, Token


def create_token(db: Session, permissions: dict[str, Any]) -> models.APIToken:
    db_token = models.APIToken(permissions=permissions)
    db.add(db_token)
    db.flush()
    db.refresh(db_token)
    return db_token


def get_tokens(db: Session, limit: int = 10, offset: int = 0) -> list[models.APIToken]:
    return db.query(models.APIToken).offset(offset).limit(limit).all()


def get_token(db: Session, token_id: str) -> models.APIToken | None:
    token = Token.parse(token_id)
    if token is None:
        return None

    if token.shortcode == SHORTCODE_TOKEN:
        return (
            db.query(models.APIToken).filter(models.APIToken.id == token.core).first()
        )

    return None


def delete_token(db: Session, db_token: models.APIToken):
    db.delete(db_token)
