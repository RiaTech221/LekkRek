package com.lekkrek.service;

/**
 * ============================================================================
 * 📁 Fichier : OperatorAccessService.java
 * 📝 Description : Contrôle d'accès centralisé et réutilisable pour le rôle OPERATEUR
 *                 basé sur la relation 0..n par identifiant (Set<Long> restaurantIds)
 *                 et vérification de changement de mot de passe obligatoire.
 * 🔒 Rôle : Isole les vérifications d'appartenance et journalise les refus (ACCESS_DENIED).
 * 💡 Auteur : Standard Enterprise Security
 * ============================================================================
 */

import com.lekkrek.entity.Commande;
import com.lekkrek.entity.Plat;
import com.lekkrek.entity.Restaurant;
import com.lekkrek.entity.Utilisateur;
import com.lekkrek.repository.RestaurantRepository;
import com.lekkrek.repository.UtilisateurRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.Objects;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class OperatorAccessService {

    private final UtilisateurRepository utilisateurRepository;
    private final RestaurantRepository restaurantRepository;
    private final AuditService auditService;

    public OperatorAccessService(UtilisateurRepository utilisateurRepository,
                                 RestaurantRepository restaurantRepository,
                                 AuditService auditService) {
        this.utilisateurRepository = utilisateurRepository;
        this.restaurantRepository = restaurantRepository;
        this.auditService = auditService;
    }

    /**
     * Récupère l'utilisateur connecté depuis le SecurityContextHolder.
     */
    public Utilisateur getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            throw new AccessDeniedException("Accès refusé : utilisateur non authentifié.");
        }
        return utilisateurRepository.findByEmail(auth.getName())
                .orElseThrow(() -> new AccessDeniedException("Accès refusé : utilisateur introuvable en base."));
    }

    /**
     * Renvoie l'ensemble des identifiants des restaurants assignés à l'utilisateur (Set<Long>).
     * Vide pour un opérateur sans restaurant.
     */
    public Set<Long> getRestaurantIdsOf(Utilisateur user) {
        if (user == null || user.getRestaurants() == null || user.getRestaurants().isEmpty()) {
            return Collections.emptySet();
        }
        return user.getRestaurants().stream()
                .map(Restaurant::getId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());
    }

    /**
     * Renvoie l'ensemble des entités Restaurants assignées à l'utilisateur.
     */
    public Set<Restaurant> getAssignedRestaurants(Utilisateur user) {
        if (user == null || user.getRestaurants() == null) {
            return Collections.emptySet();
        }
        return user.getRestaurants();
    }

    /**
     * Vérifie si l'utilisateur peut accéder/modifier un restaurant par son ID.
     */
    public void assertCanAccessRestaurant(Utilisateur user, Long restaurantId, String endpoint, String requestedId) {
        if (user == null) {
            throw new AccessDeniedException("Accès refusé : utilisateur non identifié.");
        }
        if (user.getRole() == Utilisateur.Role.ADMIN) {
            return; // L'administrateur a un accès total
        }

        // Cas OPERATEUR : Exigence du changement de mot de passe provisoire dès la 1ère connexion
        if (Boolean.TRUE.equals(user.getDoitChangerMotDePasse())) {
            logAccessDenied(user, endpoint, requestedId, "Changement de mot de passe obligatoire requis avant toute opération.");
            throw new AccessDeniedException("Accès refusé : vous devez obligatoirement modifier votre mot de passe provisoire avant d'effectuer des opérations.");
        }

        Set<Long> assignedIds = getRestaurantIdsOf(user);
        if (assignedIds.isEmpty()) {
            logAccessDenied(user, endpoint, requestedId, "Opérateur sans restaurant assigné");
            throw new AccessDeniedException("Accès refusé : aucun restaurant ne vous est assigné.");
        }

        if (restaurantId == null || !assignedIds.contains(restaurantId)) {
            logAccessDenied(user, endpoint, requestedId, "Tentative d'accès au restaurant non autorisé ID: " + restaurantId);
            throw new AccessDeniedException("Accès refusé : vous n'avez pas l'autorisation d'accéder aux données de ce restaurant.");
        }
    }

    /**
     * Surcharge pour vérifier l'accès avec une entité Restaurant.
     */
    public void assertCanAccessRestaurant(Utilisateur user, Restaurant restaurant, String endpoint, String requestedId) {
        assertCanAccessRestaurant(user, restaurant != null ? restaurant.getId() : null, endpoint, requestedId);
    }

    /**
     * Vérifie si l'utilisateur a le droit d'accéder/modifier un plat.
     */
    public void assertCanAccessPlat(Utilisateur user, Plat plat, String endpoint, String requestedId) {
        if (user == null) {
            throw new AccessDeniedException("Accès refusé : utilisateur non identifié.");
        }
        if (user.getRole() == Utilisateur.Role.ADMIN) {
            return;
        }
        if (plat == null) {
            throw new AccessDeniedException("Accès refusé : plat introuvable.");
        }
        assertCanAccessRestaurant(user, plat.getRestaurant(), endpoint, requestedId);
    }

    /**
     * Vérifie si l'utilisateur a le droit d'accéder/modifier une commande.
     */
    public void assertCanAccessCommande(Utilisateur user, Commande commande, String endpoint, String requestedId) {
        if (user == null) {
            throw new AccessDeniedException("Accès refusé : utilisateur non identifié.");
        }
        if (user.getRole() == Utilisateur.Role.ADMIN) {
            return;
        }
        if (commande == null) {
            throw new AccessDeniedException("Accès refusé : commande introuvable.");
        }
        assertCanAccessRestaurant(user, commande.getRestaurant(), endpoint, requestedId);
    }

    /**
     * Enregistre un événement de refus d'accès dans la table audit_logs.
     */
    public void logAccessDenied(Utilisateur user, String endpoint, String requestedId, String reason) {
        String actorEmail = user != null ? user.getEmail() : "inconnu";
        String role = user != null && user.getRole() != null ? user.getRole().name() : "OPERATEUR";
        auditService.logAction(
                actorEmail,
                role,
                "ACCESS_DENIED",
                endpoint != null ? endpoint : "API",
                requestedId != null ? requestedId : "-",
                null,
                reason
        );
    }
}
