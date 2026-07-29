import httpx
from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from app.core.dependencies import get_db, rate_limit
from app.core.config import get_settings
from app.schemas.auth import TokenResponse
from app.services.auth_service import AuthService
from app.services.audit_service import AuditService

router = APIRouter(prefix="/auth", tags=["OAuth"])
settings = get_settings()


@router.post("/google", response_model=TokenResponse)
async def google_auth(
    request: Request,
    body: dict,
    db: Session = Depends(get_db),
    _=Depends(rate_limit),
):
    code = body.get("code")
    redirect_uri = body.get("redirect_uri", settings.google_redirect_uri)

    if not code:
        raise HTTPException(status_code=400, detail="Missing authorization code")

    token_url = "https://oauth2.googleapis.com/token"
    data = {
        "code": code,
        "client_id": settings.google_client_id,
        "client_secret": settings.google_client_secret,
        "redirect_uri": redirect_uri,
        "grant_type": "authorization_code",
    }

    async with httpx.AsyncClient() as client:
        token_resp = await client.post(token_url, data=data)
        if token_resp.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to exchange code for token")

        token_data = token_resp.json()
        user_info_resp = await client.get(
            "https://www.googleapis.com/oauth2/v2/userinfo",
            headers={"Authorization": f"Bearer {token_data['access_token']}"},
        )
        if user_info_resp.status_code != 200:
            raise HTTPException(status_code=400, detail="Failed to fetch user info")

        user_info = user_info_resp.json()

    auth_service = AuthService(db)
    user = auth_service.find_or_create_oauth_user(
        provider="google",
        provider_user_id=user_info["id"],
        email=user_info["email"],
        name=user_info.get("name", user_info["email"]),
    )

    access_token = auth_service.refresh_token(user.id)
    refresh_token = auth_service.refresh_token(user.id)

    audit = AuditService(db)
    audit.log(
        action="oauth_login",
        user_id=user.id,
        details="Google OAuth login",
        ip_address=request.client.host if request.client else None,
        user_agent=request.headers.get("user-agent"),
    )

    return TokenResponse(access_token=access_token, refresh_token=refresh_token)
