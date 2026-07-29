from datetime import datetime
from pydantic import BaseModel


class CategoryBase(BaseModel):
    name: str
    slug: str
    description: str = ""
    image: str = ""
    display_order: int = 0


class CategoryCreate(CategoryBase):
    pass


class CategoryUpdate(BaseModel):
    name: str | None = None
    slug: str | None = None
    description: str | None = None
    image: str | None = None
    display_order: int | None = None


class CategoryResponse(CategoryBase):
    id: str
    product_count: int = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
