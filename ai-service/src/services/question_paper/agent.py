import logging
from pathlib import Path
from pydantic_ai import Agent, RunContext
from pydantic_ai.models.google import GoogleModel, GoogleModelSettings
from pydantic_ai.messages import ToolReturn

from src.services.question_paper.model_provider import google_model_provider
from .models.ai_question_paper import AIQuestionPaper
from .tools.verification_agent.agent import question_paper_verification_agent
from .tools.verification_agent.models import AIQuestionPaperVerificationFeedback, AIQuestionPaperWithoutImages

logger = logging.getLogger(__name__)


def get_system_prompt() -> str:
    """Load the system prompt for question paper generation."""
    prompts_dir = Path(__file__).parent
    prompt_path = prompts_dir / "system_prompt.md"
    
    try:
        with open(prompt_path, "r", encoding="utf-8") as f:
            return f.read().strip()
    except FileNotFoundError:
        logger.error(f"Prompt file not found: {prompt_path}")
        raise ValueError(f"Prompt file not found: {prompt_path}")


      
model = GoogleModel("learnlm-2.0-flash-experimental", provider=google_model_provider)
model_settings = GoogleModelSettings(temperature=0.4)
    
system_prompt = get_system_prompt()


question_paper_agent = Agent(
        model=model,
        output_type=AIQuestionPaper,
        system_prompt=system_prompt,
        model_settings=model_settings,
        retries=3,
    ) 


@question_paper_agent.tool
async def verification_tool(ctx: RunContext[None], question_paper: AIQuestionPaperWithoutImages) -> AIQuestionPaperVerificationFeedback:
    """Verify the question paper. and get the feedback."""
        
    result = await question_paper_verification_agent.run(user_prompt=question_paper.model_dump_json(),
                                                         deps=ctx.deps,
                                                         usage=ctx.usage)
            
    return result.output