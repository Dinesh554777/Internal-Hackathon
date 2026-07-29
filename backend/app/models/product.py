import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Float, Integer, DateTime, Text, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship
from app.database.base import Base


class Product(Base):
    __tablename__ = "products"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name = Column(String, nullable=False)
    slug = Column(String, unique=True, index=True)
    description = Column(Text, nullable=False)
    price = Column(Float, nullable=False)
    currency = Column(String, default="USD", nullable=False)
    images = Column(JSON, default=list)
    category_id = Column(String, ForeignKey("categories.id"), nullable=True, index=True)
    tags = Column(JSON, default=list)
    stock = Column(Integer, default=0, nullable=False)
    rating = Column(Float, default=0.0)

    brand = Column(String, default="")
    original_price = Column(Float, nullable=True)
    is_new = Column(Boolean, default=False)
    discount = Column(Float, default=0.0)
    delivery = Column(String, default="Free Delivery")
    specifications = Column(JSON, default=dict)
    features = Column(JSON, default=list)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    category_rel = relationship("Category", back_populates="products")
    reviews = relationship("Review", back_populates="product", cascade="all, delete-orphan")
    wishlist_items = relationship("WishlistItem", back_populates="product", cascade="all, delete-orphan")
