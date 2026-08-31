# Database Setup Troubleshooting

## Common Issues & Solutions

### 1. "Error: connect ECONNREFUSED 127.0.0.1:5432"
**Problem:** Can't connect to the database.

**Solutions:**
- ✓ Verify `DATABASE_URL` and `DIRECT_URL` in `.env` are correct
- ✓ Check your Supabase project is active (not paused)
- ✓ Ensure you're on a network that can reach Supabase
- ✓ Try pinging the database host: `ping aws-1-eu-central-2.pooler.supabase.com`

### 2. "prisma: command not found"
**Problem:** Prisma CLI isn't installed.

**Solutions:**
- ✓ Run: `npm install` to install all dependencies
- ✓ Use `npx prisma` instead of just `prisma` (npx downloads it temporarily)

### 3. "Error: P1000 - Authentication failed"
**Problem:** Supabase credentials are wrong.

**Solutions:**
- ✓ Go to Supabase Dashboard → Project Settings → Database
- ✓ Copy the correct connection strings
- ✓ Update `DATABASE_URL` and `DIRECT_URL` in `.env`
- ✓ Restart your dev server

### 4. "Error: P3014 - Migrate found drift"
**Problem:** Database schema doesn't match Prisma schema.

**Solutions:**
- ✓ Run: `npx prisma db push --force-reset` (⚠️ this deletes all data)
- ✓ Or, create a migration: `npx prisma migrate dev --name fix_schema`

### 5. "Error: P2002 - Unique constraint violation"
**Problem:** Trying to create duplicate records.

**Solutions:**
- ✓ Check if the record already exists before creating
- ✓ Use `upsert` instead of `create` to update if exists
- ✓ Example:
  ```typescript
  await prisma.package.upsert({
    where: { slug: "ladakh-expedition" },
    update: { title: "New Title" },
    create: { slug: "ladakh-expedition", title: "New Title", ... }
  });
  ```

### 6. "Error: P1001 - Can't reach database server"
**Problem:** Connection timeout.

**Solutions:**
- ✓ Check your internet connection
- ✓ Ensure Supabase isn't under maintenance (check status.supabase.com)
- ✓ Try restarting your dev server
- ✓ Check if you're behind a firewall/VPN blocking Supabase IPs

### 7. "Error: P2025 - Record not found"
**Problem:** Trying to access a record that doesn't exist.

**Solutions:**
- ✓ Use `findUnique()` or `findMany()` to check if it exists first
- ✓ Use `findUniqueOrThrow()` only if you want to error
- ✓ Example:
  ```typescript
  const pkg = await prisma.package.findUnique({
    where: { slug: "ladakh-expedition" }
  });
  if (!pkg) return null; // Handle gracefully
  ```

### 8. NextJS Hot-Reload Exhausting Connections
**Problem:** "Error: too many connections" during development.

**Solutions:**
- ✓ Already handled! The `lib/db.ts` file uses a singleton pattern
- ✓ Connections are reused across hot-reloads in development
- ✓ Don't create new PrismaClient instances directly

### 9. "Cannot find module @prisma/client"
**Problem:** Prisma Client types not generated.

**Solutions:**
- ✓ Run: `npm run db:generate`
- ✓ Or: `npx prisma generate`
- ✓ Check `node_modules/.prisma/client/` exists

### 10. API Routes Not Finding Database
**Problem:** API works locally but fails in production.

**Solutions:**
- ✓ Ensure `DATABASE_URL` is set in production environment
- ✓ Use environment variables, not hardcoded values
- ✓ Test with: `echo $DATABASE_URL` (should print connection string)
- ✓ For Vercel: Add `DATABASE_URL` and `DIRECT_URL` in Settings → Environment Variables

---

## Performance Tips

### 1. Use Indexes
Prisma schema already includes indexes on frequently queried fields:
```prisma
@@index([category])  // Speed up searches by category
@@index([featured])  // Speed up featured packages
@@index([userId])    // Speed up user lookups
```

### 2. Use `select` to fetch only needed fields
```typescript
// Bad: Gets all columns
const bookings = await prisma.booking.findMany();

// Good: Gets only what you need
const bookings = await prisma.booking.findMany({
  select: {
    id: true,
    startDate: true,
    totalPrice: true,
    package: { select: { title: true } }
  }
});
```

### 3. Batch queries when possible
```typescript
// Bad: N+1 queries
const packages = await prisma.package.findMany();
for (const pkg of packages) {
  const bookings = await prisma.booking.findMany({
    where: { packageId: pkg.id }
  });
}

// Good: One query with includes
const packages = await prisma.package.findMany({
  include: { bookings: true }
});
```

### 4. Use pagination for large datasets
```typescript
const packages = await prisma.package.findMany({
  skip: 0,
  take: 10,  // Return 10 results at a time
});
```

### 5. Monitor with Prisma Studio
```bash
npm run db:studio
# Opens http://localhost:5555
# See real-time query performance and data
```

---

## Verifying Setup

Run this to check if everything is connected:

```bash
# Check Prisma can reach the database
npx prisma db execute --stdin << 'EOF'
SELECT COUNT(*) FROM "Package";
EOF

# If you get a number, the connection works!
```

Or create a test script:

**File:** `scripts/test-db.ts`

```typescript
import { prisma } from "@/lib/db";

async function main() {
  console.log("🔍 Testing database connection...");
  
  try {
    const packageCount = await prisma.package.count();
    console.log(`✓ Database connected! Found ${packageCount} packages.`);
    
    const userCount = await prisma.user.count();
    console.log(`✓ Found ${userCount} users.`);
    
    const bookingCount = await prisma.booking.count();
    console.log(`✓ Found ${bookingCount} bookings.`);
  } catch (error) {
    console.error("✗ Database connection failed:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
```

Run with: `npx tsx scripts/test-db.ts`

---

## Need More Help?

- **Prisma Docs:** https://www.prisma.io/docs
- **Supabase Docs:** https://supabase.com/docs
- **Prisma Schema Reference:** https://www.prisma.io/docs/orm/reference/prisma-schema-reference
- **Check database logs:** Supabase Dashboard → Database → Logs
