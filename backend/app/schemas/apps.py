from typing import Any

from pydantic import BaseModel

from ..utils import TokenGetter
from .badges import Badge


class AppBase(BaseModel):
    name: str

    class Config:
        getter_dict = TokenGetter(id="app")
        orm_mode = True


class AppBaseOpt(BaseModel):
    name: str | None

    class Config:
        getter_dict = TokenGetter(id="app")
        orm_mode = True


class AppCreate(AppBase):
    pass


class AppUpdate(AppBaseOpt):
    pass


class App(AppBase):
    id: str


class APIToken(BaseModel):
    id: str

    class Config:
        getter_dict = TokenGetter(id="tkn")
        orm_mode = True
