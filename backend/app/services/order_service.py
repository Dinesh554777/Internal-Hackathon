from sqlalchemy.orm import Session
from app.models.order import Order, OrderItem, OrderStatus
from app.models.cart import Cart, CartItem
from app.schemas.order import OrderResponse, OrderItemResponse


class OrderService:
    def __init__(self, db: Session):
        self.db = db

    def create_order(self, user_id: str, shipping_address: dict) -> OrderResponse:
        cart = self.db.query(Cart).filter(Cart.user_id == user_id).first()
        if not cart or not cart.items:
            raise ValueError("Cart is empty")

        total = sum(item.product.price * item.quantity for item in cart.items)

        order = Order(
            user_id=user_id,
            total=total,
            status=OrderStatus.PENDING,
            shipping_address=shipping_address,
        )
        self.db.add(order)
        self.db.flush()

        for cart_item in cart.items:
            order_item = OrderItem(
                order_id=order.id,
                product_id=cart_item.product_id,
                quantity=cart_item.quantity,
                price=cart_item.product.price,
            )
            self.db.add(order_item)

        self.db.query(CartItem).filter(CartItem.cart_id == cart.id).delete()
        self.db.commit()
        self.db.refresh(order)

        return self._to_response(order)

    def get_user_orders(self, user_id: str) -> list[OrderResponse]:
        orders = (
            self.db.query(Order)
            .filter(Order.user_id == user_id)
            .order_by(Order.created_at.desc())
            .all()
        )
        return [self._to_response(order) for order in orders]

    def get_order_by_id(self, order_id: str) -> OrderResponse:
        order = self.db.query(Order).filter(Order.id == order_id).first()
        if not order:
            raise ValueError("Order not found")
        return self._to_response(order)

    def _to_response(self, order: Order) -> OrderResponse:
        items = [
            OrderItemResponse(
                id=item.id,
                product_id=item.product_id,
                product=item.product,
                quantity=item.quantity,
                price=item.price,
            )
            for item in order.items
        ]
        return OrderResponse(
            id=order.id,
            user=order.user,
            items=items,
            total=order.total,
            status=order.status.value,
            shipping_address=order.shipping_address,
            created_at=order.created_at,
            updated_at=order.updated_at,
        )
