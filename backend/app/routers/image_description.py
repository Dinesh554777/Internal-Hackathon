from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.dependencies import get_db
from app.schemas.image_description import ImageDescriptionResponse
from app.services.image_description_service import ImageDescriptionService

router = APIRouter(prefix="/products", tags=["Image Description"])


@router.get("/{product_id}/description", response_model=ImageDescriptionResponse)
def get_product_image_description(product_id: str, db: Session = Depends(get_db)):
    service = ImageDescriptionService(db)
    try:
        result = service.describe(product_id)
        return ImageDescriptionResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
