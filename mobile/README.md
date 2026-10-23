# LekkRek Mobile — App Expo (React Native)

**LekkRek Mobile** est l'espace client natif de la plateforme LekkRek : consultation du menu du jour, filtres (recherche, restaurant, budget, quartier, moment) et ajout au panier.

Elle remplace l'ancienne **coque WebView** (qui affichait le site web) par une vraie app native : [Expo](https://expo.dev) SDK 58, React Native 0.88, TypeScript et [Expo Router](https://docs.expo.dev/router/introduction) (routing par fichiers).

---

## Prérequis

| Outil | Version | Remarque |
|---|---|---|
| Node.js | ≥ 20 (testé sur v26) | + npm (le projet utilise `package-lock.json`) |
| Expo Go | sur le téléphone | [expo.dev/go](https://expo.dev/go) — pour scanner le QR code |
| Backend LekkRek | port **8080** | requis : l'app n'affiche le menu que si l'API répond |

---

## Démarrage rapide

```bash
cd mobile
npm install        # dépendances (une première fois)
npx expo start     # démarre Metro (serveur de dev)
```

Dans le terminal Metro :

| Touche | Action |
|---|---|
| `r` | recharger l'app |
| `i` | ouvrir le **simulateur iOS** |
| `a` | ouvrir l'**émulateur Android** |
| `Ctrl+C` | arrêter Metro |

Ou scannez le **QR code** avec l'app **Expo Go** sur votre téléphone.

> ⚠️ **Téléphone physique** : il doit être sur le **même réseau** que votre machine (WiFi ou partage de connexion). Voir [Configuration de l'adresse du backend](#configuration-de-ladresse-du-backend-apiurl) — sur un téléphone, `localhost` ne marche **pas**.

### Lancer le backend (nécessaire pour voir le menu)

```bash
# 1. Base de données (depuis la racine du repo, une seule fois)
mysql -u root < database_schema.sql

# 2. API (profil « dev » : seed automatique des données de test)
cd backend
mvn spring-boot:run        # Maven requis (pas de mvnw dans le projet)
```

Vérification :

```bash
curl http://localhost:8080/api/v1/public/menu   # doit renvoyer du JSON (HTTP 200)
```

La connexion à la base est pilotée par variables d'environnement (valeurs par défaut entre parenthèses) : `DB_URL` (`jdbc:mysql://localhost:3306/lekkrek_db`), `DB_USER` (`lekkrek_app`), `DB_PASSWORD` (`lekkrek_app_password`). Créez l'utilisateur dédié ou surchargez `DB_USER`/`DB_PASSWORD`.

---

## Branche actuelle : `feat/mobile-app-expo-native`

Branche de développement **active** de l'app mobile (suivie sur `origin/feat/mobile-app-expo-native`), créée à partir de **`develop`** (après la PR #53).

**Objectif** : construire l'app Expo native qui remplace la coque WebView.

| Commit | Objet |
|---|---|
| `8003069` | remplace la coque WebView par une app Expo native (SDK 58 + Expo Router + TS) |
| `c19da56` | écran Menu natif (filtres, grille, panier) + nettoyage du template |
| `d1351d1` | fix : timeout de 8 s sur les fetchs du menu (fin du spinner infini) |

**État d'avancement**

- ✅ Écran « Menu du jour » : navbar, hero, barre de filtres, pills de catégories, grille des produits, états chargement/erreur/vide.
- ✅ Ajout au panier (compteur local dans l'écran).
- ⏳ À venir : écran Panier / checkout, suivi de commande, profil (s'empileront dans le Stack racine).

**Autres branches du dépôt**

| Branche | Rôle |
|---|---|
| `develop` | branche d'intégration (les PR atterrissent ici) |
| `main` | production |
| `feat/mobile-app-expo-native` | ← celle-ci : l'app mobile |

```bash
git checkout develop   # basculer sur l'intégration
git checkout feat/mobile-app-expo-native   # revenir sur l'app mobile
```

---

## Configuration de l'adresse du backend (`apiBaseUrl`)

Toute la couche API passe par **un point unique** : [`src/services/config.ts`](src/services/config.ts), qui lit `expo.extra.apiBaseUrl` (défini dans [`app.json`](app.json)) :

```jsonc
// app.json
"extra": {
  "apiBaseUrl": "http://172.20.10.4:8080"   // IP LAN de la machine de dev
}
```

- **Simulateur iOS / web** : `http://localhost:8080` suffit.
- **Téléphone réel** : il faut l'**IP LAN de votre machine** (ex. `http://192.168.1.10:8080`). Une IP `172.20.10.x` correspond généralement à un partage de connexion iPhone.
- ⚠️ **Tout changement dans `app.json` impose un redémarrage de Metro** (`Ctrl+C` puis `npx expo start`) : la config `extra` ne se lit qu'au démarrage.
- Une IP locale peut changer à chaque reconnexion réseau : si le menu ne charge plus, mettez à jour `extra.apiBaseUrl`.

Les requêtes ont un **timeout de 8 s** (`src/services/menuApi.ts`) : si le backend est injoignable, l'écran affiche « Impossible de charger le menu » avec un bouton **Réessayer**, au lieu d'un spinner infini.

---

## Structure du projet

```
mobile/
├── app.json            # config Expo (nom, icônes, plugins, extra.apiBaseUrl)
├── src/
│   ├── app/            # routes Expo Router — chaque fichier = un écran
│   │   ├── _layout.tsx # Stack racine (header masqué)
│   │   └── index.tsx   # écran « Menu du jour »
│   ├── components/     # DishCard, FilterBar, CategoryPills (UI pure)
│   ├── hooks/          # useMenu (données + états), useCategories
│   ├── services/       # config.ts (URL API), menuApi.ts (appels HTTP)
│   ├── types/          # types TS miroir des entités backend
│   └── constants/      # theme.ts (couleurs, typo, espacements)
├── assets/             # icônes, splash
└── scripts/            # reset-project.js (template, à éviter)
```

Les routes vivent dans `src/app/` ; tout le reste (composants, hooks, services) reste **hors** de `src/app/`.

---

## Commandes utiles

```bash
npx expo start              # serveur de dev
npm run android             # + émulateur Android
npm run ios                 # + simulateur iOS
npm run web                 # version web
npm run lint                # ESLint
npx tsc --noEmit            # typecheck TypeScript
npx expo-doctor             # diagnostique dépendances / config
npx expo install <pkg>      # AJOUTER une dépendance (jamais npm install <pkg>)
npx expo install --fix      # aligner les versions sur le SDK
```

> Lancez `lint` + `tsc --noEmit` avant de considérer une tâche comme terminée.

---

## Dépannage

| Symptôme | Cause / solution |
|---|---|
| « Chargement du menu… » puis erreur après ~8 s | Backend injoignable : IP périmée dans `extra.apiBaseUrl`, backend arrêté, ou téléphone sur un autre réseau |
| Menu vide, filtres OK | Backend up mais base non seedée → redémarrez-le en profil `dev` (DataLoader) |
| Changement dans `app.json` sans effet | **Redémarrez Metro** (`Ctrl+C` puis `npx expo start`) |
| Le téléphone ne voit pas l'API | Téléphone en 4G → passez sur le **même WiFi/hotspot** que la machine ; vérifiez le pare-feu (port 8080) |
| Nouvelle IP après changement de réseau | Mettez à jour `extra.apiBaseUrl` puis redémarrez Metro |
| Erreur de dépendances / SDK | `npx expo-doctor` puis `npx expo install --fix` |

> ❌ `npm run reset-project` réinitialise l'app sur le squelette du template : **ne pas l'exécuter** sur ce projet.

---

## Aller plus loin

- Conventions du projet pour les agents : [`AGENTS.md`](AGENTS.md)
- [Documentation Expo](https://docs.expo.dev/) · [Expo Router](https://docs.expo.dev/router/introduction) · [SDK 58](https://docs.expo.dev/versions/v58.0.0/)
- README général de la plateforme : [`../README.md`](../README.md)
