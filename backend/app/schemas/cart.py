from pydantic import BaseModel
from app.schemas.product import ProductResponse


class CartItemAdd(BaseModel):
    product_id: str
    quantity: int = 1


class CartItemUpdate(BaseModel):
    quantity: int


class CartItemResponse(BaseModel):
    id: str
    product_id: str
    product: ProductResponse
    quantity: int

    class Config:
        from_attributes = True


class CartResponse(BaseModel):
    id: str
    user_id: str
    items: list[CartItemResponse]
    total: float

    class Config:
        from_attributes = True
