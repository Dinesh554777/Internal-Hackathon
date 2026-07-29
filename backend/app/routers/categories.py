from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.dependencies import get_db
from app.schemas.category import CategoryCreate, CategoryUpdate
from app.services.category_service import CategoryService

router = APIRouter(prefix="/categories", tags=["Categories"])


@router.get("")
def get_categories(db: Session = Depends(get_db)):
    service = CategoryService(db)
    categories = service.get_all()
    return {"data": categories}


@router.get("/{category_id}")
def get_category(category_id: str, db: Session = Depends(get_db)):
    service = CategoryService(db)
    try:
        cat = service.get_by_id(category_id)
        return {"data": cat}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("", status_code=201)
def create_category(payload: CategoryCreate, db: Session = Depends(get_db)):
    service = CategoryService(db)
    cat = service.create(payload)
    return {"data": cat, "message": "Category created"}


@router.put("/{category_id}")
def update_category(category_id: str, payload: CategoryUpdate, db: Session = Depends(get_db)):
    service = CategoryService(db)
    try:
        cat = service.update(category_id, payload)
        return {"data": cat, "message": "Category updated"}
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.delete("/{category_id}", status_code=204)
def delete_category(category_id: str, db: Session = Depends(get_db)):
    service = CategoryService(db)
    try:
        service.delete(category_id)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
