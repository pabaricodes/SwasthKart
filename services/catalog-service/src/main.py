from contextlib import asynccontextmanager

from fastapi import FastAPI
from sqlalchemy import text

from src.config.database import engine, Base
from src.api.categories_router import router as categories_router, admin_router as categories_admin
from src.api.products_router import router as products_router, admin_router as products_admin


@asynccontextmanager
async def lifespan(app: FastAPI):
    yield
    await engine.dispose()


app = FastAPI(
    title="SwasthKart Catalog Service",
    version="1.0.0",
    lifespan=lifespan,
)

# Public routes
app.include_router(categories_router)
app.include_router(products_router)

# Admin routes
app.include_router(categories_admin)
app.include_router(products_admin)


@app.get("/health/live")
async def health_live():
    return {"status": "ok"}


@app.get("/health/ready")
async def health_ready():
    try:
        async with engine.connect() as conn:
            await conn.execute(text("SELECT 1"))
        return {"status": "ready", "checks": {"db": "ok"}}
    except Exception:
        return {"status": "not_ready", "checks": {"db": "fail"}}
