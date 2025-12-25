# Stage 1: Builder
FROM node:22-slim AS builder

RUN npm install -g pnpm
WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm run build

# Prune dev dependencies
RUN pnpm install --prod --frozen-lockfile

# ---

# Stage 2: Production
FROM node:22-slim AS production

ENV LANG=en_US.UTF-8
ENV DEBIAN_FRONTEND=noninteractive
ENV NODE_ENV=production
ENV PORT=3000

# Install all runtime dependencies in a SINGLE layer
# NOTE: wkhtmltopdf has been REMOVED from this list
RUN apt-get update --fix-missing \
    && apt-get install -y --no-install-recommends --fix-missing \
    # Core dependencies
    git \
    curl \
    wget \
    ca-certificates \
    # Runtime dependencies for wkhtmltopdf (still needed by the static binary)
    libxrender1 \
    libfontconfig1 \
    libxext6 \
    libssl3 \
    # X11 and display server for headless rendering
    xvfb \
    xfonts-75dpi \
    xfonts-base \
    # Fonts
    fonts-liberation \
    fonts-ipafont-gothic \
    fonts-wqy-zenhei \
    fonts-thai-tlwg \
    fonts-khmeros \
    fonts-kacst \
    fonts-freefont-ttf \
    fonts-noto-color-emoji \
    fonts-noto-cjk \
    # Pandoc and image-handling dependencies
    pandoc \
    librsvg2-bin \
    imagemagick \
    libcurl4 \
    && rm -rf /var/lib/apt/lists/*

# === THE FIX ===
# Download and install the patched static binary for Debian 12 (Bookworm)
# We use 'apt-get install -y ./...' because it automatically
# handles any missing dependencies for the local .deb file.
RUN wget https://github.com/wkhtmltopdf/packaging/releases/download/0.12.6.1-3/wkhtmltox_0.12.6.1-3.bookworm_amd64.deb \
    && apt-get update \
    && apt-get install -y --no-install-recommends ./wkhtmltox_0.12.6.1-3.bookworm_amd64.deb \
    && rm ./wkhtmltox_0.12.6.1-3.bookworm_amd64.deb \
    && rm -rf /var/lib/apt/lists/* \
    && wkhtmltopdf --version

WORKDIR /app

# Copy the pruned production node_modules from the builder stage
COPY --from=builder /app/node_modules ./node_modules

# Copy the built application from the builder stage
COPY --from=builder /app/dist ./dist

# Copy package.json
COPY package.json .

EXPOSE ${PORT}

CMD ["node", "dist/src/main"]