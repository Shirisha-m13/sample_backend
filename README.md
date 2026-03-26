# Backend

Real-time feedback backend using Express + Socket.IO + PostgreSQL.

## Local run

1. Install dependencies:
   npm install
2. Create env file:
   copy .env.example .env
3. Run migrations:
   npm run migrate:up
4. Start dev server:
   npm run dev

Runs on `http://localhost:4000` by default.

## Environment variables

- `PORT` (default: `4000`)
- `FRONTEND_URLS` (comma-separated origins, default: `http://localhost:5173`)
- `DATABASE_URL` (example: `postgres://postgres:root@localhost:5432/feedback_app`)
- Optional split DB vars (used when `DATABASE_URL` is missing):
  - `PGHOST`
  - `PGPORT`
  - `PGDATABASE`
  - `PGUSER`
  - `PGPASSWORD`
- SSL controls (useful for Azure PostgreSQL):
  - `PG_SSL=true|false`
  - `PG_SSL_REJECT_UNAUTHORIZED=true|false`

## Database behavior

- Schema is managed by migrations (`node-pg-migrate`).
- Run `npm run migrate:up` before starting the backend.
- API and socket data are served from PostgreSQL (persistent).

## Migration commands

- Create a new migration:
  - `npm run migrate:create -- <migration_name>`
- Apply migrations:
  - `npm run migrate:up`
- Roll back one migration:
  - `npm run migrate:down`

## Azure hosting (App Service)

1. Create a Node.js App Service.
2. Deploy this `backend` folder.
3. Set App Settings:
   - `PORT` is managed by Azure.
   - `FRONTEND_URLS` = your frontend URL(s), comma-separated.
   - `DATABASE_URL` = your Azure PostgreSQL connection string.
   - `PG_SSL=true`
   - `PG_SSL_REJECT_UNAUTHORIZED=false`
4. Startup command: leave default (`npm start`).
