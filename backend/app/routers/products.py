from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.dependencies import get_db
from app.schemas.product import ProductCreate, ProductUpdate
from app.services.product_service import ProductService
from app.services.wishlist_service import WishlistService
from app.core.dependencies import get_current_user_optional

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("")
def get_products(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    category_id: str | None = None,
    search: str | None = None,
    min_price: float | None = None,
    max_price: float | None = None,
    min_rating: float | None = None,
    sort_by: str = "newest",
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user_optional),
):
    service = ProductService(db)
    products, total = service.get_all(
        page=page,
        limit=limit,
        category_id=category_id,
        search=search,
        min_price=min_price,
        max_price=max_price,
        min_rating=min_rating,
        sort_by=sort_by,
    )

    if current_user:
        wishlist_service = WishlistService(db)
        wishlist_ids = wishlist_service.get_wishlist_ids(current_user.id)
        for p in products:
            p["in_wishlist"] = p["id"] in wishlist_ids

    return {
        "data": products,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": (total + limit - 1) // limit,
    }


@router.get("/suggestions")
def get_search_suggestions(
    q: str = Query("", min_length=2),
    db: Session = Depends(get_db),
):
    service = ProductService(db)
    suggestions = service.search_suggestions(q)
    return {"data": suggestions}


@router.get("/{product_id}")
def get_product(
    product_id: str,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user_optional),
):
    service = ProductService(db)
    try:
        product = service.get_by_id(product_id)
        if current_user:
            wishlist_service = WishlistService(db)
            product["in_wishlist"] = wishlist_service.is_in_wishlist(current_user.id, product_id)
        return {"data": product}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("", status_code=201)
def create_product(payload: ProductCreate, db: Session = Depends(get_db)):
    service = ProductService(db)
    product = service.create(payload)
    return {"data": product, "message": "Product created"}


@router.put("/{product_id}")
def update_product(product_id: str, payload: ProductUpdate, db: Session = Depends(get_db)):
    service = ProductService(db)
    try:
        product = service.update(product_id, payload)
        return {"data": product, "message": "Product updated"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/{product_id}", status_code=204)
def delete_product(product_id: str, db: Session = Depends(get_db)):
    service = ProductService(db)
    try:
        service.delete(product_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
