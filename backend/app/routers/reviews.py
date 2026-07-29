from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, get_current_user
from app.models.user import User
from app.schemas.review import ReviewCreate, ReviewUpdate
from app.services.review_service import ReviewService

router = APIRouter(prefix="/reviews", tags=["Reviews"])


@router.get("/product/{product_id}")
def get_product_reviews(
    product_id: str,
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
):
    service = ReviewService(db)
    reviews, total = service.get_by_product(product_id, page=page, limit=limit)
    return {
        "data": reviews,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": (total + limit - 1) // limit,
    }


@router.post("", status_code=201)
def create_review(
    payload: ReviewCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ReviewService(db)
    try:
        review = service.create(current_user.id, payload)
        return {"data": review, "message": "Review created"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.put("/{review_id}")
def update_review(
    review_id: str,
    payload: ReviewUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ReviewService(db)
    try:
        review = service.update(review_id, current_user.id, payload)
        return {"data": review, "message": "Review updated"}
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{review_id}", status_code=204)
def delete_review(
    review_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = ReviewService(db)
    try:
        service.delete(review_id, current_user.id)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
