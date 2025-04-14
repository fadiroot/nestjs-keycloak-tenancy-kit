#!/bin/bash
set -e

echo "Starting database initialization script..."

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
    SELECT 'CREATE DATABASE keycloak'
    WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'keycloak')\gexec
    GRANT ALL PRIVILEGES ON DATABASE keycloak TO $POSTGRES_USER;
EOSQL

echo "Keycloak database created successfully (if it didn't exist)."
echo "POSTGRES_USER: $POSTGRES_USER"
echo "POSTGRES_DB: $POSTGRES_DB"
echo "Database initialization script completed."