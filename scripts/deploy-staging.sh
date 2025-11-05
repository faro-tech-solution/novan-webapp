#!/bin/bash

# Deployment script for Staging environment on Hostinger VPS
# This script should be run on the VPS server

set -e

echo "🚀 Starting staging deployment..."

# Configuration
APP_NAME="novan-webapp-staging"
APP_PORT=3001
IMAGE_NAME="novan-webapp:staging"
CONTAINER_NAME="novan-webapp-staging"
ENV_FILE="/opt/novan-webapp-staging/.env"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Create app directory if it doesn't exist
APP_DIR="/opt/novan-webapp-staging"
sudo mkdir -p "$APP_DIR"
cd "$APP_DIR"

# Stop and remove old container if exists
echo "🛑 Stopping old container..."
sudo docker stop "$CONTAINER_NAME" || true
sudo docker rm "$CONTAINER_NAME" || true

# Load new image if provided
if [ -f "/tmp/novan-webapp-staging.tar.gz" ]; then
    echo "📦 Loading Docker image..."
    sudo docker load < "/tmp/novan-webapp-staging.tar.gz"
    rm -f "/tmp/novan-webapp-staging.tar.gz"
fi

# Create .env file if it doesn't exist
if [ ! -f "$ENV_FILE" ]; then
    echo "📝 Creating .env file..."
    cat > "$ENV_FILE" << EOF
NODE_ENV=development
STAGING_NEXT_PUBLIC_SUPABASE_URL=your_staging_supabase_url
STAGING_NEXT_PUBLIC_SUPABASE_ANON_KEY=your_staging_supabase_anon_key
STAGING_NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_staging_turnstile_site_key
STAGING_TURNSTILE_SECRET_KEY=your_staging_turnstile_secret_key
STAGING_DATABASE_URL=your_staging_database_url
STAGING_SUPABASE_SERVICE_ROLE_KEY=your_staging_service_role_key
EOF
    echo "⚠️  Please update $ENV_FILE with your actual staging environment variables"
fi

# Run new container
echo "🐳 Starting new container..."
sudo docker run -d \
    --name "$CONTAINER_NAME" \
    --restart unless-stopped \
    -p "$APP_PORT:3000" \
    --env-file "$ENV_FILE" \
    -e NODE_ENV=development \
    "$IMAGE_NAME"

# Wait for container to be healthy
echo "⏳ Waiting for container to start..."
sleep 5

# Check if container is running
if sudo docker ps | grep -q "$CONTAINER_NAME"; then
    echo "✅ Container is running!"
    echo "📍 Staging app is available at http://localhost:$APP_PORT"
else
    echo "❌ Container failed to start. Check logs with:"
    echo "   sudo docker logs $CONTAINER_NAME"
    exit 1
fi

# Clean up old images
echo "🧹 Cleaning up old images..."
sudo docker image prune -f

echo "🎉 Staging deployment complete!"

