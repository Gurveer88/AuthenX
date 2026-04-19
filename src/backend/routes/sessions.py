from fastapi import APIRouter, HTTPException
from models import ChatSession, ChatMessage
from store import save_session, get_session, list_sessions, delete_session
import uuid



router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.post("")
def create_session() -> dict:
    session_id = str(uuid.uuid4())
    title = "New Chat"
    
    session = ChatSession(
        session_id=session_id,
        title=title,
        tool="docs",
    )
    save_session(session)
    return {"session_id": session_id, "title": title}


@router.get("")
def get_all_sessions() -> list[ChatSession]:
    return list_sessions()


@router.get("/{session_id}")
def get_session_by_id(session_id: str) -> ChatSession:
    session = get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    return session


@router.delete("/{session_id}")
def remove_session(session_id: str) -> dict:
    if delete_session(session_id):
        return {"status": "deleted"}
    raise HTTPException(status_code=404, detail="Session not found")