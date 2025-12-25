from pydantic_ai.providers.google import GoogleProvider
from pydantic_ai.providers.openai import OpenAIProvider

from src.config import app_config

from src.utils.gcp_credentials import build_credentials_and_project_from_config


credentials, gcp_project_id = build_credentials_and_project_from_config()
# google_model_provider = GoogleProvider(credentials=credentials, project=gcp_project_id, location="global")
google_model_provider = GoogleProvider(api_key=app_config.google_api_key)


openrouter_model_provider = OpenAIProvider(api_key=app_config.openrouter_api_key, base_url="https://openrouter.ai/api/v1")