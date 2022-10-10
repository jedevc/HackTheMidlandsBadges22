from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import crud, models, schemas

router = APIRouter()


async def token(token_id: str, db: Session = Depends(crud.get_db)) -> models.APIToken:
    token = crud.get_token(db, token_id)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Token not found"
        )
    return token


@router.get("/tokens", tags=["tokens"], response_model=list[schemas.APIToken])
async def read_tokens(
    offset: int = 0, limit: int = 10, db: Session = Depends(crud.get_db)
) -> list[models.APIToken]:
    return crud.get_tokens(db, offset=offset, limit=limit)


@router.get("/tokens/{token_id}", tags=["tokens"], response_model=schemas.APIToken)
async def read_token(
    token: models.APIToken = Depends(token),
) -> models.APIToken:
    return token


@router.post("/tokens", tags=["tokens"], response_model=schemas.APIToken)
async def create_token(
    db: Session = Depends(crud.get_db),
) -> models.APIToken:
    return crud.create_token(db)


@router.delete("/tokens/{token_id}", tags=["tokens"])
async def delete_token(
    token: models.APIToken = Depends(token),
    db: Session = Depends(crud.get_db),
):
    return crud.delete_token(db, token)
