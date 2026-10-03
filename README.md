# LekkRek - Plateforme de Gestion de Commandes & CMS

Bienvenue dans le dépôt officiel du projet **LekkRek**.
LekkRek est une solution métier de bout en bout (End-to-End) destinée à la gestion de restaurants, des commandes en temps réel, et à la publication de contenu (CMS).

## 🚀 Architecture Globale

Le projet suit une architecture moderne découplée (Frontend / Backend) :

- **Frontend (Client & Admin) :** Développé avec **React.js** (Vite) et **Tailwind CSS**. Il regroupe l'espace vitrine pour les clients, et le Dashboard sécurisé pour les opérateurs et administrateurs.
- **Backend (API REST) :** Développé avec **Java 21** et **Spring Boot 3**. Il gère la logique métier, la sécurité (JWT), l'analyse des KPI, et l'extraction de documents (via Apache Tika).
- **Base de données :** **MySQL** avec un schéma géré par Hibernate/JPA.

## 📂 Structure du projet

\`\`\`
LekkReck/
├── backend/          # API Spring Boot (Port par défaut : 8080)
├── frontend/         # Application Web React/Vite (Port par défaut : 5173)
└── README.md         # Documentation principale
\`\`\`

## 🛠️ Prérequis

Pour exécuter ce projet en local, assurez-vous d'avoir installé :
- **Java 21 (JDK)**
- **Maven**
- **Node.js** (v18 ou supérieur) et **npm**
- **MySQL Server** (actif sur le port 3306)

## 🏃‍♂️ Démarrage Rapide (Quickstart)

### 1. Base de données
Assurez-vous que MySQL est en cours d'exécution avec les identifiants configurés dans \`backend/src/main/resources/application.properties\` (par défaut : \`root\` sans mot de passe). La base de données \`lekkrek_db\` sera créée et remplie automatiquement au premier lancement.

### 2. Lancement du Backend
Ouvrez un terminal dans le dossier \`backend\` :
\`\`\`bash
cd backend
mvn clean install -DskipTests
mvn spring-boot:run
\`\`\`
L'API sera disponible sur \`http://localhost:8080\`.
📚 *La documentation automatique de l'API (Swagger) est disponible sur \`http://localhost:8080/swagger-ui.html\`.*

### 3. Lancement du Frontend
Ouvrez un second terminal dans le dossier \`frontend\` :
\`\`\`bash
cd frontend
npm install
npm run dev
\`\`\`
L'interface sera accessible sur \`http://localhost:5173\`.

## 🔒 Accès par défaut
Une fois les deux serveurs lancés, vous pouvez vous connecter à l'espace d'administration (\`http://localhost:5173/admin\`) avec les accès suivants créés automatiquement (Seed Data) :
- **Administrateur :** \`admin@lekkrek.com\` / \`password\`
- **Opérateur :** \`operator@lekkrek.com\` / \`password\`

---
*Développé pour LekkRek.*
