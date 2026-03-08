from fastapi import FastAPI
from src.api.products_router import router as products_router

app = FastAPI()

app.include_router(products_router, prefix="/api/v1/catalog")