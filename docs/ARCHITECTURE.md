# Document d'architecture — Plateforme Tremplin

> Plateforme web de gestion des stagiaires et des offres d'emploi / stage
> Stack : **React (JavaScript / JSX)** + **Tailwind CSS** (frontend) · **Laravel 11** (API REST) · **MySQL 8** · **Laravel Sanctum** (auth)
> Document de conception rédigé à partir du cahier des charges fourni.

---

## 1. Vue d'ensemble de l'architecture

### 1.1 Diagramme logique

```
┌──────────────────────────────┐        HTTPS / JSON        ┌────────────────────────────┐
│   Frontend React (SPA)       │ ─────────────────────────► │   Backend Laravel (API)    │
│   - React 18 + Vite (JS/JSX) │ ◄───────────────────────── │   - Routes /api/*          │
│   - React Router             │   Bearer token (Sanctum)   │   - Controllers / Services │
│   - Tailwind CSS             │                            │   - Policies / Middleware  │
│   - TanStack Query (fetch)   │                            │                            │
│   - Zustand (auth state)     │                            │                            │
└──────────────────────────────┘                            └─────────────┬──────────────┘
                                                                          │
                                                              Eloquent ORM│
                                                                          ▼
                                                            ┌────────────────────────────┐
                                                            │         MySQL 8            │
                                                            └────────────────────────────┘

Stockage fichiers : storage/app/public (photos)
```

### 1.2 Structure du monorepo

```
ista-khemisset-platform/
├── backend/                    # Laravel 11
│   ├── app/
│   │   ├── Http/
│   │   │   ├── Controllers/Api/
│   │   │   ├── Requests/
│   │   │   ├── Resources/
│   │   │   └── Middleware/
│   │   ├── Models/
│   │   ├── Policies/
│   │   ├── Services/
│   │   └── Enums/
│   ├── database/
│   │   ├── migrations/
│   │   ├── factories/
│   │   └── seeders/
│   ├── routes/api.php
│   └── tests/
├── frontend/                   # React 18 + Vite (JavaScript / JSX)
│   ├── src/
│   │   ├── api/                # clients axios, hooks TanStack Query  (.js)
│   │   ├── components/         # (.jsx)
│   │   ├── features/           # auth, offers, applications, cv, admin (.jsx)
│   │   ├── mocks/              # données statiques de démo (.js)
│   │   ├── layouts/            # (.jsx)
│   │   ├── pages/              # (.jsx)
│   │   ├── routes/             # AppRoutes, ProtectedRoute, GuestRoute (.jsx)
│   │   ├── stores/             # zustand (auth)  (.js)
│   │   └── lib/                # (.js)
│   ├── public/
│   ├── jsconfig.json
│   └── tailwind.config.js
├── docker-compose.yml          # mysql + phpmyadmin (dev)
├── .github/workflows/ci.yml
└── README.md
```

### 1.3 Principes directeurs

- **Séparation claire** front ↔ back, communication uniquement en JSON via API REST.
- **Authentification par token** (Sanctum personal access tokens) stocké côté front en mémoire + refresh via cookie httpOnly optionnel.
- **Autorisation par rôle** (`stagiaire`, `admin`) via middleware + Policies Laravel.
- **Règles métier au backend** (jamais de confiance dans le front) : un stagiaire ne peut postuler que si profil complet + CV finalisé (photo obligatoire).
- **Recrutement direct** : le système ne gère plus de statuts (Accepté/Refusé). L'administration facilite la mise en relation en partageant les CVs aux entreprises.
- **Suivi d'emploi** : chaque stagiaire indique s'il est employé ou en recherche, avec les détails du poste si applicable.
- **Validation des uploads** stricte : MIME, taille max (5 Mo), extensions (.pdf, .jpg, .jpeg, .png).

---

## 2. Modèle de données (MySQL)

### 2.1 Diagramme ER synthétique

