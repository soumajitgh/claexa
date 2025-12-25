# AI Service

An intelligent AI service that provides question paper generation and image creation capabilities using advanced AI models.

## Features

- **Question Paper Generation**: Create custom question papers with different difficulty levels, topics, and question types
- **Image Generation**: Generate images from text prompts using AI models
- **Multiple Audience Support**: Generate content for school, undergraduate, postgraduate, research, and professional levels
- **Bloom's Taxonomy Integration**: Questions are categorized by cognitive levels
- **Flexible Schema System**: Support for various question types and configurations

## Quick Start

> **⚡ TL;DR**: `uv sync && bash scripts/compile_protos.sh && uv run python -m src.grpc_server` - That's it!

### Prerequisites

- Python 3.11+
- uv (Python package manager)
- Protocol Buffers compiler (protoc)

### Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd ai-service
```

2. Install dependencies:

```bash
uv sync
```

3. Set up environment variables:

```bash
cp env.example.txt .env
# Edit .env with your configuration
```

4. Generate protobuf code:

```bash
bash scripts/compile_protos.sh
```

5. Run the gRPC server:

```bash
uv run python -m src.grpc_server
```

The gRPC server will be available at `localhost:8080`

## gRPC API

- Package: `claexa.ai`
- Services: `ImageService`, `QuestionPaperService`
- Proto: `proto/ai_service.proto`

### Available gRPC Methods

#### ImageService

- `Generate` - Generate images from text prompts

#### QuestionPaperService

- `Generate` - Generate question papers with custom specifications

## Development

### Common Commands

```bash
# Generate protobuf code
bash scripts/compile_protos.sh

# Run gRPC server
uv run python -m src.grpc_server

# Run tests
uv run pytest

# Run tests with coverage
uv run pytest --cov=src

# Test image rendering
uv run python tests/test_image_rendering.py
```

### Project Structure

```
src/
├── grpc_server.py        # Main gRPC server
├── config.py             # Configuration management
├── grpc_types/           # Generated protobuf code
├── services/             # Business logic
│   ├── question_paper/   # Question paper generation service
│   │   ├── agent.py      # AI agent for question generation
│   │   ├── service.py    # Main service logic
│   │   ├── tools/        # Additional tools and utilities
│   │   └── response_mapper/ # Response mapping and image rendering
│   └── image/            # Image generation service
│       ├── service.py    # Image generation logic
│       └── generation.py # Image generation implementation
└── utils/                # Utility functions
    ├── google_ai_client.py  # Google AI integration
    ├── aws/              # AWS integrations
    └── converter/        # LaTeX and image converters
```

### Running Tests

```bash
uv run pytest
```

## Docker

### Quick Start (Recommended)

Build both images and run the service with a single command:

```bash
# Using Make (recommended)
make build  # Build both sandbox and main images
make up     # Run production service
make up-dev # Run development service with auto-reload

# Or using the build script directly
./scripts/build_images.sh
docker-compose up
```

### Manual Build

Build both the Python sandbox and main AI service images:

```bash
# Build both images
./scripts/build_images.sh

# Or build individually
docker build -t ai-service-python-sandbox:latest -f Dockerfile.sandbox .
docker build --target production -t ai-service:latest .
```

### Running

```bash
# Using docker-compose (recommended)
docker-compose up claexa-ai-service

# Or run directly
docker run -p 8080:8080 \
  -v /var/run/docker.sock:/var/run/docker.sock \
  ai-service:latest
```

**Important**: The main service requires access to Docker socket (`/var/run/docker.sock`) to run the Python sandbox for secure code execution.

### Docker Images

This project uses two Docker images:

1. **ai-service-python-sandbox:latest** (~1.6GB)

   - Python 3.11-slim with scientific packages
   - Pre-installed: matplotlib, numpy, scipy, graphviz, rdkit
   - Used for secure, isolated execution of visualization code
   - Built first during the build process

2. **ai-service:latest** (~1.5GB)
   - Python 3.13-slim with texlive, imagemagick
   - Main application container
   - Requires Docker socket access to run sandbox containers

See [docs/DOCKER_SANDBOX.md](./docs/DOCKER_SANDBOX.md) for detailed information about the sandbox architecture.

## Railway Deployment

Deploy to Railway cloud with Docker-in-Docker support:

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/new/template?template=https://github.com/ClaexaAI/ai-service)

### Quick Deploy

1. Click the "Deploy on Railway" button above
2. Configure environment variables (GCP credentials, API keys)
3. Enable Docker-in-Docker in project settings (Pro plan required)
4. Deploy!

See [docs/RAILWAY_DEPLOYMENT.md](./docs/RAILWAY_DEPLOYMENT.md) for complete deployment guide.

### Key Features

- **Docker-in-Docker**: Sandbox containers spawn at runtime
- **Auto-deploy**: Push to GitHub → Automatic deployment
- **Secure**: Isolated sandboxes with no network access
- **Scalable**: Horizontal and vertical scaling supported

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

[Add your license information here]
