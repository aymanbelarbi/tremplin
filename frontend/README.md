# Tremplin — Frontend

Interface stagiaire / admin pour la plateforme Tremplin (ISTA Khemisset).

## Stack

- **React 18** (JSX) + **Vite**
- **Tailwind CSS** — styling
- **TanStack Query** — state serveur
- **Zustand** — state client (auth)
- **React Router v6** — routing
- **Axios** — HTTP client
- **Lucide React** — icons
- **Sonner** — toasts
- **html2canvas + jsPDF** — export CV PDF

## Développement

```bash
npm install
npm run dev        # → http://localhost:5173 (proxy /api → localhost:8000)
npm run build      # production build
npm run lint       # ESLint
```

Le frontend attend le backend Laravel sur `http://localhost:8000` (configuré dans `vite.config.js` proxy).

## Structure `src/`

```
api/          → clients axios (auth, cv, profile, offers, admin…)
components/   → ui/, layout/, brand/
features/auth → ProtectedRoute, GuestRoute
hooks/        → useFilieres
layouts/      → PublicLayout, StagiaireLayout, AdminLayout
lib/          → api.js, normalizers.js, cities.js, cn.js, jobTitles.js
pages/        → stagiaire/, admin/
routes/       → AppRoutes.jsx
stores/       → authStore.js (Zustand + persist)
