from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from .. import crud, models, schemas

router = APIRouter()


async def app(app_id: str, db: Session = Depends(crud.get_db)) -> models.App:
    app = crud.get_app(db, app_id)
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="App not found"
        )
    return app


async def app_token(
    app_id: str, token_id: str, db: Session = Depends(crud.get_db)
) -> models.APIToken:
    token = crud.get_app_token(db, app_id, token_id)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Token not found"
        )
    return token


@router.get("/apps", tags=["apps"], response_model=list[schemas.App])
async def read_apps(
    offset: int = 0, limit: int = 10, db: Session = Depends(crud.get_db)
) -> list[models.App]:
    return crud.get_apps(db, offset=offset, limit=limit)


@router.get("/apps/{app_id}", tags=["apps"], response_model=schemas.App)
async def read_app(app: models.App = Depends(app)) -> models.App:
    return app


@router.post(
    "/apps",
    tags=["apps"],
    status_code=status.HTTP_201_CREATED,
    response_model=schemas.App,
)
async def create_app(
    app: schemas.AppCreate, db: Session = Depends(crud.get_db)
) -> models.App:
    return crud.create_app(db, name=app.name)


@router.put("/apps/{app_id}", tags=["apps"], response_model=schemas.App)
async def replace_app(
    app_data: schemas.AppCreate,
    app: models.App = Depends(app),
    db: Session = Depends(crud.get_db),
) -> models.App:
    return crud.update_app(db, app, name=app_data.name)


@router.patch("/apps/{app_id}", tags=["apps"], response_model=schemas.App)
async def update_app(
    app_data: schemas.AppUpdate,
    app: models.App = Depends(app),
    db: Session = Depends(crud.get_db),
) -> models.App:
    return crud.update_app(db, app, name=app_data.name)


@router.delete("/apps/{app_id}", tags=["apps"])
async def delete_app(
    app: models.App = Depends(app), db: Session = Depends(crud.get_db)
):
    return crud.delete_app(db, app)


@router.get(
    "/apps/{app_id}/tokens", tags=["apps"], response_model=list[schemas.APIToken]
)
async def read_app_tokens(
    offset: int = 0,
    limit: int = 10,
    app: models.App = Depends(app),
) -> list[models.APIToken]:
    return app.tokens


@router.get(
    "/apps/{app_id}/tokens/{token_id}", tags=["apps"], response_model=schemas.APIToken
)
async def read_app_token(
    token: models.APIToken = Depends(app_token),
) -> models.APIToken:
    return token


@router.post("/apps/{app_id}/tokens", tags=["apps"], response_model=schemas.APIToken)
async def create_app_token(
    app: models.App = Depends(app),
    db: Session = Depends(crud.get_db),
) -> models.APIToken:
    return crud.create_app_token(db, app)


@router.delete("/apps/{app_id}/tokens/{token_id}", tags=["apps"])
async def delete_app_key(
    token: models.APIToken = Depends(app_token),
    db: Session = Depends(crud.get_db),
):
    return crud.delete_app_token(db, token)
