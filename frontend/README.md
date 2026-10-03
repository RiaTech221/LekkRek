# LekkRek - Frontend Application 🎨

Ceci est l'application Front-End de LekkRek. Elle gère à la fois l'interface vitrine pour le grand public et le panneau d'administration pour les équipes internes.

## 🛠️ Technologies
- **Framework :** React 18
- **Build Tool :** Vite.js (très rapide pour le développement et la compilation)
- **Styling :** Tailwind CSS (Utility-first CSS)
- **Éditeur de texte :** React-Quill (pour le CMS)
- **Routage :** React Router DOM

## 📂 Structure du dossier \`src\`
- \`assets/\` : Ressources statiques (images, polices).
- \`pages/\` : Contient les vues principales divisées en deux sous-dossiers :
  - \`client/\` : Vues publiques (Vitrine de plats, Panier, Commandes, PWA).
  - \`admin/\` : Tableau de bord privé (Kanban des commandes, CMS, Paramètres, Analytics, Comptabilité).
- \`App.jsx\` : Point d'entrée des routes (gère la redirection conditionnelle selon le JWT).
- \`index.css\` : Configuration de Tailwind et variables globales.

## 🚦 Fonctionnalités Principales
1. **Vitrine Client (\`/\`)** : Mode déconnecté, parcours du menu, recherche filtrée, ajout au panier, tracking des KPI.
2. **Dashboard Kanban (\`/admin\`)** : Gestion en temps réel (Drag & drop simulé) des statuts de préparation des plats avec intégration directe de badges de paiements et remontée automatique d'alertes.
3. **CMS (\`/admin/content\`)** : Éditeur de texte riche couplé avec une importation de fichiers Word/PDF via le backend.
4. **Audit & Sécurité (\`/admin/audit\`)** : Visualisation des traces serveur en temps réel (actions des opérateurs).

## 🔧 Scripts Disponibles
Dans le dossier du projet, vous pouvez exécuter :

- \`npm run dev\` : Lance le serveur de développement local (avec Hot-Reload).
- \`npm run build\` : Compile l'application pour la production dans le dossier \`dist/\`.
- \`npm run preview\` : Permet de tester le build de production localement.

## 📝 Bonnes Pratiques
- **Composants :** Tous les composants ont été conçus pour être _responsive_ et s'adaptent aussi bien sur Desktop que sur Mobile.
- **Requêtes API :** Les requêtes nécessitant une autorisation envoient automatiquement le JWT stocké en \`localStorage\` sous forme de Header \`Authorization: Bearer <token>\`.
