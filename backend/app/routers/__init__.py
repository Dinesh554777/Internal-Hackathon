from app.routers.auth import router as auth_router
from app.routers.products import router as products_router
from app.routers.cart import router as cart_router
from app.routers.orders import router as orders_router
from app.routers.oauth import router as oauth_router
from app.routers.magic_link import router as magic_link_router
from app.routers.accessibility import router as accessibility_router

__all__ = [
    "auth_router", "products_router", "cart_router", "orders_router",
    "oauth_router", "magic_link_router", "accessibility_router",
]
