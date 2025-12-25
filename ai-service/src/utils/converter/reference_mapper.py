import asyncio
import logging
import mimetypes
from pathlib import Path
from typing import List, Optional

import httpx
from pydantic_ai import BinaryContent


logger = logging.getLogger(__name__)


def _guess_media_type(path: Path, fallback: str = "application/octet-stream") -> str:
    if path.suffix.lower() == ".pdf":
        return "application/pdf"
    media_type, _ = mimetypes.guess_type(str(path))
    return media_type or fallback


def _is_url(ref: str) -> bool:
    return ref.startswith("http://") or ref.startswith("https://")


async def _download_to_binary(session: httpx.AsyncClient, url: str) -> BinaryContent:
    logger.info(f"Downloading reference from URL: {url}")
    try:
        response = await session.get(url, timeout=30.0, follow_redirects=True)
        response.raise_for_status()
        content_type: Optional[str] = response.headers.get("content-type")
        if not content_type:
            # Fallback: try to infer from URL path
            try:
                content_type = _guess_media_type(Path(httpx.URL(url).path))
            except Exception:
                content_type = "application/octet-stream"

        return BinaryContent(data=response.content, media_type=content_type)
    except httpx.HTTPError as e:
        logger.error(f"Failed to download URL {url}: {e}")
        raise ValueError(f"Failed to download URL {url}: {e}") from e


async def map_references_to_binary_contents(refs: List[str]) -> List[BinaryContent]:
    """
    Map a list of references (URLs or local file paths) to BinaryContent objects.

    - http/https URLs are downloaded using httpx
    - Local file paths are read from disk

    Args:
        refs: list of reference strings

    Returns:
        List[BinaryContent]

    Raises:
        ValueError on invalid references or download errors
    """
    if not refs:
        return []

    url_refs: List[str] = []
    file_refs: List[Path] = []
    for ref in refs:
        if _is_url(ref):
            url_refs.append(ref)
        else:
            file_refs.append(Path(ref))

    results: List[BinaryContent] = []

    # Process local files synchronously
    for path in file_refs:
        if not path.is_file():
            raise ValueError(f"Reference is not a file: {path}")
        media_type = _guess_media_type(path)
        data = path.read_bytes()
        results.append(BinaryContent(data=data, media_type=media_type))

    # Download URLs concurrently
    if url_refs:
        async with httpx.AsyncClient() as session:
            tasks = [
                _download_to_binary(session, url)
                for url in url_refs
            ]
            downloaded: List[BinaryContent] = await asyncio.gather(*tasks)
            results.extend(downloaded)

    return results


__all__ = ["map_references_to_binary_contents"]


