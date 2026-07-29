from datetime import datetime
from pydantic import BaseModel
from app.schemas.product import ProductResponse
from app.schemas.user import UserResponse


class OrderItemBase(BaseModel):
    product_id: str
    quantity: int


class OrderCreate(BaseModel):
    shipping_address: dict


class OrderItemResponse(BaseModel):
    id: str
    product_id: str
    product: ProductResponse
    quantity: int
    price: float

    class Config:
        from_attributes = True


class OrderResponse(BaseModel):
    id: str
    user: UserResponse
    items: list[OrderItemResponse]
    total: float
    status: str
    shipping_address: dict
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
