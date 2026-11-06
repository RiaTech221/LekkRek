package com.lekkrek.service.impl;

/**
 * ============================================================================
 * 📁 Fichier : PlatServiceImpl.java
 * 📝 Description : Implémentation du service Plat avec contrôle d'accès
 *                 strict multi-restaurants (0..n par id).
 * 🔒 Rôle : Fait partie de l'architecture Backend Spring Boot.
 * 💡 Auteur : Standard Enterprise Security
 * ============================================================================
 */

import com.lekkrek.dto.PlatRequestDTO;
import com.lekkrek.entity.Plat;
import com.lekkrek.entity.Restaurant;
import com.lekkrek.entity.Utilisateur;
import com.lekkrek.repository.PlatRepository;
import com.lekkrek.repository.RestaurantRepository;
import com.lekkrek.service.AuditService;
import com.lekkrek.service.OperatorAccessService;
import com.lekkrek.service.PlatService;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;

import java.util.Collections;
import java.util.List;
import java.util.Set;

@Service
public class PlatServiceImpl implements PlatService {

    private final PlatRepository platRepository;
    private final RestaurantRepository restaurantRepository;
    private final AuditService auditService;
    private final OperatorAccessService operatorAccessService;

    public PlatServiceImpl(PlatRepository platRepository,
                           RestaurantRepository restaurantRepository,
                           AuditService auditService,
                           OperatorAccessService operatorAccessService) {
        this.platRepository = platRepository;
        this.restaurantRepository = restaurantRepository;
        this.auditService = auditService;
        this.operatorAccessService = operatorAccessService;
    }

    @Override
    public List<Plat> getAllPlats() {
        Utilisateur user = operatorAccessService.getCurrentUser();
        if (user.getRole() == Utilisateur.Role.ADMIN) {
            return platRepository.findAll();
        }

        // Rôle OPERATEUR : filtrage strict par ses restaurants assignés
        Set<Long> assignedIds = operatorAccessService.getRestaurantIdsOf(user);
        if (assignedIds.isEmpty()) {
            return Collections.emptyList();
        }

        return platRepository.findByRestaurantIdIn(assignedIds);
    }

    @Override
    public Plat createPlat(PlatRequestDTO request) {
        Utilisateur user = operatorAccessService.getCurrentUser();
        Restaurant targetRestaurant;

        if (user.getRole() == Utilisateur.Role.OPERATEUR) {
            Set<Long> assignedIds = operatorAccessService.getRestaurantIdsOf(user);
            if (assignedIds.isEmpty()) {
                operatorAccessService.logAccessDenied(user, "/api/v1/operator/plats", "-", "Opérateur sans restaurant assigné tente de créer un plat");
                throw new AccessDeniedException("Accès refusé : aucun restaurant ne vous est assigné.");
            }

            Long targetId = request.restaurantId();
            if (targetId == null) {
                if (assignedIds.size() == 1) {
                    targetId = assignedIds.iterator().next();
                } else {
                    throw new IllegalArgumentException("Veuillez spécifier le restaurant pour lequel vous souhaitez créer ce plat.");
                }
            } else if (!assignedIds.contains(targetId)) {
                operatorAccessService.logAccessDenied(user, "/api/v1/operator/plats", targetId.toString(),
                        "Tentative de création de plat dans un restaurant non assigné");
                throw new AccessDeniedException("Accès refusé : vous n'avez pas l'autorisation de créer un plat pour ce restaurant.");
            }

            targetRestaurant = restaurantRepository.findById(targetId)
                    .orElseThrow(() -> new RuntimeException("Restaurant non trouvé"));
        } else {
            // ADMIN
            targetRestaurant = restaurantRepository.findById(request.restaurantId())
                    .orElseThrow(() -> new RuntimeException("Restaurant non trouvé"));
        }

        Plat plat = new Plat();
        plat.setName(request.name());
        plat.setDescription(request.description());
        plat.setPrice(request.price());
        plat.setImage(request.image());
        plat.setMoment(request.moment());
        plat.setVariantes(request.variantes());
        plat.setStatus(Plat.DishStatus.valueOf(request.status()));
        plat.setRestaurant(targetRestaurant);

        Plat saved = platRepository.save(plat);
        String savedIdStr = saved.getId() != null ? saved.getId().toString() : "-";
        auditService.logCurrentAction("CREATE_PLAT", "Plat", savedIdStr, null,
                "Création plat: " + saved.getName() + " (" + saved.getPrice() + " F) pour " + targetRestaurant.getName());
        return saved;
    }

