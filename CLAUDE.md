# Wonderlust Expeditions — Engineering Agent Brief

> Drop this at the repo root as `CLAUDE.md` (or pass it with `claude --append-system-prompt`).
> It is the single source of truth for how work gets done on this codebase.
>
> **2026-09-03 reconciliation note:** this brief was originally drafted without full read access to the
> repo and assumed a greenfield backend (Auth.js v5, a `Tour`/`Destination` schema, no email yet). The
> repo has since moved ahead of that draft: **Kinde is already the auth provider** (working, in
> production), and the data model is **`Package`/`Booking`/`Inquiry`/`AdminUser`**, not `Tour`/`Destination`.
> Resend is already wired for inquiry emails. Sections below have been corrected in place to match what's
> actually in the repo — where a section still describes something unbuilt (payments, tests, Docker), it's
> still a forward-looking spec, adapted to the real schema/auth. Do not re-introduce Auth.js or rename
> `Package`→`Tour` — see the decisions recorded in §2/§4.

---

## 0. Ground rules — read before writing any code

1. **Never invent APIs.** If you are unsure how a library works (Next.js 16, Prisma 6, next-intl, Kinde, Stripe, Razorpay), read `node_modules/<pkg>/package.json` + the installed types, or ask. Do not guess method names.
2. **Verify before you claim.** Every task ends with `npm run lint && npm run typecheck && npm test && npm run build` passing. If a command doesn't exist yet, create it. Do not report "done" on unverified work.
3. **Small commits, one concern each.** Conventional commits: `feat:`, `fix:`, `chore:`, `test:`, `refactor:`, `docs:`.
4. **Never commit secrets.** `.env*` is gitignored except `.env.example`. If you add an env var, add it to `.env.example` and to `lib/env.ts` (see §4).
5. **Ask before destructive actions**: dropping tables, `prisma migrate reset`, force-pushing, rewriting existing working components.
6. **Server-first.** In the App Router, default to Server Components. Add `"use client"` only when you need state, effects, or browser APIs. Existing GSAP/Framer/Swiper components stay client — do not "optimise" them into server components.
7. **Do not regress the frontend.** The GSAP/Framer Motion/Swiper layer is the product's differentiator and is already good. Touch it only when the task explicitly says so.

### Next.js 16 specifics that will trip you up

- Route middleware lives in **`proxy.ts`**, not `middleware.ts`. This repo already has `proxy.ts` wired to `next-intl`. **Extend it — do not create `middleware.ts`.**
- `params` and `searchParams` in pages/layouts/route handlers are **Promises**. Always `const { locale } = await params;`.
- `cookies()`, `headers()`, and `draftMode()` are **async**. Always await them.
- Route handlers are not cached by default; opt in explicitly.

---

## 1. Project context

**Wonderlust Expeditions** — premium travel/adventure web app for Northern India (Kashmir, Ladakh, Manali, Rishikesh).

- **Live:** https://wanderlusttravels.fyi (Vercel)
- **Repo:** github.com/Nanashi-101/wonderlust
- **Stack:** Next.js 16 (App Router) · TypeScript · Tailwind CSS 4 · GSAP + Framer Motion · next-intl (en, hi, bn, pl, fr) · Radix + shadcn/ui · Swiper.js · Prisma · PostgreSQL (Supabase) · Cloudflare R2 · **Kinde** (auth) · **Resend** (email, inquiries only so far)

**Current state:** an excellent marketing/showcase frontend, with a working auth layer (Kinde), an admin panel (Super Admin-gated), a `Package`/`Booking`/`Inquiry` data model, R2 image upload, and inquiry-flow transactional email already shipped. Payments, booking-flow email, and automated tests are still absent.

**Goal of this engagement:** turn the showcase-plus-admin app that exists today into a revenue-generating booking platform, without degrading the frontend experience or re-doing the auth/admin/email work already done.

### Existing structure (respect it)

```
app/[locale]/           # locale-routed pages (admin/, bookings/, gallery/, packages/, packages/[packageId]/, packages/create/)
app/api/auth/           # Kinde routes: [kindeAuth]/ (login/logout/callback), creation/ (upserts User on first login)
app/api/upload/         # R2 image upload
components/ui/          # shadcn/ui primitives
i18n/                   # next-intl routing + request config
messages/               # en.json, hi.json, bn.json, pl.json, fr.json
lib/
  db.ts                  # Prisma client singleton
  r2.ts                  # Cloudflare R2 upload helpers
  package-utils.ts        # Zod schemas + helpers for Package
  auth/                   # Kinde-backed helpers: admin.ts (getCurrentAdmin, requireSuperAdmin)
  email/                  # Resend: client.ts, config.ts, send.ts, admin.ts/inquiries.tsx (React Email), recipients.ts, templates/
  actions/                # Next.js Server Actions: admin.ts, inquiries.ts, packages.ts (this is the established mutation
                           # pattern here — prefer a Server Action over a new route handler unless the client needs a
                           # fetch()-able endpoint, e.g. a payment-provider checkout call)
prisma/                 # schema.prisma (Package/Booking/Inquiry/AdminUser/User/GeneratedItinerary) + seed.ts
proxy.ts                # Next 16 middleware — next-intl only today; Kinde auth is enforced per-route/per-server-action
                         # via getCurrentAdmin()/requireSuperAdmin(), not via proxy.ts
```

### Target additions (add, don't reshuffle; don't rename `Package`→`Tour`)

```
app/[locale]/(shop)/          # checkout, booking confirmation — packages/ already covers listing/detail
app/[locale]/(account)/       # my-bookings, profile (login/register are Kinde-hosted, not local pages)
app/api/
  checkout/stripe/
  checkout/razorpay/
  webhooks/stripe/
  webhooks/razorpay/
  chat/
  itinerary/
lib/
  env.ts         rate-limit.ts
  payments/      ai/          validators/
tests/
  unit/          integration/  e2e/
docker/
  Dockerfile     docker-compose.yml    docker-compose.prod.yml
```

---

## 2. Priority ladder

Work strictly top-down. Do not start a MUST-tier item's successor until the previous one is merged and green.

### 🔴 MUST — blocks revenue

| # | Item | Why |
|---|------|-----|
| M1 | Env validation + secrets hygiene | Everything downstream depends on it |
| M2 | Evolve schema: money → minor units on `Package`/`Booking`, add `Payment`/`WebhookEvent`/`Review` | No payment-safe data model = no bookings |
| M3 | ~~Auth.js v5~~ **Done via Kinde** — add `requireUser()`/booking-owner checks on top of it | Can't take money from anonymous users |
| M4 | Packages booking flow (extend existing `Package`/`Booking`) | The core transaction |
| M5 | **Payment gateway: Stripe (intl) + Razorpay (India)** | The revenue engine |
| M6 | Webhooks + idempotency | Without this you *will* lose or double-charge orders |
| M7 | Transactional email (Resend) | Legal + trust requirement for bookings |
| M8 | Test suite + CI | Payments code without tests is negligence |

