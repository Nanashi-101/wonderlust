-- ─────────────────────────────────────────────────────────────────────────────
-- 002_add_advertisement.sql
--
-- Adds the Advertisement model (homepage promo-image scroll gallery).
-- Applied by hand via psql because `prisma db push`/`migrate dev` hung
-- indefinitely against the Supabase Supavisor pooler from this machine
-- (TCP connects fine, no stuck locks/sessions found in pg_stat_activity/
-- pg_locks — looks like a client-side schema-engine issue, not a DB issue).
-- Purely additive (new table only), so safe to run directly:
--   psql "$DIRECT_URL" -f prisma/manual-migrations/002_add_advertisement.sql
-- ─────────────────────────────────────────────────────────────────────────────

BEGIN;

CREATE TABLE "Advertisement" (
    "id" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "imageKey" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Advertisement_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Advertisement_active_order_idx" ON "Advertisement"("active", "order");

COMMIT;
