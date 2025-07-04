#!/bin/bash

# Migration Helper Script
# This script is a convenience wrapper around the Node.js migrate.js script

# Get the directory of this script
SCRIPT_DIR=$(dirname "$0")
PROJECT_ROOT=$(cd "$SCRIPT_DIR/.." && pwd)

# Run the Node.js script with the provided arguments
node "$SCRIPT_DIR/migrate.js" "$@"

# Check if the command was successful
if [ $? -eq 0 ]; then
  echo "✅ Migration command completed successfully"
else
  echo "❌ Migration command failed"
  exit 1
fi
