from datetime import datetime
from pydantic import BaseModel


class WishlistItemCreate(BaseModel):
    product_id: str


class WishlistItemResponse(BaseModel):
    id: str
    user_id: str
    product_id: str
    created_at: datetime

    class Config:
        from_attributes = True
