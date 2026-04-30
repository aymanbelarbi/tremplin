# Tremplin

> Web platform for managing trainees and job/internship offers for **ISTA Khemisset**.

**Tremplin** connects ISTA trainees to professional opportunities: trainees create their profiles, indicate their employment status, build their CVs online, and apply for offers published by the administration. The administration facilitates the connection by centralizing applications and sharing qualified profiles with partner companies.

![Tremplin](https://img.shields.io/badge/Laravel-11-red) ![React](https://img.shields.io/badge/React-18-blue) ![PHP](https://img.shields.io/badge/PHP-8.3-purple) ![Node](https://img.shields.io/badge/Node-20%2B-green)

---

## Table of Contents

1. [Technical Stack](#technical-stack)
2. [Monorepo Structure](#monorepo-structure)
3. [Prerequisites Installation](#prerequisites-installation)
   - [Windows](#windows)
   - [macOS](#macos)
   - [Linux (Ubuntu/Debian)](#linux-ubuntudebian)
4. [Project Setup](#project-setup)
5. [Running the Application](#running-the-application)
6. [Demo Accounts](#demo-accounts)
7. [Docker Services](#docker-services)
8. [Testing](#testing)
9. [Useful Commands](#useful-commands)
10. [Troubleshooting](#troubleshooting)

---

## Technical Stack

- **Frontend**: React 18 (JavaScript / JSX) + Vite + Tailwind CSS
- **Backend**: Laravel 11 + PHP 8.3 + Sanctum (Token-based auth)
- **Database**: MySQL 8 (Docker for dev, dedicated server for prod)
- **Employment Tracking**: Each trainee indicates if they are employed or looking for a job
- **CV**: Real-time PDF generation (`jsPDF` + `html2canvas`)
- **Mail**: Configurable SMTP (default to log in dev)

## Monorepo Structure

```
tremplin/
├── backend/                   # Laravel 11 API
├── frontend/                  # React 18 SPA (JS/JSX) + Vite + Tailwind
├── docs/                      # Documentation
├── docker-compose.yml         # MySQL + phpMyAdmin (dev)
├── .github/workflows/ci.yml   # CI: backend tests + frontend lint/build
└── README.md
```

---

## Prerequisites Installation

You need **4 tools**: **PHP 8.3+**, **Node 20+**, **Composer 2**, and **Docker** (for local MySQL). Choose your platform below.

### Windows

**Option A — Official Installers (Recommended for beginners)**

1. **PHP 8.3**: Download `php-8.3.x-Win32-vs16-x64.zip` from [windows.php.net/download](https://windows.php.net/download/), extract to `C:\php`, then add `C:\php` to your `PATH` (System Settings → Environment Variables).
   - Rename `php.ini-development` to `php.ini` and uncomment the following extensions: `extension=curl`, `extension=fileinfo`, `extension=gd`, `extension=mbstring`, `extension=openssl`, `extension=pdo_mysql`, `extension=zip`.
2. **Composer**: Download the installer [getcomposer.org/Composer-Setup.exe](https://getcomposer.org/Composer-Setup.exe) and run it.
3. **Node 20+**: Download the LTS installer from [nodejs.org](https://nodejs.org/) → "LTS".
4. **Git**: [git-scm.com/download/win](https://git-scm.com/download/win).
5. **Docker Desktop**: [docker.com/products/docker-desktop](https://www.docker.com/products/docker-desktop/) (requires WSL2 on Windows 10/11).

**Option B — Chocolatey (Faster if you are familiar)**

```powershell
# In PowerShell as Administrator
choco install php composer nodejs-lts git docker-desktop -y
```

**Verification:**
```powershell
php --version        # should show 8.3.x
composer --version   # should show 2.x
node --version       # should show v20.x or higher
git --version
```

### macOS

**With Homebrew** (Recommended — [brew.sh](https://brew.sh/) to install if you don't have it):

```bash
brew install php@8.3 composer node git
brew link --force --overwrite php@8.3
brew install --cask docker     # Docker Desktop
```

**Verification:**
```bash
php --version
composer --version
node --version
git --version
```

### Linux (Ubuntu/Debian)

```bash
# PHP 8.3 + necessary extensions
sudo add-apt-repository ppa:ondrej/php -y
sudo apt update
sudo apt install -y php8.3 php8.3-cli php8.3-mbstring php8.3-xml php8.3-curl \
  php8.3-zip php8.3-gd php8.3-mysql unzip git

# Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# Node 20+ (via NodeSource)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Docker + Docker Compose
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER  # restart session to use docker without sudo
```

**Verification:**
```bash
php --version && composer --version && node --version
```

---

## Project Setup

Once the prerequisites are installed, the following commands work **the same on Windows / macOS / Linux** (use PowerShell, Terminal, or Bash).

### 1. Clone the repository

```bash
git clone https://github.com/aymanbelarbi/tremplin.git
cd tremplin
```

### 2. Configure the backend

```bash
cd backend
composer install
```

**Create the `.env` file:**

- **macOS / Linux:** `cp .env.example .env`
- **Windows (PowerShell):** `Copy-Item .env.example .env`
- **Windows (CMD):** `copy .env.example .env`

**Start MySQL via Docker** (from the repo root, in another terminal):

```bash
docker compose up -d mysql
```

MySQL runs on `localhost:3306` with:
- DB: `tremplin`
- User: `tremplin`
- Password: `secret`

These values are already in `.env.example` — no changes needed.

**Generate key + migrate + seed with demo data:**

```bash
php artisan key:generate
php artisan migrate:fresh --seed
```

> ⚡ This command creates the database + an admin account. Trainees register via the public registration form.

### 3. Configure the frontend

In a **new terminal** (keep the first one open):

```bash
cd tremplin/frontend
npm install
```

---

## Running the Application

**Two terminals in parallel:**

### Terminal 1 — Backend (Laravel)

```bash
cd tremplin/backend
php artisan serve
```

→ API available at **http://localhost:8000**

### Terminal 2 — Frontend (Vite)

```bash
cd tremplin/frontend
npm run dev
```

→ Interface available at **http://localhost:5173** (or the port displayed in the console)

The frontend automatically redirects `/api` calls to the backend. **Open http://localhost:5173 in your browser to get started.**

---

## Demo Accounts

| Role  | Email                | Password           |
|-------|----------------------|--------------------|
| Admin | `admin@tremplin.ma`  | `tremplin --admin` |

You can also create a new trainee account via public registration at `/inscription`.

---

## Docker Services

The `docker-compose.yml` provides MySQL + phpMyAdmin:

```bash
docker compose up -d           # start everything
docker compose up -d db          # just MySQL (sufficient to run the app)
docker compose down            # stop everything
docker compose down -v         # stop + remove volumes (reset DB)
```

Available services:
- **MySQL**: `localhost:3306` (user=`tremplin`, pwd=`secret`, db=`tremplin`)
- **phpMyAdmin**: http://localhost:8080 (root/root)

---

## Testing

```bash
# Backend (Pest)
cd backend
php artisan test                   # all tests
php artisan test --filter=CvTest   # single file

# Frontend
cd frontend
npm run lint    # ESLint
npm run build   # check if build passes
```

---

## Useful Commands

### Backend

```bash
php artisan migrate:fresh --seed   # full reset + re-seed demo
php artisan db:seed --class=AdminSeeder  # seed only the admin
php artisan queue:work             # process background jobs
php artisan tinker                 # Laravel REPL
```

### Frontend

```bash
npm run dev      # dev server with HMR
npm run build    # production build (dist/)
npm run preview  # preview the build
npm run lint     # ESLint
```

---

## Troubleshooting

| Problem | Solution |
|---|---|
| `php: command not found` | PHP is not in your `PATH`. Check installation, restart your terminal. |
| `SQLSTATE[HY000] [2002]` on startup | MySQL is unreachable. Check if Docker is up: `docker compose ps`. If empty: `docker compose up -d db`. |
| `SQLSTATE[HY000] [1045] Access denied` | Wrong password. Check if `.env` contains `DB_USERNAME=tremplin` and `DB_PASSWORD=secret` (or reset volume: `docker compose down -v && docker compose up -d db`). |
| `Port 8000 already in use` | Another backend is running. Change port: `php artisan serve --port=8001`. |
| `Port 5173 already in use` | Vite automatically takes the next one (5174, 5175...). Check console. |
| Symfony Process error (Windows) | Open PowerShell as Administrator or add antivirus exception. |
| `composer install` fails on `ext-gd` | Enable GD extension in `php.ini` (uncomment `extension=gd`). |
| `npm install` fails on `sharp` or `node-gyp` | Install build tools: `npm install -g windows-build-tools` (Windows) or `xcode-select --install` (macOS). |

If you get stuck, open a [GitHub issue](https://github.com/aymanbelarbi/tremplin/issues) with the full error message + your platform (Windows/macOS/Linux) + PHP, Node, Composer versions.

---

## License

Project completed as part of an internship at **ISTA Khemisset**. Educational use.
