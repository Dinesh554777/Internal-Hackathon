from datetime import datetime
from pydantic import BaseModel, Field


class ReviewBase(BaseModel):
    rating: int = Field(ge=1, le=5)
    title: str = ""
    comment: str = ""


class ReviewCreate(ReviewBase):
    product_id: str


class ReviewUpdate(BaseModel):
    rating: int | None = Field(None, ge=1, le=5)
    title: str | None = None
    comment: str | None = None


class ReviewResponse(ReviewBase):
    id: str
    user_id: str
    product_id: str
    user_name: str = ""
    created_at: datetime

    class Config:
        from_attributes = True