### 🟡 SHOULD — operational maturity

| # | Item |
|---|------|
| S1 | ~~Admin dashboard~~ **Package CRUD + R2 upload done.** Remaining: bookings table with filters + refund action, revenue overview |
| S2 | Sentry error tracking + structured logging |
| S3 | SEO: per-package metadata, JSON-LD `TouristTrip`, sitemap, hreflang for all 5 locales |
| S4 | Caching/ISR for package pages; R2-backed image pipeline (upload already exists — add caching/optimisation) |
| S5 | Rate limiting on auth, checkout, chat, itinerary endpoints |
| S6 | **Docker** — local dev parity + portable prod image |
| S7 | Accessibility pass (Radix helps; verify focus traps, reduced-motion for GSAP) |

### 🟢 MAYBE — differentiation

| # | Item |
|---|------|
| A1 | AI chatbot (Vercel AI SDK + RAG over package data) |
| A2 | AI itinerary generation (`GeneratedItinerary` model already exists — wire structured output → draft → human approval) |
| A3 | Reviews + ratings (verified-booking-gated) |
| A4 | Real-time booking notifications (Pusher) |
| A5 | Advanced filters/search (difficulty, altitude, season, budget) |
| A6 | Mobile app |

---

## 3. Standing acceptance criteria (every task)

A task is **not done** unless all of these hold:

- [ ] `npm run lint` clean, `npm run typecheck` clean (no `any`, no `@ts-ignore` without a comment explaining why)
- [ ] `npm test` green; new code has tests (see §7 for the required cases)
- [ ] `npm run build` succeeds
- [ ] All user-facing strings added to **all five** `messages/*.json` — never hardcode English in JSX
- [ ] Money handled as **integer minor units** (paise/cents), never floats
- [ ] Every API route validates input with Zod and returns typed errors
- [ ] Every DB write that touches money runs inside a transaction
- [ ] No secret, key, or token in client bundles (`NEXT_PUBLIC_` only for genuinely public values)
- [ ] `.env.example` and `lib/env.ts` updated if env vars changed
- [ ] Short summary of what changed + what you verified

---

## 4. Task specs

### M1 — Env validation

Create `lib/env.ts` using Zod. Parse `process.env` at module load; fail fast at build/boot with a readable message listing missing vars. Split server vs client schemas. Never import server env into a client component.

**Already in `.env.example` today** — the real var names in this repo, use these exactly (not the `AUTH_*`/`R2_*` placeholders an Auth.js/generic setup would use):

```
DATABASE_URL
DIRECT_URL
KINDE_CLIENT_ID
KINDE_CLIENT_SECRET
KINDE_ISSUER_URL
KINDE_SITE_URL
KINDE_POST_LOGIN_REDIRECT_URL       # optional
KINDE_POST_LOGOUT_REDIRECT_URL      # optional
CLOUDFLARE_R2_ACCOUNT_ID
CLOUDFLARE_R2_ACCESS_KEY_ID
CLOUDFLARE_R2_SECRET_ACCESS_KEY
CLOUDFLARE_R2_BUCKET_NAME
CLOUDFLARE_R2_PUBLIC_DOMAIN
NEXT_PUBLIC_R2_PUBLIC_URL
RESEND_API_KEY                      # optional — email no-ops with a warning if unset
EMAIL_REPLY_TO                      # optional
ADMIN_ALERT_TO                      # optional
```

**Still to add, as each M-item lands** (M5/M6 payments, S2 Sentry, S5 rate limiting, A1/A2 AI):

```
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
RAZORPAY_KEY_ID
RAZORPAY_KEY_SECRET
RAZORPAY_WEBHOOK_SECRET
NEXT_PUBLIC_RAZORPAY_KEY_ID
SENTRY_DSN
OPENAI_API_KEY            # or ANTHROPIC_API_KEY
UPSTASH_REDIS_REST_URL UPSTASH_REDIS_REST_TOKEN
NEXT_PUBLIC_SITE_URL
```

Do not add `AUTH_SECRET`/`AUTH_URL` — there is no Auth.js in this repo.

### M2 — Data model

Do **not** replace the schema with the `Tour`/`Destination` design in §5 — that section is kept only as a
reference for the *shape* of `Payment`/`WebhookEvent`/`Review`, field-name-adapted below. Evolve the real
schema (`Package`, `Booking`, `Inquiry`, `AdminUser`, `User`, `GeneratedItinerary`) in place:

- **Money migration (breaking, needs a real migration + backfill):** `Package.priceFrom` and `Booking.totalPrice`
  are currently `Int` **rupees**. Payment gateways need minor units (paise). Either rename them to
  `priceFromMinor`/`totalPriceMinor` and multiply existing data ×100 in the migration, or add new
  `*Minor` columns alongside and cut over — pick one, don't leave both meanings ambiguous under the same
  field name. Add a `currency` field (`Currency` enum: `INR` for now; `EUR`/`USD` when Stripe lands) —
  default `INR`, since every existing row is rupees today.
- Add `Payment` and `WebhookEvent` models per the shapes in §5, but `Payment.bookingId` → `Booking` (not `Tour`),
  and drop `PaymentProvider`/`PaymentStatus`/`Currency` enum bodies from §5 as reference only — define them once,
  here, not duplicated.
- Add `Review`, keyed off `Booking` (not `Tour`) + `Package` — same `bookingId @unique` verified-booking gate.
- Extend `BookingStatus` (currently `PENDING | CONFIRMED | CANCELLED | COMPLETED`) to add `AWAITING_PAYMENT` and
  `REFUNDED` — do not remove the existing values, other code already depends on them.
- `User`/`AdminUser` stay as-is — they mirror Kinde, don't add `Account`/`Session`/`VerificationToken`/`Role`
  tables from §5, Kinde owns that state, not Prisma.
- If/when a real per-departure capacity model is needed (S-tier, not required for M2), add a `Departure` model
  per §5's shape, `packageId` not `tourId`.
- Keep `translations: Json?` on `Package` as-is for now — migrating to a `PackageTranslation` table is a
  separate, non-payment-blocking refactor; don't bundle it into the money migration.
- Generate a real migration (`prisma migrate dev --name <name>`), never hand-edit `schema.prisma` and expect
  the DB to follow.

### M3 — Auth

**Already done, via Kinde** (`@kinde-oss/kinde-auth-nextjs`) — do not introduce Auth.js. What exists:

