from fastapi import APIRouter

router = APIRouter()


@router.post("/apps/{app}/mail/{user}", tags=["email"])
async def read_users(app: str, user: str):
    raise NotImplementedError()
