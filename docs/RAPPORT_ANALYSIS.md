# Analyse Complète du Projet "Tremplin" — Rapport de Stage

Ce document synthétise l'architecture, la conception et la réalisation du projet **Tremplin**, une plateforme de gestion des stagiaires et des offres pour l'**ISTA Khémisset**. Il est rédigé à l'attention de l'élaboration du rapport de stage, en utilisant le pronom "Nous".

---

## 1. Introduction et Contexte

Le projet **Tremplin** est né du besoin de centraliser et de dynamiser l'insertion professionnelle des stagiaires de l'ISTA Khémisset. L'objectif est de créer un pont numérique entre l'administration (qui publie les offres) et les stagiaires (qui postulent et gèrent leur visibilité).

### Objectifs fonctionnels :
- Permettre aux stagiaires de créer un profil complet et un CV normalisé.
- Offrir un suivi en temps réel du statut d'emploi des lauréats.
- Centraliser les offres de stage et d'emploi.
- Faciliter la mise en relation par l'administration.

---

## 2. Analyse et Conception

Nous avons opté pour une architecture moderne découplée afin de garantir la flexibilité et la maintenabilité.

### 2.1 Architecture Logique
Le projet suit une architecture **SPA (Single Page Application)** pour le frontend et une **API REST** pour le backend :
- **Frontend** : React 18 avec Vite, utilisant Tailwind CSS pour le design et Zustand pour la gestion d'état.
- **Backend** : Laravel 11, agissant comme un serveur d'API robuste avec authentification via Laravel Sanctum.
- **Base de données** : MySQL 8 pour la persistance des données.

### 2.2 Modèle de Données (MCD/MLD)
Nous avons conçu un schéma de base de données relationnel centré sur l'utilisateur :
- **User** : Gère l'authentification et les rôles (`admin`, `stagiaire`).
- **Profile** : Extension de l'utilisateur contenant les informations spécifiques au stagiaire (filière, promotion, ville, statut d'emploi).
- **Cv** : Stocke les données structurées du CV au format JSON (expériences, formations, compétences, etc.), permettant une flexibilité maximale.
- **Offer** : Gère les annonces publiées par les administrateurs.
- **Application** : Table de liaison gérant les candidatures des stagiaires aux offres.
- **Filiere** : Référentiel des spécialités disponibles au sein de l'établissement.

### 2.3 Sécurité
La sécurité repose sur deux piliers :
1. **Authentification** : Utilisation de tokens personnels (Sanctum) pour chaque session.
2. **Autorisation** : Un middleware personnalisé `EnsureRole` vérifie les droits d'accès pour chaque point de terminaison de l'API, isolant strictement les fonctionnalités administratives des fonctionnalités stagiaires.

---

## 3. Réalisation Technique

### 3.1 Le Générateur de CV Dynamique
C'est la pièce maîtresse technologique du projet. Nous avons implémenté :
- **Édition en temps réel** : Le frontend React synchronise instantanément le formulaire avec un aperçu visuel (CvPreview).
- **Persistance JSON** : Au lieu de multiples tables complexes, les sections du CV (expériences, langues) sont stockées en JSON dans la base de données, ce qui simplifie les requêtes et l'évolution du schéma.
- **Export PDF Client-Side** : Nous utilisons les bibliothèques `html2canvas` et `jsPDF` pour générer le document final directement dans le navigateur, assurant une fidélité visuelle parfaite par rapport à l'aperçu.

### 3.2 Gestion du Statut d'Emploi
Nous avons intégré un flux spécifique dès l'inscription pour capturer le statut professionnel du stagiaire. Si un stagiaire est "Employé", il peut renseigner les détails de son poste, lesquels sont automatiquement synchronisés avec son CV pour valoriser son parcours.

### 3.3 Dashboard Administratif
L'interface admin fournit une vue d'ensemble grâce à :
- Des indicateurs clés (KPIs) calculés via l'API `StatsController`.
- Une gestion simplifiée des offres (CRUD complet).
- Un accès rapide aux dossiers des stagiaires avec possibilité de visualiser et télécharger leurs CVs.

---

## 4. Conclusion

Le projet **Tremplin** représente une solution complète et moderne répondant aux défis de l'insertion professionnelle à l'ISTA Khémisset. Par l'utilisation de technologies de pointe (React, Laravel 11), nous avons réussi à bâtir une plateforme à la fois performante pour les administrateurs et intuitive pour les stagiaires.

---
*Document généré pour l'aide à la rédaction du rapport de stage — Mai 2026.*
