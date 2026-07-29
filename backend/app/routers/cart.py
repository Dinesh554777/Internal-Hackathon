from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, get_current_user
from app.models.user import User
from app.schemas.cart import CartItemAdd, CartItemUpdate
from app.services.cart_service import CartService

router = APIRouter(prefix="/cart", tags=["Cart"])


@router.get("")
def get_cart(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = CartService(db)
    return service.get_cart(current_user.id)


@router.post("/items")
def add_to_cart(
    payload: CartItemAdd,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = CartService(db)
    try:
        return service.add_item(current_user.id, payload.product_id, payload.quantity)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.put("/items/{product_id}")
def update_cart_item(
    product_id: str,
    payload: CartItemUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = CartService(db)
    try:
        return service.update_item_quantity(current_user.id, product_id, payload.quantity)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/items/{product_id}")
def remove_from_cart(
    product_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = CartService(db)
    return service.remove_item(current_user.id, product_id)


@router.delete("")
def clear_cart(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    service = CartService(db)
    return service.clear_cart(current_user.id)
