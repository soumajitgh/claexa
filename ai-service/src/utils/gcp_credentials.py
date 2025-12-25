import json
import os
from typing import Optional, List, Tuple
from google.oauth2 import service_account
from src.config import app_config

 
def build_credentials_and_project_from_config(
    scopes: Optional[List[str]] = None,
) -> Tuple[service_account.Credentials, str]:
    """
    Build google.oauth2.service_account credentials and project_id from config JSON.

    Args:
        scopes: Optional list of OAuth scopes to include in the credentials. If not
            provided, defaults to ["https://www.googleapis.com/auth/cloud-platform"].

    Returns:
        A tuple of (credentials, project_id).

    Raises:
        ValueError: If the config JSON is missing/invalid or project_id is absent.
    """
    service_account_json = app_config.gcp_service_account_json
    if not service_account_json:
        raise ValueError("GCP service account JSON is required in configuration")

    try:
        info = json.loads(service_account_json)
    except Exception as exc:
        raise ValueError(f"Invalid GCP service account JSON: {exc}") from exc

    project_id = info.get("project_id")
    if not project_id:
        raise ValueError("project_id missing in GCP service account JSON")

    if not scopes:
        scopes = ["https://www.googleapis.com/auth/cloud-platform"]

    creds = service_account.Credentials.from_service_account_info(info, scopes=scopes)
    return creds, project_id


