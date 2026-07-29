from sqlalchemy.orm import Session
from sqlalchemy import or_
from app.models.product import Product
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse


class ProductService:
    def __init__(self, db: Session):
        self.db = db

    def get_all(
        self,
        page: int = 1,
        limit: int = 20,
        category: str | None = None,
        search: str | None = None,
    ) -> tuple[list[ProductResponse], int]:
        query = self.db.query(Product)

        if category:
            query = query.filter(Product.category == category)

        if search:
            query = query.filter(
                or_(
                    Product.name.ilike(f"%{search}%"),
                    Product.description.ilike(f"%{search}%"),
                )
            )

        total = query.count()
        products = (
            query.order_by(Product.created_at.desc())
            .offset((page - 1) * limit)
            .limit(limit)
            .all()
        )

        return [ProductResponse.model_validate(p) for p in products], total

    def get_by_id(self, product_id: str) -> ProductResponse:
        product = self.db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise ValueError("Product not found")
        return ProductResponse.model_validate(product)

    def create(self, payload: ProductCreate) -> ProductResponse:
        product = Product(**payload.model_dump())
        self.db.add(product)
        self.db.commit()
        self.db.refresh(product)
        return ProductResponse.model_validate(product)

    def update(self, product_id: str, payload: ProductUpdate) -> ProductResponse:
        product = self.db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise ValueError("Product not found")

        update_data = payload.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(product, key, value)

        self.db.commit()
        self.db.refresh(product)
        return ProductResponse.model_validate(product)

    def delete(self, product_id: str) -> None:
        product = self.db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise ValueError("Product not found")
        self.db.delete(product)
        self.db.commit()
