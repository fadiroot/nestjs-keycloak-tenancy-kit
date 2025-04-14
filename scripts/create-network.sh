#!/bin/bash

NETWORK_NAME="tenant-network"

echo "Checking if $NETWORK_NAME network exists..."

# Use Docker socket to check if network exists
if ! docker network inspect $NETWORK_NAME > /dev/null 2>&1; then
    echo "Creating $NETWORK_NAME network..."
    docker network create $NETWORK_NAME
else
    echo "$NETWORK_NAME network already exists."
fi

# Execute the command passed to the script
exec "$@"
