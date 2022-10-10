from fastapi import APIRouter

router = APIRouter()


@router.get("/permissions", tags=["status"])
async def permissions():
    raise NotImplementedError()
