from pydantic import BaseModel

from ..utils import SHORTCODE_BADGE, SHORTCODE_BADGE_CODE, TokenGetter


class Badge(BaseModel):
    id: str
    claimed: bool

    class Config:
        orm_mode = True
        getter_dict = TokenGetter(id=SHORTCODE_BADGE)


class BadgeCode(BaseModel):
    id: str

    class Config:
        orm_mode = True
        getter_dict = TokenGetter(id=SHORTCODE_BADGE_CODE)
