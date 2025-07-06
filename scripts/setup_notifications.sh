#!/bin/bash

# Apply notifications system migration
echo "Applying notifications system migration..."
psql "$DATABASE_URL" -f ./migrations/notifications_system.sql

echo "Migration completed successfully!"
