# Example API Routes Using Prisma + Supabase

After completing the setup, use these examples to interact with your database.

## 1. Get All Packages

**File:** `app/api/packages/route.ts`

```typescript
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const packages = await prisma.package.findMany({
      where: {
        active: true,
      },
      orderBy: {
        featured: "desc",
      },
    });
    
    return NextResponse.json(packages);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch packages" },
      { status: 500 }
    );
  }
}
```

**Usage:** `GET /api/packages`

---

## 2. Get Single Package by Slug

**File:** `app/api/packages/[slug]/route.ts`

```typescript
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const pkg = await prisma.package.findUnique({
      where: {
        slug: params.slug,
      },
    });

    if (!pkg) {
      return NextResponse.json(
        { error: "Package not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(pkg);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch package" },
      { status: 500 }
    );
  }
}
```

**Usage:** `GET /api/packages/ladakh-expedition`

---

## 3. Create Booking

**File:** `app/api/bookings/route.ts`

```typescript
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userId, packageId, startDate, guests, totalPrice, notes } = body;

    // Validate required fields
    if (!userId || !packageId || !totalPrice) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.create({
      data: {
        userId,
        packageId,
        startDate: startDate ? new Date(startDate) : null,
        guests: guests || 1,
        totalPrice,
        notes: notes || null,
        status: "PENDING",
      },
    });

    return NextResponse.json(booking, { status: 201 });
  } catch (error) {
    console.error("Booking creation error:", error);
    return NextResponse.json(
      { error: "Failed to create booking" },
      { status: 500 }
    );
  }
}
```

**Usage:** 
```bash
POST /api/bookings
Content-Type: application/json

{
  "userId": "kp_user123",
  "packageId": "pkg_ladakh",
  "startDate": "2024-06-15",
  "guests": 2,
  "totalPrice": 85998,
  "notes": "Honeymoon trip"
}
```

---

## 4. Get User Bookings

**File:** `app/api/users/[userId]/bookings/route.ts`

```typescript
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
  try {
    const bookings = await prisma.booking.findMany({
      where: {
        userId: params.userId,
      },
      include: {
        package: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch bookings" },
      { status: 500 }
    );
  }
}
```

**Usage:** `GET /api/users/kp_user123/bookings`

---

## 5. Update Booking Status

**File:** `app/api/bookings/[bookingId]/route.ts`

```typescript
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  request: NextRequest,
  { params }: { params: { bookingId: string } }
) {
  try {
    const body = await request.json();
    const { status } = body;

    if (!["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    const booking = await prisma.booking.update({
      where: { id: params.bookingId },
      data: { status },
    });

    return NextResponse.json(booking);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update booking" },
      { status: 500 }
    );
  }
}
```

**Usage:**
```bash
PATCH /api/bookings/booking123
Content-Type: application/json

{
  "status": "CONFIRMED"
}
```

---

## 6. Search Packages by Difficulty & Category

**File:** `app/api/packages/search/route.ts`

```typescript
import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const difficulty = searchParams.get("difficulty");
    const category = searchParams.get("category");
    const maxPrice = searchParams.get("maxPrice");

    const where = {
      active: true,
      ...(difficulty && { difficulty }),
      ...(category && { category }),
      ...(maxPrice && { priceFrom: { lte: parseInt(maxPrice) } }),
    };

    const packages = await prisma.package.findMany({
      where,
      orderBy: { priceFrom: "asc" },
    });

    return NextResponse.json(packages);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to search packages" },
      { status: 500 }
    );
  }
}
```

**Usage:** `GET /api/packages/search?difficulty=Advanced&maxPrice=50000`

---

## Using Prisma in Server Actions

Instead of API routes, you can also use Prisma directly in Next.js Server Actions:

```typescript
"use server"

import { prisma } from "@/lib/db";

export async function createUserIfNotExists(userId: string, email: string) {
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      id: userId,
      email,
    },
  });
  return user;
}

export async function getPackagesByCategory(category: string) {
  return await prisma.package.findMany({
    where: {
      category,
      active: true,
    },
  });
}
```

---

## Error Handling Best Practices

```typescript
import { prisma } from "@/lib/db";
import { Prisma } from "@prisma/client";

export async function safeDbOperation() {
  try {
    // Your Prisma query
    const result = await prisma.package.findMany();
    return result;
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      // Handle Prisma-specific errors
      console.error("Database error:", error.code, error.message);
    } else if (error instanceof Prisma.PrismaClientValidationError) {
      // Handle validation errors
      console.error("Validation error:", error.message);
    } else {
      console.error("Unknown error:", error);
    }
    throw error;
  }
}
```

---

## Testing Queries

Use Prisma Studio to test queries visually:

```bash
npm run db:studio
```

This opens a GUI at `http://localhost:5555` where you can browse, create, update, and delete records.
