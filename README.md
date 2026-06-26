# TaskKo

TaskKo is a monorepo with a Next.js frontend and an Express, TypeScript, Prisma backend backed by Postgres in Docker.

## Prerequisites

- Node.js 20 or newer
- npm
- Docker Desktop

## Project Structure

```text
TaskKo/
  backend/    Express API, Prisma schema, TypeScript config
  frontend/   Next.js app
```

## Setup

1. Install dependencies from the root directory:

   ```bash
   npm install
   ```

2. Create the backend environment file:

   ```bash
   cp backend/.env.example backend/.env
   ```

   On Windows PowerShell, use:

   ```powershell
   Copy-Item backend/.env.example backend/.env
   ```

3. Start Postgres:

   ```bash
   npm run db:up
   ```

4. Push the Prisma schema to the local database:

   ```bash
   npm run db:push --workspace backend
   ```

You can also run the main setup steps together:

```bash
npm run setup
```

On Windows PowerShell, if `npm` is blocked by the local execution policy, use `npm.cmd` for the same commands.

## Running The App

Start the backend and frontend together:

```bash
npm run dev
```

The frontend runs at [http://localhost:3000](http://localhost:3000).
The backend runs at [http://localhost:4000](http://localhost:4000).

## Database Commands

Start Postgres:

```bash
npm run db:up
```

Stop Postgres:

```bash
npm run db:down
```

View Postgres logs:

```bash
npm run db:logs
```

Generate the Prisma client:

```bash
npm run prisma:generate --workspace backend
```

Create and run a migration:

```bash
npm run prisma:migrate --workspace backend
```
