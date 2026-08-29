#!/bin/bash

# Supabase + Prisma Setup Script for Wonderlust

echo "🚀 Starting Supabase + Prisma Setup..."
echo ""

# Step 1: Install dependencies
echo "📦 Step 1: Installing dependencies..."
npm install
if [ $? -ne 0 ]; then
  echo "❌ npm install failed"
  exit 1
fi
echo "✓ Dependencies installed"
echo ""

# Step 2: Generate Prisma Client
echo "🔧 Step 2: Generating Prisma Client..."
npx prisma generate
if [ $? -ne 0 ]; then
  echo "❌ Prisma generate failed"
  exit 1
fi
echo "✓ Prisma Client generated"
echo ""

# Step 3: Push schema to database
echo "🗄️  Step 3: Pushing schema to Supabase..."
npx prisma db push
if [ $? -ne 0 ]; then
  echo "❌ Prisma db push failed"
  exit 1
fi
echo "✓ Schema pushed to Supabase"
echo ""

# Step 4: Seed database (optional)
echo "🌱 Step 4: Seeding database (optional)..."
read -p "Would you like to seed the database? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  npx prisma db seed
  echo "✓ Database seeded"
else
  echo "⊘ Skipped seeding"
fi
echo ""

echo "✅ Setup complete! Your Supabase + Prisma connection is ready."
echo ""
echo "Next steps:"
echo "  • Run 'npm run dev' to start the development server"
echo "  • Check out PRISMA_SETUP.md for usage examples"
echo "  • Use 'npm run db:studio' to browse your database"
