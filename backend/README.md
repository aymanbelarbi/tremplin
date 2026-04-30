# Tremplin Backend API

> Le moteur de la plateforme Tremplin — Gestion de l'insertion professionnelle des stagiaires.
> Développé avec **Laravel 11**, **Sanctum** pour l'authentification, et **MySQL 8**.

## 🚀 Fonctionnalités clés

- **Authentification Sécurisée** : Système d'inscription et de connexion pour Stagiaires et Administrateurs.
- **Gestion de Profil & CV** : Endpoints pour gérer les informations personnelles, le statut d'emploi, et le constructeur de CV (expériences, formations, compétences, certifications).
- **Synchronisation Automatique** : Les mises à jour effectuées dans le constructeur de CV (Bio, Adresse, Téléphone, Date de naissance) sont automatiquement synchronisées avec le profil utilisateur.
- **Système de Candidatures** : Les stagiaires peuvent postuler aux offres avec un instantané (snapshot) de leur CV au moment du dépôt.
- **Back-office Admin** : Gestion complète des offres d'emploi/stage, suivi des stagiaires et traitement des candidatures.

## 🛠 Installation

1. **Cloner le dépôt**
2. **Configurer l'environnement**
   ```bash
   cp .env.example .env
   ```
3. **Installer les dépendances**
   ```bash
   composer install
   ```
4. **Générer la clé d'application**
   ```bash
   php artisan key:generate
   ```
5. **Lancer les migrations & seeders**
   ```bash
   php artisan migrate --seed
   ```
   *Le seeder crée un compte admin par défaut : `admin@tremplin.ma` / `password`.*
6. **Lien symbolique pour le stockage**
   ```bash
   php artisan storage:link
   ```
7. **Lancer le serveur**
   ```bash
   php artisan serve
   ```

## 📡 API Endpoints (v1)

### Authentification
- `POST /api/v1/auth/register` : Inscription
- `POST /api/v1/auth/login` : Connexion
- `POST /api/v1/auth/logout` : Déconnexion

### Stagiaire (Me)
- `GET /api/v1/me/profile` : Voir mon profil
- `PUT /api/v1/me/profile` : Mettre à jour mon profil
- `GET /api/v1/me/cv` : Voir mon CV
- `PUT /api/v1/me/cv` : Mettre à jour mon CV (sync auto avec Profil)

### Offres & Candidatures
- `GET /api/v1/offers` : Liste des offres publiques
- `POST /api/v1/offers/{id}/apply` : Postuler à une offre
- `GET /api/v1/me/applications` : Mes candidatures

## 🧪 Tests

```bash
php artisan test
```

## 📄 Licence

Ce projet est sous licence MIT.
