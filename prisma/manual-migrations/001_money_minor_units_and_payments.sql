-- ─────────────────────────────────────────────────────────────────────────────
-- 001_money_minor_units_and_payments.sql
--
-- Brings the live database in line with the schema.prisma changes for CLAUDE.md
-- M2 (evolve Package/Booking money fields to minor units, add Payment/
-- WebhookEvent/Review) and A2 (GeneratedItinerary.approved/currency/totalPriceMinor).
-- NOT auto-applied — this project uses `prisma db push`
-- (no prisma/migrations history exists), and `db push` would run the naive
-- version of this diff:
--
--   ALTER TABLE "Booking" DROP COLUMN "totalPrice",
--   ADD COLUMN "totalPriceMinor" INTEGER NOT NULL;
--
-- which DROPS the existing rupee data with no backfill, and fails outright on
-- a non-empty table (NOT NULL with no default). This script instead adds the
-- new column, backfills it from the old one (×100, rupees → paise), THEN makes
-- it NOT NULL and drops the old column — safe against existing rows.
--
-- Run once, by hand, against DIRECT_URL (not the pooled DATABASE_URL — same
-- reason prisma migrations need it): e.g.
--   psql "$DIRECT_URL" -f prisma/manual-migrations/001_money_minor_units_and_payments.sql
-- or paste into the Supabase SQL editor. Wrapped in a transaction so it's
-- all-or-nothing. Take a fresh backup/snapshot first regardless — this is
-- real booking/pricing data.
-- ─────────────────────────────────────────────────────────────────────────────

BEGIN;

-- ── New enums ────────────────────────────────────────────────────────────
CREATE TYPE "Currency" AS ENUM ('INR', 'EUR', 'USD');
CREATE TYPE "PaymentProvider" AS ENUM ('STRIPE', 'RAZORPAY');
CREATE TYPE "PaymentStatus" AS ENUM ('CREATED', 'PENDING', 'SUCCEEDED', 'FAILED', 'REFUNDED', 'PARTIALLY_REFUNDED');

-- ── Extend BookingStatus (additive — safe on its own) ───────────────────────
-- Postgres can't add enum values inside the same transaction it uses them in
-- on PG < 12; Supabase runs PG 15+, so this is fine in one transaction here.
ALTER TYPE "BookingStatus" ADD VALUE 'AWAITING_PAYMENT';
ALTER TYPE "BookingStatus" ADD VALUE 'REFUNDED';

-- ── Package: priceFrom (rupees) → priceFromMinor (paise) ───────────────────
ALTER TABLE "Package" ADD COLUMN "priceFromMinor" INTEGER;
ALTER TABLE "Package" ADD COLUMN "currency" "Currency" NOT NULL DEFAULT 'INR';
UPDATE "Package" SET "priceFromMinor" = "priceFrom" * 100;
ALTER TABLE "Package" ALTER COLUMN "priceFromMinor" SET NOT NULL;
ALTER TABLE "Package" DROP COLUMN "priceFrom";

-- ── Booking: totalPrice (rupees) → totalPriceMinor (paise) ─────────────────
ALTER TABLE "Booking" ADD COLUMN "totalPriceMinor" INTEGER;
ALTER TABLE "Booking" ADD COLUMN "currency" "Currency" NOT NULL DEFAULT 'INR';
ALTER TABLE "Booking" ADD COLUMN "cancelledAt" TIMESTAMP(3);
UPDATE "Booking" SET "totalPriceMinor" = "totalPrice" * 100;
ALTER TABLE "Booking" ALTER COLUMN "totalPriceMinor" SET NOT NULL;
ALTER TABLE "Booking" DROP COLUMN "totalPrice";

-- ── GeneratedItinerary: A2 fields (all safe as plain ADD COLUMN — nullable or defaulted) ──
ALTER TABLE "GeneratedItinerary" ADD COLUMN "approved" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "GeneratedItinerary" ADD COLUMN "currency" "Currency" NOT NULL DEFAULT 'INR';
ALTER TABLE "GeneratedItinerary" ADD COLUMN "totalPriceMinor" INTEGER;

-- ── New tables ───────────────────────────────────────────────────────────
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "provider" "PaymentProvider" NOT NULL,
    "providerOrderId" TEXT,
    "providerPaymentId" TEXT,
    "amountMinor" INTEGER NOT NULL,
    "refundedMinor" INTEGER NOT NULL DEFAULT 0,
    "currency" "Currency" NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'CREATED',
    "failureReason" TEXT,
    "raw" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "WebhookEvent" (
    "id" TEXT NOT NULL,
    "provider" "PaymentProvider" NOT NULL,
    "providerEventId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "payload" JSONB NOT NULL,
    "processedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WebhookEvent_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "bookingId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "packageId" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Payment_providerPaymentId_key" ON "Payment"("providerPaymentId");
CREATE INDEX "Payment_bookingId_status_idx" ON "Payment"("bookingId", "status");
CREATE UNIQUE INDEX "WebhookEvent_providerEventId_key" ON "WebhookEvent"("providerEventId");
CREATE UNIQUE INDEX "Review_bookingId_key" ON "Review"("bookingId");
CREATE INDEX "Review_packageId_published_idx" ON "Review"("packageId", "published");

ALTER TABLE "Payment" ADD CONSTRAINT "Payment_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Review" ADD CONSTRAINT "Review_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "Booking"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "Review" ADD CONSTRAINT "Review_packageId_fkey" FOREIGN KEY ("packageId") REFERENCES "Package"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

COMMIT;

-- ── After running, verify before trusting it ────────────────────────────────
-- SELECT slug, "priceFromMinor", currency FROM "Package" LIMIT 5;
-- SELECT id, "totalPriceMinor", currency FROM "Booking" LIMIT 5;
-- Spot-check a couple of priceFromMinor/totalPriceMinor values against what
-- you remember the rupee prices being (×100).
