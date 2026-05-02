# Document d'architecture — Plateforme Tremplin

> Plateforme web de gestion des stagiaires et des offres d'emploi / stage pour ISTA Khemisset
> Stack : **React 18 (JSX)** + **Tailwind CSS** (frontend) · **Laravel 11** (API REST) · **MySQL 8** · **Laravel Sanctum** (auth)
> Dernière mise à jour : mai 2026 — reflète le code tel qu'implémenté.

---

## 1. Vue d'ensemble de l'architecture

### 1.1 Diagramme logique

```
┌──────────────────────────────┐        HTTPS / JSON        ┌────────────────────────────┐
│   Frontend React (SPA)       │ ─────────────────────────► │   Backend Laravel (API)    │
│   - React 18 + Vite (JSX)   │ ◄───────────────────────── │   - Routes /api/v1/*       │
│   - React Router v6          │   Bearer token (Sanctum)   │   - Controllers            │
│   - Tailwind CSS             │                            │   - Middleware EnsureRole   │
│   - TanStack Query (fetch)   │                            │                            │
│   - Zustand (auth state)     │                            │                            │
└──────────────────────────────┘                            └─────────────┬──────────────┘
                                                                          │
                                                              Eloquent ORM│
                                                                          ▼
                                                            ┌────────────────────────────┐
                                                            │         MySQL 8            │
                                                            └────────────────────────────┘

Stockage fichiers :
  - photos    → storage/app/public/photos   (accessible via Storage::url)
  - CV PDFs   → storage/app/cv_pdfs        (téléchargement via route auth)
```

### 1.2 Structure du monorepo

```
tremplin/
├── backend/                        # Laravel 11
│   ├── app/
│   │   ├── Enums/                  # Role, EmploymentStatus, OfferType
│   │   ├── Http/
│   │   │   ├── Controllers/Api/
│   │   │   │   ├── AuthController
│   │   │   │   ├── Public/         # OfferController, FiliereController
│   │   │   │   ├── Stagiaire/      # ProfileController, CvController, ApplicationController
│   │   │   │   └── Admin/          # StatsController, OfferController, StagiaireController, ApplicationController, FiliereController
│   │   │   ├── Middleware/         # EnsureRole
│   │   │   ├── Requests/           # RegisterRequest, StoreOfferRequest
│   │   │   └── Resources/         # UserResource, StagiaireResource, ProfileResource, CvResource, OfferResource
│   │   └── Models/                # User, Profile, Cv, Offer, Application, Filiere
│   ├── database/
│   │   ├── migrations/
│   │   ├── seeders/               # AdminSeeder, FiliereSeeder
│   │   └── factories/
│   ├── routes/api.php
│   └── tests/
├── frontend/                       # React 18 + Vite (JSX)
│   ├── src/
│   │   ├── api/                   # clients axios (.js)
│   │   ├── components/            # ui/, layout/, brand/
│   │   ├── features/auth/         # ProtectedRoute, GuestRoute, AuthVisual
│   │   ├── hooks/                 # useFilieres
│   │   ├── layouts/               # PublicLayout, StagiaireLayout, AdminLayout
│   │   ├── lib/                   # api.js, cities.js, cn.js, jobTitles.js, normalizers.js
│   │   ├── mocks/                 # data.js
│   │   ├── pages/                 # toutes les pages (.jsx)
│   │   ├── routes/                # AppRoutes.jsx
│   │   └── stores/                # authStore.js (Zustand)
│   └── public/
├── docs/
└── README.md
```

### 1.3 Principes directeurs

- **Séparation claire** front ↔ back, communication uniquement en JSON via API REST.
- **Authentification par token** (Sanctum personal access tokens) stocké côté front via Zustand persist.
- **Autorisation par rôle** (`stagiaire`, `admin`) via middleware `EnsureRole`.
- **Règles métier au backend** : un stagiaire ne peut postuler que si `profile_completed` + `cv.is_finalized`.
- **Recrutement direct** : pas de statuts Accepté/Refusé. L'admin facilite la mise en relation en partageant les CVs.
- **Suivi d'emploi** : chaque stagiaire indique s'il est employé ou en recherche, avec détails du poste si applicable.
- **Validation des uploads** stricte : MIME, taille max (5 Mo), extensions (.jpg, .jpeg, .png pour photos, .pdf pour CVs).

