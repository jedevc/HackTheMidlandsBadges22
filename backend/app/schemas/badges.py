from pydantic import BaseModel

from ..utils import SHORTCODE_BADGE, SHORTCODE_BADGE_CODE, TokenGetter


class BadgeBase(BaseModel):
    claimed: bool

    class Config:
        orm_mode = True
        getter_dict = TokenGetter(id=SHORTCODE_BADGE)


class BadgeBaseOpt(BaseModel):
    claimed: bool | None

    class Config:
        orm_mode = True
        getter_dict = TokenGetter(id=SHORTCODE_BADGE)


class Badge(BadgeBase):
    id: str

    class Config:
        orm_mode = True
        getter_dict = TokenGetter(id=SHORTCODE_BADGE)


class BadgeCreate(BadgeBase):
    pass


class BadgeUpdate(BadgeBaseOpt):
    pass


class BadgeCode(BaseModel):
    id: str

    class Config:
        orm_mode = True
        getter_dict = TokenGetter(id=SHORTCODE_BADGE_CODE)
