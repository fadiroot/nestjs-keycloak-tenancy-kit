# NestJS Keycloak Tenancy Kit

This starter demonstrates how to provision fully isolated tenants with NestJS, Keycloak Organizations, and per-tenant PostgreSQL databases. It includes:

- Tenant provisioning service that orchestrates Keycloak, Dockerized tenant DBs, and master metadata.
- Keycloak admin integration for creating organizations and seeding tenant owners.
- Scriptable tenant migrations and seeders so each tenant DB starts with the expected schema.

## Architecture

![NestJS Keycloak Tenancy Kit Diagram](Screenshot%202025-11-17%20at%208.36.22%E2%80%AFAM.png)

1. **API Gateway (NestJS App)** routes tenant requests and exposes provisioning endpoints.
2. **Tenant Provisioning Service** coordinates the workflow:
   - Calls **Keycloak Admin API** to create an Organization and invite the owner.
   - Spawns a dedicated PostgreSQL instance/container for the tenant and runs migrations/seeders.
   - Persists tenant metadata (DB creds, Keycloak org IDs, etc.) in the master database.
3. **Keycloak SPI (custom listener)** emits an event when an owner is created, which triggers the NestJS API to insert the user into the correct tenant DB.

## Building & Running

1. Navigate into the Docker workspace:
   ```bash
   cd docker
   ```
2. Build and start the stack with the prepared environment file:
   ```bash
   docker compose --env-file ../.env up -d --build
   ```
3. Shut down the stack when you're done:
   ```bash
   docker compose --env-file ../.env down
   ```

## Environment Configuration

Copy `.env.example` to `.env` and adjust the values for your environment (Keycloak URLs, database credentials, Dropbox tokens, etc.). The example file mirrors all required keys for both the NestJS app and the Keycloak containers.

## Migration Scripts

This project uses a multi-tenancy architecture with separate migrations for the master database and tenant databases.

### Master Database Migrations

- Create a new migration:
  ```
  pnpm run migration:create
  ```

- Run migrations:
  ```
  pnpm run migration:run
  ```

- List applied migrations:
  ```
  pnpm run migration:list
  ```

### Tenant Database Migrations

- Create a new migration for tenant databases:
  ```
  pnpm run tenant:migration:create
  ```

- Apply migrations to all tenant databases:
  ```
  pnpm run apply-migrations
  ```

- Test a migration for tenant databases:
  ```
  pnpm run migration:test
  ```

## Other Commands

Additional helper scripts are listed in the `package.json` `scripts` section.
