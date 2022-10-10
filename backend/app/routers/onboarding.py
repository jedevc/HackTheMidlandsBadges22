from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from .. import crud, models, schemas
from ..utils import Token

router = APIRouter()


@router.post(
    "/signup",
    tags=["onboarding"],
    status_code=status.HTTP_201_CREATED,
    response_model=schemas.User,
)
async def signup(
    user: schemas.UserCreate, db: Session = Depends(crud.get_db)
) -> models.User:
    db_user = crud.create_user(db, name=user.name, email=user.email)

    permissions = schemas.Permissions(
        users=schemas.Atom(
            read=[str(Token("usr", db_user.id))],
        ),
    )
    db_token = crud.create_token(db, permissions.dict())
    print(f"emailing api token <{Token('tkn', db_token.id)}> to {db_user.email}")
    return db_user
