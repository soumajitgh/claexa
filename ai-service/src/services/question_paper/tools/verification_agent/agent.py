import logging
from pathlib import Path
from pydantic_ai import Agent
from pydantic_ai.models.openai import OpenAIChatModel
from pydantic_ai.settings import ModelSettings

from src.services.question_paper.model_provider import openrouter_model_provider
from src.services.question_paper.tools.verification_agent.models import AIQuestionPaperVerificationFeedback

logger = logging.getLogger(__name__)


def get_system_prompt() -> str:
    """Load the system prompt for question paper verification."""
    prompts_dir = Path(__file__).parent
    prompt_path = prompts_dir / "system_prompt.md"
    
    try:
        with open(prompt_path, "r", encoding="utf-8") as f:
            return f.read().strip()
    except FileNotFoundError:
        logger.error(f"Prompt file not found: {prompt_path}")
        raise ValueError(f"Prompt file not found: {prompt_path}")


# Define settings with the OpenRouter-specific 'provider' object
settings = ModelSettings(
    extra_body={
        "provider": {
            "order": ["wandb/fp8", "siliconflow/fp8", "deepinfra/fp4"], 
            "allow_fallbacks": True          
        }
    }
)

# Pass the settings when initializing the model
_model = OpenAIChatModel(
    "deepseek/deepseek-chat-v3.1", 
    provider=openrouter_model_provider,
    settings=settings
)
    
_system_prompt = get_system_prompt()

question_paper_verification_agent = Agent(
        model=_model,
        output_type=AIQuestionPaperVerificationFeedback,
        system_prompt=_system_prompt,
    ) 
