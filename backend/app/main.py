from fastapi import FastAPI, status
from fastapi.responses import JSONResponse

from . import models, schemas
from .models.database import engine
from .routers import routers

models.Base.metadata.create_all(bind=engine)

app = FastAPI()

for router in routers:
    app.include_router(router)
