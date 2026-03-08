from pydantic import BaseModel, Field
from uuid import UUID
from typing import Optional, List
from enum import Enum



class ProductCategory(str, Enum):
    READY_TO_EAT = "READY_TO_EAT"
    INGREDIENTS = "INGREDIENTS"


class ProductType(str, Enum):
    READY_TO_EAT = "READY_TO_EAT"
    INGREDIENT = "INGREDIENT"
    BOTH = "BOTH"


class DietType(str, Enum):
    VEG = "VEG"
    NON_VEG = "NON_VEG"
    EGGETARIAN = "EGGETARIAN"


class ProductSummary(BaseModel):
    productId: UUID = Field(example="3b241101-e2bb-4255-8caf-4136c566a962")
    name: str = Field(example="Protein Bowl")
    category: ProductCategory = Field(example="READY_TO_EAT")
    productType: ProductType = Field(example="READY_TO_EAT")
    dietType: DietType = Field(example="NON_VEG")
    price: int = Field(example=299)
    calories: Optional[int] = Field(example=450)
    proteinG: Optional[int] = Field(example=32)
    carbsG: Optional[int] = Field(example=40)
    fatG: Optional[int] = Field(example=15)
    popularity7dCount: int = Field(example=120)
    isActive: bool = Field(example=True)
    createdAt: str = Field(example="2026-03-08T13:49:24")

class ProductListResponse(BaseModel):
    page: int
    pageSize: int
    total: int
    items: List[ProductSummary]