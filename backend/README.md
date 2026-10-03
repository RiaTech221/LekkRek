# LekkRek - Backend API ⚙️

Ce répertoire contient l'API RESTful du projet LekkRek, développée avec **Spring Boot 3** et **Java 21**.

## 🛠️ Technologies Clés
- **Core :** Spring Boot (Web, Data JPA)
- **Sécurité :** Spring Security, JWT (JSON Web Tokens)
- **Base de données :** MySQL, Hibernate
- **Outils métiers :** Apache Tika (Extraction PDF/Word pour le CMS)
- **Documentation :** Swagger / SpringDoc OpenAPI

## 📂 Architecture des packages
Le code source se trouve dans \`src/main/java/com/lekkrek/\` :
- \`config/\` : Configuration globale (Web, CORS, Loaders).
- \`controller/\` : Contrôleurs REST (Endpoints publics, admin, opérateurs).
- \`dto/\` : Objets de transfert de données (Data Transfer Objects).
- \`entity/\` : Modèles de la base de données (Entities JPA).
- \`repository/\` : Interfaces d'accès aux données (Spring Data JPA).
- \`security/\` : Filtres JWT, gestion des rôles (Admin / Opérateur).
- \`service/\` : Logique métier (Commandes, KPI, Plats, etc.).
- \`scheduler/\` : Tâches planifiées (ex: cron jobs).

## 🔐 Sécurité & Authentification
L'API est sécurisée via des **Tokens JWT**. 
- Les routes \`/api/v1/public/**\` sont ouvertes.
- Les routes \`/api/v1/admin/**\` exigent le rôle \`ROLE_ADMIN\`.
- Les routes \`/api/v1/operator/**\` exigent les rôles \`ROLE_OPERATEUR\` ou \`ROLE_ADMIN\`.

Le filtre intercepte chaque requête, valide la signature du JWT, et injecte l'utilisateur dans le \`SecurityContext\`, permettant d'enregistrer la piste d'audit avec précision.

## 📄 Documentation API Interactive (Swagger)
Une fois le backend lancé (\`mvn spring-boot:run\`), vous pouvez explorer et tester toutes les routes API directement via Swagger UI :
👉 **http://localhost:8080/swagger-ui.html**

## 📊 Modules Spécifiques
- **CMS & Apache Tika :** Le \`DocumentParserController\` permet de recevoir des fichiers MultiparFile (PDF, DOCX) et d'en extraire le texte HTML enrichi pour pré-remplir l'éditeur de l'administration.
- **Audit Logging :** Toutes les actions sensibles (validation d'une commande, suppression d'un plat) déclenchent le \`AuditService\` qui trace l'email, le rôle, l'action et la date.
- **Analytics KPI :** Le \`AnalyticsController\` centralise les événements front-end (clics WhatsApp, recherches) pour générer des tableaux de bord en temps réel.
