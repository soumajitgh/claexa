FROM python:3.13-slim

WORKDIR /app

# Install system dependencies including graphviz, texlive, and imagemagick
RUN apt-get update && apt-get install -y \
    graphviz \
    libgraphviz-dev \
    texlive-full \
    imagemagick \
    gcc \
    g++ \
    gfortran \
    libopenblas-dev \
    liblapack-dev \
    pkg-config \
    libfreetype6-dev \
    libpng-dev \
    git \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Install uv for package management
RUN curl -LsSf https://astral.sh/uv/install.sh | sh
ENV PATH="/root/.local/bin:$PATH"

# Copy dependency files and install Python dependencies
COPY uv.lock pyproject.toml /app/
RUN uv sync --frozen --no-dev

# Copy application code
COPY . /app/

# Expose gRPC port
EXPOSE 8080

# Run the gRPC server
CMD ["uv", "run", "python", "-m", "src.grpc_server"]
