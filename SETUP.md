# Setup Instructions

This guide will help you set up the Community Rentals platform on your local machine.

## Phase 1 Setup (Foundation)

### 1. Prerequisites

Before you begin, ensure you have:

- **Node.js** 18.x or higher ([Download](https://nodejs.org/))
- **PostgreSQL** 14.x or higher ([Download](https://www.postgresql.org/download/))
- **npm** or **yarn** package manager
- **Git** for version control

### 2. Clone the Repository

```bash
git clone <repository-url>
cd CommunityRentals
```

### 3. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Next.js 14
- React 18
- Prisma (ORM)
- NextAuth.js (Authentication)
- Tailwind CSS
- TypeScript
- Zod (Validation)

### 4. Database Setup

#### Option A: Local PostgreSQL

1. **Create a database**:
   ```bash
   # Login to PostgreSQL
   psql -U postgres

   # Create database
   CREATE DATABASE community_rentals;

   # Exit
   \q
   ```

2. **Set connection string** in `.env`:
   ```env
   DATABASE_URL="postgresql://postgres:your_password@localhost:5432/community_rentals?schema=public"
   ```

#### Option B: Cloud PostgreSQL (Railway, Render, Supabase)

1. Create a PostgreSQL instance on your preferred cloud provider
2. Copy the connection string
3. Update `DATABASE_URL` in `.env`

### 5. Environment Variables

Create a `.env` file:

```bash
cp .env.example .env
```

**Required variables**:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/community_rentals?schema=public"

# NextAuth (generate a random 32+ character string)
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-key-min-32-characters-long"
```

**Optional variables** (for development):

```env
# Twilio (for OTP SMS) - Leave empty to use console logging
TWILIO_ACCOUNT_SID=""
TWILIO_AUTH_TOKEN=""
TWILIO_PHONE_NUMBER=""

# Cloudinary (for image uploads) - Leave empty for now
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
```

**Generate a secure NEXTAUTH_SECRET**:
```bash
# Using OpenSSL
openssl rand -base64 32

# Or Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### 6. Initialize Database

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (creates tables)
npm run db:push

# Seed initial data (categories, demo society, users)
npm run db:seed
```

### 7. Verify Setup

Check if database was seeded correctly:

```bash
# Open Prisma Studio (visual database browser)
npm run db:studio
```

This opens `http://localhost:5555` where you can see:
- **Categories**: 10 categories (Furniture, Tools, Sports, etc.)
- **Society**: Demo Residency
- **Users**: Admin (9999999999), Demo User (9876543210)
- **Listings**: 2 sample listings

### 8. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

You should see the homepage with "Community Rentals" title.

## Testing Authentication (Phase 1)

### Test OTP Flow

1. **Request OTP**:
   ```bash
   curl -X POST http://localhost:3000/api/auth/request-otp \
     -H "Content-Type: application/json" \
     -d '{"mobile": "9876543210"}'
   ```

2. **Check console** for OTP (in development mode):
   ```
   📱 === MOCK OTP ===
   Mobile: 9876543210
   OTP: 123456
   Valid for: 10 minutes
   ==================
   ```

3. **Verify OTP**:
   ```bash
   curl -X POST http://localhost:3000/api/auth/verify-otp \
     -H "Content-Type: application/json" \
     -d '{"mobile": "9876543210", "otp": "123456"}'
   ```

### Test Accounts

After seeding, you have these test users:

| Mobile       | Role  | Name       | Society         | Flat  |
|--------------|-------|------------|-----------------|-------|
| 9999999999   | admin | Admin User | Demo Residency  | A-101 |
| 9876543210   | user  | Demo User  | Demo Residency  | B-205 |

## Project Structure (After Phase 1)

```
community-rentals/
├── app/                      # Next.js App Router
│   ├── api/                  # API routes
│   │   └── auth/            # Authentication endpoints
│   │       ├── [...nextauth]/route.ts
│   │       ├── request-otp/route.ts
│   │       └── verify-otp/route.ts
│   ├── layout.tsx           # Root layout
│   ├── page.tsx             # Homepage
│   └── globals.css          # Global styles
│
├── components/              # React components
│   └── ui/                  # Reusable UI components
│       ├── Button.tsx
│       ├── Input.tsx
│       ├── Card.tsx
│       ├── Badge.tsx
│       ├── Spinner.tsx
│       └── index.ts
│
├── lib/                     # Utilities
│   ├── auth.ts             # NextAuth config
│   ├── prisma.ts           # Prisma client
│   ├── otp.ts              # OTP utilities
│   ├── validations.ts      # Zod schemas
│   └── types.ts            # TypeScript types
│
├── prisma/                  # Database
│   ├── schema.prisma       # Database schema
│   └── seed.ts             # Seed script
│
├── types/                   # Type definitions
│   └── next-auth.d.ts      # NextAuth types
│
├── .env                     # Environment variables
├── .env.example            # Example env file
├── next.config.js          # Next.js config
├── tailwind.config.ts      # Tailwind config
├── tsconfig.json           # TypeScript config
└── package.json            # Dependencies
```

## Common Issues & Solutions

### Issue: `PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING`

**Solution**: This is handled automatically. Prisma schema is already created.

### Issue: Database connection failed

**Solution**:
1. Check PostgreSQL is running: `pg_isready`
2. Verify `DATABASE_URL` in `.env`
3. Test connection: `npm run db:push`

### Issue: Port 3000 already in use

**Solution**:
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or run on different port
PORT=3001 npm run dev
```

### Issue: OTP not receiving

**Solution**: In development, OTP is logged to console. Check terminal output.

### Issue: Module not found

**Solution**:
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

## Database Commands Reference

```bash
# Generate Prisma Client
npm run db:generate

# Push schema changes (development)
npm run db:push

# Create migration (production)
npx prisma migrate dev --name init

# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Seed database
npm run db:seed

# Open Prisma Studio
npm run db:studio
```

## Next Steps

After completing Phase 1 setup:

1. ✅ Database is configured
2. ✅ Authentication system is ready
3. ✅ UI components are created
4. ✅ Sample data is seeded

**Phase 2** will add:
- User registration and profile setup
- Product listing creation
- Owner dashboard

Continue with Phase 2 implementation once Phase 1 is verified working.

## Need Help?

- Check the [README.md](./README.md) for general information
- Review the [PRD](./PRD.md) for feature requirements
- Open an issue if you encounter problems

## Verification Checklist

- [ ] Node.js 18+ installed
- [ ] PostgreSQL running
- [ ] Dependencies installed (`node_modules/` exists)
- [ ] `.env` file created with DATABASE_URL
- [ ] Database schema pushed (`npm run db:push`)
- [ ] Database seeded (`npm run db:seed`)
- [ ] Dev server running (`npm run dev`)
- [ ] Homepage loads at http://localhost:3000
- [ ] Prisma Studio accessible (`npm run db:studio`)
- [ ] 10 categories visible in database
- [ ] 2 users visible in database
- [ ] 2 sample listings visible in database

Once all items are checked, Phase 1 is complete! 🎉
