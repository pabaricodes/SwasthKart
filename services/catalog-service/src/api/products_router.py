from fastapi import APIRouter, Query
from typing import Optional
from src.services.product_service import ProductService
from src.models.product_schema import ProductListResponse

router = APIRouter()


@router.get("/products", response_model=ProductListResponse)
def get_products(
    category: Optional[str] = Query(default=None),
    dietType: Optional[str] = Query(default=None),
    page: int = Query(default=1, ge=1),
    pageSize: int = Query(default=20, ge=1, le=100),
):
    service = ProductService()
    products, total = service.get_products(
        category=category,
        dietType=dietType,
        page=page,
        pageSize=pageSize,
    )
    return {
        "page": page,
        "pageSize": pageSize,
        "total": total,
        "items": products
    }

@router.get("/health")
def health():
    return {"status": "ok"}