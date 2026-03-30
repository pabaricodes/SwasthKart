"""Initial schema — categories and products tables.

Revision ID: 001
Revises:
Create Date: 2026-03-29
"""

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID, JSONB

revision = "001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "categories",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("slug", sa.String(100), unique=True, nullable=False),
        sa.Column("image_url", sa.String(500)),
        sa.Column("sort_order", sa.Integer, default=0),
        sa.Column("is_active", sa.Boolean, default=True),
        sa.Column("created_at", sa.DateTime, server_default=sa.text("NOW()")),
    )
    op.create_index("ix_categories_slug", "categories", ["slug"])

    op.create_table(
        "products",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "category_id",
            UUID(as_uuid=True),
            sa.ForeignKey("categories.id"),
            nullable=False,
        ),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("slug", sa.String(200), unique=True, nullable=False),
        sa.Column("description", sa.Text),
        sa.Column("brand", sa.String(100)),
        sa.Column("image_urls", JSONB, server_default="[]"),
        sa.Column("mrp_paise", sa.Integer, nullable=False),
        sa.Column("selling_price_paise", sa.Integer, nullable=False),
        sa.Column("unit", sa.String(20), nullable=False),
        sa.Column("unit_value", sa.Integer, nullable=False),
        sa.Column("nutrition_info", JSONB),
        sa.Column("allergens", sa.ARRAY(sa.Text), server_default="{}"),
        sa.Column("is_active", sa.Boolean, default=True),
        sa.Column("created_at", sa.DateTime, server_default=sa.text("NOW()")),
        sa.Column("updated_at", sa.DateTime, server_default=sa.text("NOW()")),
    )
    op.create_index("ix_products_category_id", "products", ["category_id"])
    op.create_index("ix_products_slug", "products", ["slug"])
    op.create_index("ix_products_is_active", "products", ["is_active"])


def downgrade() -> None:
    op.drop_table("products")
    op.drop_table("categories")
