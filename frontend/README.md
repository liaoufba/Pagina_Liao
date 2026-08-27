# LIAO Frontend

The "Face" of the LIAO (Liga Acadêmica de Inteligência Artificial e Otimização) web application.

## 🛠️ Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client

---

## 🚀 Setup

### Prerequisites
- Node.js (v18+)
- Backend API running (see [**Backend README**](../backend/README.md))

### Installation
1. Install dependencies: `npm install`
2. Configure environment: Create a `.env` file in the root directory.
   ```env
   VITE_API_URL=http://localhost:3001/api
   ```
3. Start development server: `npm run dev`

---

## 🎨 UI & Styling

### Components
- **`components/ui/`**: Core reusable UI elements (Cards, Modals, Buttons).
- **`components/domain/`**: Specialized components for LIAO (EventCard, MemberCard).
- **`views/pages/`**: Full-page views like Dashboard, Members, and Admin.

### Tailwind Utilities
We use several custom utilities for consistent styling:
- `.glass`: Glassmorphism effect.
- `.btn-primary`: Primary LIAO gradient button.
- `.card`: Standard card shadow and radius.

---

## 🔌 API Integration

The frontend communicates with the backend via Axios.
- **Service:** See `src/services/api.ts` for the base configuration.
- **Types:** Interfaces are derived from the backend's OpenAPI spec to ensure data consistency.
- **Authentication:** JWT tokens are stored in `localStorage` and managed via Axios interceptors.

---

## 📁 Project Structure
```
src/
├── components/     # UI and Domain components
├── controllers/    # Hooks for data fetching
├── services/       # API configuration
├── views/          # Pages and Layouts
├── models/         # TypeScript interfaces
├── App.tsx         # Routing and Main structure
└── main.tsx        # React entry point
```

## License
MIT
