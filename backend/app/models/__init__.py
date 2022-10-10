from sqlalchemy import Column, ForeignKey, String, Table
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from sqlalchemy_json import mutable_json_type  # type: ignore

from .database import Base
from ..utils import uniqueid

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True, default=uniqueid)
    email = Column(String, unique=True, index=True)
    name = Column(String)

    badges: list["Badge"] = relationship("Badge", back_populates="user")


class Badge(Base):
    __tablename__ = "badges"

    id = Column(String, primary_key=True, index=True, default=uniqueid)
    user_id = Column(String, ForeignKey("users.id"))

    user: "User" = relationship("User", back_populates="badges")
    codes: list["BadgeCode"] = relationship("BadgeCode", back_populates="badge")


class BadgeCode(Base):
    __tablename__ = "badge_codes"

    id = Column(String, primary_key=True, index=True, default=uniqueid)
    badge_id = Column(String, ForeignKey("badges.id"))

    badge: "Badge" = relationship("Badge", back_populates="codes")


class App(Base):
    __tablename__ = "apps"

    id = Column(String, primary_key=True, index=True, default=uniqueid)
    name = Column(String)

    tokens: list["APIToken"] = relationship("APIToken", back_populates="app")


class APIToken(Base):
    __tablename__ = "tokens"

    id = Column(String, primary_key=True, index=True, default=uniqueid)
    app_id = Column(String, ForeignKey("apps.id"))

    app: "App" = relationship("App", back_populates="tokens")


class Store(Base):
    __tablename__ = "app_stores"

    id = Column(String, primary_key=True, index=True, default=uniqueid)
    app_id = Column(String, ForeignKey("apps.id"))
    badge_id = Column(String, ForeignKey("badges.id"))

    data: dict[str, str] = Column(mutable_json_type(dbtype=JSONB, nested=True))

    app: "App" = relationship("App")
    badge: "Badge | None" = relationship("Badge")
