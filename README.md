# LIAO - Full Stack Application

Complete full-stack web application for **LIAO (Liga Acadêmica de Inteligência Artificial e Otimização)**. This repository houses both the Node.js backend and the React frontend.

## 🚀 Quick Start

### Prerequisites
- **Node.js** v18+
- **Docker** (recommended for automatic database setup) or local **PostgreSQL**
- **npm**

### Run the Full Stack
For a fresh setup, follow these steps in order:

#### Backend
```bash
cd liao-backend
npm install
npm run db:setup
npm run dev
```

#### Frontend
```bash
cd liao-react
npm install
# Ensure VITE_API_URL=http://localhost:3001/api in your .env
npm run dev
```

---

## 📁 Repository Structure

- [**`liao-backend/`**](./liao-backend/README.md): Node.js + Express + Prisma. The engine of the application.
- [**`liao-react/`**](./liao-react/README.md): React + Vite + Tailwind. The user interface of the application.
- [**`docs/`**](./docs): Interactive documentation powered by mdBook for human developers and LLM agents.

---

## Project Documentation (mdBook)

The project includes an interactive documentation book powered by [mdBook](https://rust-lang.github.io/mdBook/). It covers system design rules, color guidelines, component standards, and architecture for both human developers and LLM coding assistants.

### Render Documentation Locally

To serve and view the documentation locally in your browser:

1. **Install mdBook** (if not installed):
   ```bash
   # On Linux/macOS via Cargo:
   cargo install mdbook

   # Or via system package manager (Debian/Ubuntu):
   sudo apt install mdbook
   ```

2. **Serve the Docs**:
   Run from the repository root:
   ```bash
   npm run docs:serve
   # Or directly using the CLI:
   mdbook serve docs
   ```

3. **Open in Browser**:
   Navigate to `http://localhost:3000` to browse the interactive documentation book.

To build the static HTML book output:
```bash
npm run docs:build
# Output will be generated in docs/book/
```

---

## 🛠️ Key Workflows

### 🔄 The "Type Sync" Workflow
This project uses an automated OpenAPI workflow to keep the frontend and backend in sync without manual type definitions.

Whenever you change the **database schema** in `liao-backend/prisma/schema.prisma`:
1. **Migrate the DB:** `npx prisma migrate dev`
2. **Sync Types:** 
   ```bash
   cd liao-backend && npm run generate:types
   ```
This command regenerates the OpenAPI spec and updates the TypeScript interfaces used by the frontend.

### 🗄️ Database Management
Refer to the [**Backend README**](./liao-backend/README.md#️-database-workflow-prisma) for detailed instructions on:
- Applying schema changes.
- Resetting the database.
- Seeding example data.

---

## 🔧 Tech Stack Overview

- **Backend:** Node.js, Express, PostgreSQL, Prisma ORM, JWT.
- **Frontend:** React 18, TypeScript, Vite, Tailwind CSS.
- **Spec:** OpenAPI 3.0 (Automated).

## 🚢 Deployment
- **Backend:** Build with `npm run build` and run with `npm start`.
- **Frontend:** Build with `npm run build` and deploy the `dist/` folder.

## 🤝 Contributing
Please refer to the specific READMEs in `liao-backend/` and `liao-react/` for detailed development guidelines.

---
**Built with ❤️ by LIAO Team**
