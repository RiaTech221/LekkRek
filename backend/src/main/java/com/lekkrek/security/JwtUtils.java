package com.lekkrek.security;

/**
 * ============================================================================
 * 📁 Fichier : JwtUtils.java
 * 📝 Description : Classe métier pour la gestion de JwtUtils dans LekkRek.
 * 🔒 Rôle : Fait partie de l'architecture Backend Spring Boot.
 * 💡 Auteur : Documenté automatiquement (Standard Enterprise)
 * ============================================================================
 */


import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.env.Environment;
import org.springframework.core.env.Profiles;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import jakarta.annotation.PostConstruct;
import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.security.SecureRandom;
import java.util.Date;
import java.util.Set;

@Component
public class JwtUtils {

    private static final Logger log = LoggerFactory.getLogger(JwtUtils.class);

    /** Taille minimale de la clé HMAC-SHA256 : 256 bits = 32 octets. */
    private static final int MIN_KEY_BYTES = 32;

    /**
     * Clés publiées dans le dépôt (anciennes valeurs par défaut, exemples de documentation).
     * Le dépôt étant public, ces valeurs sont connues de tous : elles sont refusées
     * pour qu'aucun serveur ne puisse signer des tokens avec une clé devinable.
     */
    private static final Set<String> CLES_PUBLIQUES_INTERDITES = Set.of(
            "LekkRekDevSecretKeyMustBeAtLeast256BitsLongForHS256Algorithm!!",
            "VotreCleJwtTresLongueEtSecuriseeMinimum256BitsHS256!"
    );

    @Value("${jwt.secret:}")
    private String jwtSecretString;

    @Value("${jwt.expirationMs}")
    private int jwtExpirationMs;

    private final Environment environment;

    private Key jwtSecret;

    public JwtUtils(Environment environment) {
        this.environment = environment;
    }

    /**
     * Validation de la clé JWT au démarrage.
     * - PROD : clé absente, trop courte, factice ou publiée dans le dépôt → refus de démarrer.
     * - DEV  : clé absente → clé aléatoire temporaire (les sessions sont perdues à chaque
     *          redémarrage) ; clé faible ou publiée → refus également.
     */
    @PostConstruct
    public void init() {
        String secret = jwtSecretString == null ? "" : jwtSecretString.trim();
        boolean isProd = environment.acceptsProfiles(Profiles.of("prod"));

        // Valeurs factices des fichiers d'exemple / de la doc = clé non renseignée
        boolean isPlaceholder = secret.startsWith("a_generer") || secret.startsWith("<");

        if (secret.isEmpty() || isPlaceholder) {
            if (isProd) {
                throw new IllegalStateException(
                        "JWT_SECRET n'est pas défini. En production, générez une clé avec "
                        + "'openssl rand -hex 64' et ajoutez-la au fichier .env du serveur.");
            }
            byte[] randomKey = new byte[64];
            new SecureRandom().nextBytes(randomKey);
            this.jwtSecret = Keys.hmacShaKeyFor(randomKey);
            log.warn("JWT_SECRET non défini : clé aléatoire TEMPORAIRE utilisée (dev uniquement). "
                    + "Les sessions seront invalidées à chaque redémarrage. "
                    + "Ajoutez JWT_SECRET=$(openssl rand -hex 64) dans votre .env pour les conserver.");
            return;
        }

        if (CLES_PUBLIQUES_INTERDITES.contains(secret)) {
            throw new IllegalStateException(
                    "JWT_SECRET utilise une clé publiée dans le dépôt public : n'importe qui pourrait "
                    + "forger un token ADMIN. Générez une clé avec 'openssl rand -hex 64'.");
        }

        byte[] keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < MIN_KEY_BYTES) {
            throw new IllegalStateException("JWT_SECRET doit faire au moins 256 bits (32 caractères).");
        }
        this.jwtSecret = Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateJwtToken(Authentication authentication) {
        UserDetails userPrincipal = (UserDetails) authentication.getPrincipal();

        return Jwts.builder()
                .setSubject((userPrincipal.getUsername()))
                .setIssuedAt(new Date())
                .setExpiration(new Date((new Date()).getTime() + jwtExpirationMs))
                .signWith(jwtSecret)
                .compact();
    }

    public String getUserNameFromJwtToken(String token) {
        return Jwts.parserBuilder().setSigningKey(jwtSecret).build()
                .parseClaimsJws(token).getBody().getSubject();
    }

    public boolean validateJwtToken(String authToken) {
        try {
            Jwts.parserBuilder().setSigningKey(jwtSecret).build().parseClaimsJws(authToken);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            System.err.println("Invalid JWT token: " + e.getMessage());
        }
        return false;
    }
}
