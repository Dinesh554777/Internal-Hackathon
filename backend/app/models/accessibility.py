import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, Integer, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database.base import Base


class AccessibilityProfile(Base):
    __tablename__ = "accessibility_profiles"

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey("users.id"), unique=True, nullable=False)

    disability_category = Column(String, default="standard")
    preferred_font_size = Column(String, default="medium")
    theme = Column(String, default="system")
    voice_enabled = Column(Boolean, default=False)
    high_contrast = Column(Boolean, default=False)
    keyboard_navigation = Column(Boolean, default=True)
    reading_speed = Column(String, default="normal")
    language = Column(String, default="en")
    speech_rate = Column(String, default="normal")
    reduced_motion = Column(Boolean, default=False)
    simplified_layout = Column(Boolean, default=False)
    large_buttons = Column(Boolean, default=False)
    captions_enabled = Column(Boolean, default=True)

    preferences = Column(JSON, default=dict)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    user = relationship("User", back_populates="accessibility_profile")
