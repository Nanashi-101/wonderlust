# Supabase + Prisma Setup Guide

## Current Status ✓
- ✓ Prisma schema configured with User, Package, Booking, and GeneratedItinerary models
- ✓ Prisma Client singleton set up in `lib/db.ts`
- ✓ Environment variables configured with Supabase credentials
- ✓ Dependencies installed (Prisma CLI and Client)

## What's Missing & How to Fix

### Step 1: Install Dependencies (if not already done)
```bash
npm install
```

### Step 2: Generate Prisma Client
```bash
npm run db:generate
# or
npx prisma generate
```
This creates the TypeScript types and Prisma Client based on your schema.

### Step 3: Push Schema to Supabase
```bash
npm run db:push
# or
npx prisma db push
```
This creates/updates all tables in your Supabase PostgreSQL database.

### Step 4: (Optional) Seed Your Database
```bash
npm run db:seed
# or
npx prisma db seed
```
Runs the seed script at `prisma/seed.ts` to populate initial data.

### Step 5: (Optional) Open Prisma Studio
```bash
npm run db:studio
# or
npx prisma studio
```
Opens a GUI to browse/edit your database data.

## Troubleshooting

**Issue: "prisma: not found"**
- Run `npm install` to install Prisma CLI

**Issue: Connection refused/timeout**
- Verify DATABASE_URL and DIRECT_URL in `.env` are correct
- Check that Supabase project is active
- Ensure you're on a network that can reach Supabase

**Issue: Schema validation errors**
- Review the error message in `prisma/schema.prisma`
- Common issues: missing enum definitions, incorrect data types

## Next Steps

1. **Use Prisma in your API routes:**
   ```typescript
   import { prisma } from "@/lib/db";
   
   // Example: Get all packages
   const packages = await prisma.package.findMany();
   ```

2. **Use Prisma in server actions:**
   ```typescript
   "use server"
   import { prisma } from "@/lib/db";
   
   export async function getPackages() {
     return await prisma.package.findMany();
   }
   ```

3. **Create API endpoints** in `app/api/` folder to interact with the database

## Database URL Format

**DATABASE_URL** (PgBouncer for connection pooling):
- Used by: NextJS app (runtime)
- Protocol: `postgresql://...pooler.supabase.com:6543`

**DIRECT_URL** (Direct connection):
- Used by: Prisma migrations & schema push
- Protocol: `postgresql://...pooler.supabase.com:5432`

Both are in your `.env` file and properly configured.