- `app/api/auth/[kindeAuth]/route.ts` — Kinde's hosted login/register/logout/callback.
- `app/api/auth/creation/route.ts` — on first login, upserts the Kinde user into the local `User` table
  (id = Kinde user id).
- `lib/auth/admin.ts` — `getCurrentAdmin()` (returns `AdminUser | null` for the current session, matched by
  email) and `requireSuperAdmin()` (same, but only for `role === "SUPER_ADMIN"`). The admin panel is
  Super-Admin-only by design — don't loosen that without asking.

**Still to add for the booking/checkout flow** (regular customers, not admins):

- A `requireUser()`-equivalent server helper (new, e.g. in `lib/auth/user.ts`) that wraps
  `getKindeServerSession()` the same way `getCurrentAdmin()` does, and looks up/creates the local `User` row —
  reuse the upsert shape from `app/api/auth/creation/route.ts` rather than inventing a new one.
- Route/Server-Action-level ownership checks (`booking.userId === user.id` or admin) — there is no
  `proxy.ts`-level route protection today (`proxy.ts` only runs next-intl); keep it that way and gate
  `/[locale]/checkout/*`, `/[locale]/bookings/*` per-page/per-action via Kinde's `isAuthenticated()` /
  `getCurrentAdmin()`, consistent with how `/[locale]/admin` is already gated. **Never** trust a role or
  user id sent from the client.

### M4 — Packages + booking flow

`lib/actions/packages.ts` already has admin-only Server Actions for package CRUD (`createPackageAction`, gated
by `getCurrentAdmin()`) — extend that file for further package mutations rather than adding a parallel
`/api/tours` route tree. Reads (listing/detail pages) already exist under `app/[locale]/packages/`.

New work for the booking flow — Server Actions unless the client needs a plain `fetch()` (payment checkout
does; booking creation itself doesn't have to):

```
createBookingAction(input)        auth required → creates PENDING booking, server-computed totalPriceMinor
getMyBookingsAction()             current user's bookings
getBookingAction(id)              owner or admin only
cancelBookingAction(id)           policy-gated
```

**Non-negotiable:** the server recomputes the total from the DB (`Package.priceFromMinor × guests`, or a
`Departure` override once that model exists). A client-supplied price is only ever used to *detect
tampering*, never to charge.

Also enforce: `startDate` in the future, `guests ≥ 1`, remaining capacity check inside the transaction that
creates the booking (capacity itself is future work — §M2's optional `Departure` model — until then, cap
only on `guests ≥ 1` and a sane upper bound).

### M5/M6 — Payments

See §6 for boilerplate. Design rules:

- One provider-agnostic interface, two adapters (`stripe.ts`, `razorpay.ts`), selected by the booking's currency/region — INR → Razorpay, everything else → Stripe.
- **The webhook is the source of truth for payment success**, never the browser redirect.
- Verify signatures on every webhook. Reject unsigned/invalid with 400 before parsing.
- Idempotency: persist `WebhookEvent(providerEventId @unique)`; if it exists, return 200 and stop.
- Booking state machine, enforced in code: `PENDING → AWAITING_PAYMENT → CONFIRMED → COMPLETED`, with `CANCELLED` / `REFUNDED` as terminal branches. Illegal transitions throw.
- Stripe route handler must read the **raw body** (`await req.text()`), not parsed JSON.
- Capacity is decremented in the same transaction that marks the booking `CONFIRMED`.

### M7 — Email (Resend)

Resend is already wired (`lib/email/`: `client.ts`, `config.ts`, `send.ts`, `recipients.ts`, React Email
templates) and shipping inquiry-flow email (confirmation, admin alert, reply notification) — follow that
existing structure/patterns, don't set up Resend from scratch. Add booking-flow templates: booking
confirmation, payment receipt, cancellation/refund, pre-departure reminder (T-5 days, via Vercel Cron), admin
new-booking alert. Localised by the booking's locale. Email failure must **never** roll back a successful
payment — enqueue/log and continue (same failure-isolation approach already used for inquiry email).

### S1 — Admin dashboard

`/[locale]/admin` — package CRUD with R2 image upload, and Super-Admin gating via `requireSuperAdmin()`, are
**already built**. Remaining: bookings table with filters + refund action, revenue/conversion overview.
Reuse the existing `AdminDashboardShell` and admin Server Action patterns (`lib/actions/admin.ts`) rather than
introducing TanStack Table unless the existing table approach can't handle it.

### S3 — SEO

`generateMetadata` per package with OG images; JSON-LD `TouristTrip` / `Product` + `Offer`; `app/sitemap.ts`
covering every package × every locale; `hreflang` alternates; canonical URLs on `wanderlusttravels.fyi`.

### S5 — Rate limiting

Upstash Redis sliding window in `lib/rate-limit.ts`. Login 5/min/IP, register 3/hr/IP, checkout 10/min/user, chat 20/min/user, itinerary generation 5/hr/user. Return `429` with `Retry-After`.

### A1/A2 — AI features

- **Vercel AI SDK**, streaming responses.
- Chatbot: system prompt scoped to Wonderlust; retrieve relevant tours from the DB and inject as context (RAG). It may **quote prices from the DB** but must never invent tours, dates, or discounts. Explicit refusal path: booking changes and refunds → hand off to a human.
- Itinerary generator: structured output (Zod schema) → produces a **draft** that is priced from real DB tour components and requires human/admin approval before it can be booked. Never let the model set the final price.
- Log token usage per user; rate limit hard (see S5).

---

## 5. Prisma schema — reference shapes only (not a drop-in replacement)

> **This block predates reading the real schema and does not match it.** The real schema is
> `Package`/`Booking`/`Inquiry`/`AdminUser`/`User`/`GeneratedItinerary` (see `prisma/schema.prisma`), prices
> today are plain rupee `Int`s, and auth/session state lives in Kinde, not `Account`/`Session`/
> `VerificationToken` tables. **Do not paste this block in over the real schema.** Use it only for the field
> shapes of the models M2 says to *add* — `Payment`, `WebhookEvent`, `Review`, optionally `Departure` — and
> apply §M2's field-name mapping (`Tour`→`Package`, `tourId`→`packageId`, `priceMinor`→`priceFromMinor`,
> `totalMinor`→`totalPriceMinor`) as you do. Ignore `User`, `Account`, `Session`, `VerificationToken`,
> `Destination`, `DestinationTranslation`, `Tour`, `TourTranslation`, and the `Role` enum below entirely —
> they don't apply to this repo.

