from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.dependencies import get_db
from app.schemas.product import ProductCreate, ProductResponse, ProductUpdate
from app.services.product_service import ProductService

router = APIRouter(prefix="/products", tags=["Products"])


@router.get("", response_model=dict)
def get_products(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    category: str | None = None,
    search: str | None = None,
    db: Session = Depends(get_db),
):
    service = ProductService(db)
    products, total = service.get_all(page=page, limit=limit, category=category, search=search)
    return {
        "data": products,
        "total": total,
        "page": page,
        "limit": limit,
        "total_pages": (total + limit - 1) // limit,
    }


@router.get("/{product_id}", response_model=dict)
def get_product(product_id: str, db: Session = Depends(get_db)):
    service = ProductService(db)
    try:
        product = service.get_by_id(product_id)
        return {"data": product, "message": "Product retrieved", "status": 200}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("", response_model=dict, status_code=201)
def create_product(payload: ProductCreate, db: Session = Depends(get_db)):
    service = ProductService(db)
    product = service.create(payload)
    return {"data": product, "message": "Product created", "status": 201}


@router.put("/{product_id}", response_model=dict)
def update_product(product_id: str, payload: ProductUpdate, db: Session = Depends(get_db)):
    service = ProductService(db)
    try:
        product = service.update(product_id, payload)
        return {"data": product, "message": "Product updated", "status": 200}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/{product_id}", status_code=204)
def delete_product(product_id: str, db: Session = Depends(get_db)):
    service = ProductService(db)
    try:
        service.delete(product_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
