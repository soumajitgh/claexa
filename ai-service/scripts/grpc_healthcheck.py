import asyncio
import os
import sys

import grpc
from grpc_health.v1 import health_pb2, health_pb2_grpc


async def check(address: str) -> int:
    async with grpc.aio.insecure_channel(address) as channel:
        stub = health_pb2_grpc.HealthStub(channel)
        try:
            resp = await stub.Check(health_pb2.HealthCheckRequest(service=""), timeout=5)
            return 0 if resp.status == health_pb2.HealthCheckResponse.SERVING else 1
        except Exception:
            return 1


def main() -> int:
    address = os.getenv("GRPC_HEALTH_ADDR", "localhost:8080")
    return asyncio.run(check(address))


if __name__ == "__main__":
    sys.exit(main())