```prisma
// prisma/schema.prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

enum Role            { CUSTOMER AGENT ADMIN }
enum Difficulty      { EASY MODERATE HARD EXPEDITION }
enum BookingStatus   { PENDING AWAITING_PAYMENT CONFIRMED COMPLETED CANCELLED REFUNDED }
enum PaymentStatus   { CREATED PENDING SUCCEEDED FAILED REFUNDED PARTIALLY_REFUNDED }
enum PaymentProvider { STRIPE RAZORPAY }
enum Currency        { INR EUR USD }

model User {
  id            String    @id @default(cuid())
  email         String    @unique
  emailVerified DateTime?
  name          String?
  phone         String?
  passwordHash  String?
  image         String?
  role          Role      @default(CUSTOMER)
  locale        String    @default("en")
  accounts      Account[]
  sessions      Session[]
  bookings      Booking[]
  reviews       Review[]
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt

  @@index([role])
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String?
  access_token      String?
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String?
  session_state     String?
  user              User    @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
}

model Destination {
  id           String                   @id @default(cuid())
  slug         String                   @unique   // kashmir, ladakh, manali, rishikesh
  region       String
  heroImage    String?
  lat          Float?
  lng          Float?
  tours        Tour[]
  translations DestinationTranslation[]
  createdAt    DateTime                 @default(now())
  updatedAt    DateTime                 @updatedAt
}

model DestinationTranslation {
  id            String      @id @default(cuid())
  destinationId String
  locale        String                              // en hi bn pl fr
  name          String
  description   String      @db.Text
  destination   Destination @relation(fields: [destinationId], references: [id], onDelete: Cascade)

  @@unique([destinationId, locale])
}

model Tour {
  id              String            @id @default(cuid())
  slug            String            @unique
  destinationId   String
  priceMinor      Int                                 // paise / cents — NEVER a float
  currency        Currency          @default(INR)
  durationDays    Int
  difficulty      Difficulty
  maxParticipants Int
  minAge          Int?
  maxAltitudeM    Int?
  seasonStart     Int?                                // month 1-12
  seasonEnd       Int?
  images          String[]                            // R2 keys
  published       Boolean           @default(false)
  deletedAt       DateTime?                           // soft delete
  destination     Destination       @relation(fields: [destinationId], references: [id])
  translations    TourTranslation[]
  departures      Departure[]
  bookings        Booking[]
  reviews         Review[]
  createdAt       DateTime          @default(now())
  updatedAt       DateTime          @updatedAt

  @@index([destinationId, published])
  @@index([difficulty, priceMinor])
}

model TourTranslation {
  id          String   @id @default(cuid())
  tourId      String
  locale      String
  title       String
  summary     String   @db.Text
  description String   @db.Text
  itinerary   Json                                    // [{ day, title, detail }]
  inclusions  String[]
  exclusions  String[]
  tour        Tour     @relation(fields: [tourId], references: [id], onDelete: Cascade)

  @@unique([tourId, locale])
}

model Departure {
  id            String    @id @default(cuid())
  tourId        String
  startDate     DateTime
  endDate       DateTime
  seatsTotal    Int
  seatsBooked   Int       @default(0)
  priceMinor    Int?                                  // optional seasonal override
  tour          Tour      @relation(fields: [tourId], references: [id], onDelete: Cascade)
  bookings      Booking[]

  @@index([tourId, startDate])
}

model Booking {
  id            String        @id @default(cuid())
  reference     String        @unique                 // WL-2026-000123, human-facing
  userId        String
  tourId        String
  departureId   String?
  participants  Int
  totalMinor    Int                                   // server-computed, authoritative
  currency      Currency
  status        BookingStatus @default(PENDING)
  locale        String        @default("en")
  contactEmail  String
  contactPhone  String?
  notes         String?       @db.Text
  cancelledAt   DateTime?
  user          User          @relation(fields: [userId], references: [id])
  tour          Tour          @relation(fields: [tourId], references: [id])
  departure     Departure?    @relation(fields: [departureId], references: [id])
  payments      Payment[]
  review        Review?
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt

  @@index([userId, status])
  @@index([status, createdAt])
}

model Payment {
  id                String          @id @default(cuid())
  bookingId         String
  provider          PaymentProvider
  providerOrderId   String?                           // Stripe session / Razorpay order
  providerPaymentId String?         @unique
  amountMinor       Int
  refundedMinor     Int             @default(0)
  currency          Currency
  status            PaymentStatus   @default(CREATED)
  failureReason     String?
  raw               Json?                             // last provider payload, for audit
  booking           Booking         @relation(fields: [bookingId], references: [id])
  createdAt         DateTime        @default(now())
  updatedAt         DateTime        @updatedAt

  @@index([bookingId, status])
}

model WebhookEvent {
  id              String          @id @default(cuid())
  provider        PaymentProvider
  providerEventId String          @unique             // idempotency key
  type            String
  payload         Json
  processedAt     DateTime?
  createdAt       DateTime        @default(now())
}

model Review {
  id        String   @id @default(cuid())
  bookingId String   @unique                          // verified bookings only
  userId    String
  tourId    String
  rating    Int                                       // 1-5, validate in app layer
  comment   String?  @db.Text
  published Boolean  @default(false)
  booking   Booking  @relation(fields: [bookingId], references: [id])
  user      User     @relation(fields: [userId], references: [id])
  tour      Tour     @relation(fields: [tourId], references: [id])
  createdAt DateTime @default(now())

  @@index([tourId, published])
}
```

---

## 6. Payment boilerplate

> Same caveat as §5: the code below was written against the aspirational `Tour`/`Payment.bookingId → Tour`
> shape. `zod` is already installed; `stripe`/`razorpay` are not. When implementing, adapt every
> `booking.tour` / `tour.translations` / `tourId` reference to `booking.package` / the `Package.translations`
> `Json?` blob / `packageId`, and every `*Minor` field name per §M2's mapping. `requireUser` doesn't exist
> yet — it's the helper §M3 says to add in `lib/auth/user.ts`, not an import from `@/lib/auth` (that path
> doesn't exist; the real module is `lib/auth/admin.ts`).

Install:

```bash
npm i stripe razorpay
```

### 6.1 Money helpers — `lib/payments/money.ts`

```ts
export type Currency = "INR" | "EUR" | "USD";

/** Every currency we support has 2 minor units. Revisit if JPY/KWD are added. */
export const MINOR_UNITS: Record<Currency, number> = { INR: 100, EUR: 100, USD: 100 };

export function toMinor(amount: number, currency: Currency): number {
  return Math.round(amount * MINOR_UNITS[currency]);
}

export function fromMinor(minor: number, currency: Currency): number {
  return minor / MINOR_UNITS[currency];
}

export function formatMoney(minor: number, currency: Currency, locale: string): string {
  return new Intl.NumberFormat(locale, { style: "currency", currency })
    .format(fromMinor(minor, currency));
}

/** Never trust a client price. This only detects tampering. */
export function assertPriceMatches(clientMinor: number, serverMinor: number): void {
  if (clientMinor !== serverMinor) {
    throw new Error(`PRICE_MISMATCH: client=${clientMinor} server=${serverMinor}`);
  }
}
```

