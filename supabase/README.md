# Supabase development workflow

## Why this exists

8 of the 37 migrations in `migrations/` are "fix" migrations correcting an
earlier one — `achievement_id` ambiguity was fixed 4 separate times, and the
`user_stats` RLS policy was added/fixed/restored/re-fixed 4 times. That
pattern means migrations touching RLS or function signatures were being
written and pushed without a local test pass first. Use the loop below to
catch that class of bug before it ships.

## Prerequisites

- [Docker](https://www.docker.com/) running locally (the Supabase CLI uses
  it to run Postgres + the rest of the stack).
- The Supabase CLI (already a dependency, invoked via `npx supabase` /
  the `pnpm supabase:*` scripts below — no separate install needed).

## The loop

```sh
pnpm supabase:start   # boots the local stack (Postgres, Auth, Studio, ...)
```

This repo treats `supabase/schemas/*.sql` as the declarative source of
truth for the schema (see `schema_paths` in `supabase/config.toml`) rather
than hand-writing incremental migrations directly:

1. Edit the relevant file(s) under `supabase/schemas/`.
2. Generate a migration from the diff between your schema files and the
   local database:
   ```sh
   npx supabase db diff -f <descriptive_migration_name>
   ```
3. Read the generated file in `supabase/migrations/` before doing anything
   else with it. `db diff` is a starting point, not a guarantee — this is
   exactly the step that would have caught the ambiguous-column and RLS
   issues before they shipped.
4. Apply it locally and confirm it actually works:
   ```sh
   npx supabase db reset   # replays all migrations + seed data from scratch
   ```
5. Exercise anything the migration touches (an RPC call, a query that
   depends on the new RLS policy, etc.) against the local stack before
   pushing.

```sh
pnpm supabase:stop    # tear down the local stack when done
pnpm supabase:reset   # equivalent to `supabase db reset` above
```

`pnpm dev:supabase` starts the local stack and the Vite dev server together.

## Migration history squash

Now that the schema has stabilized, squashing the 37 migrations (8 of which
are fixes for earlier ones) into a single baseline is worth considering —
but it changes what a fresh `supabase db reset` replays and can conflict
with the migration history already recorded against any deployed project
(`supabase_migrations.schema_migrations`), so it needs to be done
deliberately against a real project connection, not assumed safe from a
local-only check. Treat it as a separate, explicit task rather than
something to do incidentally.
