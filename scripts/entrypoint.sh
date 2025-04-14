#!/bin/bash

# Wait for PostgreSQL to be up
./wait-for-it.sh $POSTGRES_HOST:$POSTGRES_PORT -- echo "PostgreSQL is up"

# Run migrations
echo "Running migrations..."
pnpm run migration:run

# Execute the CMD (which should be your start command)
echo "Starting the application..."
exec "$@"