### 6.2 Provider interface — `lib/payments/provider.ts`

```ts
import type { Currency } from "./money";

export interface CheckoutInput {
  bookingId: string;
  bookingReference: string;
  amountMinor: number;
  currency: Currency;
  customerEmail: string;
  locale: string;
  description: string;
}

export interface CheckoutSession {
  provider: "STRIPE" | "RAZORPAY";
  providerOrderId: string;
  /** Stripe: hosted URL to redirect to. Razorpay: null — the client opens the SDK modal. */
  redirectUrl: string | null;
  /** Razorpay needs these client-side to open Checkout. */
  clientPayload?: Record<string, unknown>;
}

export interface RefundInput {
  providerPaymentId: string;
  amountMinor: number;
  reason?: string;
}

export interface PaymentProviderAdapter {
  readonly name: "STRIPE" | "RAZORPAY";
  createCheckout(input: CheckoutInput): Promise<CheckoutSession>;
  verifyWebhook(rawBody: string, headers: Headers): Promise<VerifiedEvent>;
  refund(input: RefundInput): Promise<{ refundId: string; refundedMinor: number }>;
}

export interface VerifiedEvent {
  providerEventId: string;
  type: string;
  bookingId?: string;
  providerPaymentId?: string;
  amountMinor?: number;
  status: "SUCCEEDED" | "FAILED" | "REFUNDED" | "IGNORED";
  raw: unknown;
}

/** INR settles far cheaper through Razorpay; everything else goes to Stripe. */
export function pickProvider(currency: Currency): "STRIPE" | "RAZORPAY" {
  return currency === "INR" ? "RAZORPAY" : "STRIPE";
}
```

### 6.3 Stripe adapter — `lib/payments/stripe.ts`

```ts
import Stripe from "stripe";
import { env } from "@/lib/env";
import type {
  PaymentProviderAdapter, CheckoutInput, CheckoutSession, VerifiedEvent, RefundInput,
} from "./provider";

export const stripe = new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: "2025-08-27.basil", // pin; bump deliberately
  typescript: true,
});

export const stripeAdapter: PaymentProviderAdapter = {
  name: "STRIPE",

  async createCheckout(input: CheckoutInput): Promise<CheckoutSession> {
    const session = await stripe.checkout.sessions.create(
      {
        mode: "payment",
        customer_email: input.customerEmail,
        locale: input.locale as Stripe.Checkout.SessionCreateParams.Locale,
        client_reference_id: input.bookingId,
        metadata: { bookingId: input.bookingId, reference: input.bookingReference },
        payment_intent_data: { metadata: { bookingId: input.bookingId } },
        line_items: [{
          quantity: 1,
          price_data: {
            currency: input.currency.toLowerCase(),
            unit_amount: input.amountMinor,
            product_data: { name: input.description },
          },
        }],
        success_url: `${env.NEXT_PUBLIC_SITE_URL}/${input.locale}/booking/${input.bookingReference}?paid=1`,
        cancel_url:  `${env.NEXT_PUBLIC_SITE_URL}/${input.locale}/checkout/${input.bookingId}?cancelled=1`,
        expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
      },
      // Retry-safe: same booking never creates two charges.
      { idempotencyKey: `checkout_${input.bookingId}` },
    );

    return {
      provider: "STRIPE",
      providerOrderId: session.id,
      redirectUrl: session.url,
    };
  },

  async verifyWebhook(rawBody: string, headers: Headers): Promise<VerifiedEvent> {
    const signature = headers.get("stripe-signature");
    if (!signature) throw new Error("MISSING_SIGNATURE");

    const event = stripe.webhooks.constructEvent(
      rawBody, signature, env.STRIPE_WEBHOOK_SECRET,
    );

    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object as Stripe.Checkout.Session;
        return {
          providerEventId: event.id,
          type: event.type,
          bookingId: s.metadata?.bookingId,
          providerPaymentId: typeof s.payment_intent === "string" ? s.payment_intent : undefined,
          amountMinor: s.amount_total ?? undefined,
          status: s.payment_status === "paid" ? "SUCCEEDED" : "FAILED",
          raw: event,
        };
      }
      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent;
        return {
          providerEventId: event.id,
          type: event.type,
          bookingId: pi.metadata?.bookingId,
          providerPaymentId: pi.id,
          status: "FAILED",
          raw: event,
        };
      }
      case "charge.refunded": {
        const c = event.data.object as Stripe.Charge;
        return {
          providerEventId: event.id,
          type: event.type,
          providerPaymentId: typeof c.payment_intent === "string" ? c.payment_intent : undefined,
          amountMinor: c.amount_refunded,
          status: "REFUNDED",
          raw: event,
        };
      }
      default:
        return { providerEventId: event.id, type: event.type, status: "IGNORED", raw: event };
    }
  },

  async refund({ providerPaymentId, amountMinor, reason }: RefundInput) {
    const refund = await stripe.refunds.create(
      { payment_intent: providerPaymentId, amount: amountMinor, reason: "requested_by_customer",
        metadata: { note: reason ?? "" } },
      { idempotencyKey: `refund_${providerPaymentId}_${amountMinor}` },
    );
    return { refundId: refund.id, refundedMinor: refund.amount };
  },
};
```

### 6.4 Razorpay adapter — `lib/payments/razorpay.ts`

