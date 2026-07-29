from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, rate_limit
from app.core.config import get_settings
from app.schemas.auth import MagicLinkRequest, MagicLinkVerifyRequest, TokenResponse
from app.services.auth_service import AuthService
from app.services.audit_service import AuditService

router = APIRouter(prefix="/auth", tags=["Magic Link"])
settings = get_settings()


@router.post("/magic-link", status_code=status.HTTP_200_OK)
async def send_magic_link(
    body: MagicLinkRequest,
    request: Request,
    db: Session = Depends(get_db),
    _=Depends(rate_limit),
):
    auth_service = AuthService(db)
    try:
        token = auth_service.create_magic_link(body.email)
        magic_link_url = f"{settings.frontend_url}/auth/magic?token={token}"
        return {
            "message": "Magic link sent to your email",
            "dev_link": magic_link_url,
        }
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.post("/magic-link/verify", response_model=TokenResponse)
async def verify_magic_link(
    body: MagicLinkVerifyRequest,
    request: Request,
    db: Session = Depends(get_db),
    _=Depends(rate_limit),
):
    auth_service = AuthService(db)
    try:
        user = auth_service.verify_magic_link(body.token)
        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        access_token = auth_service.refresh_token(user.id)
        refresh_token = auth_service.refresh_token(user.id)

        session = auth_service.create_session(
            user_id=user.id,
            access_token=access_token,
            refresh_token=refresh_token,
            ip=request.client.host if request.client else None,
            ua=request.headers.get("user-agent"),
        )

        audit = AuditService(db)
        audit.log(
            action="magic_link_login",
            user_id=user.id,
            details="Logged in via magic link",
            ip_address=request.client.host if request.client else None,
            user_agent=request.headers.get("user-agent"),
        )

        return TokenResponse(access_token=access_token, refresh_token=refresh_token)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
