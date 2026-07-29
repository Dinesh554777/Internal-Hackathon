from fastapi import Request, HTTPException, status
from starlette.middleware.base import BaseHTTPMiddleware
from app.core.config import get_settings

settings = get_settings()

SAFE_METHODS = {"GET", "HEAD", "OPTIONS"}


class CSRFMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.method in SAFE_METHODS:
            return await call_next(request)

        if request.url.path.startswith("/api/auth/google"):
            return await call_next(request)

        if request.url.path.startswith("/api/auth/magic-link"):
            return await call_next(request)

        origin = request.headers.get("origin", "")
        referer = request.headers.get("referer", "")

        allowed_origins = settings.cors_origins

        if origin and origin not in allowed_origins:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="CSRF check failed: invalid origin",
            )

        if referer:
            is_valid = any(ref in referer for ref in allowed_origins)
            if not is_valid:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="CSRF check failed: invalid referer",
                )

        return await call_next(request)
