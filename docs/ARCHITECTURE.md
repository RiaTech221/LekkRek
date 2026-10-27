# 📐 Architecture & Diagrammes UML — LekkRek

Ce document regroupe les spécifications architecturales et les diagrammes de modélisation du projet **LekkRek**.

---

## 1. Diagramme d'Architecture Globale (Composants & Flux)

Le diagramme ci-dessous illustre le découpage multi-plateforme, la couche de sécurité Spring Security (JWT / RBAC), les services métier et la persistance MySQL.

```mermaid
flowchart TB
  subgraph Clients["📱 Couche Présentation (Multi-plateformes)"]
    WebClient["🌐 Web Client PWA<br/>(React / Vite / Tailwind)"]
    MobileClient["📱 Mobile Client Natif<br/>(React Native / Expo SDK 58)"]
    AdminBackoffice["🖥️ Dashboard Admin & Opérateur<br/>(React / Vite / Tailwind)"]
  end

  subgraph Gateway["🛡️ Sécurité & Filtrage"]
    CorsFilter["Filtre CORS"]
    JwtFilter["Filtre JWT (HMAC-SHA256)"]
    SecurityGuard["Contrôle d'accès RBAC<br/>(@PreAuthorize ADMIN / OPERATEUR)"]
  end

  subgraph Backend["⚙️ Backend REST API (Spring Boot 3 / Java 21)"]
    Controllers["Contrôleurs REST<br/>(/api/v1/public/**, /operator/**, /admin/**)"]
    Services["Services Métier<br/>(PlatService, CommandeService, AuditService, etc.)"]
    Repositories["Spring Data JPA Repositories"]
  end

  subgraph Database["🗄️ Persistance des Données (MySQL 8)"]
    DB[("lekkrek_db<br/>13 tables métier + 1 table de liaison")]
  end

  subgraph External["🔗 Services Tiers"]
    WhatsApp["WhatsApp Web / Liens pré-remplis"]
    FileSystem["Stockage Disque (Uploads images)"]
  end

  WebClient -->|Requêtes REST| CorsFilter
  MobileClient -->|Requêtes REST| CorsFilter
  AdminBackoffice -->|Requêtes REST + Bearer JWT / Cookie HttpOnly| CorsFilter

  CorsFilter --> JwtFilter --> SecurityGuard --> Controllers
  Controllers --> Services --> Repositories --> DB
  WebClient -.->|Redirection commande / panier| WhatsApp
  Services -.->|Gestion des photos| FileSystem
```

---

## 2. Modèle de Données (Diagramme Entité-Relation UML)

Le schéma relationnel comprend 13 entités métier et 1 table de liaison pour la gestion flexible des droits opérateurs (`operateur_restaurants`).

```mermaid
erDiagram
    UTILISATEURS ||--o{ OPERATEUR_RESTAURANTS : "possede"
    RESTAURANTS ||--o{ OPERATEUR_RESTAURANTS : "est assigne a"
    
    RESTAURANTS ||--o{ PLATS : "propose"
    RESTAURANTS ||--o{ COMMANDES : "recoit"
    RESTAURANTS ||--o{ OFFRES : "programme"
    
    PLATS ||--o{ OFFRES : "fait l'objet de"
    PLATS ||--o{ PLAT_DISPONIBILITES_HEBDO : "possede"
    PLATS ||--o{ COMMANDE_ITEMS : "est commande dans"
    
    COMMANDES ||--|{ COMMANDE_ITEMS : "se compose de"

    UTILISATEURS {
        bigint id PK
        string nom_complet
        string email UK
        string telephone
        string mot_de_passe
        string role "ADMIN | OPERATEUR"
        boolean actif
        string photo_url
        datetime date_creation
    }

    OPERATEUR_RESTAURANTS {
        bigint utilisateur_id PK,FK
        bigint restaurant_id PK,FK
    }

    RESTAURANTS {
        bigint id PK
        string name
        string location
        string repere
        string telephone
        string image
        string operator_name
        boolean active
        decimal commission_rate
        string subscription_plan
        date subscription_end_date
        boolean sur_place
        boolean a_emporter
        boolean livraison
        decimal supplement_livraison
        string notes
        datetime created_at
    }

    PLATS {
        bigint id PK
        bigint restaurant_id FK
        string name
        string description
        decimal price
        string image
        string status "DISPO | EPUISE"
        string moment
        string variantes
    }

    PLAT_DISPONIBILITES_HEBDO {
        bigint id PK
        bigint plat_id FK
        string jour_semaine "LUNDI..DIMANCHE"
        string moment "dejeuner | etc."
        boolean actif
    }

    OFFRES {
        bigint id PK
        bigint restaurant_id FK
        string plat_id FK
        date date_offre
        string moment
        decimal prix
        decimal prix_emporter
        string statut "DISPO | EPUISE"
        datetime created_at
    }

    COMMANDES {
        bigint id PK
        bigint restaurant_id FK
        string order_number UK
        string client_name
        string client_phone
        string client_address
        string type "LIVRAISON | EMPORTER | SUR_PLACE"
        string status "NOUVELLE | EN_PREPARATION | PRETE | LIVREE | ANNULEE"
        string payment_method "WAVE | ORANGE_MONEY | ESPECES"
        string payment_status "ATTENTE | PAYE | ECHOUE"
        decimal total_amount
        datetime created_at
    }

    COMMANDE_ITEMS {
        bigint id PK
        bigint commande_id FK
        bigint plat_id FK
        int quantity
        decimal unit_price
    }

    PARTNER_REQUESTS {
        bigint id PK
        string nom_restaurant
        string nom_contact
        string telephone
        string ville
        string status "PENDING | APPROVED | REJECTED"
        datetime created_at
    }

    PAGE_CONTENTS {
        bigint id PK
        string slug UK
        string title
        string seo_keywords
        string content
        datetime created_at
        datetime updated_at
    }

    PLATFORM_SETTINGS {
        bigint id PK
        string platform_name
        string support_email
        string support_phone
        string default_currency
        string instagram_url
        string facebook_url
        string tiktok_url
        string whatsapp_message_greeting
        string whatsapp_message_cart
        string whatsapp_message_order
        string whatsapp_message_default
        string hero_title
        string hero_subtitle
    }

    ANALYTICS_EVENTS {
        bigint id PK
        string event_type
        string entity_id
        string context
        datetime timestamp
    }

    AUDIT_LOGS {
        bigint id PK
        string actor_email
        string role
        string action
        string entity_type
        string entity_id
        string old_value
        string new_value
        datetime timestamp
    }

    REFERENCE_DATA {
        bigint id PK
        string type "QUARTIER | CRENEAU | CATEGORIE"
        string valeur
        string description
        boolean actif
        datetime created_at
    }
```

---

[← Retour au README principal](../README.md)
