from typing import Any

from sqlalchemy import Boolean, Column, ForeignKey, String, Table
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from sqlalchemy_json import mutable_json_type  # type: ignore

from ..utils import uniqueid
from .database import Base


class User(Base):
    __tablename__ = "users"

    id: str = Column(String, primary_key=True, index=True, default=uniqueid)
    email: str = Column(String, unique=True, index=True)
    name: str = Column(String)

    badges: list["Badge"] = relationship("Badge", back_populates="user")


class Badge(Base):
    __tablename__ = "badges"

    id: str = Column(String, primary_key=True, index=True, default=uniqueid)
    user_id: str = Column(String, ForeignKey("users.id"))

    claimed: bool = Column(Boolean, default=False)

    user: "User | None" = relationship("User", back_populates="badges")
    codes: list["BadgeCode"] = relationship("BadgeCode", back_populates="badge")


class BadgeCode(Base):
    __tablename__ = "badge_codes"

    id: str = Column(String, primary_key=True, index=True, default=uniqueid)
    badge_id: str = Column(String, ForeignKey("badges.id"))

    badge: "Badge" = relationship("Badge", back_populates="codes")


class APIToken(Base):
    __tablename__ = "tokens"

    id: str = Column(String, primary_key=True, index=True, default=uniqueid)
    permissions: dict[str, Any] = Column(mutable_json_type(dbtype=JSONB, nested=True))


class Store(Base):
    __tablename__ = "stores"

    id: str = Column(String, primary_key=True, index=True, default=uniqueid)
    badge_id: str = Column(String, ForeignKey("badges.id"))

    data: dict[str, str] = Column(mutable_json_type(dbtype=JSONB, nested=True))

    badge: "Badge | None" = relationship("Badge")
