from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import crud, models, schemas
from ..utils import SHORTCODE_BADGE, SHORTCODE_TOKEN, SHORTCODE_USER, Token
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

    usr = str(Token(SHORTCODE_USER, db_user.id))
    bdg = str(Token(SHORTCODE_BADGE, badge.id))
    permissions = schemas.Permissions(
        users=schemas.PermissionsAtom(read=[usr]),
        badges=schemas.PermissionsAtom(read=[bdg]),
        store=schemas.PermissionsStore(
            badges=schemas.PermissionsAtom(read=[bdg], write=[bdg]),
            keys=schemas.PermissionsAtom(read=["code", "token"], write=["code"]),
        ),
    )
    db_token = crud.create_token(db, permissions.dict())
    tkn = str(Token(SHORTCODE_TOKEN, db_token.id))

    # helper for admin view, allows easily finding token for given user
    store = crud.get_store(db, badge)
    if store is None:
        store = crud.create_store(db, badge)
    store.data["token"] = tkn
    db.add(store)
    db.commit()  # FIXME: only call commit once :)

    print(f"emailing api token <{tkn}> to {db_user.email}")

    return db_user
