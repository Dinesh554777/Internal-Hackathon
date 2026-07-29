from datetime import datetime
from pydantic import BaseModel


class ProductBase(BaseModel):
    name: str
    description: str
    price: float
    currency: str = "USD"
    images: list[str] = []
    category_id: str | None = None
    tags: list[str] = []
    stock: int = 0
    brand: str = ""
    original_price: float | None = None
    is_new: bool = False
    discount: float = 0.0
    delivery: str = "Free Delivery"
    specifications: dict[str, str] = {}
    features: list[str] = []


class ProductCreate(ProductBase):
    pass


class ProductUpdate(BaseModel):
    name: str | None = None
    description: str | None = None
    price: float | None = None
    currency: str | None = None
    images: list[str] | None = None
    category_id: str | None = None
    tags: list[str] | None = None
    stock: int | None = None
    brand: str | None = None
    original_price: float | None = None
    is_new: bool | None = None
    discount: float | None = None
    delivery: str | None = None
    specifications: dict[str, str] | None = None
    features: list[str] | None = None


class ProductResponse(ProductBase):
    id: str
    slug: str | None = None
    rating: float
    created_at: datetime
    updated_at: datetime
    review_count: int = 0
    category_name: str | None = None
    category_slug: str | None = None

    class Config:
        from_attributes = True