```ts
import Razorpay from "razorpay";
import crypto from "node:crypto";
import { env } from "@/lib/env";
import type {
  PaymentProviderAdapter, CheckoutInput, CheckoutSession, VerifiedEvent, RefundInput,
} from "./provider";

export const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
});

export const razorpayAdapter: PaymentProviderAdapter = {
  name: "RAZORPAY",

  async createCheckout(input: CheckoutInput): Promise<CheckoutSession> {
    const order = await razorpay.orders.create({
      amount: input.amountMinor,          // already in paise
      currency: input.currency,
      receipt: input.bookingReference,     // max 40 chars
      notes: { bookingId: input.bookingId },
      payment_capture: true,
    });

    return {
      provider: "RAZORPAY",
      providerOrderId: order.id,
      redirectUrl: null,                   // client opens the Razorpay modal
      clientPayload: {
        key: env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        order_id: order.id,
        amount: order.amount,
        currency: order.currency,
        name: "Wonderlust Expeditions",
        description: input.description,
        prefill: { email: input.customerEmail },
        notes: { bookingId: input.bookingId },
      },
    };
  },

  async verifyWebhook(rawBody: string, headers: Headers): Promise<VerifiedEvent> {
    const signature = headers.get("x-razorpay-signature");
    if (!signature) throw new Error("MISSING_SIGNATURE");

    const expected = crypto
      .createHmac("sha256", env.RAZORPAY_WEBHOOK_SECRET)
      .update(rawBody)
      .digest("hex");

    // Timing-safe compare — never use ===
    const ok =
      expected.length === signature.length &&
      crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
    if (!ok) throw new Error("INVALID_SIGNATURE");

    const event = JSON.parse(rawBody);
    const entity = event.payload?.payment?.entity;

    switch (event.event) {
      case "payment.captured":
        return {
          providerEventId: headers.get("x-razorpay-event-id") ?? `${entity.id}:captured`,
          type: event.event,
          bookingId: entity.notes?.bookingId,
          providerPaymentId: entity.id,
          amountMinor: entity.amount,
          status: "SUCCEEDED",
          raw: event,
        };
      case "payment.failed":
        return {
          providerEventId: headers.get("x-razorpay-event-id") ?? `${entity.id}:failed`,
          type: event.event,
          bookingId: entity.notes?.bookingId,
          providerPaymentId: entity.id,
          status: "FAILED",
          raw: event,
        };
      case "refund.processed": {
        const refund = event.payload.refund.entity;
        return {
          providerEventId: headers.get("x-razorpay-event-id") ?? `${refund.id}:refunded`,
          type: event.event,
          providerPaymentId: refund.payment_id,
          amountMinor: refund.amount,
          status: "REFUNDED",
          raw: event,
        };
      }
      default:
        return {
          providerEventId: headers.get("x-razorpay-event-id") ?? crypto.randomUUID(),
          type: event.event,
          status: "IGNORED",
          raw: event,
        };
    }
  },

  async refund({ providerPaymentId, amountMinor, reason }: RefundInput) {
    const refund = await razorpay.payments.refund(providerPaymentId, {
      amount: amountMinor,
      speed: "normal",
      notes: { reason: reason ?? "" },
    });
    return { refundId: refund.id, refundedMinor: Number(refund.amount) };
  },
};
```

### 6.5 Shared webhook handler — `lib/payments/handle-event.ts`

```ts
import { db } from "@/lib/db";
import type { VerifiedEvent } from "./provider";
import { BookingStatus, PaymentStatus, PaymentProvider } from "@prisma/client";

/**
 * Idempotent. Safe to call twice with the same event — providers WILL retry.
 * The webhook, not the browser redirect, is the source of truth.
 */
export async function handlePaymentEvent(
  provider: PaymentProvider,
  event: VerifiedEvent,
): Promise<{ handled: boolean; reason?: string }> {
  if (event.status === "IGNORED") return { handled: false, reason: "unhandled_type" };

  const existing = await db.webhookEvent.findUnique({
    where: { providerEventId: event.providerEventId },
  });
  if (existing?.processedAt) return { handled: false, reason: "duplicate" };

  return db.$transaction(async (tx) => {
    await tx.webhookEvent.upsert({
      where:  { providerEventId: event.providerEventId },
      create: {
        provider,
        providerEventId: event.providerEventId,
        type: event.type,
        payload: event.raw as object,
      },
      update: {},
    });

    if (event.status === "SUCCEEDED" && event.bookingId) {
      const booking = await tx.booking.findUnique({
        where: { id: event.bookingId },
        include: { departure: true },
      });
      if (!booking) throw new Error(`BOOKING_NOT_FOUND: ${event.bookingId}`);

      // Amount tampering check — the provider must have charged what we asked for.
      if (event.amountMinor != null && event.amountMinor !== booking.totalMinor) {
        throw new Error(
          `AMOUNT_MISMATCH: expected=${booking.totalMinor} got=${event.amountMinor}`,
        );
      }

      // Already confirmed by an earlier delivery of this event — nothing to do.
      if (booking.status === BookingStatus.CONFIRMED) {
        await tx.webhookEvent.update({
          where: { providerEventId: event.providerEventId },
          data: { processedAt: new Date() },
        });
        return { handled: true, reason: "already_confirmed" };
      }

      await tx.payment.updateMany({
        where: { bookingId: booking.id, status: { in: [PaymentStatus.CREATED, PaymentStatus.PENDING] } },
        data: {
          status: PaymentStatus.SUCCEEDED,
          providerPaymentId: event.providerPaymentId,
          raw: event.raw as object,
        },
      });

      await tx.booking.update({
        where: { id: booking.id },
        data: { status: BookingStatus.CONFIRMED },
      });

      // Seats are committed only once payment is real.
      if (booking.departureId) {
        const updated = await tx.departure.updateMany({
          where: {
            id: booking.departureId,
            seatsBooked: { lte: booking.departure!.seatsTotal - booking.participants },
          },
          data: { seatsBooked: { increment: booking.participants } },
        });
        if (updated.count === 0) throw new Error("CAPACITY_EXCEEDED_AFTER_PAYMENT");
      }
    }

    if (event.status === "FAILED" && event.bookingId) {
      await tx.payment.updateMany({
        where: { bookingId: event.bookingId },
        data: { status: PaymentStatus.FAILED, providerPaymentId: event.providerPaymentId },
      });
      await tx.booking.update({
        where: { id: event.bookingId },
        data: { status: BookingStatus.PENDING },
      });
    }

    if (event.status === "REFUNDED" && event.providerPaymentId) {
      const payment = await tx.payment.findUnique({
        where: { providerPaymentId: event.providerPaymentId },
      });
      if (payment) {
        const refunded = payment.refundedMinor + (event.amountMinor ?? 0);
        await tx.payment.update({
          where: { id: payment.id },
          data: {
            refundedMinor: refunded,
            status: refunded >= payment.amountMinor
              ? PaymentStatus.REFUNDED
              : PaymentStatus.PARTIALLY_REFUNDED,
          },
        });
        await tx.booking.update({
          where: { id: payment.bookingId },
          data: { status: BookingStatus.REFUNDED },
        });
      }
    }

    await tx.webhookEvent.update({
      where: { providerEventId: event.providerEventId },
      data: { processedAt: new Date() },
    });

    return { handled: true };
  });
}
```

### 6.6 Route handlers

