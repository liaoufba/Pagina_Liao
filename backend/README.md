# LIAO Backend

Backend API and Database Engine for the LIAO (Liga Acadêmica de Inteligência Artificial e Otimização) web application.

## 🛠️ Tech Stack

- **Node.js + Express** - Web framework
- **TypeScript** - Type safety
- **PostgreSQL** - Database
- **Prisma** - ORM
- **OpenAPI 3.0** - Spec generation
- **JWT** - Authentication

---

## 🚀 Setup

### Prerequisites
- Node.js (v18+)
- Docker (recommended for automatic database setup)

### Installation
1. Install dependencies:
   ```bash
   npm install
   ```
2. Set up the development database:
   ```bash
   npm run db:setup
   ```
   *(This automatically copies `.env.example` to `.env`, spins up a PostgreSQL container via Docker, and runs migrations & seeding).*
3. Start the development server:
   ```bash
   npm run dev
   ```

---

## 🗄️ Database Workflow (Prisma)

When working with the database, follow these workflows to keep your schema and data in sync.

### 1. Applying Schema Changes
If you modify `prisma/schema.prisma`, you **must** sync the database:
```bash
# This creates a migration, updates the DB, and regenerates types
npx prisma migrate dev --name describe_your_change
```

### 2. Starting Fresh (Resetting)
If your database is out of sync or you want to wipe all data:
```bash
# Drops DB, reapplies all migrations, and runs the seed automatically
npx prisma migrate reset
```

### 3. Seeding Data
To populate the database with example data (members, tutors, events, etc.):
```bash
# Only runs the seed script (prisma/seed.ts)
npx prisma db seed
```

### 4. 🔄 Toggling Environments (Dev vs. Prod)
This project features an automated environment switcher. You can toggle between your local database and a production database without overriding your auto-configured local database string:

1. Open `backend/.env` and locate the **Database Configuration** section.
2. Toggle the `DB_ENV` setting:
   * `DB_ENV=dev`: Uses `DEV_DATABASE_URL` (automatically managed for your local machine or Docker).
   * `DB_ENV=prod`: Uses `PROD_DATABASE_URL` (points to your production database URL).
3. The active `DATABASE_URL` used by Prisma is automatically synchronized whenever you run `npm run dev`, `npm run build`, or `npm run db:setup`.

---

## 📜 API Documentation

The full API specification is available via Swagger UI at `/api/docs` when the server is running.

### Key Endpoints
- **Auth:** `POST /api/auth/login`, `POST /api/auth/register`, `GET /api/auth/me`
- **Members:** `GET /api/members`, `POST /api/members`, `PUT /api/members/:id`, `DELETE /api/members/:id`
- **Tutors:** `GET /api/tutors`, `POST /api/tutors`, `PUT /api/tutors/:id`, `DELETE /api/tutors/:id`
- **Events:** `GET /api/events`, `POST /api/events`, `PUT /api/events/:id`, `DELETE /api/events/:id`
- **Content:** `GET /api/content/:type` (notice/faq/video)
- **ProSel:** `POST /api/prosel/apply`, `GET /api/prosel/applications`

---

## 🤖 Type Generation
This project uses an automated OpenAPI workflow to provide types for the frontend.

- `npm run generate:openapi`: Extracts models from Prisma and generates `openapi.json`.
- `npm run generate:types`: Generates TypeScript interfaces from the `openapi.json` into `src/types/api.ts`.

---

## 📁 Project Structure
```
src/
├── config/        # Database & Auth config
├── controllers/   # Route handlers
├── routes/        # API route definitions
├── middleware/    # Auth & Error handling
├── types/         # Generated API types
└── server.ts      # Express entry point
```

## License
MIT
