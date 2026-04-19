from __future__ import annotations
import json
import logging
from typing import Optional
from langchain_core.messages import HumanMessage, SystemMessage, AIMessage
from config import get_generator_llm
from models import GeneratorOutput, ValidatorFeedback, Citation, ChatMessage
from search import web_search



logger = logging.getLogger(__name__)

GENERATOR_SYSTEM_PROMPT = """\
You are an expert content generator. Your job is to produce high-quality, \
accurate output for a specific tool type.

## Tool: {tool}

## Skill Instructions
{skills_context}

## Key Rules
1. Follow the skill instructions EXACTLY.
2. Ground your content in facts. Use the web_search tool if you need to verify data \
   or find real-world information.
3. Cite all sources.
4. Do NOT hallucinate data, statistics, names, or URLs.
5. If you are unsure about something, search for it first.
"""

REVISION_ADDENDUM = """

## Previous Feedback from Validator
The validator found the following issues with your last output:

### Issues
{issues}

### Suggestions
{suggestions}

You have two options:
1. **Correct** the issues and regenerate.
2. **Argue back** if you believe the validator is wrong — include a "rebuttal" \
   key in your JSON response explaining why.

Either way, produce a complete, corrected response.
"""


def generate(
    prompt: str,
    skills_context: str,
    tool: str,
    previous_feedback: Optional[ValidatorFeedback] = None,
    chat_history: list[ChatMessage] = None,
) -> GeneratorOutput:
    llm = get_generator_llm()
    llm_with_tools = llm.bind_tools([web_search])
    system_text = GENERATOR_SYSTEM_PROMPT.format(
        tool=tool,
        skills_context=skills_context,
    )
    if previous_feedback:
        system_text += REVISION_ADDENDUM.format(
            issues="\n".join(f"- {i}" for i in previous_feedback.issues),
            suggestions="\n".join(f"- {s}" for s in previous_feedback.suggestions),
        )
    messages = [SystemMessage(content=system_text)]
    if chat_history:
        for msg in chat_history:
            if msg.role == 'user':
                message.append(HumanMessage(content = msg.content))
            elif msg.role == 'assistant':
                message.append(AIMessage(content = msg.content))
            elif msg.role == 'system':
                message.append(SystemMessage(content = msg.content))
    logger.info("Generator LLM invoked for tool: %s", tool)
    current_messages = list(messages)
    max_tool_iterations = 5
    for _ in range(max_tool_iterations):
        response = llm_with_tools.invoke(current_messages)
        current_messages.append(response)
        if not response.tool_calls:
            break
        for tool_call in response.tool_calls:
            if tool_call["name"] == "web_search":
                try:
                    result = web_search.invoke(tool_call["args"])
                except Exception as e:
                    result = f"Search error: {e}"
                current_messages.append({
                    "role": "tool",
                    "name": tool_call["name"],
                    "tool_call_id": tool_call["id"],
                    "content": str(result)
                })
    from langchain_core.output_parsers import PydanticOutputParser
    from langchain_core.exceptions import OutputParserException
    import re
    parser = PydanticOutputParser(pydantic_object=GeneratorOutput)
    current_messages.append(SystemMessage(content=parser.get_format_instructions()))
    final_response = llm.invoke(current_messages)
    text_output = final_response.content
    try:
        final_result = parser.invoke(text_output)
    except OutputParserException:
        match = re.search(r"```(?:json)?\s*(\{.*?\})\s*```", text_output, re.DOTALL | re.IGNORECASE)
        if match:
            text_output = match.group(1)
        else:
            start = text_output.find("{")
            end = text_output.rfind("}")
            if start != -1 and end != -1:
                text_output = text_output[start:end+1]
        try:
            data = json.loads(text_output)
            if isinstance(data.get('content'), dict):
                final_result = GeneratorOutput(
                    content=data['content'],
                    citations=[Citation(**c) if isinstance(c, dict) else c for c in data.get('citations', [])],
                    metadata=data.get('metadata', {}),
                    rebuttal=data.get('rebuttal')
                )
            else:
                final_result = GeneratorOutput.model_validate(data)
        except Exception as e:
            logger.error("Failed to parse generator output: %s", e)
            final_result = GeneratorOutput(content=text_output, metadata={"error": "Parse failed"})
    return final_result