```ts
// app/api/webhooks/stripe/route.ts
import { stripeAdapter } from "@/lib/payments/stripe";
import { handlePaymentEvent } from "@/lib/payments/handle-event";

export const runtime = "nodejs";      // NOT edge — needs crypto + Prisma
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  const rawBody = await req.text();   // MUST be raw, never req.json()
  try {
    const event = await stripeAdapter.verifyWebhook(rawBody, req.headers);
    await handlePaymentEvent("STRIPE", event);
    return new Response(null, { status: 200 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    // 400 = don't retry (bad signature). 500 = please retry (our bug).
    const status = message.includes("SIGNATURE") ? 400 : 500;
    console.error("[stripe-webhook]", message);
    return new Response(JSON.stringify({ error: message }), { status });
  }
}
```

```ts
// app/api/webhooks/razorpay/route.ts — same shape, razorpayAdapter, "RAZORPAY"
```

```ts
// app/api/checkout/route.ts
import { z } from "zod";
import { requireUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { pickProvider } from "@/lib/payments/provider";
import { stripeAdapter } from "@/lib/payments/stripe";
import { razorpayAdapter } from "@/lib/payments/razorpay";
import { checkRateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const Body = z.object({
  bookingId: z.string().cuid(),
  locale: z.enum(["en", "hi", "bn", "pl", "fr"]).default("en"),
});

export async function POST(req: Request) {
  const user = await requireUser();
  await checkRateLimit(`checkout:${user.id}`, { limit: 10, windowSec: 60 });

  const parsed = Body.safeParse(await req.json());
  if (!parsed.success) {
    return Response.json({ error: "INVALID_INPUT", issues: parsed.error.issues }, { status: 400 });
  }

  const booking = await db.booking.findUnique({
    where: { id: parsed.data.bookingId },
    include: { tour: { include: { translations: true } } },
  });

  if (!booking) return Response.json({ error: "NOT_FOUND" }, { status: 404 });
  if (booking.userId !== user.id) return Response.json({ error: "FORBIDDEN" }, { status: 403 });
  if (booking.status === "CONFIRMED") {
    return Response.json({ error: "ALREADY_PAID" }, { status: 409 });
  }

  const adapter = pickProvider(booking.currency) === "RAZORPAY" ? razorpayAdapter : stripeAdapter;
  const title =
    booking.tour.translations.find((t) => t.locale === parsed.data.locale)?.title ??
    booking.tour.translations.find((t) => t.locale === "en")!.title;

  const session = await adapter.createCheckout({
    bookingId: booking.id,
    bookingReference: booking.reference,
    amountMinor: booking.totalMinor,          // server-authoritative
    currency: booking.currency,
    customerEmail: booking.contactEmail,
    locale: parsed.data.locale,
    description: `${title} — ${booking.participants} traveller(s)`,
  });

  await db.$transaction([
    db.payment.create({
      data: {
        bookingId: booking.id,
        provider: adapter.name,
        providerOrderId: session.providerOrderId,
        amountMinor: booking.totalMinor,
        currency: booking.currency,
        status: "CREATED",
      },
    }),
    db.booking.update({
      where: { id: booking.id },
      data: { status: "AWAITING_PAYMENT" },
    }),
  ]);

  return Response.json(session);
}
```

---

## 7. Testing — required cases

Stack: **Vitest** (unit/integration) + **Testcontainers or a dockerised Postgres** for DB tests + **Playwright** (e2e) + **MSW** to mock providers.

```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "typecheck": "tsc --noEmit",
    "lint": "next lint"
  }
}
```

### Money & pricing (unit)
- `toMinor(1499.99, "INR")` → `149999`; no float drift across 1000 random values
- `fromMinor` round-trips exactly
- `formatMoney` renders correctly for all 5 locales (`hi-IN` lakh grouping, `pl-PL` space separators, `fr-FR` comma decimal)
- `assertPriceMatches` throws on any mismatch, including off-by-one
- Total = `priceMinor × participants` (+ seasonal override when a `Departure.priceMinor` exists)

### Booking rules (integration, real DB)
- Booking with `participants > seatsAvailable` → rejected
- Booking with a past `departure.startDate` → rejected
- `participants` of 0 or negative → rejected
- Concurrent bookings for the last seat: **exactly one** succeeds (run 10 in parallel)
- A client-supplied `totalMinor` is ignored; the server value is used
- Non-owner fetching a booking → 403; admin → 200
- Cancellation outside the policy window → rejected

### Payments (integration, mocked providers)
- Checkout creates a `Payment(CREATED)` + moves booking to `AWAITING_PAYMENT`
- Checkout on an already-`CONFIRMED` booking → 409
- Checkout for another user's booking → 403
- INR booking routes to Razorpay; EUR/USD routes to Stripe
- Stripe `idempotencyKey` prevents two sessions for one booking

### Webhooks — the highest-risk surface
- Valid Stripe signature → booking `CONFIRMED`, seats incremented
- **Invalid signature → 400, and nothing in the DB changes**
- **Missing signature header → 400**
- **Same event delivered twice → second call is a no-op; seats incremented once**
- Event amount ≠ `booking.totalMinor` → rejected, booking stays unconfirmed, alert logged
- Webhook for an unknown `bookingId` → 500, provider retries, no partial write
- `payment.failed` → booking returns to `PENDING`, seats untouched
- Full refund → `PaymentStatus.REFUNDED` + `BookingStatus.REFUNDED`
- Partial refund → `PARTIALLY_REFUNDED`, `refundedMinor` accumulates correctly
- Unknown event type → 200, `IGNORED`, no writes
- Raw-body handling: a JSON-parsed body must **fail** signature verification (guards the classic regression)
- Razorpay signature compare is timing-safe and rejects a length-mismatched signature without throwing

### Auth (integration)
- Password is hashed, never stored or returned in plaintext
- Session cookie is `httpOnly`, `secure`, `sameSite=lax`
- `CUSTOMER` hitting an admin route → 403 (test the API, not just the hidden UI)
- Role escalation via request body is ignored
- `proxy.ts` preserves locale on the auth redirect: `/pl/checkout/x` → `/pl/login?callbackUrl=/pl/checkout/x`
- Expired session → 401

### i18n
- Every key present in `en.json` exists in `hi/bn/pl/fr.json` (write this as an automated test — it will catch drift forever)
- No orphan keys in non-English files
- Unknown locale falls back to `en` and does not 500
- Currency/date formatting matches locale

### AI endpoints
- Unauthenticated → 401
- Over rate limit → 429 with `Retry-After`
- Prompt-injection attempt in user input does not leak the system prompt or other users' data
- Itinerary generator output fails Zod validation → returns 422, never persists a malformed draft
- Generated itinerary can never be booked without `approved = true`

### E2E (Playwright)
- Browse → tour detail → book → pay (Stripe test card `4242 4242 4242 4242`) → confirmation page → email queued
- Payment declined (`4000 0000 0000 0002`) → user sees a clear error, booking not confirmed
- Same flow in `pl` locale, prices in EUR
- Admin creates a tour, publishes it, and it appears on the public listing
- Mobile viewport (390×844): booking flow completes end to end

