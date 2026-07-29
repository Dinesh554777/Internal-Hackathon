from pydantic import BaseModel


class VoiceProcessRequest(BaseModel):
    text: str
    conversation_id: str | None = None


class VoiceProcessResponse(BaseModel):
    intent: str
    confidence: float
    response: str
    action: str | None = None
    data: dict | list | None = None
