from sqlalchemy.orm import Session
from app.models.user import User, UserRole
from app.core.security import hash_password, verify_password, create_access_token, create_refresh_token
from app.schemas.auth import RegisterRequest
from app.schemas.user import UserResponse


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
            role=UserRole.CUSTOMER,
        )
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return UserResponse.model_validate(user)

    def login(self, email: str, password: str) -> tuple[str, str]:
        user = self.db.query(User).filter(User.email == email).first()
        if not user or not verify_password(password, user.hashed_password):
            raise ValueError("Invalid email or password")

        access_token = create_access_token(user.id)
        refresh_token = create_refresh_token(user.id)
        return access_token, refresh_token

    def refresh_token(self, user_id: str) -> str:
        user = self.db.query(User).filter(User.id == user_id).first()
        if not user:
            raise ValueError("User not found")
        return create_access_token(user.id)
