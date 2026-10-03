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
- `frontend` : Compile votre code React (Vite) de production et lance Nginx sur le port 80 public.

L'opération peut prendre 2 à 3 minutes la première fois (le temps de télécharger les dépendances Java et NPM).

---

## 7. Vérification

Une fois le processus terminé, ouvrez votre navigateur et tapez : `http://VOTRE_ADRESSE_IP` ou `http://votre-domaine.com`. 
La plateforme Lekk Rek devrait s'afficher ! 🎉

---

## 8. Activation du HTTPS (Sécurité SSL) - Option Cloudflare

Pour que votre site soit en `https://`, la méthode la plus simple et gratuite est d'utiliser **Cloudflare** :
1. Créez un compte gratuit sur [Cloudflare](https://dash.cloudflare.com/sign-up).
2. Ajoutez votre nom de domaine.
3. Modifiez les serveurs DNS (Nameservers) chez votre registraire pour ceux fournis par Cloudflare.
4. Dans le tableau de bord Cloudflare, allez dans **SSL/TLS** -> **Onglet Overview**, et choisissez le mode **Flexible** ou **Full**.
5. Allez dans **Edge Certificates** et activez "Always Use HTTPS".

Votre plateforme est désormais chiffrée avec le petit cadenas vert !

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