### CI (`.github/workflows/ci.yml`)
`lint → typecheck → unit → integration (Postgres service container) → build → e2e`. Block merges to `main` on failure. Cache `node_modules` and the Next build.

---

## 8. Docker boilerplate

### 8.1 `.dockerignore`

```
node_modules
.next
.git
.env*
!.env.example
npm-debug.log*
.DS_Store
coverage
playwright-report
test-results
README.md
docs
*.md
```

### 8.2 `docker/Dockerfile` — multi-stage production image

```dockerfile
# syntax=docker/dockerfile:1.7

# ---------- deps ----------
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY package.json package-lock.json ./
COPY prisma ./prisma
RUN --mount=type=cache,target=/root/.npm npm ci

# ---------- builder ----------
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Build-time public vars only. Real secrets are injected at runtime.
ARG NEXT_PUBLIC_SITE_URL
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ARG NEXT_PUBLIC_RAZORPAY_KEY_ID
ENV NEXT_PUBLIC_SITE_URL=$NEXT_PUBLIC_SITE_URL \
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=$NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY \
    NEXT_PUBLIC_RAZORPAY_KEY_ID=$NEXT_PUBLIC_RAZORPAY_KEY_ID \
    NEXT_TELEMETRY_DISABLED=1

RUN npx prisma generate
RUN npm run build          # requires output: "standalone" in next.config.ts

# ---------- runner ----------
FROM node:20-alpine AS runner
RUN apk add --no-cache openssl curl
WORKDIR /app
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0 NEXT_TELEMETRY_DISABLED=1

RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

USER nextjs
EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=20s --retries=3 \
  CMD curl -fsS http://localhost:3000/api/health || exit 1

CMD ["node", "server.js"]
```

> Add `output: "standalone"` to `next.config.ts` and create `app/api/health/route.ts` returning `{ ok: true }` plus a `SELECT 1` DB ping.

### 8.3 `docker/Dockerfile.dev`

```dockerfile
FROM node:20-alpine
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY prisma ./prisma
RUN npx prisma generate
EXPOSE 3000
CMD ["npm", "run", "dev"]
```

### 8.4 `docker-compose.yml` — local dev

```yaml
services:
  db:
    image: postgres:16-alpine
    restart: unless-stopped
    environment:
      POSTGRES_USER: wonderlust
      POSTGRES_PASSWORD: wonderlust
      POSTGRES_DB: wonderlust
    ports: ["5432:5432"]
    volumes: ["pgdata:/var/lib/postgresql/data"]
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U wonderlust"]
      interval: 5s
      timeout: 5s
      retries: 10

  redis:
    image: redis:7-alpine
    restart: unless-stopped
    ports: ["6379:6379"]
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      retries: 10

  web:
    build:
      context: .
      dockerfile: docker/Dockerfile.dev
    restart: unless-stopped
    env_file: [.env.local]
    environment:
      DATABASE_URL: postgresql://wonderlust:wonderlust@db:5432/wonderlust
      DIRECT_URL:   postgresql://wonderlust:wonderlust@db:5432/wonderlust
      REDIS_URL:    redis://redis:6379
    ports: ["3000:3000"]
    volumes:
      - .:/app
      - /app/node_modules      # keep container's node_modules
      - /app/.next
    depends_on:
      db:    { condition: service_healthy }
      redis: { condition: service_healthy }

  # Forwards Stripe webhooks to the local app. `docker compose --profile tools up stripe-cli`
  stripe-cli:
    image: stripe/stripe-cli:latest
    profiles: [tools]
    env_file: [.env.local]
    command: listen --forward-to web:3000/api/webhooks/stripe
    depends_on: [web]

volumes:
  pgdata:
```

### 8.5 `docker-compose.prod.yml`

```yaml
services:
  web:
    build:
      context: .
      dockerfile: docker/Dockerfile
      args:
        NEXT_PUBLIC_SITE_URL: https://wanderlusttravels.fyi
        NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: ${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
        NEXT_PUBLIC_RAZORPAY_KEY_ID: ${NEXT_PUBLIC_RAZORPAY_KEY_ID}
    restart: always
    env_file: [.env.production]
    ports: ["3000:3000"]
    deploy:
      resources:
        limits: { cpus: "1.0", memory: 1G }
```

### 8.6 Make targets

```makefile
up:        ; docker compose up -d --build
down:      ; docker compose down
logs:      ; docker compose logs -f web
migrate:   ; docker compose exec web npx prisma migrate dev
seed:      ; docker compose exec web npx prisma db seed
studio:    ; docker compose exec web npx prisma studio
test:      ; docker compose exec web npm test
stripe:    ; docker compose --profile tools up stripe-cli
reset:     ; docker compose down -v && docker compose up -d --build
```

> **Note:** Vercel is your current host and does not use this image. Docker here buys you (a) reproducible local dev with a real Postgres, (b) identical CI test environment, (c) a portable exit path if you ever move off Vercel. Don't rip out the Vercel deploy to adopt Docker.

---

## 9. Execution order for the agent

Work one PR at a time, in this order. Stop and report after each.

```
 1. chore: health endpoint + env validation (lib/env.ts) + .env.example (Kinde/R2/Resend vars, not Auth.js)
 2. chore: Docker dev environment (compose + Dockerfile.dev) — verify `npm run dev` works in-container
 3. feat: money-as-minor-units migration on Package/Booking + Payment/WebhookEvent/Review models + seed update
 4. test: Vitest + Playwright harness, i18n key-parity test, CI workflow
 5. feat: requireUser() helper on top of existing Kinde auth + booking-owner checks (no Auth.js — already done)
 6. feat: booking creation (server-authoritative pricing, capacity in transaction) — Package listing/detail
    pages already exist, extend them rather than rebuild
 7. feat: Stripe adapter + checkout route + webhook  ← full test suite from §7 required
 8. feat: Razorpay adapter + webhook + provider routing
 9. feat: booking-flow Resend emails (confirmation/receipt/refund/reminder) — extend existing lib/email/, don't
    rebuild it
10. feat: admin bookings table + refund action + revenue overview (package CRUD admin already exists)
11. chore: Sentry + rate limiting + SEO/JSON-LD/sitemap
12. feat: AI chatbot (RAG over packages)
13. feat: AI itinerary generation (GeneratedItinerary model exists — wire it up, admin-approval gated)
14. feat: reviews (booking-verified)
```

**Before starting any item, print a short plan and wait for approval. Before touching payments, re-read §6 and §7.**
