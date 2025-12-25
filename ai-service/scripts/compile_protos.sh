#!/usr/bin/env bash
set -euo pipefail

PROTO_DIR="proto"
OUT_DIR="src/grpc_types"

mkdir -p "$OUT_DIR"

uv run python -m grpc_tools.protoc \
  -I"$PROTO_DIR" \
  --python_out="$OUT_DIR" \
  --grpc_python_out="$OUT_DIR" \
  "$PROTO_DIR/ai_service.proto"

echo "Protobuf generated into $OUT_DIR"

