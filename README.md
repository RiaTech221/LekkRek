# LekkRek — Plateforme de Gestion de Restaurants & CMS

**LekkRek** est une solution métier de bout en bout destinée à la gestion de restaurants, des commandes en temps réel et à la publication de contenu dynamique (CMS). Elle couvre l'espace vitrine client, le dashboard opérateur et le panneau d'administration.

---

## Architecture

Le projet suit une architecture découplée Frontend / Backend :

| Couche | Technologie | Rôle |
|---|---|---|
| **Frontend** | React.js (Vite) + Tailwind CSS | Vitrine client, dashboard admin & opérateur |
| **Backend** | Java 21 + Spring Boot 3 + Spring Security | API REST, sécurité JWT, logique métier, KPI |
| **Base de données** | MySQL + Hibernate/JPA | Persistance des données |
| **CI/CD** | GitHub Actions | Validation backend (Maven) + frontend (Vite) sur chaque PR |

---

## Fonctionnalités

### Espace Client (public, sans inscription)
- Consultation du menu du jour par restaurant
- Filtres par restaurant, catégorie et disponibilité
- Passage de commande avec saisie du téléphone et de l'adresse de livraison
- Suivi de commande en temps réel par numéro
- Formulaire de demande de partenariat
- Contact rapide via WhatsApp avec messages pré-remplis (panier, commande)
- Interface **PWA** (installable sur mobile)

### Dashboard Opérateur (accès restreint)
- Gestion des plats du jour (ajout, modification, statut disponible/épuisé)
- Duplication du menu de la veille
- Suivi et mise à jour des commandes en temps réel
- Upload de photos de plats

### Panneau Admin (accès restreint)
- Gestion des restaurants et des opérateurs
- Comptabilité et suivi des commissions
- KPI et analytics de la plateforme
- CMS : édition des pages de contenu (CGU, À propos…)
- Gestion des paramètres globaux : nom de la plateforme, réseaux sociaux, numéro WhatsApp, textes d'accueil, modèles de messages
- Journal d'audit
- Traitement des demandes de partenariat

---

## Structure du projet

```
LekkRek/
├── backend/                  # API Spring Boot (port 8080)
│   ├── src/main/java/        # Code source Java
│   └── src/main/resources/   # Configuration (application.properties)
├── frontend/                 # Application React/Vite (port 5173)
│   ├── src/
│   │   ├── pages/            # Pages admin, opérateur et client
│   │   └── config.js         # Configuration centralisée des URL API
│   └── .env                  # Variables d'environnement locales (non commité)
├── .github/workflows/        # Pipelines CI GitHub Actions
├── database_schema.sql       # Schéma initial + données de démarrage
└── README.md
```

---

## Prérequis

