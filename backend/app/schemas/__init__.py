from pydantic import BaseModel

from ..utils import TokenGetter
from .badges import *
from .tokens import *
from .users import *


class KeyValue(BaseModel):
    key: str
    value: str


class Value(BaseModel):
    value: str
