from __future__ import annotations
import json
import logging
import traceback
import asyncio
from fastapi import APIRouter, BackgroundTasks, Request
from fastapi.responses import StreamingResponse
from models import ReceiveRequest, TaskResponse, ChatMessage, Citation
from modules.orchestrator import run_generation_loop
from routes.util import load_skills, new_task_id
from store import save_task, publish_event, subscribe, unsubscribe, add_message_to_session, get_session, save_session



logger = logging.getLogger(__name__)
router = APIRouter()


def process_task(task_id: str, request: ReceiveRequest):
    try:
        skills_context = load_skills(request.tool)
        logger.info("Loaded skills for tool '%s' (%d chars)", request.tool, len(skills_context))
        chat_history = []
        if request.session_id:
            session = get_session(request.session_id)
            if session: 
                chat_history = session.messages
        def status_callback(msg: str):
            publish_event(task_id, msg)
        result = run_generation_loop(
            prompt=request.prompt,
            tool=request.tool,
            skills_context=skills_context,
            chat_history = chat_history,
            status_callback=status_callback,
        )
        try:
            if isinstance(result.final_output.content, str):
                content_parsed = json.loads(result.final_output.content)
            else:
                content_parsed = result.final_output.content
        except (json.JSONDecodeError, TypeError):
            content_parsed = result.final_output.content
        citations_dump = [c.model_dump() for c in result.final_output.citations]
        task = TaskResponse(
            task_id=task_id,
            status="completed" if result.is_validated else "completed_with_warnings",
            result={
                "content": content_parsed,
                "citations": citations_dump,
                "metadata": result.final_output.metadata,
                "validation": {
                    "is_validated": result.is_validated,
                    "total_rounds": result.total_rounds,
                    "final_confidence": (
                        result.rounds[-1].validator_feedback.confidence
                        if result.rounds
                        else 0.0
                    ),
                    "remaining_issues": (
                        result.rounds[-1].validator_feedback.issues
                        if result.rounds and not result.is_validated
                        else []
                    ),
                },
                "rounds": [
                    {
                        "round": r.round_number,
                        "issues": r.validator_feedback.issues,
                        "suggestions": r.validator_feedback.suggestions,
                        "confidence": r.validator_feedback.confidence,
                        "is_valid": r.validator_feedback.is_valid,
                        "had_rebuttal": r.generator_output.rebuttal is not None,
                    }
                    for r in result.rounds
                ],
            },
            rounds_taken=result.total_rounds,
        )
        save_task(task)
        if request.session_id:
            session = get_session(request.session_id)
            if session and session.title == "New Chat":
                session.title = request.prompt[:50] + ("..." if len(request.prompt) > 50 else "")
                session.tool = request.tool
                save_session(session)
            add_message_to_session(request.session_id, ChatMessage(
                role="user",
                content=request.prompt,
                task_id=task_id
            ))
            add_message_to_session(request.session_id, ChatMessage(
                role="assistant",
                content=json.dumps(content_parsed) if isinstance(content_parsed, dict) else content_parsed,
                citations=result.final_output.citations,
                task_id=task_id
            ))
        publish_event(task_id, "[DONE]")
        logger.info("Task %s completed: validated=%s, rounds=%d", task_id, result.is_validated, result.total_rounds)
    except Exception as exc:
        logger.error("Task %s failed: %s\n%s", task_id, exc, traceback.format_exc())
        error_task = TaskResponse(
            task_id=task_id,
            status="failed",
            error=str(exc),
        )
        save_task(error_task)
        publish_event(task_id, f"[ERROR] {str(exc)}")


@router.post("/receive")
def receive(request: ReceiveRequest, background_tasks: BackgroundTasks):
    task_id = new_task_id()
    logger.info(
        "Received request: task_id=%s, tool=%s, prompt=%s...",
        task_id,
        request.tool,
        request.prompt[:80],
    )
    initial_task = TaskResponse(task_id=task_id, status="processing")
    save_task(initial_task)
    background_tasks.add_task(process_task, task_id, request)
    return {"task_id": task_id, "status": "processing"}


@router.get("/stream/{task_id}")
async def stream(task_id: str, request: Request):
    q = subscribe(task_id)
    async def event_generator():
        try:
            while True:
                if await request.is_disconnected():
                    break
                try:
                    message = await asyncio.wait_for(q.get(), timeout=1.0)
                    yield f"data: {message}\n\n"
                    if message in ("[DONE]",) or message.startswith("[ERROR]"):
                        break
                except asyncio.TimeoutError:
                    # Send a keep-alive ping
                    yield ": keep-alive\n\n"
        finally:
            unsubscribe(task_id, q)
    return StreamingResponse(event_generator(), media_type="text/event-stream")