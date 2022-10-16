import enum
from fnmatch import fnmatch

from pydantic import BaseModel

from ..utils import SHORTCODE_TOKEN, Token, TokenGetter


class PermissionsAtom(BaseModel):
    read: list[str] = []
    write: list[str] = []
    create: bool = False
    enumerate: bool = False

    @staticmethod
    def all() -> "PermissionsAtom":
        return PermissionsAtom(
            read=["*"],
            write=["*"],
            create=True,
            enumerate=True,
        )

    @staticmethod
    def empty() -> "PermissionsAtom":
        return PermissionsAtom()

    def can_read(self, item: Token | str) -> bool:
        return self._can(item, self.read)

    def can_write(self, item: Token | str) -> bool:
        return self._can(item, self.write)

    def can_enumerate(self) -> bool:
        return self.enumerate

    def can_create(self) -> bool:
        return self.create

    def _can(self, item: Token | str, rules: list[str]) -> bool:
        for rule in rules:
            if fnmatch(str(item), rule):
                return True
        return False


class PermissionsStore(BaseModel):
    badges: PermissionsAtom
    keys: PermissionsAtom

    def can_read(self, badge: Token | str, key: str) -> bool:
        return self.badges.can_read(badge) and self.keys.can_read(key)

    def can_write(self, badge: Token | str, key: str) -> bool:
        return self.badges.can_write(badge) and self.keys.can_write(key)

    def can_enumerate(self, badge: Token | str) -> bool:
        return self.badges.can_read(badge) and self.keys.can_enumerate()


class Permissions(BaseModel):
    badges: PermissionsAtom = PermissionsAtom.empty()
    users: PermissionsAtom = PermissionsAtom.empty()
    tokens: PermissionsAtom = PermissionsAtom.empty()
    store: PermissionsStore = PermissionsStore(
        badges=PermissionsAtom.empty(), keys=PermissionsAtom.empty()
    )

    @staticmethod
    def all() -> "Permissions":
        return Permissions(
            badges=PermissionsAtom.all(),
            users=PermissionsAtom.all(),
            tokens=PermissionsAtom.all(),
            store=PermissionsStore(
                badges=PermissionsAtom.all(),
                keys=PermissionsAtom.all(),
            ),
        )

    @staticmethod
    def empty() -> "Permissions":
        return Permissions()


class APIToken(BaseModel):
    id: str
    permissions: Permissions

    class Config:
        getter_dict = TokenGetter(id=SHORTCODE_TOKEN)
        orm_mode = True
