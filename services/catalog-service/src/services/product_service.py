from src.repositories.product_repository import ProductRepository
from fastapi import HTTPException


class ProductService:

    def __init__(self):
        self.repo = ProductRepository()

    def get_products(self, category=None, dietType=None, page=1, pageSize=20):
     offset = (page - 1) * pageSize
     products, total = self.repo.find_all(
        category=category,
        dietType=dietType,
        limit=pageSize,
        offset=offset,
     )
     return products, total
    
    def get_product(product_id: UUID, db: Session):
     product = self.repo.get_product_by_id(db, product_id)

     if not product:
        raise HTTPException(status_code=404, detail="Product not found")

     return product