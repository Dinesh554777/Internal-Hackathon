from pydantic import BaseModel


class ImageDescriptionResponse(BaseModel):
    description: str
    source: str
