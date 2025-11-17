# Community Rentals Platform

A peer-to-peer rental platform for gated communities where residents can list household items for rent, browse community inventory, and connect directly with each other.

## Features

### Phase 1: Foundation (✅ Completed)
- ✅ Next.js 14 with TypeScript and Tailwind CSS
- ✅ PostgreSQL database with Prisma ORM
- ✅ Complete database schema (User, Listing, Category, Society, Contact, Flag)
- ✅ Mobile OTP authentication with NextAuth.js
- ✅ OTP sending utilities (Twilio integration)
- ✅ Validation schemas with Zod
- ✅ Database seeding with sample data

### Upcoming Phases
- **Phase 2**: Owner Features (Registration, Profile, Listing Management)
- **Phase 3**: Renter Features (Search, Browse, Filters, Contact)
- **Phase 4**: Admin Panel (Dashboard, User Management, Analytics)
- **Phase 5**: Polish & Testing

## Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: Tailwind CSS
- **Database**: PostgreSQL
- **ORM**: Prisma
- **Authentication**: NextAuth.js
- **Validation**: Zod
- **Forms**: React Hook Form
- **SMS**: Twilio (for OTP)
- **Image Storage**: Cloudinary (configurable)

## Getting Started

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database (local or cloud)
- Twilio account (for OTP SMS) - optional for development
- Cloudinary account (for image uploads) - optional for development

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd CommunityRentals
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Edit `.env` and configure:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `NEXTAUTH_SECRET`: Random secret key (min 32 characters)
   - `TWILIO_*`: Twilio credentials (optional for dev)
   - `CLOUDINARY_*`: Cloudinary credentials (optional for dev)

4. **Set up the database**

   Generate Prisma client:
   ```bash
   npm run db:generate
   ```

   Push schema to database:
   ```bash
   npm run db:push
   ```

   Seed initial data (categories, demo society, users):
   ```bash
   npm run db:seed
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Schema

### Core Models

- **User**: Authentication, profile, contact preferences, verification status
- **Society**: Gated community information (name, address, blocks)
- **Category**: Product categories (Furniture, Tools, Sports, etc.)
- **Listing**: Rental items with pricing, photos, availability
- **Contact**: Tracks inquiries between renters and owners
- **Flag**: Reports and moderation queue

### Default Data (After Seeding)

- **Categories**: 10 categories (Furniture, Tools, Sports, Kitchen, Electronics, etc.)
- **Society**: "Demo Residency" with blocks A, B, C, D
- **Users**:
  - Admin: `9999999999` (role: admin)
  - Demo: `9876543210` (role: user)
- **Sample Listings**: 2 items (Dining Table, Electric Drill)

## Development

### Database Commands

```bash
# Generate Prisma client
npm run db:generate

# Push schema changes
npm run db:push

# Open Prisma Studio (GUI)
npm run db:studio

# Seed database
npm run db:seed
```

### Authentication Flow

1. **Request OTP**: `POST /api/auth/request-otp`
   - Sends 6-digit OTP to mobile via SMS
   - Valid for 10 minutes
   - Rate limited: 5 requests/hour per mobile

2. **Verify OTP**: `POST /api/auth/verify-otp`
   - Validates OTP
   - Max 3 attempts before 5-minute block
   - Returns user profile completion status

3. **Sign In**: Use NextAuth's mobile-otp provider
   - Credentials: mobile + OTP
   - Returns JWT session

### Development Mode

In development (`NODE_ENV=development`):
- OTP is logged to console instead of sent via SMS
- No Twilio credentials required
- Database connection uses local PostgreSQL

## Project Structure

```
/app                    # Next.js App Router pages and API routes
  /api/auth            # Authentication endpoints
  /auth                # Auth pages (signin, error)
  layout.tsx           # Root layout
  page.tsx             # Homepage
  globals.css          # Global styles

/lib                   # Shared utilities
  auth.ts              # NextAuth configuration
  prisma.ts            # Prisma client instance
  otp.ts               # OTP generation and sending
  validations.ts       # Zod schemas
  types.ts             # TypeScript types

/prisma                # Database
  schema.prisma        # Database schema
  seed.ts              # Seed script

/components            # Reusable React components (coming in Phase 2)
/types                 # TypeScript type definitions
```

## Environment Variables

See `.env.example` for all required variables.

### Required for Production
- `DATABASE_URL`: PostgreSQL connection string
- `NEXTAUTH_SECRET`: Random secret (min 32 chars)
- `NEXTAUTH_URL`: Your domain (e.g., https://yourdomain.com)

### Optional (Development)
- Twilio credentials (OTP will be console-logged if not set)
- Cloudinary credentials (for image uploads)

## Security

- Mobile OTP authentication with rate limiting
- Failed attempt tracking (3 attempts → 5 min block)
- OTP expiry (10 minutes)
- JWT sessions with secure cookies
- Input validation with Zod
- SQL injection prevention via Prisma

## Roadmap

- [x] Phase 1: Foundation & Database Setup
- [ ] Phase 2: Owner Features (Listing Management)
- [ ] Phase 3: Renter Features (Search, Browse, Contact)
- [ ] Phase 4: Admin Panel (Dashboard, Moderation)
- [ ] Phase 5: Testing & Polish

## Support

For issues or questions, please refer to the Product Requirements Document (PRD) or contact the development team.

## License

Private project for gated community use.
