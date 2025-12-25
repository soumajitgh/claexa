import asyncio
import logging
import signal
import sys
from typing import Optional, Any, cast

import grpc
from grpc_health.v1 import health, health_pb2, health_pb2_grpc
from grpc_reflection.v1alpha import reflection
import logfire

from src.config import app_config
from src.grpc_types import ai_service_pb2 as pb
from src.grpc_types import ai_service_pb2_grpc as pb_grpc
from src.services.question_paper.service import generate_question_paper
from src.services.question_paper.grpc_mapper import (
    pb_to_generate_request,
    core_to_pb_question_paper,
)
from src.utils.errors import ServiceError


logger = logging.getLogger(__name__)

# Logfire configuration
logfire.configure()
logfire.instrument_pydantic_ai()
logfire.instrument_httpx(capture_all=True)

# Help static type checkers with dynamically generated protobuf symbols
pb = cast(Any, pb)


class QuestionPaperServiceServicer(pb_grpc.QuestionPaperServiceServicer):
    async def Generate(self, request, context):
        try:
            dto_req = pb_to_generate_request(request)
            dto_resp = await generate_question_paper(dto_req)
            return getattr(pb, "QuestionPaperGenerateResponse")(
                question_paper=core_to_pb_question_paper(dto_resp.question_paper)
            )
        except ServiceError as he:
            code = grpc.StatusCode.INTERNAL
            if he.status_code == 400:
                code = grpc.StatusCode.INVALID_ARGUMENT
            elif he.status_code == 403:
                code = grpc.StatusCode.PERMISSION_DENIED
            elif he.status_code == 404:
                code = grpc.StatusCode.NOT_FOUND
            elif he.status_code == 429:
                code = grpc.StatusCode.RESOURCE_EXHAUSTED
            await context.abort(code, he.detail or "Request failed")
        except Exception as e:
            logger.exception("Question paper generation failed")
            await context.abort(grpc.StatusCode.INTERNAL, str(e))


async def serve(bind_addr: Optional[str] = None) -> None:
    server = grpc.aio.server(
        options=[
            ("grpc.max_send_message_length", 64 * 1024 * 1024),
            ("grpc.max_receive_message_length", 64 * 1024 * 1024),
        ]
    )

    pb_grpc.add_QuestionPaperServiceServicer_to_server(QuestionPaperServiceServicer(), server)

    # Health and reflection
    health_servicer = health.HealthServicer()
    health_pb2_grpc.add_HealthServicer_to_server(health_servicer, server)

    service_names = (
        "claexa.ai.QuestionPaperService",
        health.SERVICE_NAME,
        reflection.SERVICE_NAME,
    )
    reflection.enable_server_reflection(service_names, server)

    # IPv6-only insecure connection
    address = bind_addr or f"[::]:{app_config.port}"
    server.add_insecure_port(address)
    logger.info(f"🚀 gRPC server listening on {address}")
    logger.info(f"📡 Services: QuestionPaperService")
    logger.info(f"🔍 Server reflection enabled")

    await server.start()
    # Set SERVING status for health
    health_servicer.set("", health_pb2.HealthCheckResponse.SERVING)
    
    # Setup graceful shutdown
    stop_event = asyncio.Event()
    
    def handle_shutdown(signum, frame):
        logger.info(f"Received signal {signum}, initiating graceful shutdown...")
        stop_event.set()
    
    # Register signal handlers for graceful shutdown
    signal.signal(signal.SIGINT, handle_shutdown)
    signal.signal(signal.SIGTERM, handle_shutdown)
    
    try:
        await stop_event.wait()
    except asyncio.CancelledError:
        logger.info("Server cancelled, shutting down...")
    finally:
        logger.info("Stopping server...")
        health_servicer.set("", health_pb2.HealthCheckResponse.NOT_SERVING)
        await server.stop(5)
        logger.info("✅ Server stopped gracefully")


def main() -> None:
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    # Check if running in development mode
    is_dev = '--dev' in sys.argv or app_config.env == 'development'
    
    if is_dev:
        logger.info("🔧 Running in DEVELOPMENT mode")
        logger.info("💡 Use 'scripts/dev_server.sh' for auto-reload on file changes")
    else:
        logger.info("🏭 Running in PRODUCTION mode")
    
    try:
        asyncio.run(serve())
    except KeyboardInterrupt:
        logger.info("Received keyboard interrupt")
    except Exception as e:
        logger.error(f"Server error: {e}", exc_info=True)
        sys.exit(1)


if __name__ == "__main__":
    main()


