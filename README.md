# Muzički Događaji

Public catalog of music events in Serbia.

## Stack

- Next.js 15
- TypeScript
- Tailwind CSS
- PostgreSQL
- Neon
- Drizzle ORM
- Vercel
- HTTP Basic Authentication for admin routes

## Local Development

1. Copy `.env.example` to `.env`.
2. Start PostgreSQL with Docker Compose.
3. Run Drizzle migrations.
4. Start the Next.js dev server.

Local PostgreSQL is exposed on host port `5433` to avoid conflicts with a system PostgreSQL service.

```sh
docker compose up -d
npm install
npm run db:generate
npm run db:migrate
npm run dev
```

Admin routes are protected by `ADMIN_USERNAME` and `ADMIN_PASSWORD_HASH`.
Escape dollar signs in bcrypt hashes inside env files, for example `\$2a\$12\$...`. A raw hash like `$2a$12$...` will not work in Next env files because `$` is treated as variable expansion.
The middleware handles the Basic Auth challenge at the edge, while bcrypt hash verification runs in the Node admin layout because bcrypt uses Node APIs.

Generate a local hash for the initial admin password `123456` with:

```sh
npm run auth:hash-admin
```