- **Java 21 (JDK)** — [Télécharger](https://adoptium.net/)
- **Maven 3.8+**
- **Node.js 22+** et **npm**
- **MySQL Server** actif sur le port `3306`

---

## Installation

### 1. Cloner le dépôt

```bash
git clone https://github.com/RiaTech221/LekkRek.git
cd LekkRek
```

> Travailler sur la branche `develop` (branche de référence de l'équipe) :
> ```bash
> git checkout develop
> ```

---

### 2. Base de données

S'assurer que MySQL est actif sur le port `3306`, puis créer la base :

```sql
CREATE DATABASE lekkrek_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

Importer le schéma initial et les données de démarrage :
```bash
mysql -u root -p lekkrek_db < database_schema.sql
```

> Hibernate gère aussi le schéma automatiquement (`ddl-auto=update`) au premier lancement si vous préférez ne pas importer manuellement.

---

### 3. Configuration de l'environnement

#### Backend
Les variables de configuration sont lues depuis l'environnement système. En développement local, les valeurs par défaut définies dans `application.properties` sont utilisées automatiquement — **aucune action requise**.

Pour surcharger (optionnel en dev, obligatoire en production) :
```bash
export DB_USER=root
export DB_PASSWORD=motdepasse
export JWT_SECRET=une-cle-secrete-forte-de-64-caracteres-minimum
```

#### Frontend
Copier le fichier d'exemple et l'adapter si nécessaire :
```bash
cp frontend/.env.example frontend/.env
```

Le fichier `.env` par défaut pointe vers `http://localhost:8080`. Modifier `VITE_API_URL` si votre backend tourne sur un autre hôte ou port.

---

### 4. Lancement du Backend

```bash
cd backend
mvn clean install -DskipTests
mvn spring-boot:run
```

L'API est disponible sur `http://localhost:8080`.  
La documentation Swagger est disponible sur `http://localhost:8080/swagger-ui.html`.

---

### 5. Lancement du Frontend

Dans un second terminal :
```bash
cd frontend
npm install
npm run dev
```

L'interface est accessible sur `http://localhost:5173`.

---

## Variables d'environnement

### Backend (`application.properties` / variables système)

| Variable | Description | Défaut (dev local) |
|---|---|---|
| `DB_URL` | URL JDBC de la base MySQL | `jdbc:mysql://localhost:3306/lekkrek_db` |
| `DB_USER` | Utilisateur MySQL | `root` |
| `DB_PASSWORD` | Mot de passe MySQL | *(vide)* |
| `JWT_SECRET` | Clé secrète de signature des tokens JWT (min. 32 chars) | Valeur de fallback dev incluse |
| `JWT_EXPIRATION_MS` | Durée de validité des tokens JWT en ms | `86400000` (24h) |

> En production, toutes ces variables doivent être définies dans l'environnement système ou un gestionnaire de secrets. Ne jamais les commiter.

### Frontend (`frontend/.env`)

| Variable | Description | Exemple |
|---|---|---|
| `VITE_API_URL` | URL de base de l'API backend | `http://localhost:8080` |

Créer le fichier `frontend/.env` à partir du modèle :
```bash
cp frontend/.env.example frontend/.env
```

---

## Accès par défaut

| Rôle | Nom / Restaurant | Email | Mot de passe |
|---|---|---|---|
| **Administrateur** | Admin Principal | `admin@lekkrek.com` | `password123` |
| **Opérateur** | Awa Ndiaye (La Fourchette) | `awa@lekkrek.com` | `password123` |
| **Opérateur** | Modou Fall (Chez Loutcha) | `modou@lekkrek.com` | `password123` |
| **Opérateur** | Fatou Diop (Le Djoloff) | `fatou@lekkrek.com` | `password123` |

> Ces accès sont créés automatiquement au démarrage (`DataLoader.java`). **Changer ces mots de passe avant tout déploiement en production.**

---

## CI/CD

Chaque push et chaque Pull Request sur `develop` et `main` déclenche automatiquement :

- **Validation backend** : compilation Maven (Java 21), vérification qu'aucune erreur ne casse le build
- **Validation frontend** : build Vite, vérification qu'aucune erreur de syntaxe ou d'import ne casse le bundle

Les merges ne peuvent être effectués que si les deux checks passent.

---

## Workflow Git

```
main          ← branche de production, toujours stable
develop       ← branche d'intégration (référence de l'équipe)
  └── fix/<description>      ← corrections de bugs
  └── feat/<description>     ← nouvelles fonctionnalités
  └── docs/<description>     ← documentation
```

**Règle** : chaque modification passe par une branche dédiée → Pull Request → `develop` (CI obligatoire). Le merge `develop → main` se fait périodiquement une fois les changements validés.

---

## Sécurité

La sécurité applicative est gérée par Spring Security :

- Authentification par **token JWT** (signé HMAC-SHA256)
- Contrôle d'accès par rôle : `ADMIN`, `OPERATEUR`
- Protection des endpoints avec `@PreAuthorize` au niveau méthode
- Clé JWT externalisée via variable d'environnement (`JWT_SECRET`)
- Les routes publiques (menu, commandes clients, suivi) sont accessibles sans authentification

---

*LekkRek — Ziguinchor*
