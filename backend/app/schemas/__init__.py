from pydantic import BaseModel

from ..utils import TokenGetter
from .apps import *
from .badges import *
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


class Developer(BaseModel):
    id: str
    email: str

    superuser: bool