---

## 2. Modèle de données (MySQL)

### 2.1 Diagramme ER synthétique

```
users ──1:1── profiles ──1:1── cvs
  │                │            │
  │                │            (experiences, educations, skills,
  │                │             languages, certifications, loisirs = JSON)
  │
  └──1:N applications ──N:1── offers
                                  │
                                  └── created_by → users(admin)
```

### 2.2 Tables

#### `users`
| Champ              | Type              | Contraintes                         |
|--------------------|-------------------|-------------------------------------|
| id                 | BIGINT UNSIGNED   | PK, AUTO_INCREMENT                  |
| first_name         | VARCHAR(100)      | NOT NULL                            |
| last_name          | VARCHAR(100)      | NOT NULL                            |
| email              | VARCHAR(180)      | NOT NULL, UNIQUE                    |
| phone              | VARCHAR(20)       | NULLABLE                            |
| password           | VARCHAR(255)      | NOT NULL (bcrypt)                   |
| role               | ENUM              | `stagiaire`, `admin` — default `stagiaire` |
| email_verified_at  | TIMESTAMP         | NULLABLE                            |
| remember_token     | VARCHAR(100)      | NULLABLE                            |
| created_at / updated_at | TIMESTAMP    |                                     |

Index : `(role)`, `(email)`.
Accessor : `full_name` = `first_name` + `last_name` (computed via Eloquent accessor).

