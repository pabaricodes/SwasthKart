from src.repositories.product_repository import ProductRepository


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