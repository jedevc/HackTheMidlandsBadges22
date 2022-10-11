from pydantic import BaseModel

from ..utils import TokenGetter


class Badge(BaseModel):
    id: str
    claimed: bool

    class Config:
        orm_mode = True
        getter_dict = TokenGetter(id="bdg")


class BadgeCode(BaseModel):
    id: str

    class Config:
        orm_mode = True
        getter_dict = TokenGetter(id="bdc")
