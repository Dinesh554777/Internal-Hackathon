import uuid
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.dependencies import get_db
from app.schemas.voice import VoiceProcessRequest, VoiceProcessResponse
from app.services.voice_assistant_service import VoiceAssistantService
from app.core.config import get_settings

router = APIRouter(prefix="/voice", tags=["Voice Assistant"])
settings = get_settings()

conversations: dict[str, VoiceAssistantService] = {}


@router.post("/process", response_model=VoiceProcessResponse)
def process_voice(payload: VoiceProcessRequest, db: Session = Depends(get_db)):
    conv_id = payload.conversation_id or str(uuid.uuid4())

    if conv_id not in conversations:
        conversations[conv_id] = VoiceAssistantService(db)

    assistant = conversations[conv_id]
    intent = assistant.process(payload.text)
    result = assistant.execute_intent(intent)

    return VoiceProcessResponse(
        intent=result["intent"],
        confidence=intent.get("confidence", 0.5),
        response=result["response"],
        action=result.get("action"),
        data=result.get("data"),
    )


@router.post("/clear")
def clear_conversation(conversation_id: str):
    if conversation_id in conversations:
        conversations[conversation_id].clear_history()
        del conversations[conversation_id]
    return {"status": "cleared"}
