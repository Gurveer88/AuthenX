from __future__ import annotations
import logging
from typing import Callable, Optional
from dataclasses import dataclass, field
from config import MAX_VALIDATION_ROUNDS
from models import GeneratorOutput, RoundLog, ValidatorFeedback, ChatMessage
from modules.generate import generate
from modules.validate import validate



logger = logging.getLogger(__name__)


@dataclass
class OrchestrationResult:
    final_output: GeneratorOutput
    is_validated: bool
    rounds: list[RoundLog] = field(default_factory=list)
    total_rounds: int = 0


def run_generation_loop(
    prompt: str,
    tool: str,
    skills_context: str,
    chat_history: list[ChatMessage] = None,
    max_rounds: int | None = None,
    status_callback: Optional[Callable[[str], None]] = None,
) -> OrchestrationResult:
    def _log_and_emit(msg: str):
        logger.info(msg)
        if status_callback:
            status_callback(msg)
    if max_rounds is None:
        max_rounds = MAX_VALIDATION_ROUNDS
    rounds: list[RoundLog] = []
    feedback: ValidatorFeedback | None = None
    _log_and_emit(f"Starting orchestration loop for tool: {tool}")
    for round_num in range(1, max_rounds + 1):
        _log_and_emit(f"=== Round {round_num}/{max_rounds} ===")
        _log_and_emit("Generator: producing content...")
        gen_output: GeneratorOutput = generate(
            prompt=prompt,
            skills_context=skills_context,
            tool=tool,
            previous_feedback=feedback,
            chat_history=chat_history,
        )
        _log_and_emit(f"Generator: produced {len(gen_output.content)} chars, {len(gen_output.citations)} citations")
        
        _log_and_emit("Validator: checking content...")
        full_prompt = prompt
        if chat_history:
            history_text = "\n".join([f"{msg.role}: {msg.content}" for msg in chat_history])
            full_prompt = f"Chat History:\n{history_text}\n\nCurrent Prompt:\n{prompt}"
        feedback = validate(
            original_prompt=full_prompt,
            generated_output=gen_output,
            skills_context=skills_context,
            tool=tool,
        )
        _log_and_emit(f"Validator: is_valid={feedback.is_valid}, confidence={feedback.confidence:.2f}, issues={len(feedback.issues)}")
        
        round_log = RoundLog(
            round_number=round_num,
            generator_output=gen_output,
            validator_feedback=feedback,
        )
        rounds.append(round_log)
        if feedback.is_valid:
            _log_and_emit(f"Validated successfully after {round_num} round(s).")
            return OrchestrationResult(
                final_output=gen_output,
                is_validated=True,
                rounds=rounds,
                total_rounds=round_num,
            )

        _log_and_emit(f"Round {round_num} failed validation. Issues: {'; '.join(feedback.issues)}")
    msg = f"Max rounds ({max_rounds}) reached without full validation."
    logger.warning(msg)
    if status_callback:
        status_callback(msg)
    return OrchestrationResult(
        final_output=rounds[-1].generator_output if rounds else GeneratorOutput(content=""),
        is_validated=False,
        rounds=rounds,
        total_rounds=max_rounds,
    )