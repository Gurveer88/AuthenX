import os
import logging
from dotenv import load_dotenv



load_dotenv()
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
os.environ["AWS_REGION"] = AWS_REGION
os.environ["AWS_DEFAULT_REGION"] = AWS_REGION
GENERATOR_MODEL_ID = os.getenv("GENERATOR_MODEL_ID", "us.meta.llama4-maverick-17b-instruct-v1:0")
VALIDATOR_MODEL_ID = os.getenv("VALIDATOR_MODEL_ID", "us.meta.llama4-maverick-17b-instruct-v1:0")
MAX_VALIDATION_ROUNDS = int(os.getenv("MAX_VALIDATION_ROUNDS", "10"))
SERPAPI_KEY = os.getenv("SERPAPI_KEY", "")
logger = logging.getLogger(__name__)
_generator_llm = None
_validator_llm = None


def get_generator_llm():
    global _generator_llm
    if _generator_llm is None:
        try:
            from langchain_aws import ChatBedrock
            _generator_llm = ChatBedrock(
                model_id=GENERATOR_MODEL_ID,
                region_name=AWS_REGION,
                model_kwargs={"temperature": 0.7, "max_tokens": 4096},
            )
            logger.info("Generator LLM initialized: %s", GENERATOR_MODEL_ID)
        except Exception as e:
            logger.error("Failed to initialize generator LLM: %s", e)
            raise
    return _generator_llm


def get_validator_llm():
    global _validator_llm
    if _validator_llm is None:
        try:
            from langchain_aws import ChatBedrock
            _validator_llm = ChatBedrock(
                model_id=VALIDATOR_MODEL_ID,
                region_name=AWS_REGION,
                model_kwargs={"temperature": 0.2, "max_tokens": 2048},
            )
            logger.info("Validator LLM initialized: %s", VALIDATOR_MODEL_ID)
        except Exception as e:
            logger.error("Failed to initialize validator LLM: %s", e)
            raise
    return _validator_llm