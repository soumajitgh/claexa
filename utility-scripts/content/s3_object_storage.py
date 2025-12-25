import mimetypes
from pydantic import BaseModel


class UploadDocumentDTO(BaseModel):
    bucket_name: str
    object_key: str
    path: str


def upload_document_to_bucket(s3_client, dto: UploadDocumentDTO) -> None:
    try:
        mime_type, _ = mimetypes.guess_type(dto.path)
        extra_args = {"ContentType": mime_type or "application/octet-stream"}
        s3_client.upload_file(dto.path, dto.bucket_name, dto.object_key, ExtraArgs=extra_args)
    except FileNotFoundError:
        raise FileNotFoundError(f"Local file not found: {dto.path}")
    except Exception as e:
        raise Exception(f"Failed to upload {dto.path} to s3://{dto.bucket_name}/{dto.object_key}: {str(e)}")


