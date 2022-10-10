import re
import secrets
import string
from typing import Any, Iterable, Optional

from pydantic.utils import GetterDict

_token_length = 16
_token_alphabet = string.ascii_letters + string.digits
_token_regexp = re.compile("^(.*?)([a-z]{3})([a-zA-Z0-9]+)$")


def uniqueid() -> str:
    return "".join(secrets.choice(_token_alphabet) for i in range(_token_length))


class Token:
    def __init__(self, shortcode: str, core: str, prefix: Optional[str] = None):
        self.shortcode = shortcode
        self.core = core
        self.prefix = prefix

    @staticmethod
    def parse(raw: str) -> Optional["Token"]:
        if match := _token_regexp.match(raw):
            return Token(
                prefix=match.group(1),
                shortcode=match.group(2),
                core=match.group(3),
            )
        return None

    def __str__(self) -> str:
        return f"{self.prefix if self.prefix else ''}{self.shortcode}{self.core}"


def TokenGetter(**kwargs: str):
    class _Getter(GetterDict):
        def get(self, key: str, default: Optional[Any] = None) -> Any:
            if key in kwargs and key in self:
                return kwargs[key] + str(super().get(key, default))
            else:
                return super().get(key, default)

    return _Getter
