from ..models.database import SessionLocal
from .apps import *
from .badges import *
from .stores import *
from .users import *


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