```
users ──1:1── stagiaire_profiles ──1:1── cvs
  │                   │                   │
  │                   │                   ├── 1:N cv_experiences
  │                   │                   ├── 1:N cv_educations
  │                   │                   ├── 1:N cv_skills
  │                   │                   ├── 1:N cv_languages
  │                   │                   └── 1:N cv_certifications
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
| full_name          | VARCHAR(150)      | NOT NULL                            |
| email              | VARCHAR(180)      | NOT NULL, UNIQUE                    |
| phone              | VARCHAR(20)       | NULLABLE                            |
| password           | VARCHAR(255)      | NOT NULL (bcrypt)                   |
| role               | ENUM              | `stagiaire`, `admin` — NOT NULL     |
| email_verified_at  | TIMESTAMP         | NULLABLE                            |
| remember_token     | VARCHAR(100)      | NULLABLE                            |
| created_at / updated_at | TIMESTAMP    |                                     |

Index : `(role)`, `(email)`.

#### `stagiaire_profiles`
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
| links               | JSON               | NULLABLE (`[{label, url}]`)          |
| profile_completed    | BOOLEAN           | NOT NULL, default false              |
| created_at / updated_at | TIMESTAMP      |                                      |

#### `offers`
| Champ           | Type              | Contraintes                         |
|-----------------|-------------------|-------------------------------------|
| id              | BIGINT UNSIGNED   | PK                                  |
| title           | VARCHAR(180)      | NOT NULL                            |
| company_name    | VARCHAR(150)      | NOT NULL                            |
| type            | ENUM              | `emploi`, `stage`                   |
| description     | TEXT              | NOT NULL                            |
| requirements    | TEXT              | NULLABLE (contient la filière et les tags) |
| location        | VARCHAR(150)      | NULLABLE                            |
| contract_type   | VARCHAR(80)       | NULLABLE (CDI, CDD, PFE, …)         |
| duration        | VARCHAR(80)       | NULLABLE                            |
| salary_range    | VARCHAR(80)       | NULLABLE                            |
| is_published    | BOOLEAN           | NOT NULL, default true              |
| published_at    | TIMESTAMP         | NULLABLE                            |
| closes_at       | DATE              | NULLABLE                            |
| created_by      | BIGINT UNSIGNED   | FK users.id (admin)                 |
| created_at / updated_at | TIMESTAMP |                                     |

Index : `(is_published, published_at)`, `(type)`.

#### `cvs`
| Champ            | Type              | Contraintes                         |
|------------------|-------------------|-------------------------------------|
| id               | BIGINT UNSIGNED   | PK                                  |
| user_id          | BIGINT UNSIGNED   | FK users.id UNIQUE                  |
| title            | VARCHAR(150)      | NULLABLE (intitulé recherché)       |
| summary          | TEXT              | NULLABLE (résumé / objectif)        |
| pdf_path         | VARCHAR(255)      | NULLABLE (PDF généré)               |
| is_finalized     | BOOLEAN           | default false                       |
| created_at / updated_at | TIMESTAMP  |                                     |

#### `cv_experiences`
| id, cv_id (FK), position, company, city, start_date, end_date, is_current BOOL, description TEXT, sort_order INT |


#### `cv_educations`
| Champ | Type | Contraintes |
|---|---|---|
| id, cv_id (FK), degree, school, city, start_date, end_date, is_current BOOL, description, sort_order | | |

#### `cv_skills`
| id, cv_id (FK), name VARCHAR(100), sort_order |

#### `cv_languages`
| id, cv_id (FK), name, level VARCHAR(50) |

#### `cv_certifications`
| id, cv_id (FK), name VARCHAR(150), year YEAR, sort_order INT |

#### `applications`
| Champ         | Type              | Contraintes                        |
|---------------|-------------------|------------------------------------|
| id            | BIGINT UNSIGNED   | PK                                 |
| user_id       | BIGINT UNSIGNED   | FK users.id                        |
| offer_id      | BIGINT UNSIGNED   | FK offers.id                       |
| cv_snapshot   | JSON              | copie figée du CV au moment de la candidature |
| cover_message | TEXT              | NULLABLE                           |
| created_at / updated_at | TIMESTAMP |                                  |

Contrainte : `UNIQUE(user_id, offer_id)` → un stagiaire ne postule qu'une fois par offre.
Index : `(offer_id, status)`, `(user_id, status)`.

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

Toutes les réponses sont en JSON. Préfixe : `/api`.
Auth : `Authorization: Bearer <token>` (Sanctum) sauf endpoints publics.
Pagination : `?page=1&per_page=15` → réponse `{ data: [...], meta: {...}, links: {...} }`.

### 3.1 Public

| Méthode | Endpoint                 | Description                                  |
|---------|--------------------------|----------------------------------------------|
| POST    | `/auth/register`         | Inscription stagiaire (name, email, phone, password, password_confirmation, employment_status, job_*, filiere, promotion) |
| POST    | `/auth/login`            | Connexion (email, password) → `{ user, token }` |
| POST    | `/auth/forgot-password`  | Email de reset (optionnel v1)                |
| GET     | `/offers`                | Liste offres publiées (filtres : `type`, `q`, `location`) |
| GET     | `/offers/{id}`           | Détail d'une offre publiée                   |
| GET     | `/offers/recent`         | 3 offres les plus récentes (page d'accueil)  |

### 3.2 Authentifié (tout utilisateur connecté)

| Méthode | Endpoint                 | Description                                  |
|---------|--------------------------|----------------------------------------------|
| GET     | `/auth/me`               | Retourne l'utilisateur courant               |
| POST    | `/auth/logout`           | Invalide le token courant                    |
| PATCH   | `/auth/password`         | Change le mot de passe                       |

### 3.3 Stagiaire (`role=stagiaire`)

| Méthode | Endpoint                                | Description                              |
|---------|-----------------------------------------|------------------------------------------|
| GET     | `/me/profile`                           | Profil stagiaire                         |
| PUT     | `/me/profile`                           | Mise à jour profil (emploi, filière, etc.) |
| GET     | `/me/cv`                                | CV + sections                            |
| PUT     | `/me/cv`                                | Upsert CV complet (sync auto avec Profil/User : bio, address, birth_date, phone, names) |
| POST    | `/me/cv/finalize`                       | Marque `is_finalized=true`                 |
| POST    | `/offers/{id}/apply`                    | Postule (vérifie profil complet + CV finalisé + photo obligatoire) |
| GET     | `/me/applications`                      | Liste mes candidatures                   |
| GET     | `/me/applications/{id}`                 | Détail                                   |

### 3.4 Administration (`role=admin`)

| Méthode | Endpoint                                      | Description                                   |
|---------|-----------------------------------------------|-----------------------------------------------|
| GET     | `/admin/dashboard`                            | Indicateurs agrégés (counts, graphiques)      |
| GET     | `/admin/offers`                               | Liste (publiées + brouillons), filtres        |
| POST    | `/admin/offers`                               | Créer une offre                               |
| GET     | `/admin/offers/{id}`                          | Détail                                        |
| PUT     | `/admin/offers/{id}`                          | Modifier                                      |
| DELETE  | `/admin/offers/{id}`                          | Supprimer                                     |
| PATCH   | `/admin/offers/{id}/publish`                  | Publier / dépublier (toggle `is_published`)   |
| GET     | `/admin/stagiaires`                           | Liste stagiaires (filtres : `q`, `employment_status`, `filiere`, `promotion`) |
| GET     | `/admin/stagiaires/{id}`                      | Profil complet + CV                          |
| GET     | `/admin/offers/{id}/applications`             | Candidatures pour une offre                   |
| GET     | `/admin/applications/{id}`                    | Détail candidature (CV + snapshot)            |

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
1. `profile_completed = true` (Photo de profil obligatoire)
2. CV existe et `is_finalized = true`
3. Pas de candidature existante sur cette offre
4. `offer.is_published = true` ET (`closes_at` IS NULL OU `closes_at ≥ today`)

Chaque échec renvoie un `422` avec un code d'erreur métier explicite :
```json
{ "message": "Profil incomplet", "code": "profile_incomplete" }
{ "message": "CV non finalisé", "code": "cv_not_finalized" }
{ "message": "Déjà candidat", "code": "already_applied" }
{ "message": "Offre fermée", "code": "offer_closed" }
```

### 4.3 Création du CV en temps réel

- Le formulaire React maintient un state local complet du CV.
- Chaque modification met à jour le state → l'aperçu (composant `<CvPreview />`) se re-rend instantanément.
- Bouton **"Sauvegarder"** : PUT `/me/cv` + mutations par section (experiences/educations/…).
- Bouton **"Finaliser"** : POST `/me/cv/finalize` → met `is_finalized=true`.
- Modification ultérieure → `is_finalized` repasse à `false` jusqu'à nouvelle finalisation.

### 4.4 Workflow candidature côté admin

L'admin accède à la liste des candidatures pour chaque offre. Il peut consulter le profil complet et le CV de chaque candidat. Le recrutement se fait par contact direct (téléphone/email) entre l'entreprise et le stagiaire, l'administration agissant comme facilitateur.

---

## 5. Frontend — Arborescence React

### 5.1 Routes

```
Public
  /                          HomePage              (hero + 3 offres récentes + CTA)
  /offres                    OffersListPage
  /offres/:id                OfferDetailPage
  /connexion                 LoginPage
  /inscription               RegisterPage
  /inscription/emploi        EmploymentStatusPage   (après register)

