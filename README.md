# 🍔 LekkRek - Application de Livraison de Repas

LekkRek est une plateforme multi-rôles de commande et de gestion de livraison de repas. Elle connecte les clients (qui commandent sans créer de compte), les opérateurs (qui gèrent les cartes et l'état des commandes), et le porteur de projet / administrateur (qui gère l'activité, les finances et le parc de restaurants).

## 🚀 Architecture du Projet

Ce projet est séparé en deux modules distincts :
- **Backend** : API RESTful développée en Java avec Spring Boot.
- **Frontend** : Application Single Page Application (SPA) développée en React (Vite).

---

## 🛠️ Technologies Utilisées

* **Backend** : Java 21, Spring Boot 3, Spring Security (JWT), Spring Data JPA, Hibernate.
* **Frontend** : React 18, Vite, TailwindCSS, React Router DOM.
* **Base de données** : MySQL 8.

---

## 👤 Rôles et Fonctionnalités

### 1. Client (Mode Invité)
- Parcourt les restaurants et leurs plats disponibles.
- Ajoute des plats au panier.
- Passe une commande avec choix du moyen de paiement (Espèces, Wave, Orange Money).
- Suit l'état de sa commande en temps réel grâce à son numéro de suivi unique (`CMD-XXXXXX`).

### 2. Opérateur
- Dispose d'un compte de connexion.
- **Tableau de Bord Kanban** : Gère l'évolution des commandes en direct (Nouvelle -> En préparation -> Prête -> Livrée).
- **Gestion des Menus** : Crée, modifie et gère la disponibilité des plats (Dispo / Épuisé) pour chaque restaurant assigné.

### 3. Administrateur (Porteur de projet)
- Dispose de tous les droits de l'opérateur, plus un accès exclusif à la section d'administration.
- **Gestion des Restaurants** : Ajoute ou désactive des restaurants partenaires.
- **Gestion des Opérateurs** : Crée et révoque les accès pour ses collaborateurs.
- **Comptabilité** : Suit le chiffre d'affaires, le panier moyen, la répartition par méthode de paiement et l'historique complet des commandes.
- **Paramètres** : Gère les préférences globales (notifications sonores, rafraîchissement auto) et la sécurité du compte.

---

## 💻 Instructions d'Installation et de Lancement

### Prérequis
- Java JDK 21
- Node.js (v18+)
- MySQL Server en cours d'exécution (Port 3306)

### Étape 1 : Base de données
1. Ouvrez votre terminal MySQL ou un outil comme phpMyAdmin.
2. Exécutez le script SQL fourni à la racine : `database_schema.sql` (Crée la base `lekkrek_db` et les tables).

### Étape 2 : Lancement du Backend (Spring Boot)
1. Ouvrez un terminal dans le dossier `backend`.
2. Assurez-vous que vos identifiants MySQL correspondent dans le fichier `backend/src/main/resources/application.properties` (par défaut : `root` / *mot de passe vide*).
3. Exécutez la commande :
   ```bash
   ./mvnw spring-boot:run
   ```
   *L'API sera disponible sur `http://localhost:8080`*

### Étape 3 : Lancement du Frontend (React)
1. Ouvrez un nouveau terminal dans le dossier `frontend`.
2. Installez les dépendances :
   ```bash
   npm install
   ```
3. Démarrez le serveur de développement :
   ```bash
   npm run dev
   ```
   *L'application sera disponible sur `http://localhost:5173`*

---

## 🔐 Identifiants de Test (Défaut)

L'application crée automatiquement un compte Administrateur au premier lancement :

* **Rôle** : Administrateur
* **Email** : `admin@lekkrek.com`
* **Mot de passe** : `password123`

Vous pourrez ensuite créer d'autres opérateurs depuis l'onglet **"Opérateurs"** dans l'espace Admin.

---

## 🔗 Structure des APIs Principales

* `GET /api/v1/public/restaurants` : Liste publique des restaurants.
* `POST /api/v1/public/orders` : Envoi d'une commande client.
* `GET /api/v1/public/orders/track/{numero}` : Suivi client.
* `POST /api/v1/public/auth/login` : Authentification JWT.
* `PUT /api/v1/operator/orders/{id}/status` : Changement d'état Kanban (Protégé).
* `POST /api/v1/admin/restaurants` : Ajout d'un restaurant (Protégé Admin).

---
*Projet conçu et assemblé par Google Antigravity.*
