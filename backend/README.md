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
L'API est sécurisée via des **Tokens JWT** (HMAC-SHA256). 
- Les routes `/api/v1/public/**` sont ouvertes (catalogue, plats du jour, tracking commande, formulaires de contact).
- Les routes `/api/v1/admin/**` exigent le rôle `ROLE_ADMIN`.
- Les routes `/api/v1/operator/**` exigent les rôles `ROLE_OPERATEUR` ou `ROLE_ADMIN`.

> 🛡️ **Cloisonnement Opérateur (Relation 0..n) :**  
> Les requêtes envoyées à `/api/v1/operator/**` sont strictement filtrées en base de données selon les restaurants assignés à l'opérateur connecté (via la table de liaison `operateur_restaurants`). Un opérateur ne peut ni lire ni modifier les plats, plannings ou commandes d'un restaurant qui ne lui est pas attribué.

### Diagramme de Séquence : Authentification & Contrôle d'Accès

```mermaid
sequenceDiagram
    autonumber
    actor User as Opérateur / Client
    participant Filter as JwtAuthenticationFilter
    participant Ctrl as OperatorController
    participant Svc as CommandeService / PlatService
    participant DB as MySQL (lekkrek_db)

    Note over User,Filter: 1. Authentification
    User->>Filter: POST /api/v1/auth/login (email, password)
    Filter->>DB: Recherche utilisateur & vérification mot de passe
    DB-->>Filter: Utilisateur validé (ROLE_OPERATEUR)
    Filter-->>User: 200 OK + JWT Bearer Token

    Note over User,DB: 2. Requête métier cloisonnée
    User->>Filter: GET /api/v1/operator/commandes (Bearer <token>)
    Filter->>Filter: Valider signature JWT & injecter SecurityContext
    Filter->>Ctrl: Déléguer au contrôleur
    Ctrl->>Svc: getCommandesByOperateur(email)
    Svc->>DB: SELECT c FROM commandes c JOIN operateur_restaurants op ON c.restaurant_id = op.restaurant_id WHERE op.utilisateur_id = :userId
    DB-->>Svc: Commandes des restaurants autorisés uniquement
    Svc-->>Ctrl: DTOs filtrés
    Ctrl-->>User: 200 OK (Données cloisonnées)
```

## 📐 Modèle de Données & Diagramme de Classes UML (JPA)

```mermaid
classDiagram
    direction TB

    class Utilisateur {
        +Long id
        +String nomComplet
        +String email
        +String telephone
        +Role role
        +Boolean actif
        +String photoUrl
        +Set~Restaurant~ restaurants
    }

    class Restaurant {
        +Long id
        +String name
        +String location
        +String repere
        +String telephone
        +String image
        +String operatorName
        +boolean active
        +BigDecimal commissionRate
        +String subscriptionPlan
        +Boolean surPlace
        +Boolean aEmporter
        +Boolean livraison
        +BigDecimal supplementLivraison
        +String notes
    }

    class Plat {
        +Long id
        +String name
        +String description
        +BigDecimal price
        +String image
        +DishStatus status
        +String moment
        +String variantes
        +Restaurant restaurant
    }

    class PlatDisponibiliteHebdo {
        +Long id
        +Plat plat
        +String jourSemaine
        +String moment
        +boolean actif
    }

    class Offre {
        +Long id
        +Restaurant restaurant
        +Plat plat
        +LocalDate dateOffre
        +String moment
        +BigDecimal prix
        +BigDecimal prixEmporter
        +String statut
    }

    class Commande {
        +Long id
        +String orderNumber
        +String clientName
        +String clientPhone
        +String clientAddress
        +TypeCommande type
        +StatusCommande status
        +PaymentMethod paymentMethod
        +PaymentStatus paymentStatus
        +BigDecimal totalAmount
        +Restaurant restaurant
        +List~CommandeItem~ items
    }

    class CommandeItem {
        +Long id
        +Commande commande
        +Plat plat
        +Integer quantity
        +BigDecimal unitPrice
    }

    class PartnerRequest {
        +Long id
        +String nomRestaurant
        +String nomContact
        +String telephone
        +String ville
        +String status
    }

    class PageContent {
        +Long id
        +String slug
        +String title
        +String seoKeywords
        +String content
    }

    class PlatformSettings {
        +Long id
        +String platformName
        +String supportEmail
        +String supportPhone
        +String defaultCurrency
    }

    class AnalyticsEvent {
        +Long id
        +String eventType
        +String entityId
        +String context
        +LocalDateTime timestamp
    }

    class AuditLog {
        +Long id
        +String actorEmail
        +String role
        +String action
        +String entityType
        +String entityId
        +LocalDateTime timestamp
    }

    class ReferenceData {
        +Long id
        +String type
        +String valeur
        +String description
        +Boolean actif
    }

    Utilisateur "0..*" o-- "0..*" Restaurant : operateur_restaurants
    Restaurant "1" *-- "0..*" Plat : possède
    Restaurant "1" *-- "0..*" Commande : reçoit
    Restaurant "1" *-- "0..*" Offre : publie
    Plat "1" *-- "0..*" Offre : concerne
    Plat "1" *-- "0..*" PlatDisponibiliteHebdo : planning hebdo
    Commande "1" *-- "1..*" CommandeItem : détaille
    Plat "1" <-- "0..*" CommandeItem : référence
```

## 📄 Documentation API Interactive (Swagger)
Une fois le backend lancé (`mvn spring-boot:run`), vous pouvez explorer et tester toutes les routes API directement via Swagger UI :
👉 **http://localhost:8080/swagger-ui.html**

## 📊 Modules Spécifiques
- **CMS & Apache Tika :** Le `DocumentParserController` permet de recevoir des fichiers MultipartFile (PDF, DOCX) et d'en extraire le texte HTML enrichi pour pré-remplir l'éditeur de l'administration.
- **Audit Logging :** Toutes les actions sensibles (validation d'une commande, suppression d'un plat) déclenchent le `AuditService` qui trace l'email, le rôle, l'action et la date.
- **Analytics KPI :** Le `AnalyticsController` centralise les événements front-end (clics WhatsApp, recherches) pour générer des tableaux de bord en temps réel.

## 🔑 Comptes de test par défaut (`DataLoader.java`)
> ⚠️ **Sécurité en Production :** `DataLoader.java` est protégé par `@ConditionalOnProperty(app.dataloader.enabled=true)` et est **désactivé par défaut**. Pour activer l'injection de ces comptes de test en développement local, définissez la variable d'environnement `APP_DATALOADER_ENABLED=true`.

| Rôle | Nom / Restaurant | Email | Mot de passe | Périmètre |
|---|---|---|---|---|
| **Administrateur** | Admin Principal | `admin@lekkrek.com` | `password123` | Accès global plateforme |
| **Opérateur** | Awa Ndiaye *(exemple)* | `awa@lekkrek.com` | `password123` | Assignation dynamique 0..n via `operateur_restaurants` |
