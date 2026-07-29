from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, get_current_user
from app.models.user import User
from app.models.accessibility import AccessibilityProfile
from app.schemas.accessibility import AccessibilityProfileCreate, AccessibilityProfileUpdate, AccessibilityProfileResponse

router = APIRouter(prefix="/accessibility", tags=["Accessibility"])


def get_or_create_profile(db: Session, user_id: str) -> AccessibilityProfile:
    profile = db.query(AccessibilityProfile).filter(AccessibilityProfile.user_id == user_id).first()
    if not profile:
        profile = AccessibilityProfile(user_id=user_id)
        db.add(profile)
        db.commit()
        db.refresh(profile)
    return profile


@router.get("/profile", response_model=AccessibilityProfileResponse)
def get_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = get_or_create_profile(db, current_user.id)
    return profile


@router.put("/profile", response_model=AccessibilityProfileResponse)
def update_profile(
    payload: AccessibilityProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    profile = get_or_create_profile(db, current_user.id)
    update_data = payload.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(profile, key, value)
    db.commit()
    db.refresh(profile)
    return profile


@router.post("/profile", response_model=AccessibilityProfileResponse, status_code=201)
def create_profile(
    payload: AccessibilityProfileCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    existing = db.query(AccessibilityProfile).filter(AccessibilityProfile.user_id == current_user.id).first()
    if existing:
        raise HTTPException(status_code=409, detail="Profile already exists")
    profile = AccessibilityProfile(user_id=current_user.id, **payload.model_dump())
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile
