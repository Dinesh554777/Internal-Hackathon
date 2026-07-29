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


class ProductResponse(ProductBase):
    id: str
    slug: str | None = None
    rating: float
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
