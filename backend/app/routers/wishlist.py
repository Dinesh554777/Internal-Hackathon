from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, get_current_user
from app.models.user import User
from app.schemas.wishlist import WishlistItemCreate
from app.services.wishlist_service import WishlistService
from app.services.product_service import ProductService

router = APIRouter(prefix="/wishlist", tags=["Wishlist"])


@router.get("")
def get_wishlist(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = WishlistService(db)
    items = service.get_user_wishlist(current_user.id)
    product_service = ProductService(db)
    products = []
    for item in items:
        try:
            product = product_service.get_by_id(item["product_id"])
            product["wishlist_id"] = item["id"]
            products.append(product)
        except ValueError:
            continue
    return {"data": products}


@router.get("/ids")
def get_wishlist_ids(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = WishlistService(db)
    ids = service.get_wishlist_ids(current_user.id)
    return {"data": ids}


@router.post("", status_code=201)
def add_to_wishlist(
    payload: WishlistItemCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = WishlistService(db)
    try:
        item = service.add_item(current_user.id, payload.product_id)
        return {"data": item, "message": "Added to wishlist"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/{product_id}", status_code=204)
def remove_from_wishlist(
    product_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = WishlistService(db)
    try:
        service.remove_item(current_user.id, product_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.get("/check/{product_id}")
def check_wishlist(
    product_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = WishlistService(db)
    is_in = service.is_in_wishlist(current_user.id, product_id)
    return {"data": {"in_wishlist": is_in}}
