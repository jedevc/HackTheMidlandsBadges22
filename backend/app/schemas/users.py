from typing import Any

from pydantic import BaseModel

from ..utils import SHORTCODE_USER, TokenGetter
from .badges import Badge


class UserBase(BaseModel):
    name: str
    email: str

    class Config:
        getter_dict = TokenGetter(id=SHORTCODE_USER)
        orm_mode = True


class UserBaseOpt(BaseModel):
    name: str | None
    email: str | None

    class Config:
        getter_dict = TokenGetter(id=SHORTCODE_USER)
        orm_mode = True


class UserCreate(UserBase):
    pass


class UserUpdate(UserBaseOpt):
    pass


class User(UserBase):
    id: str
    badges: list[Badge]

    class Config:
        getter_dict = TokenGetter(id=SHORTCODE_USER)
        orm_mode = True
