from sqlalchemy.orm import Session

from .. import models
from ..utils import Token


def create_app(db: Session, name: str) -> models.App:
    db_app = models.App(name=name)
    db.add(db_app)
    db.commit()
    db.refresh(db_app)
    return db_app


def update_app(
    db: Session,
    db_app: models.App,
    name: str | None = None,
) -> models.App:
    if name is not None:
        db_app.name = name
    db.add(db_app)
    db.commit()
    db.refresh(db_app)
    return db_app


def delete_app(db: Session, db_app: models.App):
    db.delete(db_app)
    db.commit()


def get_apps(db: Session, limit: int = 10, offset: int = 0) -> list[models.App]:
    return db.query(models.App).offset(offset).limit(limit).all()


def get_app(db: Session, app_id: str) -> models.App | None:
    token = Token.parse(app_id)
    if token is None:
        return None
    if token.shortcode == "app":
        return db.query(models.App).filter(models.App.id == token.core).first()
    return None


def create_app_token(db: Session, app: models.App) -> models.APIToken:
    db_token = models.APIToken(app=app)
    db.add(db_token)
    db.commit()
    db.refresh(db_token)
    return db_token


def get_app_token(db: Session, app_id: str, token_id: str) -> models.APIToken | None:
    app = get_app(db, app_id)
    if app is None:
        return None

    token = Token.parse(token_id)
    if token is None:
        return None

    if token.shortcode == "tkn":
        return (
            db.query(models.APIToken)
            .join(models.App)
            .filter(models.APIToken.id == token.core, models.App.id == app.id)
            .first()
        )

    return None


def delete_app_token(db: Session, db_token: models.APIToken):
    db.delete(db_token)
    db.commit()
