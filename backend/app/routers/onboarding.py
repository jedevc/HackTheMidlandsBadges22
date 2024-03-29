import json
import os
import smtplib
import ssl
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from sqlalchemy.orm import Session

from .. import crud, models, schemas
from ..utils import SHORTCODE_BADGE, SHORTCODE_TOKEN, SHORTCODE_USER, Token
from .helpers import badge

router = APIRouter()


class Signup(schemas.UserCreate):
    badge: str


class Resend(BaseModel):
    badge: str


PLATFORM_CLIENT_URL = os.environ.get("PLATFORM_CLIENT_URL")
SMTP_DEV = bool(json.loads(os.environ.get("SMTP_DEV") or "false"))
SMTP_USERNAME = os.environ.get("SMTP_USERNAME")
SMTP_PASSWORD = os.environ.get("SMTP_PASSWORD")
SMTP_SERVER = os.environ.get("SMTP_SERVER")
SMTP_PORT = int(os.environ.get("SMTP_PORT") or 0)


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
    user = crud.create_user(db, name=signup.name, email=signup.email)
    badge.user = user
    badge.claimed = True

    usr = str(Token(SHORTCODE_USER, user.id))
    bdg = str(Token(SHORTCODE_BADGE, badge.id))
    permissions = schemas.Permissions(
        users=schemas.PermissionsAtom(read=[usr]),
        badges=schemas.PermissionsAtom(read=[bdg]),
        store=schemas.PermissionsStore(
            badges=schemas.PermissionsAtom(read=[bdg], write=[bdg]),
            keys=schemas.PermissionsAtom(read=["code", "token"], write=["code"]),
        ),
    )
    token = crud.create_token(db, permissions.dict())
    tkn = str(Token(SHORTCODE_TOKEN, token.id))

    # helper for admin view, allows easily finding token for given user
    store = crud.get_store(db, badge)
    if store is None:
        store = crud.create_store(db, badge)
    store.data["token"] = tkn

    sendmail(user, usr, bdg, tkn)
    db.commit()

    return user


@router.post(
    "/resend",
    tags=["onboarding"],
    response_model=schemas.User,
)
async def resend(
    signup: Resend,
    db: Session = Depends(crud.get_db),
) -> models.User:
    badge = crud.get_badge(db, signup.badge)
    if not badge:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Badge not found"
        )
    if not badge.claimed or not badge.user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Badge not claimed"
        )

    store = crud.get_store(db, badge)
    if store is None:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="No store found"
        )
    tkn = store.data["token"]

    usr = str(Token(SHORTCODE_USER, badge.user.id))
    bdg = str(Token(SHORTCODE_BADGE, badge.id))

    sendmail(badge.user, usr, bdg, tkn)
    return badge.user


def sendmail(user: models.User, usr: str, bdg: str, tkn: str):
    mail = MIMEMultipart("alternative")
    mail["Subject"] = onboarding_subject
    mail["From"] = SMTP_USERNAME
    mail["To"] = user.email
    url = f"{PLATFORM_CLIENT_URL}?token={tkn}"
    text = MIMEText(onboarding_template.format(user.name, user.email, url), "plain")
    mail.attach(text)

    if SMTP_USERNAME and SMTP_SERVER:
        ssl_context = ssl.create_default_context()
        service = smtplib.SMTP_SSL(SMTP_SERVER, SMTP_PORT, context=ssl_context)
        if SMTP_PASSWORD:
            service.login(SMTP_USERNAME, SMTP_PASSWORD)
        service.sendmail(SMTP_USERNAME, user.email, mail.as_string())
        service.quit()
    elif SMTP_DEV:
        # developer fallback!
        print(mail.as_string())
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="sign up is no longer permitted",
        )


onboarding_subject = "Welcome to the HackTheMidlands Badge Platform!"
onboarding_template = """
Hi {0}!

You're receiving this email because someone signed up for the HackTheMidlands
interactive badge service using your email address "{1}".

Click here to login and edit your badge: "{2}"

If you didn't request this email, then you ignore this safely.

All the best,
HTM
"""
