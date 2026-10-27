#!/bin/sh
# =============================================================================
# 🔒 LekkRek — Sélection du certificat HTTPS au démarrage de Nginx
# Exécuté automatiquement par l'image officielle nginx (/docker-entrypoint.d/)
# AVANT le lancement de Nginx.
#
#  - Si un certificat Let's Encrypt existe pour $DOMAIN → on l'utilise.
#  - Sinon → certificat auto-signé temporaire, pour que Nginx démarre quand
#    même (indispensable pour que Certbot puisse valider le domaine via le
#    port 80, et pour tester en HTTPS sur l'IP du VPS avant d'avoir un domaine).
#
#  Une boucle en arrière-plan recharge Nginx toutes les 6 h : elle bascule sur
#  le certificat Let's Encrypt dès qu'il apparaît et prend en compte les
#  renouvellements faits par le conteneur certbot.
# =============================================================================
set -e

DOMAIN="${DOMAIN:-localhost}"
LE_DIR="/etc/letsencrypt/live/${DOMAIN}"
SELF_DIR="/etc/nginx/ssl/selfsigned"
CURRENT="/etc/nginx/ssl/current"

select_cert() {
    if [ -f "${LE_DIR}/fullchain.pem" ] && [ -f "${LE_DIR}/privkey.pem" ]; then
        ln -sfn "${LE_DIR}" "${CURRENT}"
        echo "[lekkrek-ssl] Certificat Let's Encrypt utilisé pour ${DOMAIN}"
    else
        if [ ! -f "${SELF_DIR}/fullchain.pem" ]; then
            mkdir -p "${SELF_DIR}"
            openssl req -x509 -nodes -newkey rsa:2048 -days 30 \
                -keyout "${SELF_DIR}/privkey.pem" \
                -out "${SELF_DIR}/fullchain.pem" \
                -subj "/CN=${DOMAIN}" >/dev/null 2>&1
        fi
        ln -sfn "${SELF_DIR}" "${CURRENT}"
        echo "[lekkrek-ssl] ⚠️  Pas de certificat Let's Encrypt pour ${DOMAIN} : certificat auto-signé TEMPORAIRE"
    fi
}

mkdir -p /etc/nginx/ssl
select_cert

# Rechargement périodique (nouveau certificat / renouvellement)
(
    while :; do
        sleep 6h
        select_cert
        nginx -s reload || true
    done
) &
