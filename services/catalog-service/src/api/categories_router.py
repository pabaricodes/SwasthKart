from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from src.config.database import get_db
from src.models.schemas import CategoryResponse, CategoryInput
from src.repositories import category_repository

router = APIRouter(prefix="/v1", tags=["Categories"])


@router.get("/categories", response_model=list[CategoryResponse])
async def list_categories(db: AsyncSession = Depends(get_db)):
    categories = await category_repository.get_all_active(db)
    return categories


@router.get("/categories/{slug}", response_model=CategoryResponse)
async def get_category(slug: str, db: AsyncSession = Depends(get_db)):
    category = await category_repository.get_by_slug(db, slug)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category


# Admin endpoints
admin_router = APIRouter(prefix="/v1/admin", tags=["Admin - Categories"])


@admin_router.post("/categories", response_model=CategoryResponse, status_code=201)
async def create_category(data: CategoryInput, db: AsyncSession = Depends(get_db)):
    category = await category_repository.create(
        db, name=data.name, slug=data.slug, image_url=data.image_url, sort_order=data.sort_order
    )
    return category


@admin_router.put("/categories/{category_id}", response_model=CategoryResponse)
async def update_category(
    category_id: UUID, data: CategoryInput, db: AsyncSession = Depends(get_db)
):
    category = await category_repository.get_by_id(db, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return await category_repository.update(
        db, category, name=data.name, slug=data.slug, image_url=data.image_url, sort_order=data.sort_order
    )


@admin_router.delete("/categories/{category_id}", status_code=204)
async def delete_category(category_id: UUID, db: AsyncSession = Depends(get_db)):
    category = await category_repository.get_by_id(db, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    await category_repository.delete(db, category)
