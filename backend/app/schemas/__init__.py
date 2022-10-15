from pydantic import BaseModel

from ..utils import TokenGetter
from .badges import *
from .tokens import *
from .users import *


class StoragePermissionScopes(BaseModel):
    read: list[str]
    write: list[str]


class PermissionScopes(BaseModel):
    storage: StoragePermissionScopes
    email: bool


class Permission(BaseModel):
    app: list[str]
    badge: list[str]
    scopes: PermissionScopes
    superuser: bool


class KeyValue(BaseModel):
    key: str
    value: str


class Value(BaseModel):
    value: str
