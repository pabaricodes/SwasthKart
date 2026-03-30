from datetime import datetime
from typing import Optional
from uuid import UUID

from pydantic import BaseModel, Field


class NutritionInfo(BaseModel):
    calories: Optional[float] = None
    protein_g: Optional[float] = None
    carbs_g: Optional[float] = None
    fat_g: Optional[float] = None
    fiber_g: Optional[float] = None
    serving_size: Optional[float] = None
    serving_unit: Optional[str] = None


class CategoryResponse(BaseModel):
    id: UUID
    name: str
    slug: str
    image_url: Optional[str] = None
    sort_order: int
    is_active: bool
    created_at: datetime

    class Config:
        from_attributes = True


class CategoryInput(BaseModel):
    name: str = Field(max_length=100)
    slug: str = Field(max_length=100)
    image_url: Optional[str] = Field(default=None, max_length=500)
    sort_order: int = 0


class ProductResponse(BaseModel):
    id: UUID
    category_id: UUID
    name: str
    slug: str
    description: Optional[str] = None
    brand: Optional[str] = None
    image_urls: list[str] = []
    mrp_paise: int
    selling_price_paise: int
    unit: str
    unit_value: int
    nutrition_info: Optional[NutritionInfo] = None
    allergens: list[str] = []
    is_active: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ProductInput(BaseModel):
    category_id: UUID
    name: str = Field(max_length=200)
    slug: str = Field(max_length=200)
    description: Optional[str] = None
    brand: Optional[str] = Field(default=None, max_length=100)
    image_urls: list[str] = []
    mrp_paise: int = Field(ge=0)
    selling_price_paise: int = Field(ge=0)
    unit: str = Field(pattern=r"^(g|kg|ml|l|pieces)$")
    unit_value: int
    nutrition_info: Optional[NutritionInfo] = None
    allergens: list[str] = []


class Pagination(BaseModel):
    page: int
    page_size: int
    total_count: int
    total_pages: int


class PaginatedProducts(BaseModel):
    data: list[ProductResponse]
    pagination: Pagination
