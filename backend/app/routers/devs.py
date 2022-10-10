from fastapi import APIRouter

router = APIRouter()


@router.get("/devs", tags=["devs"])
async def read_devs():
    raise NotImplementedError()


@router.get("/devs/{dev}", tags=["devs"])
async def read_dev(dev: str):
    raise NotImplementedError()


@router.patch("/devs/{dev}", tags=["devs"])
async def update_dev(dev: str):
    raise NotImplementedError()


@router.put("/devs/{dev}", tags=["devs"])
async def replace_dev(dev: str):
    raise NotImplementedError()