Stagiaire (protégé role=stagiaire)
  /espace                    StagiaireLayout
    /espace/profil           ProfileEditPage
    /espace/cv               CvBuilderPage             (form + preview live)
    /espace/candidatures     MyApplicationsPage
    /espace/candidatures/:id ApplicationDetailPage

Admin (protégé role=admin)
  /admin/connexion           AdminLoginPage
  /admin                     AdminLayout
    /admin/dashboard         DashboardPage
    /admin/offres            OffersAdminPage
    /admin/offres/nouvelle   OfferFormPage
    /admin/offres/:id        OfferFormPage (édition)
    /admin/offres/:id/candidatures  OfferApplicationsPage
    /admin/stagiaires        StagiairesListPage
    /admin/stagiaires/:id    StagiaireDetailPage
    /admin/candidatures/:id  ApplicationReviewPage

404 / 403 pages dédiées.
```

### 5.2 Organisation `src/`

```
src/
├── api/
│   ├── client.js                 # axios instance + interceptor token
│   ├── auth.js
│   ├── offers.js
│   ├── applications.js
│   ├── cv.js
│   ├── profile.js
│   └── admin/
│       ├── offers.js
│       ├── stagiaires.js
│       └── applications.js
├── stores/
│   └── authStore.js              # Zustand : user, token, login/logout
├── features/
│   ├── auth/
│   │   ├── RegisterForm.jsx
│   │   ├── LoginForm.jsx
│   │   └── ProtectedRoute.jsx
│   ├── offers/
│   │   ├── OfferCard.jsx
│   │   ├── OfferFilters.jsx
│   │   └── OfferBadge.jsx
│   ├── cv/
│   │   ├── CvBuilder.jsx
│   │   ├── CvPreview.jsx
│   │   ├── sections/
│   │   │   ├── ExperiencesForm.jsx
│   │   │   ├── EducationsForm.jsx
│   │   │   ├── SkillsForm.jsx
│   │   │   └── LanguagesForm.jsx
│   │   └── templates/
│   │       ├── ClassicTemplate.jsx
│   │       └── ModernTemplate.jsx
│   ├── applications/
│   │   └── ApplicationsTable.jsx
│   └── admin/
│       └── StatCard.jsx
│       └── OfferForm.jsx
├── components/                   # UI générique
│   ├── ui/
│   │   ├── Button.jsx
│   │   ├── Input.jsx
│   │   ├── Select.jsx
│   │   ├── Modal.jsx
│   │   ├── Table.jsx
│   │   ├── Badge.jsx
│   │   ├── Toast.jsx
│   │   └── EmptyState.jsx
│   └── layout/
│       ├── PublicNavbar.jsx
│       ├── StagiaireSidebar.jsx
│       ├── AdminSidebar.jsx
│       └── Footer.jsx
├── layouts/
│   ├── PublicLayout.jsx
│   ├── StagiaireLayout.jsx
│   └── AdminLayout.jsx
├── pages/                        # pages listées plus haut (.jsx)
├── routes/
│   └── AppRoutes.jsx
├── lib/
│   ├── formatters.js
│   ├── validators.js             # schémas Zod (validation runtime, pas de types statiques)
│   └── constants.js
├── hooks/
│   ├── useAuth.js
│   ├── useOffers.js
│   └── useCv.js
├── App.jsx
└── main.jsx
```

### 5.3 Bibliothèques retenues

| Besoin                | Choix                           |
|-----------------------|---------------------------------|
| Routing               | `react-router-dom` v6           |
| State serveur         | `@tanstack/react-query`         |
| State client (auth)   | `zustand`                       |
| Formulaires           | `react-hook-form` + `zod`       |
| HTTP                  | `axios`                         |
| Icons                 | `lucide-react`                  |
| Tables admin          | `@tanstack/react-table`         |
| Toasts                | `sonner`                        |
| Dates                 | `date-fns`                      |
| Upload preview        | natif + `react-dropzone`        |

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
Exigences…
Durée / Contrat / Salaire

[ Postuler ]   ← si non connecté : redirection login
               ← si connecté mais profil incomplet : tooltip
```

