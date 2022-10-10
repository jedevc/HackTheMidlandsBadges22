from ..models.database import SessionLocal
from .badges import *
from .stores import *
from .tokens import *
from .users import *


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
