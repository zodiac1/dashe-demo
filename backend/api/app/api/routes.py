from fastapi import APIRouter
from . import property_sales

router = APIRouter()
router.include_router(property_sales.router)

@router.get("/")
async def read_root():
    return {"message": "Welcome to the Dashe Demo API"}
