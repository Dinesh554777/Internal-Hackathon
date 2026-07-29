from sqlalchemy.orm import Session, joinedload
from app.models.wishlist import WishlistItem
from app.models.product import Product


class WishlistService:
    def __init__(self, db: Session):
        self.db = db

    def get_user_wishlist(self, user_id: str) -> list[dict]:
        items = (
            self.db.query(WishlistItem)
            .options(joinedload(WishlistItem.product))
            .filter(WishlistItem.user_id == user_id)
            .order_by(WishlistItem.created_at.desc())
            .all()
        )
        return [self._to_dict(item) for item in items]

    def add_item(self, user_id: str, product_id: str) -> dict:
        existing = (
            self.db.query(WishlistItem)
            .filter(WishlistItem.user_id == user_id, WishlistItem.product_id == product_id)
            .first()
        )
        if existing:
            return self._to_dict(existing)
        product = self.db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise ValueError("Product not found")
        item = WishlistItem(user_id=user_id, product_id=product_id)
        self.db.add(item)
        self.db.commit()
        self.db.refresh(item)
        return self._to_dict(item)

    def remove_item(self, user_id: str, product_id: str) -> None:
        item = (
            self.db.query(WishlistItem)
            .filter(WishlistItem.user_id == user_id, WishlistItem.product_id == product_id)
            .first()
        )
        if not item:
            raise ValueError("Item not found in wishlist")
        self.db.delete(item)
        self.db.commit()

    def is_in_wishlist(self, user_id: str, product_id: str) -> bool:
        return (
            self.db.query(WishlistItem)
            .filter(WishlistItem.user_id == user_id, WishlistItem.product_id == product_id)
            .first()
            is not None
        )

    def get_wishlist_ids(self, user_id: str) -> list[str]:
        items = (
            self.db.query(WishlistItem.product_id)
            .filter(WishlistItem.user_id == user_id)
            .all()
        )
        return [i[0] for i in items]

    def _to_dict(self, item: WishlistItem) -> dict:
        return {
            "id": item.id,
            "user_id": item.user_id,
            "product_id": item.product_id,
            "created_at": item.created_at.isoformat() if item.created_at else None,
        }
