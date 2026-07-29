from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import get_settings
from app.database.base import Base
from app.database.session import engine
from app.middleware.csrf import CSRFMiddleware
from app.routers import (
    auth_router,
    products_router,
    categories_router,
    cart_router,
    orders_router,
    reviews_router,
    wishlist_router,
    oauth_router,
    magic_link_router,
    accessibility_router,
)

settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(CSRFMiddleware)

app.include_router(auth_router, prefix="/api")
app.include_router(products_router, prefix="/api")
app.include_router(categories_router, prefix="/api")
app.include_router(cart_router, prefix="/api")
app.include_router(orders_router, prefix="/api")
app.include_router(reviews_router, prefix="/api")
app.include_router(wishlist_router, prefix="/api")
app.include_router(oauth_router, prefix="/api")
app.include_router(magic_link_router, prefix="/api")
app.include_router(accessibility_router, prefix="/api")


@app.get("/api/health")
def health_check():
    return {"status": "healthy", "service": settings.app_name, "version": settings.app_version}
