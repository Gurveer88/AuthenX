from __future__ import annotations
import json
import logging
from langchain_core.messages import HumanMessage, SystemMessage
from config import get_validator_llm
from models import GeneratorOutput, ValidatorFeedback
from search import web_search



logger = logging.getLogger(__name__)


VALIDATOR_SYSTEM_PROMPT = """\
You are a strict content validator. Your job is to verify the quality and \
accuracy of generated content.

## Tool: {tool}

## Expected Output Format (from Skill Instructions)
{skills_context}

## Your Validation Checklist
1. **Format compliance**: Does the output match the JSON schema from the skill instructions?
2. **Factual accuracy**: Are all claims, statistics, and data points accurate? \
   Use the web_search tool to fact-check suspicious claims.
3. **Citation validity**: Are all citations real? Do the URLs exist? \
   Do the citations actually support the claims made?
4. **Hallucination detection**: Is any data clearly fabricated? \
   Watch for suspiciously round numbers, fake company names, or non-existent sources.
5. **Completeness**: Does the output fully address the user's prompt?
6. **Consistency**: Are there internal contradictions in the output?
7. **Quality**: Is the content well-written, clear, and professional?

## CRITICAL: User-Defined Concepts
- If the user defines custom concepts, hypothetical features, or non-standard syntax in their prompt, \
  the generated content SHOULD explain those concepts as specified by the user.
- DO NOT reject content for using user-defined concepts that aren't part of standard language features.
- Only validate that the explanation is accurate to what the user described, not whether it exists in reality.
- Example: If user defines "scope {{}}" as a C++ concept, validate the explanation matches their definition, \
  not whether it's real C++.

## Important
- Be thorough but fair. Do not flag issues that are merely stylistic preferences.
- If you are unsure about a factual claim, USE the web_search tool to verify it.
- A confidence of 0.85+ with no critical issues means is_valid should be true.
- Focus on substantive errors, not nitpicks.
"""


def validate(
    original_prompt: str,
    generated_output: GeneratorOutput,
    skills_context: str,
    tool: str,
) -> ValidatorFeedback:
    llm = get_validator_llm()
    llm_with_tools = llm.bind_tools([web_search])
    
    system_text = VALIDATOR_SYSTEM_PROMPT.format(
        tool=tool,
        skills_context=skills_context,
    )
    user_text = f"""## Original User Prompt
{original_prompt}

## Generated Output to Verify
{json.dumps(generated_output.model_dump(), indent=2, default=str)}
"""
    if generated_output.rebuttal:
        user_text += f"""
## Generator's Rebuttal (from previous round)
The generator argued back against your previous feedback:
{generated_output.rebuttal}
Consider this rebuttal carefully. If the generator's argument is valid, \
adjust your assessment accordingly.
"""

    messages = [
        SystemMessage(content=system_text),
        HumanMessage(content=user_text)
    ]
    
    logger.info("Validator LLM invoked for tool: %s", tool)
    
    current_messages = list(messages)
    max_tool_iterations = 3
    
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
    
    parser = PydanticOutputParser(pydantic_object=ValidatorFeedback)
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
            final_result = ValidatorFeedback.model_validate(data)
        except Exception as e:
            logger.error("Failed to parse validator output: %s", e)
            final_result = ValidatorFeedback(
                is_valid=False,
                issues=["Validator response could not be parsed: " + text_output[:200]],
                suggestions=["Regenerate and ensure output is well-structured"],
                confidence=0.0
            )
            
    return final_result