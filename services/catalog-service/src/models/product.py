import uuid
from datetime import datetime

from sqlalchemy import (
    ARRAY,
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text,
)
from sqlalchemy.dialects.postgresql import JSONB, UUID
from sqlalchemy.orm import relationship

from src.config.database import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    category_id = Column(
        UUID(as_uuid=True), ForeignKey("categories.id"), nullable=False, index=True
    )
    name = Column(String(200), nullable=False)
    slug = Column(String(200), unique=True, nullable=False, index=True)
    description = Column(Text)
    brand = Column(String(100))
    image_urls = Column(JSONB, default=[])
    mrp_paise = Column(Integer, nullable=False)
    selling_price_paise = Column(Integer, nullable=False)
    unit = Column(String(20), nullable=False)  # g, kg, ml, l, pieces
    unit_value = Column(Integer, nullable=False)
    nutrition_info = Column(JSONB)
    allergens = Column(ARRAY(Text), default=[])
    is_active = Column(Boolean, default=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    category = relationship("Category", back_populates="products")
