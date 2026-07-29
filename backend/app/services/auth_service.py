from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.models.user import User, UserRole
from app.core.security import (
    hash_password,
    verify_password,
    create_access_token,
    create_refresh_token,
    generate_reset_token,
)
from app.core.config import get_settings
from app.schemas.auth import RegisterRequest
from app.schemas.user import UserResponse

settings = get_settings()


class AuthService:
    def __init__(self, db: Session):
        self.db = db

    def register(self, payload: RegisterRequest) -> UserResponse:
        existing = self.db.query(User).filter(User.email == payload.email).first()
        if existing:
            raise ValueError("Email already registered")

        user = User(
            email=payload.email,
            name=payload.name,
            hashed_password=hash_password(payload.password),
            role=payload.role,
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return UserResponse.model_validate(user)

    def login(self, email: str, password: str) -> tuple[str, str, UserResponse]:
        user = self.db.query(User).filter(User.email == email).first()
        if not user or not verify_password(password, user.hashed_password):
            raise ValueError("Invalid email or password")
        if not user.is_active:
            raise ValueError("Account is deactivated")

        access_token = create_access_token(user.id)
        refresh_token = create_refresh_token(user.id)
        return access_token, refresh_token, UserResponse.model_validate(user)

    def refresh_token(self, user_id: str) -> str:
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError("User not found")
        return create_access_token(user.id)

    def forgot_password(self, email: str) -> str:
        user = self.db.query(User).filter(User.email == email).first()
        if not user:
            raise ValueError("User not found")

        reset_token = generate_reset_token()
        user.reset_token = reset_token
        user.reset_token_expires = datetime.now(timezone.utc) + timedelta(
            minutes=settings.reset_token_expire_minutes
        )
        self.db.commit()
        return reset_token

    def reset_password(self, token: str, new_password: str) -> None:
        user = self.db.query(User).filter(User.reset_token == token).first()
        if not user:
            raise ValueError("Invalid reset token")
        if not user.reset_token_expires or user.reset_token_expires < datetime.now(timezone.utc):
            raise ValueError("Reset token has expired")

        user.hashed_password = hash_password(new_password)
        user.reset_token = None
        user.reset_token_expires = None
        self.db.commit()
