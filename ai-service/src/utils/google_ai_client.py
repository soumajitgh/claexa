import logging
import os
from typing import Optional

import google.genai as genai
from google.genai.client import DebugConfig

from src.utils.gcp_credentials import build_credentials_and_project_from_config


logger = logging.getLogger(__name__)

# Singleton client
_genai_client: Optional[genai.Client] = None


def get_genai_client() -> genai.Client:
    """Return a process-wide Google GenAI client configured for Vertex AI."""
    global _genai_client

    if _genai_client is None:
        credentials, project_id = build_credentials_and_project_from_config()
        location = "global"
        _genai_client = genai.Client(
            vertexai=True,
            location=location,
            credentials=credentials,
            project=project_id,
            debug_config=DebugConfig(
                client_mode="debug"
            )
        )
        logger.info("Initialized universal Google GenAI client (Vertex AI) for project '%s' in '%s'", project_id, location)

    return _genai_client


__all__ = ["get_genai_client"]


