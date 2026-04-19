from __future__ import annotations
import logging
from fastapi import APIRouter, HTTPException
from models import TaskResponse
from store import get_task, list_tasks



logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/send/{task_id}", response_model=TaskResponse)
def send(task_id: str):
    task = get_task(task_id)
    if task is None:
        raise HTTPException(
            status_code=404,
            detail={
                "error": f"Task '{task_id}' not found.",
                "message": "The task ID may be invalid or the task may have expired.",
            },
        )
    return task


@router.get("/send", response_model=list[TaskResponse])
def send_all():
    return list_tasks()