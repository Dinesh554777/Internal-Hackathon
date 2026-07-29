import secrets
from datetime import datetime, timedelta, timezone
from sqlalchemy.orm import Session
from app.models.user import User, UserRole
from app.models.magic_link import MagicLink
from app.models.accessibility import AccessibilityProfile
from app.models.oauth import OAuthAccount
from app.models.session import LoginSession
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
        self.db.flush()

        profile = AccessibilityProfile(user_id=user.id)
        self.db.add(profile)
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

    def create_session(self, user_id: str, access_token: str, refresh_token: str, ip: str | None = None, ua: str | None = None) -> LoginSession:
        session = LoginSession(
            user_id=user_id,
            token=access_token,
            refresh_token=refresh_token,
            ip_address=ip,
            user_agent=ua,
            expires_at=datetime.now(timezone.utc) + timedelta(days=settings.jwt_refresh_token_expire_days),
        )
        self.db.add(session)
        self.db.commit()
        return session

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

    def create_magic_link(self, email: str) -> str:
        token = secrets.token_urlsafe(48)
        link = MagicLink(
            email=email,
            token=token,
            expires_at=datetime.now(timezone.utc) + timedelta(minutes=settings.magic_link_expire_minutes),
        )
        self.db.add(link)
        self.db.commit()
        return token

    def verify_magic_link(self, token: str) -> User:
        link = self.db.query(MagicLink).filter(MagicLink.token == token, MagicLink.used == False).first()
        if not link:
            raise ValueError("Invalid or used magic link")
        if link.expires_at < datetime.now(timezone.utc):
            raise ValueError("Magic link has expired")
        link.used = True
        user = self.db.query(User).filter(User.email == link.email).first()
        if not user:
            raise ValueError("User not found")
        self.db.commit()
        return user

    def find_or_create_oauth_user(self, provider: str, provider_user_id: str, email: str, name: str) -> User:
        account = self.db.query(OAuthAccount).filter(
            OAuthAccount.provider == provider,
            OAuthAccount.provider_user_id == provider_user_id,
        ).first()
        if account:
            return account.user
        user = self.db.query(User).filter(User.email == email).first()
        if not user:
            user = User(
                email=email,
                name=name,
                hashed_password=hash_password(secrets.token_urlsafe(32)),
            )
            self.db.add(user)
            self.db.flush()
            profile = AccessibilityProfile(user_id=user.id)
            self.db.add(profile)
        account = OAuthAccount(
            user_id=user.id,
            provider=provider,
            provider_user_id=provider_user_id,
        )
        self.db.add(account)
        self.db.commit()
        return user
