from fnmatch import fnmatch

from pydantic import BaseModel

from ..utils import TokenGetter


class Atom(BaseModel):
    read: list[str] = []
    write: list[str] = []
    create: bool = False
    enumerate: bool = False

    @staticmethod
    def all() -> "Atom":
        return Atom(
            read=["*"],
            write=["*"],
            create=True,
            enumerate=True,
        )

    @staticmethod
    def empty() -> "Atom":
        return Atom()

    def can_read(self, item: str) -> bool:
        return self._can(item, self.read)

    def can_write(self, item: str) -> bool:
        return self._can(item, self.write)

    def can_enumerate(self) -> bool:
        return self.enumerate

    def can_create(self) -> bool:
        return self.create

    def _can(self, item: str, rules: list[str]) -> bool:
        for rule in rules:
            if fnmatch(item, rule):
                return True
        return False


class StorePermissions(BaseModel):
    badges: Atom
    keys: Atom

    def can_read(self, badge: str, key: str) -> bool:
        return self.badges.can_read(badge) and self.keys.can_read(key)

    def can_write(self, badge: str, key: str) -> bool:
        return self.badges.can_write(badge) and self.keys.can_write(key)

    def can_enumerate(self, badge: str) -> bool:
        return self.badges.can_read(badge) and self.keys.can_enumerate()


class Permissions(BaseModel):
    badges: Atom = Atom.empty()
    users: Atom = Atom.empty()
    tokens: Atom = Atom.empty()
    store: StorePermissions = StorePermissions(badges=Atom.empty(), keys=Atom.empty())

    @staticmethod
    def all() -> "Permissions":
        return Permissions(
            badges=Atom.all(),
            users=Atom.all(),
            tokens=Atom.all(),
            store=StorePermissions(
                badges=Atom.all(),
                keys=Atom.all(),
            ),
        )

    @staticmethod
    def empty() -> "Permissions":
        return Permissions()


class APIToken(BaseModel):
    id: str
    permissions: Permissions

    class Config:
        getter_dict = TokenGetter(id="tkn")
        orm_mode = True