    @Override
    public Plat updatePlat(Long id, PlatRequestDTO request) {
        Plat plat = platRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Plat non trouvé"));

        Utilisateur user = operatorAccessService.getCurrentUser();
        operatorAccessService.assertCanAccessPlat(user, plat, "/api/v1/operator/plats/" + id, id.toString());

        // Gestion du restaurant
        if (request.restaurantId() != null && !request.restaurantId().equals(plat.getRestaurant().getId())) {
            if (user.getRole() == Utilisateur.Role.ADMIN) {
                Restaurant newResto = restaurantRepository.findById(request.restaurantId())
                        .orElseThrow(() -> new RuntimeException("Restaurant non trouvé"));
                plat.setRestaurant(newResto);
            } else {
                // Pour un OPERATEUR : autorisé uniquement si le restaurant cible fait partie de ses restaurants assignés
                Set<Long> assignedIds = operatorAccessService.getRestaurantIdsOf(user);
                if (assignedIds.contains(request.restaurantId())) {
                    Restaurant newResto = restaurantRepository.findById(request.restaurantId())
                            .orElseThrow(() -> new RuntimeException("Restaurant non trouvé"));
                    plat.setRestaurant(newResto);
                } else {
                    operatorAccessService.logAccessDenied(user, "/api/v1/operator/plats/" + id, request.restaurantId().toString(),
                            "Tentative de transfert de plat vers un restaurant extérieur");
                    throw new AccessDeniedException("Accès refusé : vous ne pouvez transférer un plat que vers un restaurant qui vous est assigné.");
                }
            }
        }

        plat.setName(request.name());
        plat.setDescription(request.description());
        plat.setPrice(request.price());
        plat.setImage(request.image());
        plat.setMoment(request.moment());
        plat.setVariantes(request.variantes());
        plat.setStatus(Plat.DishStatus.valueOf(request.status()));

        Plat updated = platRepository.save(plat);
        auditService.logCurrentAction("UPDATE_PLAT", "Plat", id.toString(), null,
                "Modification plat: " + updated.getName() + " (" + updated.getPrice() + " F)");
        return updated;
    }

    @Override
    public void deletePlat(Long id) {
        Plat plat = platRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Plat non trouvé"));

        Utilisateur user = operatorAccessService.getCurrentUser();
        operatorAccessService.assertCanAccessPlat(user, plat, "/api/v1/operator/plats/" + id, id.toString());

        platRepository.delete(plat);
        auditService.logCurrentAction("DELETE_PLAT", "Plat", id.toString(), null,
                "Suppression plat ID: " + id + " (" + plat.getName() + ")");
    }

    @Override
    public void duplicateYesterdayPlats(Long restaurantId) {
        Restaurant restaurant = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Restaurant non trouvé"));

        Utilisateur user = operatorAccessService.getCurrentUser();
        operatorAccessService.assertCanAccessRestaurant(user, restaurantId,
                "/api/v1/operator/restaurants/" + restaurantId + "/plats/duplicate", restaurantId.toString());

        List<Plat> plats = platRepository.findByRestaurantId(restaurantId);
        for (Plat p : plats) {
            p.setStatus(Plat.DishStatus.DISPO);
        }
        platRepository.saveAll(plats);
        auditService.logCurrentAction("DUPLICATE_PLATS", "Restaurant", restaurantId.toString(), null,
                "Duplication menu pour restaurant: " + restaurant.getName());
    }

    @Override
    public Plat updatePlatStatus(Long id, String status) {
        Plat plat = platRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Plat non trouvé"));

        Utilisateur user = operatorAccessService.getCurrentUser();
        operatorAccessService.assertCanAccessPlat(user, plat, "/api/v1/operator/plats/" + id + "/status", id.toString());

        plat.setStatus(Plat.DishStatus.valueOf(status));
        Plat updated = platRepository.save(plat);
        auditService.logCurrentAction("UPDATE_PLAT_STATUS", "Plat", id.toString(), null,
                "Changement statut plat " + updated.getName() + " -> " + status);
        return updated;
    }
}
