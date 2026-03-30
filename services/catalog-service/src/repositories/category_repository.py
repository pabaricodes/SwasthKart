from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.category import Category


async def get_all_active(db: AsyncSession) -> list[Category]:
    result = await db.execute(
        select(Category).where(Category.is_active == True).order_by(Category.sort_order)
    )
    return list(result.scalars().all())


async def get_by_slug(db: AsyncSession, slug: str) -> Category | None:
    result = await db.execute(select(Category).where(Category.slug == slug))
    return result.scalar_one_or_none()


async def get_by_id(db: AsyncSession, category_id: UUID) -> Category | None:
    result = await db.execute(select(Category).where(Category.id == category_id))
    return result.scalar_one_or_none()


async def create(db: AsyncSession, **kwargs) -> Category:
    category = Category(**kwargs)
    db.add(category)
    await db.commit()
    await db.refresh(category)
    return category


async def update(db: AsyncSession, category: Category, **kwargs) -> Category:
    for key, value in kwargs.items():
        setattr(category, key, value)
    await db.commit()
    await db.refresh(category)
    return category


async def delete(db: AsyncSession, category: Category) -> None:
    await db.delete(category)
    await db.commit()
