@echo off
REM Supabase + Prisma Setup Script for Wonderlust (Windows)

echo.
echo 🚀 Starting Supabase + Prisma Setup...
echo.

REM Step 1: Install dependencies
echo 📦 Step 1: Installing dependencies...
call npm install
if errorlevel 1 (
  echo ❌ npm install failed
  exit /b 1
)
echo ✓ Dependencies installed
echo.

REM Step 2: Generate Prisma Client
echo 🔧 Step 2: Generating Prisma Client...
call npx prisma generate
if errorlevel 1 (
  echo ❌ Prisma generate failed
  exit /b 1
)
echo ✓ Prisma Client generated
echo.

REM Step 3: Push schema to database
echo 🗄️  Step 3: Pushing schema to Supabase...
call npx prisma db push
if errorlevel 1 (
  echo ❌ Prisma db push failed
  exit /b 1
)
echo ✓ Schema pushed to Supabase
echo.

REM Step 4: Seed database (optional)
echo 🌱 Step 4: Seeding database (optional)
set /p seed="Would you like to seed the database? (y/n) "
if /i "%seed%"=="y" (
  call npx prisma db seed
  echo ✓ Database seeded
) else (
  echo ⊘ Skipped seeding
)
echo.

echo ✅ Setup complete! Your Supabase + Prisma connection is ready.
echo.
echo Next steps:
echo   • Run 'npm run dev' to start the development server
echo   • Check out PRISMA_SETUP.md for usage examples
echo   • Use 'npm run db:studio' to browse your database
echo.
pause
