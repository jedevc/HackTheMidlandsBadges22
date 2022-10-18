import os
from typing import Callable

from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from ... import crud, models, schemas
from ...utils import (
    SHORTCODE_BADGE,
    SHORTCODE_BADGE_CODE,
    SHORTCODE_TOKEN,
    SHORTCODE_USER,
    Token,
)

PERMISSION_EXCEPTION = HTTPException(status.HTTP_403_FORBIDDEN, "Permission denied")


def permissions(f: Callable[[schemas.Permissions], bool] | None = None):
    async def checker(
        x_token: str = Header(),
        db: Session = Depends(crud.get_db),
    ) -> schemas.Permissions:
        if x_token == os.environ["MASTER_TOKEN"]:
            return schemas.Permissions.all()

        tkn = crud.get_token(db, x_token)
        if not tkn:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Token not found"
            )
        permissions = schemas.Permissions(**tkn.permissions)
        if f and not f(permissions):
            raise PERMISSION_EXCEPTION
        return permissions

    return checker


def user(f: Callable[[schemas.Permissions, Token], bool] | None = None):
    def checker(
        user_id: str,
        db: Session = Depends(crud.get_db),
        permissions: schemas.Permissions = Depends(permissions()),
    ) -> models.User:
        user = crud.get_user(db, user_id)
        if f and user and not f(permissions, Token(SHORTCODE_USER, user.id)):
            raise PERMISSION_EXCEPTION
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
            )
        return user

    return checker


def badge(f: Callable[[schemas.Permissions, Token], bool] | None = None):
    def checker(
        badge_id: str,
        db: Session = Depends(crud.get_db),
        permissions: schemas.Permissions = Depends(permissions()),
    ) -> models.Badge:
        badge = crud.get_badge(db, badge_id)
        if f and badge and not f(permissions, Token(SHORTCODE_BADGE, badge.id)):
            raise PERMISSION_EXCEPTION
        if not badge:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Badge not found"
            )
        return badge

    return checker


def badge_code(f: Callable[[schemas.Permissions, Token], bool] | None = None):
    def checker(
        badge_id: str,
        code_id: str,
        db: Session = Depends(crud.get_db),
        permissions: schemas.Permissions = Depends(permissions()),
    ) -> models.BadgeCode:
        badge_code = crud.get_badge_code(db, badge_id, code_id)
        if (
            f
            and badge_code
            and not f(permissions, Token(SHORTCODE_BADGE, badge_code.badge.id))
        ):
            raise PERMISSION_EXCEPTION
        if not badge_code:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Badge code not found"
            )
        return badge_code

    return checker


def token(f: Callable[[schemas.Permissions, Token], bool] | None = None):
    def checker(
        token_id: str,
        db: Session = Depends(crud.get_db),
        permissions: schemas.Permissions = Depends(permissions()),
    ) -> models.APIToken:
        token = crud.get_token(db, token_id)
        if f and token and not f(permissions, Token(SHORTCODE_TOKEN, token.id)):
            raise PERMISSION_EXCEPTION
        if not token:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail="Token not found"
            )
        return token

    return checker
