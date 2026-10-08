# Sports World database foundation

This folder contains the PostgreSQL schema and the initial Prisma migration. It is a Phase 1 foundation only: the current storefront server in `server.js` still uses its existing SQLite database. The Prisma client and inventory reservation service are not wired into the storefront, checkout, POS, or production deployment.

## 1. Install PostgreSQL

Install a supported PostgreSQL release from [postgresql.org/download](https://www.postgresql.org/download/) or use a PostgreSQL provider. Keep the database private and use a dedicated application user with access only to the Sports World database.

For a local PostgreSQL installation, create a database named `sports_world` using pgAdmin or `psql`:

```sql
CREATE DATABASE sports_world;
```

## 2. Configure the connection

Copy `.env.example` to `.env` in the repository root. Replace `USER`, `PASSWORD`, and `HOST` in `DATABASE_URL` with the database credentials and host. For a local default PostgreSQL install, the host is usually `localhost` and the port is `5432`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/sports_world?schema=public"
```

URL-encode special characters in the username or password. Do not commit `.env` or put a real password in `.env.example` or GitHub.

## 3. Validate, generate, and migrate

From the repository root, run:

```powershell
npm install
npm run prisma:validate
npm run prisma:generate
npm run prisma:migrate:deploy
```

`prisma:migrate:deploy` applies the committed migration to the database in `DATABASE_URL`. The schema can be validated and the client generated without connecting to a database; applying the migration cannot.

For later schema changes during development, create a new migration with:

```powershell
npx prisma migrate dev --name describe_the_change
```

The initial migration includes PostgreSQL `CHECK` constraints for inventory quantities and order/POS line quantities. Those constraints are hand-maintained SQL because Prisma Schema Language does not model them. Preserve and review them when changing the initial migration or inventory rules.

## 4. Inspect the database

Run Prisma Studio to browse records in a local UI:

```powershell
npm run prisma:studio
```

To inspect PostgreSQL directly, connect with pgAdmin or `psql` and run commands such as:

```sql
\dt
SELECT * FROM "store_inventory";
```

## Inventory concurrency example

`lib/inventory/atomic-stock.ts` demonstrates a PostgreSQL transaction that locks each existing store-inventory row using `SELECT ... FOR UPDATE`, checks available quantity (`stock_quantity - reserved_quantity`), and reserves stock before commit. It is not called by the existing SQLite storefront. No Redis lock or end-to-end online/POS checkout integration is claimed in this phase.

## Prisma client

The Prisma 7 client is generated under `generated/prisma/`, which is ignored by Git. Regenerate it after changing the schema with `npm run prisma:generate`. `lib/prisma.ts` requires `DATABASE_URL` at runtime and uses Prisma's PostgreSQL driver adapter.
