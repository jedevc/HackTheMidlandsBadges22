from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import crud, models, schemas
from .helpers import permissions, user

router = APIRouter()


@router.get("/users", tags=["users"], response_model=list[schemas.User])
async def read_users(
    offset: int = 0,
    limit: int = 10,
    permissions: schemas.Permissions = Depends(
        permissions(lambda p: p.users.can_enumerate())
    ),
    db: Session = Depends(crud.get_db),
) -> list[models.User]:
    return crud.get_users(db, offset=offset, limit=limit)


@router.get("/users/{user_id}", tags=["users"], response_model=schemas.User)
async def read_user(
    user: models.User = Depends(user(lambda p, u: p.users.can_read(u))),
) -> models.User:
    return user


@router.post(
    "/users",
    tags=["users"],
    status_code=status.HTTP_201_CREATED,
    response_model=schemas.User,
)
async def create_user(
    user: schemas.UserCreate,
    db: Session = Depends(crud.get_db),
    permissions: schemas.Permissions = Depends(
        permissions(lambda p: p.users.can_create())
    ),
) -> models.User:
    return crud.create_user(db, name=user.name, email=user.email)


@router.put("/users/{user_id}", tags=["users"], response_model=schemas.User)
async def replace_user(
    user_data: schemas.UserCreate,
    user: models.User = Depends(user(lambda p, u: p.users.can_write(u))),
    db: Session = Depends(crud.get_db),
) -> models.User:
    return crud.update_user(db, user, name=user_data.name, email=user_data.email)


@router.patch("/users/{user_id}", tags=["users"], response_model=schemas.User)
async def update_user(
    user_data: schemas.UserUpdate,
    user: models.User = Depends(user(lambda p, u: p.users.can_write(u))),
    db: Session = Depends(crud.get_db),
) -> models.User:
    return crud.update_user(db, user, name=user_data.name, email=user_data.email)


@router.delete("/users/{user_id}", tags=["users"])
async def delete_user(
    user: models.User = Depends(user(lambda p, u: p.users.can_write(u))),
    db: Session = Depends(crud.get_db),
):
    return crud.delete_user(db, user)
