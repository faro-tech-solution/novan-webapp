#!/bin/bash

# Deployment script for Hostinger VPS
# This script should be run on the VPS server

set -e

echo "🚀 Starting deployment..."

# Configuration
APP_NAME="novan-webapp"
APP_PORT=3000
IMAGE_NAME="novan-webapp:latest"
CONTAINER_NAME="novan-webapp"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "⚠️  Docker Compose is not installed. Installing..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
fi

# Create app directory if it doesn't exist
APP_DIR="/opt/$APP_NAME"
sudo mkdir -p "$APP_DIR"
cd "$APP_DIR"

# Stop and remove old container if exists
echo "🛑 Stopping old container..."
sudo docker stop "$CONTAINER_NAME" || true
sudo docker rm "$CONTAINER_NAME" || true

# Load new image if provided
if [ -f "/tmp/$APP_NAME.tar.gz" ]; then
    echo "📦 Loading Docker image..."
    sudo docker load < "/tmp/$APP_NAME.tar.gz"
    rm -f "/tmp/$APP_NAME.tar.gz"
fi

# Create .env file if it doesn't exist
if [ ! -f "$APP_DIR/.env" ]; then
    echo "📝 Creating .env file..."
    cat > "$APP_DIR/.env" << EOF
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_TURNSTILE_SITE_KEY=your_turnstile_site_key
TURNSTILE_SECRET_KEY=your_turnstile_secret_key
DATABASE_URL=your_database_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
EOF
    echo "⚠️  Please update $APP_DIR/.env with your actual environment variables"
fi

# Run new container
echo "🐳 Starting new container..."
sudo docker run -d \
    --name "$CONTAINER_NAME" \
    --restart unless-stopped \
    -p "$APP_PORT:3000" \
    --env-file "$APP_DIR/.env" \
    "$IMAGE_NAME"

# Wait for container to be healthy
echo "⏳ Waiting for container to start..."
sleep 5

# Check if container is running
if sudo docker ps | grep -q "$CONTAINER_NAME"; then
    echo "✅ Container is running!"
    echo "📍 App is available at http://localhost:$APP_PORT"
else
    echo "❌ Container failed to start. Check logs with:"
    echo "   sudo docker logs $CONTAINER_NAME"
    exit 1
fi

# Clean up old images
echo "🧹 Cleaning up old images..."
sudo docker image prune -f

echo "🎉 Deployment complete!"

