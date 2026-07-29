import uuid
from datetime import datetime, timezone
from sqlalchemy import Column, String, Boolean, Integer, DateTime, ForeignKey, JSON
from sqlalchemy.orm import relationship
from app.database.base import Base

DISABILITY_DEFAULTS: dict[str, dict[str, bool | str]] = {
    "blind": {
        "preferred_font_size": "xlarge",
        "high_contrast": True,
        "keyboard_navigation": True,
        "voice_enabled": True,
        "screen_reader_support": True,
        "simplified_layout": True,
        "reduced_motion": True,
        "animations_off": True,
    },
    "low_vision": {
        "preferred_font_size": "xlarge",
        "high_contrast": True,
        "keyboard_navigation": True,
        "screen_reader_support": True,
        "large_buttons": True,
    },
    "color_blind": {
        "high_contrast": True,
        "keyboard_navigation": True,
    },
    "motor_disability": {
        "preferred_font_size": "large",
        "keyboard_navigation": True,
        "voice_enabled": True,
        "large_buttons": True,
    },
    "hearing_impairment": {
        "voice_enabled": True,
        "captions_enabled": True,
        "keyboard_navigation": True,
    },
    "speech_disability": {
        "keyboard_navigation": True,
        "screen_reader_support": True,
    },
    "cognitive_disability": {
        "preferred_font_size": "large",
        "simplified_layout": True,
        "reduced_motion": True,
        "animations_off": True,
        "keyboard_navigation": True,
    },
    "senior_citizen": {
        "preferred_font_size": "xlarge",
        "high_contrast": True,
        "simplified_layout": True,
        "reduced_motion": True,
        "animations_off": True,
        "large_buttons": True,
        "keyboard_navigation": True,
    },
    "standard": {},
}

def get_defaults_for_category(category: str) -> dict[str, bool | str]:
    return DISABILITY_DEFAULTS.get(category, {}).copy()


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
    screen_reader_support = Column(Boolean, default=False)
    reading_speed = Column(String, default="normal")
    language = Column(String, default="en")
    speech_rate = Column(String, default="normal")
    reduced_motion = Column(Boolean, default=False)
    simplified_layout = Column(Boolean, default=False)
    large_buttons = Column(Boolean, default=False)
    captions_enabled = Column(Boolean, default=True)
    animations_off = Column(Boolean, default=False)

    preferences = Column(JSON, default=dict)

    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(
        DateTime(timezone=True),
        default=lambda: datetime.now(timezone.utc),
        onupdate=lambda: datetime.now(timezone.utc),
    )

    user = relationship("User", back_populates="accessibility_profile")
