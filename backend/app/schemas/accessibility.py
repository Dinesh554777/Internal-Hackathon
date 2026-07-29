from datetime import datetime
from pydantic import BaseModel


class AccessibilityProfileCreate(BaseModel):
    disability_category: str = "standard"
    preferred_font_size: str = "medium"
    theme: str = "system"
    voice_enabled: bool = False
    high_contrast: bool = False
    keyboard_navigation: bool = True
    reading_speed: str = "normal"
    language: str = "en"
    speech_rate: str = "normal"
    reduced_motion: bool = False
    simplified_layout: bool = False
    large_buttons: bool = False
    captions_enabled: bool = True
    preferences: dict = {}


class AccessibilityProfileUpdate(BaseModel):
    disability_category: str | None = None
    preferred_font_size: str | None = None
    theme: str | None = None
    voice_enabled: bool | None = None
    high_contrast: bool | None = None
    keyboard_navigation: bool | None = None
    reading_speed: str | None = None
    language: str | None = None
    speech_rate: str | None = None
    reduced_motion: bool | None = None
    simplified_layout: bool | None = None
    large_buttons: bool | None = None
    captions_enabled: bool | None = None
    preferences: dict | None = None


class AccessibilityProfileResponse(BaseModel):
    id: str
    user_id: str
    disability_category: str
    preferred_font_size: str
    theme: str
    voice_enabled: bool
    high_contrast: bool
    keyboard_navigation: bool
    reading_speed: str
    language: str
    speech_rate: str
    reduced_motion: bool
    simplified_layout: bool
    large_buttons: bool
    captions_enabled: bool
    preferences: dict
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
