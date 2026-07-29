from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.category import Category
from app.models.product import Product
from app.schemas.category import CategoryCreate, CategoryUpdate


class CategoryService:
    def __init__(self, db: Session):
        self.db = db

    def get_all(self) -> list[dict]:
        categories = (
            self.db.query(
                Category,
                func.count(Product.id).label("product_count"),
            )
            .outerjoin(Product, Product.category_id == Category.id)
            .group_by(Category.id)
            .order_by(Category.display_order, Category.name)
            .all()
        )
        return [self._to_dict(c, count) for c, count in categories]

    def get_by_id(self, category_id: str) -> dict:
        result = (
            self.db.query(
                Category,
                func.count(Product.id).label("product_count"),
            )
            .outerjoin(Product, Product.category_id == Category.id)
            .filter(Category.id == category_id)
            .group_by(Category.id)
            .first()
        )
        if not result:
            raise ValueError("Category not found")
        return self._to_dict(*result)

    def get_by_slug(self, slug: str) -> dict:
        result = (
            self.db.query(
                Category,
                func.count(Product.id).label("product_count"),
            )
            .outerjoin(Product, Product.category_id == Category.id)
            .filter(Category.slug == slug)
            .group_by(Category.id)
            .first()
        )
        if not result:
            raise ValueError("Category not found")
        return self._to_dict(*result)

    def create(self, payload: CategoryCreate) -> dict:
        cat = Category(**payload.model_dump())
        self.db.add(cat)
        self.db.commit()
        self.db.refresh(cat)
        return self._to_dict(cat, 0)

    def update(self, category_id: str, payload: CategoryUpdate) -> dict:
        cat = self.db.query(Category).filter(Category.id == category_id).first()
        if not cat:
            raise ValueError("Category not found")
        update_data = payload.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(cat, key, value)
        self.db.commit()
        self.db.refresh(cat)
        return self.get_by_id(category_id)

    def delete(self, category_id: str) -> None:
        cat = self.db.query(Category).filter(Category.id == category_id).first()
        if not cat:
            raise ValueError("Category not found")
        self.db.delete(cat)
        self.db.commit()

    def _to_dict(self, cat: Category, product_count: int) -> dict:
        return {
            "id": cat.id,
            "name": cat.name,
            "slug": cat.slug,
            "description": cat.description,
            "image": cat.image,
            "display_order": cat.display_order,
            "product_count": product_count,
            "created_at": cat.created_at.isoformat() if cat.created_at else None,
            "updated_at": cat.updated_at.isoformat() if cat.updated_at else None,
        }
