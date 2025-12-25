# syntax=docker/dockerfile:1

############################################
# Build stage: compile the Vite React app  #
############################################
FROM node:22-alpine AS build

WORKDIR /app

# Leverage corepack to use the pinned pnpm version from package.json
COPY package.json pnpm-lock.yaml ./
RUN corepack enable \
  && corepack prepare pnpm@10.11.0 --activate \
  && pnpm install --frozen-lockfile

# Copy project files and build
COPY . .
 
# Pass Vite env to build (injected at compile time)
ARG VITE_FIREBASE_CONFIG_JSON
ENV VITE_FIREBASE_CONFIG_JSON=$VITE_FIREBASE_CONFIG_JSON
ARG VITE_API_BASE_URL
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ARG VITE_PUBLIC_POSTHOG_KEY
ENV VITE_PUBLIC_POSTHOG_KEY=$VITE_PUBLIC_POSTHOG_KEY
ARG VITE_PUBLIC_POSTHOG_HOST
ENV VITE_PUBLIC_POSTHOG_HOST=$VITE_PUBLIC_POSTHOG_HOST
ARG VITE_DEPLOYMENT_TYPE
ENV VITE_DEPLOYMENT_TYPE=$VITE_DEPLOYMENT_TYPE
ARG VITE_REDIRECT_BASE_URL
ENV VITE_REDIRECT_BASE_URL=$VITE_REDIRECT_BASE_URL
ARG VITE_GOOGLE_CLIENT_ID
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
RUN pnpm build

############################################
# Runtime stage: serve with Nginx          #
############################################
FROM nginx:1.27-alpine AS runtime

# Remove default nginx static assets
RUN rm -rf /usr/share/nginx/html/*

# Copy build output
COPY --from=build /app/dist /usr/share/nginx/html

# Copy custom nginx configuration (ensures index.html is never cached)
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose port
EXPOSE 80

# Run Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
