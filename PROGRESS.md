# Tremplin — Progress & AI Continuity

## Project Overview
- **Name**: Tremplin
- **Purpose**: Platform for ISTA Khemisset trainees — track employment status, build CVs, apply to offers
- **Stack**: Laravel 11 (backend) + React 18 + Vite + Tailwind (frontend)
- **Auth**: Laravel Sanctum (token-based)
- **DB**: MySQL

## Architecture

### Backend (`/backend`)
- **Framework**: Laravel 11, PHP 8.3
- **Auth**: Sanctum tokens
- **Key Models**:
  - `User` — users table (roles: stagiaire/admin via `Role` enum)
  - `StagiaireProfile` — `employment_status` (looking/employed), `job_title`, `job_company`, `job_city`, `job_start_date`, `profile_completed`, `filiere`, `promotion`, `bio`, `links`, `photo_path`
  - `Cv` — `title`, `summary`, `theme`, `is_finalized`, `pdf_path`, `links`
  - `CvExperience`, `CvEducation`, `CvSkill`, `CvLanguage`, `CvCertification` — CV sections
  - `Offer` — job/internship offers (admin-created)
  - `Application` — stagiaire applications to offers with `cv_snapshot`
  - `Filiere` — grouped filieres (Technicien Spécialisé, Technicien, Qualifié)
- **Controllers**:
  - `AuthController` — register/login/logout/me
  - `ProfileController` — show/update profile, upload/delete photo, change password
  - `CvController` — show/update CV, upload PDF
  - `ApplicationController` (stagiaire) — list/apply/cancel applications
  - `StatsController` (admin) — KPIs, employment by filiere, applications 30d, recent activity
  - `StagiaireController` (admin) — list/search/filter stagiaires, show details, delete, download PDF
  - `OfferController` (admin) — CRUD offers
  - `OfferController` (public) — list/view published offers
  - `FiliereController` — list filieres
- **Routes**: `/api/v1/...` — all API routes in `routes/api.php`
- **Middleware**: `EnsureRole` — role-based access control

### Frontend (`/frontend`)
- **Framework**: React 18, Vite, Tailwind CSS
- **State**: Zustand (`authStore` for user/token)
- **Data Fetching**: TanStack Query (React Query)
- **Routing**: React Router DOM
- **UI**: Lucide icons, Framer Motion animations, Recharts charts
- **PDF**: jsPDF + html2canvas for CV export
- **Key Pages**:
  - `HomePage` — landing page
  - `RegisterPage` — signup (name, email, phone, filiere, promotion, password)
  - `EmploymentStatusPage` — post-register step: "looking" or "employed" (+ job details)
  - `LoginPage` — login
  - `ProfilPage` — edit profile, photo, password, completion tracker
  - `CvBuilderPage` — full CV editor with live preview, drag-drop reordering, PDF export
  - `CandidaturesPage` — list my applications, cancel
  - `OffresListPage` / `OffreDetailPage` — browse & apply to offers
  - `DashboardPage` (admin) — stats, charts, KPIs
  - `StagiairesListPage` (admin) — manage trainees, view CVs, download PDFs
  - `OffresManagePage` (admin) — CRUD offers
  - `CandidaturesManagePage` (admin) — view applications
  - `FilieresManagePage` (admin) — manage filieres
- **Layouts**: `PublicLayout`, `StagiaireLayout` (sidebar nav), `AdminLayout` (sidebar nav)
- **API layer**: `api/auth.js`, `api/profile.js`, `api/cv.js`, `api/offers.js`, `api/applications.js`, `api/admin.js`, `api/filieres.js`

## Key Features Implemented
1. **Auth**: Register → employment status step → redirect to profile
2. **Employment tracking**: `looking` vs `employed` with job details
3. **CV builder**: Multi-section editor, 2 themes (modern/classic), auto-fill from profile job data, PDF generation + upload
4. **Applications**: Apply to offers with CV snapshot, gating requires `profile_completed` + `is_finalized`
5. **Admin dashboard**: employed vs looking stats by filiere, application trends, recent activity
6. **Filiere management**: grouped filieres seeded from `FiliereSeeder`

## Data Flow
1. Register → `AuthController::register` creates `User` + `StagiaireProfile` (employment defaults to `looking`)
2. Employment step → `updateMyProfile` sets `employment_status` + job fields
3. Profile page → updates user + profile data, tracks `profile_completed = filiere && city`
4. CV builder → loads from `Cv` + `StagiaireProfile`, merges skills/languages/certifications, auto-adds job as experience if employed
5. Apply → checks `profile_completed` and `cv.is_finalized`, stores CV snapshot in `Application`

## Simplification Status (from previous work)
- OCR / document verification / diploma declaration already removed
- Gating simplified to `profile_completed` + `cv_finalized` only
- No document upload/verification routes exist

## File Map (Most Important)
| File | Purpose |
|------|---------|
| `backend/routes/api.php` | All API routes |
| `backend/app/Models/*.php` | All Eloquent models |
| `backend/app/Http/Controllers/Api/*` | All API controllers |
| `backend/database/migrations/*` | DB schema |
| `frontend/src/routes/AppRoutes.jsx` | All frontend routes |
| `frontend/src/pages/**/*.jsx` | All page components |
| `frontend/src/api/*.js` | API client functions |
| `frontend/src/stores/authStore.js` | Auth state |
| `frontend/src/lib/api.js` | Axios instance |

## Recent Changes (May 2026)
- **Bug fix**: Added missing `type` column to `offers` migration (was validated by `StoreOfferRequest` but missing from DB schema). Added to migration + Model `$fillable` + cast to `OfferType` enum.
- **ARCHITECTURE.md**: Fully updated to match actual codebase. Key corrections:
  - `users.full_name` → `first_name` + `last_name` (with accessor)
  - API prefix `/api` → `/api/v1`
  - Removed nonexistent endpoints (`/auth/forgot-password`, `/offers/recent`, `/me/cv/finalize`, `/admin/dashboard`, `PATCH /admin/offers/:id/publish`, etc.)
  - Added actual endpoints (`/filieres`, `/ping`, photo upload/delete, CV PDF upload, admin filieres CRUD, etc.)
  - Fixed frontend routes (no separate admin login, no detail pages for candidatures, inline CRUD)
  - Fixed frontend file structure (flat `api/admin.js` not `api/admin/`, actual UI components, etc.)
  - Fixed decisions table (2 CV themes not 1, no dark mode, no PWA, local-only hosting)
  - Fixed wireframes (no Accepté/Refusé status, Design tab in CV builder)

## Known Patterns
- UI language: **French**
- User communication: Darija (Moroccan Arabic) in chat
- Validation: Zod on frontend, FormRequest on backend
- Photos: stored in `storage/app/public/photos`, served via `Storage::url()`
- CV PDFs: stored in `storage/app/cv_pdfs`, downloaded via `Storage::disk('local')->download()`
