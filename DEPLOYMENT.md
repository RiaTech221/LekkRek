# Guide de Déploiement Complet - Lekk Rek (Production)

Ce document décrit étape par étape comment déployer la plateforme **Lekk Rek** sur un serveur VPS (Virtual Private Server) en utilisant l'architecture définie dans le Cahier des Charges : `Nginx -> React -> Spring Boot -> MySQL`.

---

## 1. Prérequis

Avant de commencer, vous devez avoir :
1. **Un serveur VPS** sous **Ubuntu 22.04 LTS ou 24.04 LTS**.
   - **Configuration minimale recommandée** : 2 Go de RAM, 1 CPU, 20 Go de stockage SSD.
   - Hébergeurs recommandés : Hetzner, Hostinger, DigitalOcean.
2. **Un Nom de Domaine** (ex: `lekkrek.com` ou `lekkrek.sn`).
   - Chez votre registraire de domaine, créez un enregistrement DNS de type **A** pointant vers l'adresse IP publique de votre VPS.

---

## 2. Connexion au Serveur

Ouvrez un terminal sur votre ordinateur et connectez-vous à votre VPS via SSH :

```bash
ssh root@ADRESSE_IP_DE_VOTRE_VPS
```

Mettez à jour le système :
```bash
apt update && apt upgrade -y
```

---

## 3. Installation de Docker et Git

Le projet utilise Docker pour isoler et exécuter la Base de données, le Backend et le Frontend.

Exécutez cette commande officielle pour installer Docker et Docker Compose :
```bash
curl -fsSL https://get.docker.com -o get-docker.sh
sh get-docker.sh
```

Vérifiez que Docker est bien installé :
```bash
docker --version
docker compose version
```

Installez Git s'il n'est pas présent :
```bash
apt install git -y
```

---

## 4. Récupération du Code Source

Clonez votre dépôt GitHub sur le serveur :

```bash
cd /opt
git clone https://github.com/RiaTech221/LekkRek.git
cd LekkRek
```

*(Note: Si votre dépôt est privé, Git vous demandera votre nom d'utilisateur et un "Personal Access Token" GitHub à la place du mot de passe).*

---

## 5. Configuration de la Sécurité (.env)

Il est fortement déconseillé de laisser les mots de passe par défaut. Créez un fichier d'environnement pour sécuriser la base de données MySQL.

```bash
nano .env
```

Copiez-y ceci, en remplaçant le mot de passe par un mot de passe très sécurisé de votre choix :

```env
DB_PASSWORD=MonMotDePasseUltraSecret2026!

# HTTPS (à remplir quand vous aurez le nom de domaine — voir section 8)
# DOMAIN=lekkrek.com
# CERTBOT_EMAIL=votre@email.com
# INCLUDE_WWW=1
```

Enregistrez et quittez (`Ctrl+O`, `Entrée`, `Ctrl+X`).

---

## 6. Lancement de l'Application

Vous êtes maintenant prêt à tout lancer. Exécutez la commande suivante :

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

**Que fait cette commande ?**
- `db` : Lance MySQL 8.0 en arrière-plan.
- `backend` : Compile votre code Java Spring Boot et le lance sur le port 8080 en interne.
- `frontend` : Compile votre code React (Vite) de production et lance Nginx sur les ports 80 (redirection) et 443 (HTTPS).
- `certbot` : Renouvelle automatiquement le certificat HTTPS.

L'opération peut prendre 2 à 3 minutes la première fois (le temps de télécharger les dépendances Java et NPM).

---

## 7. Vérification

Ouvrez `https://VOTRE_ADRESSE_IP` (`http://` redirige automatiquement vers `https://`).

> ⚠️ Tant que le domaine n'est pas configuré (section 8), le certificat est **auto-signé** : le navigateur affiche un avertissement. Cliquez sur « Avancé → Continuer » pour tester. La connexion admin fonctionne.

La plateforme Lekk Rek devrait s'afficher ! 🎉

---

## 8. Activation du HTTPS (Let's Encrypt, gratuit et automatique)

**Prérequis :**
1. Un nom de domaine (ex : `lekkrek.com`).
2. Chez votre registraire, un enregistrement DNS **A** `lekkrek.com → IP_DU_VPS` (et `www` → même IP si vous le voulez). Attendez la propagation (`ping lekkrek.com` doit renvoyer l'IP du VPS).
3. Ports **80** et **443** ouverts sur le pare-feu du VPS :
   ```bash
   sudo ufw allow 80 && sudo ufw allow 443
   ```

**Activation (une seule fois) :**
```bash
# 1. Renseigner le domaine dans .env
nano .env        # décommentez DOMAIN, CERTBOT_EMAIL (et INCLUDE_WWW=1 si www)

# 2. Relancer le site pour qu'il prenne le domaine en compte
docker compose -f docker-compose.prod.yml up -d --build

# 3. Obtenir le certificat
chmod +x init-letsencrypt.sh
./init-letsencrypt.sh
```

> 💡 Pour un premier essai sans risquer les limites de Let's Encrypt (5 échecs/heure), lancez d'abord `STAGING=1 ./init-letsencrypt.sh`, puis relancez sans `STAGING=1`.

**Renouvellement :** automatique. Le conteneur `certbot` vérifie toutes les 12 h et Nginx recharge le certificat toutes les 6 h. Rien à faire.

Votre plateforme est désormais chiffrée avec le petit cadenas ! 🔒

---

## 9. Commandes de Maintenance Utiles

**Voir l'état de vos conteneurs :**
```bash
docker compose -f docker-compose.prod.yml ps
```

**Voir les logs (erreurs) du Backend Spring Boot :**
```bash
docker logs -f lekkrek_prod_backend
```

**Mettre à jour le site (après avoir fait des modifications sur votre ordinateur) :**
```bash
# 1. On récupère les nouveautés
git pull origin develop

# 2. On relance la compilation et la construction (sans couper le service inutilement)
docker compose -f docker-compose.prod.yml up -d --build
```

**Couper entièrement le site :**
```bash
docker compose -f docker-compose.prod.yml down
```
