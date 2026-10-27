#!/bin/sh
# =============================================================================
# 🔒 LekkRek — Obtention du PREMIER certificat HTTPS Let's Encrypt
#
# À lancer UNE SEULE FOIS sur le VPS, quand :
#   1. le domaine pointe vers l'IP du VPS (enregistrement DNS A, + www si voulu) ;
#   2. les ports 80 et 443 sont ouverts ;
#   3. le site tourne : docker compose -f docker-compose.prod.yml up -d --build
#
# Variables lues dans le fichier .env à la racine (ou l'environnement) :
#   DOMAIN=lekkrek.com          (obligatoire, sans https://)
#   CERTBOT_EMAIL=toi@mail.com  (obligatoire, alertes d'expiration)
#   INCLUDE_WWW=1               (optionnel : couvre aussi www.DOMAIN)
#   STAGING=1                   (optionnel : certificat de TEST, pour éviter
#                                les limites de Let's Encrypt pendant les essais)
#
# Ensuite, plus rien à faire : le conteneur certbot renouvelle tout seul.
# =============================================================================
set -e

COMPOSE="docker compose -f docker-compose.prod.yml"

# Charge le .env s'il existe
if [ -f .env ]; then
    set -a
    . ./.env
    set +a
fi

if [ -z "${DOMAIN}" ] || [ "${DOMAIN}" = "localhost" ]; then
    echo "❌ DOMAIN n'est pas défini dans .env (ex : DOMAIN=lekkrek.com)"
    exit 1
fi
if [ -z "${CERTBOT_EMAIL}" ]; then
    echo "❌ CERTBOT_EMAIL n'est pas défini dans .env (ex : CERTBOT_EMAIL=toi@mail.com)"
    exit 1
fi

DOMAIN_ARGS="-d ${DOMAIN}"
if [ "${INCLUDE_WWW}" = "1" ]; then
    DOMAIN_ARGS="${DOMAIN_ARGS} -d www.${DOMAIN}"
fi

STAGING_ARG=""
if [ "${STAGING}" = "1" ]; then
    STAGING_ARG="--staging"
    echo "⚠️  Mode STAGING : certificat de test (non reconnu par les navigateurs)"
fi

echo "▶️  Vérification que Nginx tourne (nécessaire pour la validation sur le port 80)…"
${COMPOSE} up -d frontend

echo "▶️  Demande du certificat pour : ${DOMAIN_ARGS}"
${COMPOSE} run --rm --entrypoint certbot certbot certonly \
    --webroot -w /var/www/certbot \
    --cert-name "${DOMAIN}" \
    ${DOMAIN_ARGS} \
    --email "${CERTBOT_EMAIL}" \
    --agree-tos --no-eff-email \
    --non-interactive \
    --force-renewal \
    ${STAGING_ARG}

echo "▶️  Redémarrage de Nginx pour charger le certificat…"
${COMPOSE} up -d --force-recreate frontend
${COMPOSE} up -d certbot

echo "✅ HTTPS activé : https://${DOMAIN}"
