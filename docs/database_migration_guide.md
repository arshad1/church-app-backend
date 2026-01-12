# Database Migration Guide: SQLite to MySQL/PostgreSQL

This guide details the steps to migrate your database provider from SQLite (default) to MySQL or PostgreSQL.

## Prerequisites
- A running MySQL or PostgreSQL database server.
- Connection string (URL) for your database.

## 1. Update `schema.prisma`

Open `prisma/schema.prisma` and update the `datasource` block.

**For PostgreSQL:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

**For MySQL:**
```prisma
datasource db {
  provider = "mysql"
  url      = env("DATABASE_URL")
}
```

## 2. Update Environment Variables

Open `.env` and update the `DATABASE_URL`.

**For PostgreSQL:**
```env
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=public"
```

**For MySQL:**
```env
DATABASE_URL="mysql://USER:PASSWORD@HOST:PORT/DATABASE"
```

## 3. Clear Migrations

Since SQLite migrations are not compatible with other SQL dialects, you must reset the history.

1.  Delete the `prisma/migrations` folder:
    ```bash
    rm -rf prisma/migrations
    ```

## 4. Initialize Database

Run the migration command to create fresh tables in your new database.

```bash
npx prisma migrate dev --name init
```

## 5. Handling Data (Optional)

**Warning**: The above steps start with an **empty database**. 

To migrate existing data from SQLite:
1.  **Before switching**: Introspect your SQLite DB or use a tool to dump data to JSON/CSV.
2.  **After switching**: Write a seed script (`prisma/seed.ts`) to read that data and insert it into the new database.

### Example Seed Command
If you have a seed script ready:
```bash
npx prisma db seed
```
