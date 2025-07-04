# Database Migrations Guide

## Migration Management

This project uses a dual migration system:

1. **Local development migrations** in the `/migrations` directory
2. **Supabase migrations** in the `/supabase/migrations` directory

To simplify this process, we've created a migration management script that helps synchronize between these directories.

## Migration Scripts

We provide two scripts to manage migrations:

- `scripts/migrate.js` - Node.js script for migration management
- `scripts/migrate.sh` - Shell wrapper for the Node.js script

## Available Commands

### Create a New Migration

```bash
./scripts/migrate.sh create <migration-name>
```

This will create:

- A new migration file in `/migrations/<migration-name>.sql`
- A corresponding rollback file in `/migrations/rollback_<migration-name>.sql`

### Sync Migrations

```bash
./scripts/migrate.sh sync
```

This will:

- Copy migrations from `/migrations` to `/supabase/migrations` with proper timestamp and UUID naming
- Avoid duplication by comparing file contents

### List Migrations

```bash
./scripts/migrate.sh list
```

Shows all migrations in both directories.

## Workflow

1. **Create a new migration**:

   ```
   ./scripts/migrate.sh create add_new_feature
   ```

2. **Edit the migration files**:

   - Add your SQL to `/migrations/add_new_feature.sql`
   - Add rollback SQL to `/migrations/rollback_add_new_feature.sql`

3. **Sync migrations** before deploying to Supabase:

   ```
   ./scripts/migrate.sh sync
   ```

4. **Deploy to Supabase** using their CLI or dashboard.

## Best Practices

- Always create a rollback migration for each migration
- Test migrations locally before applying to production
- Keep migrations focused on a single concern
- Use descriptive names for your migrations

## Migration Naming Conventions

- Local migrations: `<descriptive_name>.sql`
- Local rollbacks: `rollback_<descriptive_name>.sql`
- Supabase migrations: `<timestamp>-<uuid>.sql` (auto-generated)
