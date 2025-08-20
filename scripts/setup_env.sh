#!/bin/bash

# Setup environment variables for Novan Webapp
echo "Setting up environment variables for Novan Webapp..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Creating .env file..."
    cp env.example .env
    echo "✅ .env file created from env.example"
else
    echo "✅ .env file already exists"
fi

# Update NEXT_PUBLIC_SITE_URL if not set
if ! grep -q "NEXT_PUBLIC_SITE_URL" .env; then
    echo "Adding NEXT_PUBLIC_SITE_URL to .env..."
    echo "" >> .env
    echo "# Site Configuration" >> .env
    echo "NEXT_PUBLIC_SITE_URL=https://novan.app" >> .env
    echo "✅ NEXT_PUBLIC_SITE_URL added to .env"
else
    echo "✅ NEXT_PUBLIC_SITE_URL already exists in .env"
fi

echo ""
echo "🎉 Environment setup complete!"
echo ""
echo "Please make sure to:"
echo "1. Set your Supabase URL and API key in .env"
echo "2. Configure the Site URL in your Supabase project dashboard:"
echo "   - Go to Authentication > URL Configuration"
echo "   - Set Site URL to: https://novan.app"
echo "   - Add https://novan.app/portal/forget_password to Redirect URLs"
echo ""
echo "This will ensure password reset emails redirect to the correct URL."
