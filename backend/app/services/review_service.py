from sqlalchemy.orm import Session
from sqlalchemy import func
from app.models.review import Review
from app.models.user import User
from app.schemas.review import ReviewCreate, ReviewUpdate


class ReviewService:
    def __init__(self, db: Session):
        self.db = db

    def get_by_product(self, product_id: str, page: int = 1, limit: int = 20) -> tuple[list[dict], int]:
        query = (
            self.db.query(Review)
            .filter(Review.product_id == product_id)
            .order_by(Review.created_at.desc())
        )
        total = query.count()
        reviews = query.offset((page - 1) * limit).limit(limit).all()
        return [self._to_dict(r) for r in reviews], total

    def create(self, user_id: str, payload: ReviewCreate) -> dict:
        existing = (
            self.db.query(Review)
            .filter(Review.user_id == user_id, Review.product_id == payload.product_id)
            .first()
        )
        if existing:
            raise ValueError("You have already reviewed this product")
        review = Review(user_id=user_id, **payload.model_dump())
        self.db.add(review)
        self.db.commit()
        self.db.refresh(review)
        self._update_product_rating(payload.product_id)
        return self._to_dict(review)

    def update(self, review_id: str, user_id: str, payload: ReviewUpdate) -> dict:
        review = self.db.query(Review).filter(Review.id == review_id).first()
        if not review:
            raise ValueError("Review not found")
        if review.user_id != user_id:
            raise ValueError("You can only edit your own reviews")
        update_data = payload.model_dump(exclude_unset=True)
        for key, value in update_data.items():
            setattr(review, key, value)
        self.db.commit()
        self.db.refresh(review)
        self._update_product_rating(review.product_id)
        return self._to_dict(review)

    def delete(self, review_id: str, user_id: str) -> None:
        review = self.db.query(Review).filter(Review.id == review_id).first()
        if not review:
            raise ValueError("Review not found")
        if review.user_id != user_id:
            raise ValueError("You can only delete your own reviews")
        product_id = review.product_id
        self.db.delete(review)
        self.db.commit()
        self._update_product_rating(product_id)

    def _update_product_rating(self, product_id: str) -> None:
        from app.models.product import Product
        avg = (
            self.db.query(func.avg(Review.rating))
            .filter(Review.product_id == product_id)
            .scalar()
        )
        rating = round(float(avg), 1) if avg else 0.0
        self.db.query(Product).filter(Product.id == product_id).update({"rating": rating})
        self.db.commit()

    def _to_dict(self, review: Review) -> dict:
        user = self.db.query(User).filter(User.id == review.user_id).first()
        return {
            "id": review.id,
            "user_id": review.user_id,
            "user_name": user.name if user else "Unknown",
            "product_id": review.product_id,
            "rating": review.rating,
            "title": review.title,
            "comment": review.comment,
            "created_at": review.created_at.isoformat() if review.created_at else None,
        }