#### `profiles`
| Champ                | Type              | Contraintes                          |
|----------------------|-------------------|--------------------------------------|
| id                   | BIGINT UNSIGNED   | PK                                   |
| user_id              | BIGINT UNSIGNED   | FK users.id, UNIQUE, ON DELETE CASCADE |
| employment_status  | ENUM               | `looking`, `employed` — default `looking` |
| job_title           | VARCHAR(150)       | NULLABLE (si employed)              |
| job_company         | VARCHAR(150)       | NULLABLE                            |
| job_city            | VARCHAR(100)       | NULLABLE                            |
| job_start_date      | DATE               | NULLABLE                            |
| birth_date           | DATE              | NULLABLE                             |
| city                 | VARCHAR(100)      | NULLABLE                             |
| photo_path           | VARCHAR(255)      | NULLABLE                             |
| filiere              | VARCHAR(120)      | NULLABLE (ex: Technicien Spécialisé — Développement Digital) |
| promotion            | INT               | NULLABLE (année de sortie, ≥ 2000)    |
| bio                 | TEXT               | NULLABLE (profil / résumé)           |
| loisirs            | JSON               | NULLABLE (`[{label, url}]` — centres d'intérêt) |
| profile_completed    | BOOLEAN           | NOT NULL, default false              |
| created_at / updated_at | TIMESTAMP      |                                      |

#### `offers`
| Champ           | Type              | Contraintes                         |
|-----------------|-------------------|-------------------------------------|
| id              | BIGINT UNSIGNED   | PK                                  |
| title           | VARCHAR(180)      | NOT NULL                            |
| company_name    | VARCHAR(150)      | NOT NULL                            |
| type            | VARCHAR(20)       | NOT NULL, default `emploi` (cast OfferType enum: `emploi`/`stage`) |
| description     | TEXT              | NOT NULL                            |
| requirements    | TEXT              | NULLABLE (filière cible, ex: « Développement Digital option Web Full Stack ») |
| location        | VARCHAR(150)      | NULLABLE                            |
| is_published    | BOOLEAN           | NOT NULL, default true              |
| published_at    | TIMESTAMP         | NULLABLE                            |
| closes_at       | DATE              | NULLABLE                            |
| created_by      | BIGINT UNSIGNED   | FK users.id (admin), NULLABLE, ON DELETE SET NULL |
| created_at / updated_at | TIMESTAMP |                                     |

Index : `(is_published, published_at)`, `(type)`.

#### `cvs`
| Champ            | Type              | Contraintes                         |
|------------------|-------------------|-------------------------------------|
| id               | BIGINT UNSIGNED   | PK                                  |
| user_id          | BIGINT UNSIGNED   | FK users.id UNIQUE, ON DELETE CASCADE |
| headline         | VARCHAR(200)      | NULLABLE (titre professionnel)      |
| summary          | TEXT              | NULLABLE (résumé / objectif)        |
| experiences      | JSON              | NULLABLE (`[{position, company, start_date, end_date, is_current, description}]`) |
| educations       | JSON              | NULLABLE (`[{degree, school, start_date, end_date}]`) |
| skills           | JSON              | NULLABLE (`["skill1", "skill2"]`)   |
| languages        | JSON              | NULLABLE (`[{name, level}]`)        |
| certifications   | JSON              | NULLABLE (`[{name, year}]`)         |
| loisirs          | JSON              | NULLABLE (`[{label, url}]`)         |
| pdf_path         | VARCHAR(255)      | NULLABLE (PDF généré)               |
| is_finalized     | BOOLEAN           | default false                       |
| created_at / updated_at | TIMESTAMP  |                                     |

#### `applications`
| Champ         | Type              | Contraintes                        |
|---------------|-------------------|------------------------------------|
| id            | BIGINT UNSIGNED   | PK                                 |
| user_id       | BIGINT UNSIGNED   | FK users.id                        |
| offer_id      | BIGINT UNSIGNED   | FK offers.id                       |
| created_at / updated_at | TIMESTAMP |                                  |

Contrainte : `UNIQUE(user_id, offer_id)` → un stagiaire ne postule qu'une fois par offre.

#### `filieres`
| Champ     | Type              | Contraintes                         |
|-----------|-------------------|-------------------------------------|
| id        | BIGINT UNSIGNED   | PK                                  |
| name      | VARCHAR           | NOT NULL, UNIQUE                    |
| category  | VARCHAR           | NULLABLE (Technicien Spécialisé, Technicien, Qualifié) |
| created_at / updated_at | TIMESTAMP |                                     |

#### `personal_access_tokens`
Table standard fournie par **Laravel Sanctum**.

### 2.3 Enums PHP
```php
enum Role: string { case Stagiaire = 'stagiaire'; case Admin = 'admin'; }
enum EmploymentStatus: string { case Looking='looking'; case Employed='employed'; }
enum OfferType: string { case Emploi='emploi'; case Stage='stage'; }
```

---

## 3. API REST — Endpoints

Toutes les réponses sont en JSON. Préfixe : `/api/v1`.
Auth : `Authorization: Bearer <token>` (Sanctum) sauf endpoints publics.

### 3.1 Public

| Méthode | Endpoint                 | Description                                  |
|---------|--------------------------|----------------------------------------------|
| POST    | `/auth/register`         | Inscription stagiaire (first_name, last_name, email, phone, password, password_confirmation, employment_status, job_*, filiere, promotion) |
| POST    | `/auth/login`            | Connexion (email, password) → `{ user, token }` |
| GET     | `/offers`                | Liste offres publiées (filtres : `search`) |
| GET     | `/offers/{id}`           | Détail d'une offre publiée                   |
| GET     | `/filieres`              | Liste des filières (groupées par catégorie)  |
| GET     | `/ping`                  | Health check → `{ ok: true }`                |

### 3.2 Authentifié (tout utilisateur connecté)

| Méthode | Endpoint                 | Description                                  |
|---------|--------------------------|----------------------------------------------|
| GET     | `/auth/me`               | Retourne l'utilisateur courant               |
| POST    | `/auth/logout`           | Invalide le token courant                    |

### 3.3 Stagiaire (`role=stagiaire`)

| Méthode | Endpoint                                | Description                              |
|---------|-----------------------------------------|------------------------------------------|
| GET     | `/me/profile`                           | Profil stagiaire                         |
| PUT     | `/me/profile`                           | Mise à jour profil (emploi, filière, ville, bio, etc.) |
| POST    | `/me/profile/photo`                     | Upload photo de profil                   |
| DELETE  | `/me/profile/photo`                     | Supprimer photo de profil                |
| PUT     | `/me/password`                          | Change le mot de passe                   |
| GET     | `/me/cv`                                | CV + sections                            |
| PUT     | `/me/cv`                                | Upsert CV complet (sync auto avec Profil/User : bio, birth_date, phone, names) |
| POST    | `/me/cv/pdf`                            | Upload PDF généré côté client            |
| POST    | `/offers/{id}/apply`                    | Postule (vérifie profil complet + CV finalisé) |
| GET     | `/me/applications`                      | Liste mes candidatures                   |
| DELETE  | `/me/applications/{id}`                 | Annuler une candidature                  |

### 3.4 Administration (`role=admin`)

| Méthode | Endpoint                                      | Description                                   |
|---------|-----------------------------------------------|-----------------------------------------------|
| GET     | `/admin/stats`                                | Indicateurs agrégés (counts, emploi par filière, candidatures 30j, activité récente) |
| GET     | `/admin/offers`                               | Liste (publiées + brouillons), filtres `search` |
| POST    | `/admin/offers`                               | Créer une offre                               |
| GET     | `/admin/offers/{id}`                          | Détail                                        |
| PUT     | `/admin/offers/{id}`                          | Modifier                                      |
| DELETE  | `/admin/offers/{id}`                          | Supprimer                                     |
| GET     | `/admin/stagiaires`                           | Liste stagiaires (filtres : `q`, `employment_status`, `filiere`, `promotion`) |
| GET     | `/admin/stagiaires/{id}`                      | Profil complet + CV                          |
| DELETE  | `/admin/stagiaires/{id}`                      | Supprimer un stagiaire                       |
| GET     | `/admin/stagiaires/{id}/cv/pdf`               | Télécharger le PDF du CV                     |
| GET     | `/admin/applications`                         | Liste toutes les candidatures                 |
| GET     | `/admin/filieres`                             | Liste des filières                            |
| POST    | `/admin/filieres`                             | Créer une filière                             |
| PUT     | `/admin/filieres/{id}`                        | Modifier une filière                          |
| DELETE  | `/admin/filieres/{id}`                        | Supprimer une filière                         |

### 3.5 Format d'erreur

```json
{
  "message": "The given data was invalid.",
  "errors": { "email": ["L'email est déjà utilisé."] }
}
```

Codes HTTP : `200` OK · `201` Created · `204` No Content · `400` Bad Request · `401` Unauthenticated · `403` Forbidden · `404` Not Found · `422` Unprocessable Entity · `429` Too Many Requests · `500` Server Error.

---

## 4. Flux fonctionnels clés

### 4.1 Inscription + suivi d'emploi

```
1. POST /auth/register                       → user créé (role=stagiaire), token retourné
   - employment_status (looking/employed) + job_title, job_company, job_city, job_start_date si employed
2. Frontend : EmploymentStatusPage ("l9iti l5edma ?")
   - Si employed → collecte les détails du poste
   - Si looking → passe directement
3. Frontend : CvBuilderPage
   - Si employed → pré-remplit une expérience à partir des données du poste
   - Si looking → CV vierge
```

### 4.2 Règles de gating pour candidature

Un stagiaire ne peut postuler (`POST /offers/{id}/apply`) que si :
1. `profile_completed = true` (filière + ville renseignées)
2. CV existe et `is_finalized = true`
3. Pas de candidature existante sur cette offre
4. `offer.is_published = true` ET (`closes_at` IS NULL OU `closes_at ≥ today`)

Chaque échec renvoie un `422` avec un message d'erreur explicite dans `errors.profile` ou `errors.offer`.

### 4.3 Création du CV en temps réel

- Le formulaire React maintient un state local complet du CV.
- Chaque modification met à jour le state → l'aperçu (composant `<CvPreview />`) se re-rend instantanément.
- Bouton **"Sauvegarder"** : PUT `/me/cv` — envoie toutes les sections + sync auto avec Profil/User.
- Bouton **"Télécharger PDF"** : génère le PDF côté client (`html2canvas` + `jsPDF`), puis l'upload via POST `/me/cv/pdf`.
- La finalisation (`is_finalized`) se gère dans le payload du PUT `/me/cv`.
- L'aperçu n'est visible que si le stagiaire a une photo de profil (sinon message "Photo requise").

### 4.4 Workflow candidature côté admin

L'admin accède à la liste des candidatures pour chaque offre. Il peut consulter le profil complet et le CV de chaque candidat. Le recrutement se fait par contact direct (téléphone/email) entre l'entreprise et le stagiaire, l'administration agissant comme facilitateur.

---

## 5. Frontend — Arborescence React

### 5.1 Routes

```
Public
  /                          HomePage
  /offres                    OffresListPage
  /offres/:id                OffreDetailPage
  /connexion                 LoginPage
  /inscription               RegisterPage
  /inscription/emploi        EmploymentStatusPage   (après register)

Stagiaire (protégé role=stagiaire, layout StagiaireLayout)
  /espace/profil             ProfilPage
  /espace/cv                 CvBuilderPage          (form + aperçu live)
  /espace/candidatures       CandidaturesPage

Admin (protégé role=admin, layout AdminLayout)
  /admin/dashboard           DashboardPage
  /admin/offres              OffresManagePage       (CRUD inline + modal)
  /admin/stagiaires          StagiairesListPage     (liste + détail inline + CV modal)
  /admin/candidatures        CandidaturesManagePage
  /admin/filieres            FilieresManagePage

404 page dédiée (NotFoundPage).
```

### 5.2 Organisation `src/`

```
src/
├── api/
│   ├── admin.js                  # toutes les fonctions admin (stagiaires, stats, etc.)
│   ├── applications.js           # applyToOffer, listMyApplications, cancelApplication
│   ├── auth.js                   # register, login, logout, me
│   ├── cv.js                     # getMyCv, updateMyCv, uploadCvPdf
│   ├── filieres.js               # listFilieres
│   ├── offers.js                 # listPublicOffers, getPublicOffer, listAdminOffers, CRUD
│   └── profile.js                # getMyProfile, updateMyProfile, uploadPhoto, deletePhoto, changePassword
├── components/
│   ├── brand/
│   │   └── Logo.jsx
│   ├── layout/
│   │   ├── PublicNavbar.jsx
│   │   └── Footer.jsx
│   └── ui/
│       ├── Badge.jsx
│       ├── DatePicker.jsx
│       ├── GroupedSelect.jsx
│       ├── ListEditor.jsx
│       ├── PageTransition.jsx
│       └── SectionHeader.jsx
├── features/auth/
│   ├── AuthVisual.jsx            # illustration side-panel for login/register
│   ├── GuestRoute.jsx            # redirects authenticated users away
│   └── ProtectedRoute.jsx        # role-based route protection
├── hooks/
│   └── useFilieres.js            # fetch + group filieres for selects
├── layouts/
│   ├── PublicLayout.jsx
│   ├── StagiaireLayout.jsx       # sidebar: Profil, Mon CV, Mes candidatures
│   └── AdminLayout.jsx           # sidebar: Tableau de bord, Offres, Stagiaires, Candidatures, Filières
├── lib/
│   ├── api.js                    # axios instance + Bearer token interceptor
│   ├── cities.js                 # VILLES list for location selects
│   ├── cn.js                     # classname utility
│   ├── jobTitles.js              # job title suggestions by filiere
│   └── normalizers.js            # normalizeOffer, normalizeStagiaire, denormalizeOffer, toUi
├── mocks/
│   └── data.js                   # EMPLOYMENT_LABELS static data
├── pages/
│   ├── HomePage.jsx
│   ├── LoginPage.jsx
│   ├── RegisterPage.jsx
│   ├── EmploymentStatusPage.jsx
│   ├── OffresListPage.jsx
│   ├── OffreDetailPage.jsx
│   ├── NotFoundPage.jsx
│   ├── stagiaire/
│   │   ├── ProfilPage.jsx        # profile edit + photo + password
│   │   ├── CvBuilderPage.jsx     # full CV editor + CvPreview (exported) + toUi helper
│   │   └── CandidaturesPage.jsx  # list + cancel
│   └── admin/
│       ├── DashboardPage.jsx     # KPIs + charts (Recharts)
│       ├── OffresManagePage.jsx  # CRUD offers + modal form
│       ├── StagiairesListPage.jsx # list + detail panel + CV viewer + PDF download
│       ├── CandidaturesManagePage.jsx
│       ├── FilieresManagePage.jsx
│       └── CvPrintPage.jsx       # full-page CV print view
├── routes/
│   └── AppRoutes.jsx
├── stores/
│   └── authStore.js              # Zustand + persist: user, token, setAuth, setUser, logout
├── App.jsx                       # BrowserRouter + QueryClientProvider + Toaster
└── main.jsx
```

### 5.3 Bibliothèques retenues

| Besoin                | Choix                           |
|-----------------------|---------------------------------|
| Routing               | `react-router-dom` v6           |
| State serveur         | `@tanstack/react-query`         |
| State client (auth)   | `zustand` + `zustand/middleware/persist` |
| Formulaires           | `react-hook-form` + `zod` (register page) |
| HTTP                  | `axios`                         |
| Icons                 | `lucide-react`                  |
| Animations            | `framer-motion`                 |
| Charts admin          | `recharts`                      |
| PDF export            | `html2canvas` + `jspdf`         |
| Toasts                | `sonner`                        |
| Classnames            | `tailwind-merge` + `clsx` (via `cn.js`) |

---

## 6. Maquettes (wireframes textuels) des pages principales

### 6.1 Page d'accueil (`/`)
```
┌──────────────────────────────────────────────────────────────┐
│  [Logo Tremplin]                          [Connexion] [Inscription] │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│   Votre profil, votre tremplin vers l'emploi.               │
│   Créez votre profil, construisez votre CV, et postulez…     │
│   [ Créer mon compte ]  [ Voir les offres ]                  │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│  Stats · Features · Comment ça marche · CTA                  │
├──────────────────────────────────────────────────────────────┤
│                         Footer                               │
└──────────────────────────────────────────────────────────────┘
```

### 6.2 Liste des offres (`/offres`)
```
┌──────────── Filtres (sidebar) ──┐  ┌───── Résultats (liste) ──────┐
│ Type : [emploi] [stage]         │  │ [Card Offre] ...              │
│ Recherche : [________]          │  │ [Card Offre] ...              │
│ Lieu : [________]               │  │ [Card Offre] ...              │
│ [Appliquer]                     │  │ ... pagination ...            │
└─────────────────────────────────┘  └───────────────────────────────┘
```

### 6.3 Détail offre (`/offres/:id`)
```
Titre de l'offre                        [Badge type]
Société · Lieu · Date de publication

Description complète…
Filière cible

[ Postuler ]   ← si non connecté : redirection login
               ← si connecté mais profil incomplet : tooltip
```

### 6.4 Inscription (`/inscription`)
Formulaire vertical :
- Prénom, Nom, Email, Téléphone
- Filière (optgroup par famille), Promotion (année, nombre)
- Mot de passe, Confirmation
- [ Créer un compte ]
- ou --- Se connecter

Après soumission → redirige vers `/inscription/emploi`.

### 6.5 Statut d'emploi (`/inscription/emploi`)
```
Avez-vous trouvé un emploi ?
   ( ) Oui, j'ai trouvé un emploi    ( ) Non, je cherche

Si oui :
  Poste : [________]
  Entreprise : [________]
  Ville : [________]
  Date de début : [________]

[ Continuer ]
```
- Oui → collecte les détails du poste
- Non → passe directement
- Après → `/espace/cv`

### 6.6 Page CV (`/espace/cv`)
Layout 2 colonnes :
```
┌─ Tabs scrollables (100%) ─────────────────────────────────────────┐
│ Informations personnelles · Formation · Expérience · Compétences · │
│ Certifications · Langues · Loisirs                                 │
└──────────────────────────────────────────────────────────────────┘
┌─────── Formulaire (gauche) ──────┐  ┌─────── Aperçu live (droite) ──┐
│                                   │  │                                │
│ Champs du formulaire actif        │  │   [Rendu du CV template A4]    │
│ (par section,
│  Ajouter/Supprimer par ligne)    │  │                                │
│                                   │  │                                │
│ [ Télécharger PDF ] [ Enregistrer ]│  │                                │
└───────────────────────────────────┘  └────────────────────────────────┘
```

### 6.8 Mes candidatures (`/espace/candidatures`)
Tableau :
| Offre | Société | Ville | Date | Action |
|-------|---------|-------|------|--------|
| …     | …       | …     | …    | [Annuler] |

### 6.9 Admin — Dashboard (`/admin/dashboard`)
```
┌─ Stats cards ──────────────────────────────────────────────┐
│ [Stagiaires: 42] [Employés: 18] [En recherche: 24] [Candidatures: 87] [Offres: 12] │
└────────────────────────────────────────────────────────────┘
┌─ Graphiques ──────────────────┐  ┌─ Activité récente ────────┐
│ Candidatures 30 derniers jours│  │ Liste des dernières      │
│ Emploi par filière (barres)   │  │ actions (inscriptions,   │
│                               │  │ candidatures, etc.)      │
└───────────────────────────────┘  └──────────────────────────┘
```

### 6.10 Admin — Gestion offres (`/admin/offres`)
Table avec colonnes : Titre, Type, Société, Publié, Candidatures (count), Date, Actions (Publier/Dépublier, Éditer, Supprimer).
Bouton **Nouvelle offre** → formulaire dans page ou modal.

### 6.11 Admin — Stagiaires (`/admin/stagiaires`)
Liste avec filtres (recherche, statut emploi, filière, promotion).
Sélection d'un stagiaire → panneau de détail inline :
```
┌─── Infos personnelles ────┐  ┌─── Situation emploi ────┐
│ Nom, email, tél, …         │  │ Employé / En recherche  │
│ Filière, niveau, année    │  │ Poste, Entreprise, Ville│
│                           │  │ (si employé)           │
└───────────────────────────┘  └─────────────────────────┘
┌─── CV ──────────────────────────────────────────────┐
│ Aperçu dans modal + lien télécharger PDF             │
└─────────────────────────────────────────────────────┘
Actions : [Supprimer] [Télécharger CV PDF]
```

### 6.12 Admin — Candidatures (`/admin/candidatures`)
Tableau de toutes les candidatures avec détails offre + stagiaire.
Pas de statut Accepté/Refusé — mise en relation directe.

---

## 7. Sécurité

| Domaine               | Mesure                                                                 |
|-----------------------|------------------------------------------------------------------------|
| Mots de passe         | `bcrypt` (Laravel Hash), politique min 8 caractères + validation Zod   |
| Auth                  | Sanctum tokens, logout révoque le token                                |
| Autorisation          | Middleware `EnsureRole` avec paramètre `admin` / `stagiaire`           |
| CSRF                  | SPA avec tokens Bearer → CSRF non requis sur `/api/*`                  |
| CORS                  | Whitelist du domaine frontend dans `config/cors.php`                   |
| Validation            | `FormRequest` Laravel sur chaque endpoint mutant                       |
| Uploads               | Validation MIME + `mimes:jpg,jpeg,png` (photos), `.pdf` (CV), taille ≤ 5 Mo |
| Injections SQL        | Eloquent / Query Builder systématiquement (jamais de raw SQL non paramétré) |
| XSS                   | Échappement par défaut de React, pas de `dangerouslySetInnerHTML`      |
| Rate limiting         | `throttle:10,1` sur `/auth/login` et `/auth/register`                  |
| RGPD / vie privée     | Données accessibles uniquement par le propriétaire et les admins     |
| Secrets               | `.env` (non commité)                                                   |

---

## 8. Suivi d'emploi

- **Champ** : `employment_status` sur `profiles` (enum `looking` / `employed`).
- **Si employed** : champs optionnels `job_title`, `job_company`, `job_city`, `job_start_date`.
- **Inscription** : le stagiaire indique sa situation dès l'inscription (EmploymentStatusPage).
- **Admin** : le dashboard affiche les stats employés vs en recherche par filière.
- **CV** : si employed, les données du poste peuvent pré-remplir une expérience dans le CV.

---

## 9. Tests

### Backend
- **Pest / PHPUnit** — feature tests pour chaque endpoint (happy path + cas d'erreur + autorisation).
- **Factories & Seeders** pour générer des stagiaires, offres, candidatures de démo.
- Tests du suivi d'emploi et des règles de gating.

### Frontend
- **Vitest** + **React Testing Library** — composants clés (CvPreview, OfferCard, ProtectedRoute).
- **Playwright** (optionnel v2) — parcours E2E : inscription → profil → CV → candidature.

### CI (`.github/workflows/ci.yml`)
- Jobs parallèles :
  - `backend` : PHP 8.2 + MySQL service, `composer install`, `php artisan test`.
  - `frontend` : Node 20, `npm ci`, `npm run lint`, `npm run test`, `npm run build`.

---

## 10. Environnement & déploiement

### Dev local (XAMPP)
- Installer XAMPP et démarrer MySQL.
- Créer une base de données `tremplin` via phpMyAdmin.
- Backend lancé avec `php artisan serve` (port 8000).
- Frontend lancé avec `npm run dev` (Vite, port 5173) — proxy `/api` → `http://localhost:8000`.

### Variables d'environnement backend (`.env`)
```
APP_NAME="Tremplin"
APP_URL=http://localhost:8000
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_DATABASE=tremplin
DB_USERNAME=root
DB_PASSWORD=
QUEUE_CONNECTION=database
FILESYSTEM_DISK=local
SANCTUM_STATEFUL_DOMAINS=localhost:5173
FRONTEND_URL=http://localhost:5173
```

### Variables d'environnement frontend (`.env`)
```
VITE_API_URL=http://localhost:8000/api
```

### Déploiement (cible prod)
- **Backend** : serveur LAMP/LEMP (ou conteneur), PHP 8.2, MySQL 8.
- **Frontend** : build statique (`npm run build`) servi par Nginx ou via CDN.
- **Stockage** : `storage/app/` avec backup nightly.
- Migrations exécutées via `php artisan migrate --force` au déploiement.

---

## 11. Roadmap de livraison proposée

| Phase | Livrable                                                                 |
|-------|--------------------------------------------------------------------------|
| **0** | Validation de ce document                                                |
| **1** | Scaffold monorepo + CI + XAMPP setup + auth (register/login) + rôles |
| **2** | Espace stagiaire : profil, suivi d'emploi, CV builder                  |
| **3** | CV builder (form + aperçu live + impression navigateur)                 |
| **4** | Espace public offres + candidature + règles de gating                   |
| **5** | Espace admin : dashboard + CRUD offres + gestion stagiaires & candidatures |
| **6** | Tests E2E, polish UI, responsive, documentation déploiement             |

Chaque phase = 1 PR principale (+ PRs correctives si nécessaire).

---

## 12. Décisions arrêtées pour la v1

| # | Point                       | Choix retenu                                                                 | Justification                                        |
|---|-----------------------------|------------------------------------------------------------------------------|------------------------------------------------------|
| 1 | Langue UI                   | **Français uniquement**                                                      | CDC rédigé en FR, simple, i18n ajoutable plus tard   |
| 2 | Emails transactionnels      | **Non implémenté** en v1 (prévu : confirmation inscription)                 | Dev via log, prod via SMTP                            |
| 3 | Photo de profil             | **Obligatoire** pour aperçu CV et postuler                                   | Professionnalisme des CVs partagés                   |
| 4 | Templates CV                | **Template unique** (moderne, barre latérale)                               | Un seul design soigné, simplicité                    |
| 5 | Export CV                   | **PDF Client-Side** via `html2canvas` + `jsPDF` + upload sur serveur         | Fidélité visuelle parfaite + stockage côté serveur   |
| 6 | Notifications in-app        | **Toasts (sonner)** pour feedbacks d'action                                  | UX moderne sans complexité backend                   |
| 7 | Thème visuel                | **Design libre, moderne** — palette brand verte, typo Inter                  | Identité cohérente ISTA                              |
| 8 | Hébergement cible           | **Local uniquement** (XAMPP) — pas de déploiement public prévu               | Usage interne ISTA Khemisset                         |
| 9 | Suivi d'emploi              | **Oui**, champ `employment_status` + détails du poste si employé            | Core value du projet : tracker l'insertion pro        |
| 10| Compte admin seed (dev)     | `admin@tremplin.ma` / `tremplin --admin` (override via `.env`)               | Valeurs de dev, rotation obligatoire en prod         |
| 11| Types d'offres              | **Emploi + stage** (conformément au CDC)                                     | Le CDC mentionne explicitement les deux              |
| 12| Versioning API              | **`/api/v1/*`**                                                              | Permet d'ajouter v2 sans casser les clients          |

### 12.1 Touches "modern 2026" implémentées

- **Toasts** (`sonner`) pour tous les feedbacks d'action.
- **Animations légères** via `framer-motion` (transitions de page, micro-interactions).
- **Responsive mobile-first** systématique.
- **Accessibilité** : focus-visible, labels ARIA.
- **Skeleton loaders** via états `isLoading` de TanStack Query.

---

*Fin du document.*
