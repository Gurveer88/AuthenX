from __future__ import annotations
from typing import Literal, Optional, Union
from pydantic import BaseModel, Field
from datetime import datetime



ToolType = Literal["graph", "forms", "charts", "docs", "pdfs", "flowcharts"]


class ReceiveRequest(BaseModel):
    prompt: str = Field(..., min_length=1, description="User prompt text")
    tool: ToolType = Field(..., description="Which output tool to use")
    session_id: Optional[str] = Field(None, description="Optional session ID to continue a chat")


class Citation(BaseModel):
    text: str
    url: str


class TaskResponse(BaseModel):
    task_id: str
    status: str = Field(
        default="processing",
        description="processing | completed | completed_with_warnings | failed",
    )
    result: Optional[dict] = None
    error: Optional[str] = None
    rounds_taken: int = 0


class GeneratorOutput(BaseModel):
    content: Union[str, dict]
    citations: list[Citation] = Field(default_factory=list)
    metadata: dict = Field(default_factory=dict)
    rebuttal: Optional[str] = Field(
        default=None,
        description="If the generator disagrees with validator feedback",
    )


class ValidatorFeedback(BaseModel):
    is_valid: bool
    issues: list[str] = Field(default_factory=list)
    suggestions: list[str] = Field(default_factory=list)
    confidence: float = Field(default=0.0, ge=0.0, le=1.0)


class RoundLog(BaseModel):
    round_number: int
    generator_output: GeneratorOutput
    validator_feedback: ValidatorFeedback


class ChatMessage(BaseModel):
    role: Literal["user", "assistant", "system"]
    content: str
    citations: list[Citation] = Field(default_factory=list)
    task_id: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)


class ChatSession(BaseModel):
    session_id: str
    title: str
    tool: ToolType
    created_at: datetime = Field(default_factory=datetime.utcnow)
    messages: list[ChatMessage] = Field(default_factory=list)