### 6.4 Inscription (`/inscription`)
Formulaire vertical :
- Nom complet, Email, Téléphone
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
│ Certifications · Langues · Loisirs                                │
└──────────────────────────────────────────────────────────────────┘
┌─────── Formulaire (gauche) ──────┐  ┌─────── Aperçu live (droite) ──┐
│                                   │  │                                │
│ Champs du formulaire actif        │  │   [Rendu du CV template        │
│ (par section, avec boutons        │  │    Classic A4, sidebar sombre] │
│  Ajouter/Supprimer par ligne)    │  │                                │
│                                   │  │                                │
│ [ Télécharger PDF ] [ Enregistrer ]│  │                                │
└───────────────────────────────────┘  └────────────────────────────────┘
```

### 6.8 Mes candidatures (`/espace/candidatures`)
Tableau :
| Offre | Société | Date | Statut (badge) | Action |
|-------|---------|------|----------------|--------|
| …     | …       | …    | En attente     | [Voir] |

### 6.9 Admin — Dashboard (`/admin/dashboard`)
```
┌─ Stats cards ──────────────────────────────────────────────┐
│ [Stagiaires: 42] [Employés: 18] [Candidatures: 87] [Acceptées: 21] │
└────────────────────────────────────────────────────────────┘
┌─ Graphiques ──────────────────┐  ┌─ Dernières candidatures ─┐
│ Employés vs recherche/filière│  │ Liste des 5 dernières    │
│ Répartition statuts (donut)   │  │                          │
└───────────────────────────────┘  └──────────────────────────┘
```

### 6.10 Admin — Gestion offres (`/admin/offres`)
Table avec colonnes : Titre, Type, Société, Publié, Candidatures (count), Date, Actions (Publier/Dépublier, Éditer, Supprimer).
Bouton **Nouvelle offre** → formulaire dans page ou modal.

### 6.11 Admin — Détail stagiaire (`/admin/stagiaires/:id`)
```
┌─── Infos personnelles ────┐  ┌─── Situation emploi ────┐
│ Nom, email, tél, …         │  │ Employé / En recherche  │
│ Filière, niveau, année    │  │ Poste, Entreprise, Ville│
│                           │  │ (si employé)           │
└───────────────────────────┘  └─────────────────────────┘
┌─── CV ──────────────────────────────────────────────┐
│ Aperçu + lien PDF                                   │
└─────────────────────────────────────────────────────┘
┌─── Candidatures ────────────────────────────────────┐
│ Table avec liens vers /admin/candidatures/:id       │
└─────────────────────────────────────────────────────┘
```

### 6.12 Admin — Review candidature (`/admin/candidatures/:id`)
- Gauche : CV rendu
- Droite : panneau de décision
  - Statut actuel
  - [ Accepter ]  [ Refuser ]
  - Commentaire (textarea)
  - Historique des changements

---

## 7. Sécurité

| Domaine               | Mesure                                                                 |
|-----------------------|------------------------------------------------------------------------|
| Mots de passe         | `bcrypt` (Laravel Hash), politique min 8 caractères + validation Zod   |
| Auth                  | Sanctum tokens, expiration configurable, logout révoque le token       |
| Autorisation          | Middleware `role:admin` / `role:stagiaire`, Policies par ressource     |
| CSRF                  | SPA avec tokens Bearer → CSRF non requis sur `/api/*`                  |
| CORS                  | Whitelist du domaine frontend dans `config/cors.php`                   |
| Validation            | `FormRequest` Laravel sur chaque endpoint mutant                       |
| Uploads               | Validation MIME + `mimes:pdf,jpg,jpeg,png`, taille ≤ 5 Mo, stockage hors webroot (`storage/app/private`) → accès via route signée |
| Injections SQL        | Eloquent / Query Builder systématiquement (jamais de raw SQL non paramétré) |
| XSS                   | Échappement par défaut de React, pas de `dangerouslySetInnerHTML`      |
| Rate limiting         | `throttle:60,1` sur `/api`, `throttle:5,1` sur `/auth/login` et `/auth/register` |
| Logs                  | Pas de password / token en logs, masquage via `VarDumper`              |
| RGPD / vie privée     | Données accessibles uniquement par le propriétaire et les admins     |
| Secrets               | `.env` (non commité), secrets CI via GitHub Actions secrets            |

---

## 8. Suivi d'emploi

- **Champ** : `employment_status` sur `stagiaire_profiles` (enum `looking` / `employed`).
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

### Dev local (docker-compose)
- Service `db` (MySQL 8) + `pma` (phpMyAdmin).
- Backend lancé avec `php artisan serve` (port 8000).
- Frontend lancé avec `npm run dev` (Vite, port 5173) — proxy `/api` → `http://localhost:8000`.

### Variables d'environnement backend (`.env`)
```
APP_NAME="Tremplin"
APP_URL=http://localhost:8000
DB_CONNECTION=mysql
DB_HOST=mysql
DB_DATABASE=tremplin
DB_USERNAME=tremplin
DB_PASSWORD=secret
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
| **1** | Scaffold monorepo + CI + docker-compose + auth (register/login) + rôles |
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
| 2 | Emails transactionnels      | **Oui, minimal** : confirmation inscription + notification statut candidature | Dev via log, prod via SMTP                            |
| 3 | Photo de profil             | **Obligatoire** pour postuler                                                | Sécurité et professionnalisme des CVs partagés       |
| 4 | Templates CV                | **1 seul** (Classic) très soigné en v1                                       | Focus sur l'efficacité et la lisibilité             |
| 5 | Export CV                   | **PDF Client-Side** via `html2canvas` + `jsPDF`                             | Assure une fidélité visuelle parfaite                 |
| 6 | Notifications in-app        | **Toasts (sonner) + badge compteur** sur "Mes candidatures"                  | UX moderne sans complexité backend                   |
| 7 | Thème visuel                | **Design libre, moderne** — couleurs OFPPT (vert #0A7A3B + neutre), typo Inter | Identité cohérente ISTA sans attendre une charte     |
| 8 | Hébergement cible           | **Portable** : docker-compose prêt + doc déploiement VPS Ubuntu + Nginx      | L'école choisira l'hébergeur plus tard               |
| 9 | Suivi d'emploi              | **Oui**, champ `employment_status` + détails du poste si employé            | Core value du projet : tracker l'insertion pro        |
| 10| Compte admin seed (dev)     | `admin@tremplin.ma` / `tremplin --admin` (override via `.env`)               | Valeurs de dev, rotation obligatoire en prod         |
| 11| Types d'offres              | **Emploi + stage** (conformément au CDC)                                     | Le CDC mentionne explicitement les deux              |
| 12| Versioning API              | **`/api/v1/*`**                                                              | Permet d'ajouter v2 sans casser les clients          |

### 12.1 Touches "modern 2026" ajoutées

- **Skeleton loaders** pendant le chargement des listes (pas de spinners bruts).
- **Toasts** (`sonner`) pour tous les feedbacks d'action.
- **Animations légères** via `framer-motion` (transitions de page, micro-interactions).
- **Dark mode** avec toggle dans le header (classe `dark:` Tailwind).
- **Responsive mobile-first** systématique (nav → drawer sur mobile).
- **PWA-ready** : `manifest.webmanifest` + icônes, installable sur mobile.
- **Accessibilité** : focus-visible, labels ARIA, contraste AA.
- **Meta SEO** de base sur les pages publiques (titre, description, OG tags).

---

*Fin du document.*
