from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import crud, models, schemas
from ..utils import Token
from .helpers import badge

router = APIRouter()


class Signup(schemas.UserCreate):
    badge: str


@router.post(
    "/signup",
    tags=["onboarding"],
    status_code=status.HTTP_201_CREATED,
    response_model=schemas.User,
)
async def signup(
    signup: Signup,
    db: Session = Depends(crud.get_db),
) -> models.User:
    badge = crud.get_badge(db, signup.badge)
    if not badge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Badge not found"
        )
    if badge.claimed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Badge already claimed"
        )
    db_user = crud.create_user(db, name=signup.name, email=signup.email)
    badge.user = db_user
    badge.claimed = True
    db.commit()

    usr = str(Token("usr", db_user.id))
    bdg = str(Token("bdg", badge.id))
    permissions = schemas.Permissions(
        users=schemas.Atom(read=[usr]),
        badges=schemas.Atom(read=[bdg]),
        store=schemas.StorePermissions(
            badges=schemas.Atom(read=[bdg], write=[bdg]),
            keys=schemas.Atom(read=["code", "token"], write=["code"]),
        ),
    )
    db_token = crud.create_token(db, permissions.dict())
    tkn = str(Token("tkn", db_token.id))

    # helper for admin view, allows easily finding token for given user
    store = crud.get_store(db, badge)
    if store is None:
        store = crud.create_store(db, badge)
    store.data["token"] = tkn
    db.add(store)
    db.commit()  # FIXME: only call commit once :)

    print(f"emailing api token <{Token('tkn', db_token.id)}> to {db_user.email}")

    return db_user
