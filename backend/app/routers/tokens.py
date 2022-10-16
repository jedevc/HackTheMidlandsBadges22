from typing import Any

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import crud, models, schemas
from .helpers import permissions, token

router = APIRouter()


@router.get("/tokens", tags=["tokens"], response_model=list[schemas.APIToken])
async def read_tokens(
    offset: int = 0,
    limit: int = 10,
    db: Session = Depends(crud.get_db),
    permissions: schemas.Permissions = Depends(
        permissions(lambda p: p.tokens.can_enumerate())
    ),
) -> list[models.APIToken]:
    return crud.get_tokens(db, offset=offset, limit=limit)


@router.get("/tokens/{token_id}", tags=["tokens"], response_model=schemas.APIToken)
async def read_token(
    token: models.APIToken = Depends(token(lambda p, t: p.tokens.can_read(t))),
) -> models.APIToken:
    return token


@router.post("/tokens", tags=["tokens"], response_model=schemas.APIToken)
async def create_token(
    permissions: schemas.Permissions,
    db: Session = Depends(crud.get_db),
    current_permissions: schemas.Permissions = Depends(
        permissions(lambda p: p.tokens.can_create())
    ),
) -> models.APIToken:
    # FIXME: check permissions are proper subset
    return crud.create_token(db, permissions.dict())


@router.delete("/tokens/{token_id}", tags=["tokens"])
async def delete_token(
    token: models.APIToken = Depends(token(lambda p, t: p.tokens.can_write(t))),
    db: Session = Depends(crud.get_db),
):
    return crud.delete_token(db, token)
