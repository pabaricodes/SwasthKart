import math
from uuid import UUID

from sqlalchemy import select, func, or_
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.product import Product


async def get_by_id(db: AsyncSession, product_id: UUID) -> Product | None:
    result = await db.execute(
        select(Product).where(Product.id == product_id, Product.is_active == True)
    )
    return result.scalar_one_or_none()


async def list_products(
    db: AsyncSession,
    page: int = 1,
    page_size: int = 20,
    category_id: UUID | None = None,
    search: str | None = None,
    sort_by: str = "created_at",
    sort_order: str = "desc",
) -> tuple[list[Product], int]:
    query = select(Product).where(Product.is_active == True)

    if category_id:
        query = query.where(Product.category_id == category_id)

    if search:
        pattern = f"%{search}%"
        query = query.where(
            or_(Product.name.ilike(pattern), Product.brand.ilike(pattern))
        )

    # Count total
    count_query = select(func.count()).select_from(query.subquery())
    total_count = (await db.execute(count_query)).scalar_one()

    # Sort
    sort_column = getattr(Product, sort_by, Product.created_at)
    if sort_order == "asc":
        query = query.order_by(sort_column.asc())
    else:
        query = query.order_by(sort_column.desc())

    # Paginate
    query = query.offset((page - 1) * page_size).limit(page_size)

    result = await db.execute(query)
    products = list(result.scalars().all())

    return products, total_count


async def create(db: AsyncSession, **kwargs) -> Product:
    product = Product(**kwargs)
    db.add(product)
    await db.commit()
    await db.refresh(product)
    return product


async def update(db: AsyncSession, product: Product, **kwargs) -> Product:
    for key, value in kwargs.items():
        setattr(product, key, value)
    await db.commit()
    await db.refresh(product)
    return product


async def delete(db: AsyncSession, product: Product) -> None:
    await db.delete(product)
    await db.commit()
