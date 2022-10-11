from fastapi import Depends, Header, HTTPException, status
from sqlalchemy.orm import Session

from ... import crud, models, schemas

PERMISSION_EXCEPTION = HTTPException(status.HTTP_403_FORBIDDEN, "Permission denied")


async def permissions(
    x_token: str = Header(), db: Session = Depends(crud.get_db)
) -> schemas.Permissions:
    if x_token == "master":
        return schemas.Permissions.all()

    tkn = crud.get_token(db, x_token)
    if not tkn:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Token not found"
        )
    return schemas.Permissions(**tkn.permissions)


async def user(
    user_id: str,
    db: Session = Depends(crud.get_db),
    permissions: schemas.Permissions = Depends(permissions),
) -> models.User:
    if not permissions.users.can_read(user_id):
        raise PERMISSION_EXCEPTION
    user = crud.get_user(db, user_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found"
        )
    return user


async def badge(
    badge_id: str,
    db: Session = Depends(crud.get_db),
    permissions: schemas.Permissions = Depends(permissions),
) -> models.Badge:
    if not permissions.badges.can_read(badge_id):
        raise PERMISSION_EXCEPTION
    badge = crud.get_badge(db, badge_id)
    if not badge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Badge not found"
        )
    return badge


async def badge_code(
    badge_id: str,
    code_id: str,
    db: Session = Depends(crud.get_db),
    permissions: schemas.Permissions = Depends(permissions),
) -> models.BadgeCode:
    if not permissions.badges.can_read(badge_id):
        raise PERMISSION_EXCEPTION
    badge_code = crud.get_badge_code(db, badge_id, code_id)
    if not badge_code:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Badge code not found"
        )
    return badge_code


async def token(
    token_id: str,
    db: Session = Depends(crud.get_db),
    permissions: schemas.Permissions = Depends(permissions),
) -> models.APIToken:
    if not permissions.tokens.can_read(token_id):
        raise PERMISSION_EXCEPTION
    token = crud.get_token(db, token_id)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Token not found"
        )
    return token
