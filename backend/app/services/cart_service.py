from sqlalchemy.orm import Session
from app.models.cart import Cart, CartItem
from app.models.product import Product
from app.schemas.cart import CartResponse, CartItemResponse


class CartService:
    def __init__(self, db: Session):
        self.db = db

    def get_or_create_cart(self, user_id: str) -> Cart:
        cart = self.db.query(Cart).filter(Cart.user_id == user_id).first()
        if not cart:
            cart = Cart(user_id=user_id)
            self.db.add(cart)
            self.db.commit()
            self.db.refresh(cart)
        return cart

    def get_cart(self, user_id: str) -> CartResponse:
        cart = self.get_or_create_cart(user_id)
        items = [
            CartItemResponse(
                id=item.id,
                product_id=item.product_id,
                product=item.product,
                quantity=item.quantity,
            )
            for item in cart.items
        ]
        total = sum(item.product.price * item.quantity for item in cart.items)
        return CartResponse(
            id=cart.id,
            user_id=cart.user_id,
            items=items,
            total=total,
        )

    def add_item(self, user_id: str, product_id: str, quantity: int) -> CartResponse:
        cart = self.get_or_create_cart(user_id)

        product = self.db.query(Product).filter(Product.id == product_id).first()
        if not product:
            raise ValueError("Product not found")

        existing = (
            self.db.query(CartItem)
            .filter(CartItem.cart_id == cart.id, CartItem.product_id == product_id)
            .first()
        )

        if existing:
            existing.quantity += quantity
        else:
            item = CartItem(cart_id=cart.id, product_id=product_id, quantity=quantity)
            self.db.add(item)

        self.db.commit()
        return self.get_cart(user_id)

    def update_item_quantity(self, user_id: str, product_id: str, quantity: int) -> CartResponse:
        cart = self.get_or_create_cart(user_id)

        item = (
            self.db.query(CartItem)
            .filter(CartItem.cart_id == cart.id, CartItem.product_id == product_id)
            .first()
        )
        if not item:
            raise ValueError("Item not found in cart")

        item.quantity = quantity
        self.db.commit()
        return self.get_cart(user_id)

    def remove_item(self, user_id: str, product_id: str) -> CartResponse:
        cart = self.get_or_create_cart(user_id)

        item = (
            self.db.query(CartItem)
            .filter(CartItem.cart_id == cart.id, CartItem.product_id == product_id)
            .first()
        )
        if item:
            self.db.delete(item)
            self.db.commit()

        return self.get_cart(user_id)

    def clear_cart(self, user_id: str) -> CartResponse:
        cart = self.get_or_create_cart(user_id)
        self.db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
        self.db.commit()
        return self.get_cart(user_id)
