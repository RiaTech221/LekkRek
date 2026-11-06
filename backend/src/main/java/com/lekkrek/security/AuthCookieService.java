package com.lekkrek.security;

/**
 * ============================================================================
 * 📁 Fichier : AuthCookieService.java
 * 📝 Description : Construction des cookies d'authentification — Option A
 *                  (JWT transporté en cookie HttpOnly côté web).
 * 🔒 Rôle : Le web reçoit le JWT dans un cookie **HttpOnly** : le JavaScript de la
 *           page ne peut pas le lire → un XSS ne peut pas voler le token.
 *           Le mobile Expo continue d'utiliser le header `Authorization: Bearer`
 *           (le backend accepte les deux canaux, cf. JwtAuthFilter).
 * 💡 Auteur : Équipe Sécurité
 * ----------------------------------------------------------------------------
 * 🔧 Config : auth.cookie.path   (chemin restreint aux appels API)
 *             auth.cookie.secure  (true en prod HTTPS, false en dev HTTP)
 *             jwt.expirationMs    (durée de vie du cookie alignée sur le JWT)
 * ============================================================================
 */

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseCookie;
import org.springframework.stereotype.Component;

import java.time.Duration;

@Component
public class AuthCookieService {

    /** Nom unique du cookie de session web. */
    public static final String NAME = "lekkrek_token";

    @Value("${auth.cookie.path:/api}")
    private String cookiePath;

    @Value("${auth.cookie.secure:true}")
    private boolean cookieSecure;

    @Value("${jwt.expirationMs}")
    private int expirationMs;

    /**
     * Cookie posé à la connexion :
     * - HttpOnly  : inaccessible au JavaScript (immunisé contre le vol de token par XSS) ;
     * - SameSite=Lax : jamais envoyé depuis un site tiers (anti-CSRF) ;
     * - Secure    : HTTPS uniquement (désactivé en dev via auth.cookie.secure=false) ;
     * - Path=/api : n'accompagne que les appels API, pas le reste du site ;
     * - Max-Age   : aligné sur l'expiration du JWT.
     */
    public ResponseCookie buildLoginCookie(String token) {
        return ResponseCookie.from(NAME, token)
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite("Lax")
                .path(cookiePath)
                .maxAge(Duration.ofMillis(expirationMs))
                .build();
    }

    /** Cookie effacé au logout (Max-Age=0 → le navigateur le supprime immédiatement). */
    public ResponseCookie buildClearCookie() {
        return ResponseCookie.from(NAME, "")
                .httpOnly(true)
                .secure(cookieSecure)
                .sameSite("Lax")
                .path(cookiePath)
                .maxAge(Duration.ZERO)
                .build();
    }
}
