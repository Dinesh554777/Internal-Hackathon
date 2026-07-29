import re
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import or_, func, desc, asc
from app.models.product import Product
from app.models.review import Review
from app.models.category import Category
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse


class ProductService:
    def __init__(self, db: Session):
        self.db = db

    def get_all(
        self,
        page: int = 1,
        limit: int = 20,
        category_id: str | None = None,
        search: str | None = None,
        min_price: float | None = None,
        max_price: float | None = None,
        min_rating: float | None = None,
        sort_by: str = "newest",
    ) -> tuple[list[dict], int]:
        query = self.db.query(Product)

        if category_id:
            query = query.filter(Product.category_id == category_id)

        if search:
            term = f"%{search}%"
            query = query.filter(
                or_(
                    Product.name.ilike(term),
                    Product.description.ilike(term),
                    Product.tags.any(search),
                )
            )

        if min_price is not None:
            query = query.filter(Product.price >= min_price)
        if max_price is not None:
            query = query.filter(Product.price <= max_price)
        if min_rating is not None:
            query = query.filter(Product.rating >= min_rating)

        sort_map = {
            "newest": desc(Product.created_at),
            "oldest": asc(Product.created_at),
            "price_asc": asc(Product.price),
            "price_desc": desc(Product.price),
            "rating": desc(Product.rating),
            "name": asc(Product.name),
        }
        order = sort_map.get(sort_by, desc(Product.created_at))

        total = query.count()
        products = (
            query.options(joinedload(Product.category_rel))
            .order_by(order)
            .offset((page - 1) * limit)
            .limit(limit)
            .all()
        )

        result = []
        for p in products:
            d = self._product_to_dict(p)
            result.append(d)

        return result, total

    def get_by_id(self, product_id: str) -> dict:
        product = (
            self.db.query(Product)
            .options(joinedload(Product.category_rel))
            .filter(Product.id == product_id)
            .first()
        )
        if not product:
            raise ValueError("Product not found")
        return self._product_to_dict(product)

    def create(self, payload: ProductCreate) -> dict:
        data = payload.model_dump()
        if "slug" not in data or not data.get("slug"):
            data["slug"] = self._slugify(data["name"])
        product = Product(**data)
        self.db.add(product)
        self.db.commit()
        self.db.refresh(product)
        return self._product_to_dict(product)

    def update(self, product_id: str, payload: ProductUpdate) -> dict:
        product = self.db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise ValueError("Product not found")
        update_data = payload.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(product, key, value)
        self.db.commit()
        self.db.refresh(product)
        return self._product_to_dict(product)

    def delete(self, product_id: str) -> None:
        product = self.db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise ValueError("Product not found")
        self.db.delete(product)
        self.db.commit()

    def search_suggestions(self, query: str, limit: int = 5) -> list[str]:
        if not query or len(query) < 2:
            return []
        term = f"%{query}%"
        results = (
            self.db.query(Product.name)
            .filter(Product.name.ilike(term))
            .distinct()
            .limit(limit)
            .all()
        )
        return [r[0] for r in results]

    def _product_to_dict(self, product: Product) -> dict:
        avg_rating = (
            self.db.query(func.avg(Review.rating))
            .filter(Review.product_id == product.id)
            .scalar()
        )
        rating = round(float(avg_rating), 1) if avg_rating else 0.0
        review_count = (
            self.db.query(func.count(Review.id))
            .filter(Review.product_id == product.id)
            .scalar()
        )

        category_name = None
        category_slug = None
        if product.category_rel:
            category_name = product.category_rel.name
            category_slug = product.category_rel.slug

        return {
            "id": product.id,
            "name": product.name,
            "slug": product.slug,
            "description": product.description,
            "price": product.price,
            "currency": product.currency,
            "images": product.images or [],
            "category_id": product.category_id,
            "category_name": category_name,
            "category_slug": category_slug,
            "tags": product.tags or [],
            "stock": product.stock,
            "rating": rating,
            "review_count": review_count,
            "created_at": product.created_at.isoformat() if product.created_at else None,
            "updated_at": product.updated_at.isoformat() if product.updated_at else None,
        }

    def _slugify(self, name: str) -> str:
        s = name.lower().strip()
        s = re.sub(r"[^\w\s-]", "", s)
        s = re.sub(r"[\s_]+", "-", s)
        s = re.sub(r"-+", "-", s)
        return s
