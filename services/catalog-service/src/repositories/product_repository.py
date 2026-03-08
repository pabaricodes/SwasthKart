from sqlalchemy import text
from src.config.database import engine

class ProductRepository:

 def find_all(self, category=None, dietType=None, limit=20, offset=0):
    base_query = "FROM products WHERE 1=1"
    params = {}

    if category:
        base_query += " AND category = :category"
        params["category"] = category

    if dietType:
        base_query += " AND diet_type = :dietType"
        params["dietType"] = dietType

    count_query = "SELECT COUNT(*) " + base_query
    data_query = "SELECT * " + base_query + " LIMIT :limit OFFSET :offset"

    params["limit"] = limit
    params["offset"] = offset

    with engine.connect() as conn:
        total = conn.execute(text(count_query), params).scalar()
        result = conn.execute(text(data_query), params)
        rows = result.fetchall()

        products = []
        for row in rows:
            products.append({
                "productId": row.product_id,
                "name": row.name,
                "category": row.category,
                "productType": row.product_type,
                "dietType": row.diet_type,
                "price": row.price,
                "calories": row.calories,
                "proteinG": row.protein_g,
                "carbsG": row.carbs_g,
                "fatG": row.fat_g,
                "popularity7dCount": row.popularity_7d_count,
                "isActive": row.is_active,
                "createdAt": str(row.created_at),
            })

    return products, total
    