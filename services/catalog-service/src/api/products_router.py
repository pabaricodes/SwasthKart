import math
from typing import Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from src.config.database import get_db
from src.models.schemas import (
    ProductResponse,
    ProductInput,
    PaginatedProducts,
    Pagination,
)
from src.repositories import product_repository

router = APIRouter(prefix="/v1", tags=["Products"])


@router.get("/products", response_model=PaginatedProducts)
async def list_products(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=20, ge=1, le=100),
    category_id: Optional[UUID] = None,
    search: Optional[str] = None,
    sort_by: str = Query(default="created_at", pattern="^(name|price|created_at)$"),
    sort_order: str = Query(default="desc", pattern="^(asc|desc)$"),
    db: AsyncSession = Depends(get_db),
):
    actual_sort = "selling_price_paise" if sort_by == "price" else sort_by

    products, total_count = await product_repository.list_products(
        db,
        page=page,
        page_size=page_size,
        category_id=category_id,
        search=search,
        sort_by=actual_sort,
        sort_order=sort_order,
    )

    return PaginatedProducts(
        data=products,
        pagination=Pagination(
            page=page,
            page_size=page_size,
            total_count=total_count,
            total_pages=math.ceil(total_count / page_size) if total_count > 0 else 0,
        ),
    )


@router.get("/products/{product_id}", response_model=ProductResponse)
async def get_product(product_id: UUID, db: AsyncSession = Depends(get_db)):
    product = await product_repository.get_by_id(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product


# Admin endpoints
admin_router = APIRouter(prefix="/v1/admin", tags=["Admin - Products"])


@admin_router.post("/products", response_model=ProductResponse, status_code=201)
async def create_product(data: ProductInput, db: AsyncSession = Depends(get_db)):
    product = await product_repository.create(
        db,
        category_id=data.category_id,
        name=data.name,
        slug=data.slug,
        description=data.description,
        brand=data.brand,
        image_urls=data.image_urls,
        mrp_paise=data.mrp_paise,
        selling_price_paise=data.selling_price_paise,
        unit=data.unit,
        unit_value=data.unit_value,
        nutrition_info=data.nutrition_info.model_dump() if data.nutrition_info else None,
        allergens=data.allergens,
    )
    return product


@admin_router.put("/products/{product_id}", response_model=ProductResponse)
async def update_product(
    product_id: UUID, data: ProductInput, db: AsyncSession = Depends(get_db)
):
    product = await product_repository.get_by_id(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return await product_repository.update(
        db,
        product,
        category_id=data.category_id,
        name=data.name,
        slug=data.slug,
        description=data.description,
        brand=data.brand,
        image_urls=data.image_urls,
        mrp_paise=data.mrp_paise,
        selling_price_paise=data.selling_price_paise,
        unit=data.unit,
        unit_value=data.unit_value,
        nutrition_info=data.nutrition_info.model_dump() if data.nutrition_info else None,
        allergens=data.allergens,
    )


@admin_router.delete("/products/{product_id}", status_code=204)
async def delete_product(product_id: UUID, db: AsyncSession = Depends(get_db)):
    product = await product_repository.get_by_id(db, product_id)
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    await product_repository.delete(db, product)
