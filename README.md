# Softy RH
This is a project about Softy RH.

## Building the Project

To build and start the project:

1. Navigate to the docker directory:
   ```
   cd docker
   ```

2. Run Docker Compose with the environment file:
   ```
   docker compose --env-file ../.env up -d --build
   ```

To stop and remove the containers:
   ```
   docker compose --env-file ../.env down
   ```

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

For additional commands and scripts, please refer to the `scripts` section in the `package.json` file.
