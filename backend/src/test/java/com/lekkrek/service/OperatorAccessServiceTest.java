package com.lekkrek.service;

import com.lekkrek.entity.Commande;
import com.lekkrek.entity.Plat;
import com.lekkrek.entity.Restaurant;
import com.lekkrek.entity.Utilisateur;
import com.lekkrek.repository.AuditLogRepository;
import com.lekkrek.repository.RestaurantRepository;
import com.lekkrek.repository.UtilisateurRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.AccessDeniedException;

import java.util.Collections;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class OperatorAccessServiceTest {

    private UtilisateurRepository utilisateurRepository;
    private RestaurantRepository restaurantRepository;
    private AuditLogRepository auditLogRepository;
    private AuditService auditService;
    private OperatorAccessService accessService;

    private Restaurant resto1;
    private Restaurant resto2;
    private Restaurant resto3;

    @BeforeEach
    void setUp() {
        utilisateurRepository = mock(UtilisateurRepository.class);
        restaurantRepository = mock(RestaurantRepository.class);
        auditLogRepository = mock(AuditLogRepository.class);
        auditService = new AuditService(auditLogRepository);
        accessService = new OperatorAccessService(utilisateurRepository, restaurantRepository, auditService);

        resto1 = new Restaurant();
        resto1.setId(10L);
        resto1.setName("Tonton G");

        resto2 = new Restaurant();
        resto2.setId(20L);
        resto2.setName("La Mariken");

        resto3 = new Restaurant();
        resto3.setId(30L);
        resto3.setName("Chez Raph");
    }

    @Test
    void testGetRestaurantIdsOf() {
        // null user
        assertTrue(accessService.getRestaurantIdsOf(null).isEmpty());

        // operator with null restaurants
        Utilisateur op0 = new Utilisateur();
        op0.setRestaurants(null);
        assertTrue(accessService.getRestaurantIdsOf(op0).isEmpty());

        // operator with empty restaurants
        op0.setRestaurants(Collections.emptySet());
        assertTrue(accessService.getRestaurantIdsOf(op0).isEmpty());

        // operator with 1 restaurant
        Utilisateur op1 = new Utilisateur();
        op1.setRestaurants(Set.of(resto1));
        assertEquals(Set.of(10L), accessService.getRestaurantIdsOf(op1));

        // operator with 2 restaurants
        Utilisateur op2 = new Utilisateur();
        op2.setRestaurants(Set.of(resto1, resto2));
        assertEquals(Set.of(10L, 20L), accessService.getRestaurantIdsOf(op2));
    }

    @Test
    void testAdminHasFullAccess() {
        Utilisateur admin = new Utilisateur();
        admin.setEmail("admin@lekkrek.com");
        admin.setRole(Utilisateur.Role.ADMIN);

        Plat plat = new Plat();
        plat.setId(101L);
        plat.setRestaurant(resto3);

        Commande cmd = new Commande();
        cmd.setId(201L);
        cmd.setRestaurant(resto3);

        // Aucune restriction pour l'admin
        assertDoesNotThrow(() -> accessService.assertCanAccessRestaurant(admin, resto3, "/api/v1/operator/test", "30"));
        assertDoesNotThrow(() -> accessService.assertCanAccessRestaurant(admin, 30L, "/api/v1/operator/test", "30"));
        assertDoesNotThrow(() -> accessService.assertCanAccessPlat(admin, plat, "/api/v1/operator/plats/101", "101"));
        assertDoesNotThrow(() -> accessService.assertCanAccessCommande(admin, cmd, "/api/v1/operator/orders/201/status", "201"));
    }

    @Test
    void testOperatorWith0RestaurantsThrows403() {
        Utilisateur op0 = new Utilisateur();
        op0.setEmail("sansresto@lekkrek.com");
        op0.setRole(Utilisateur.Role.OPERATEUR);
        op0.setRestaurants(Collections.emptySet());

        Plat plat = new Plat();
        plat.setId(101L);
        plat.setRestaurant(resto1);

        Commande cmd = new Commande();
        cmd.setId(201L);
        cmd.setRestaurant(resto1);

        assertThrows(AccessDeniedException.class, () ->
                accessService.assertCanAccessRestaurant(op0, resto1, "/test", "10"));
        assertThrows(AccessDeniedException.class, () ->
                accessService.assertCanAccessRestaurant(op0, 10L, "/test", "10"));
        assertThrows(AccessDeniedException.class, () ->
                accessService.assertCanAccessPlat(op0, plat, "/test", "101"));
        assertThrows(AccessDeniedException.class, () ->
                accessService.assertCanAccessCommande(op0, cmd, "/test", "201"));

        verify(auditLogRepository, atLeastOnce()).save(any());
    }

    @Test
    void testOperatorWith1Restaurant() {
        Utilisateur op1 = new Utilisateur();
        op1.setEmail("awa@lekkrek.com");
        op1.setRole(Utilisateur.Role.OPERATEUR);
        op1.setRestaurants(Set.of(resto1));

        Plat platAssigne = new Plat();
        platAssigne.setId(101L);
        platAssigne.setRestaurant(resto1);

        Commande cmdAssignee = new Commande();
        cmdAssignee.setId(201L);
        cmdAssignee.setRestaurant(resto1);

        Plat platAutre = new Plat();
        platAutre.setId(102L);
        platAutre.setRestaurant(resto2);

        Commande cmdAutre = new Commande();
        cmdAutre.setId(202L);
        cmdAutre.setRestaurant(resto2);

        // Accès autorisé pour le restaurant assigné
        assertDoesNotThrow(() -> accessService.assertCanAccessRestaurant(op1, resto1, "/test", "10"));
        assertDoesNotThrow(() -> accessService.assertCanAccessRestaurant(op1, 10L, "/test", "10"));
        assertDoesNotThrow(() -> accessService.assertCanAccessPlat(op1, platAssigne, "/test", "101"));
        assertDoesNotThrow(() -> accessService.assertCanAccessCommande(op1, cmdAssignee, "/test", "201"));

        // Accès refusé pour un autre restaurant => 403
        assertThrows(AccessDeniedException.class, () ->
                accessService.assertCanAccessRestaurant(op1, resto2, "/test", "20"));
        assertThrows(AccessDeniedException.class, () ->
                accessService.assertCanAccessRestaurant(op1, 20L, "/test", "20"));
        assertThrows(AccessDeniedException.class, () ->
                accessService.assertCanAccessPlat(op1, platAutre, "/test", "102"));
        assertThrows(AccessDeniedException.class, () ->
                accessService.assertCanAccessCommande(op1, cmdAutre, "/test", "202"));

        verify(auditLogRepository, atLeastOnce()).save(any());
    }

    @Test
    void testOperatorWith2Restaurants() {
        Utilisateur op2 = new Utilisateur();
        op2.setEmail("multi@lekkrek.com");
        op2.setRole(Utilisateur.Role.OPERATEUR);
        op2.setRestaurants(Set.of(resto1, resto2));

        Plat plat1 = new Plat();
        plat1.setId(101L);
        plat1.setRestaurant(resto1);

        Plat plat2 = new Plat();
        plat2.setId(102L);
        plat2.setRestaurant(resto2);

        Plat plat3 = new Plat();
        plat3.setId(103L);
        plat3.setRestaurant(resto3);

        Commande cmd1 = new Commande();
        cmd1.setId(201L);
        cmd1.setRestaurant(resto1);

        Commande cmd2 = new Commande();
        cmd2.setId(202L);
        cmd2.setRestaurant(resto2);

        Commande cmd3 = new Commande();
        cmd3.setId(203L);
        cmd3.setRestaurant(resto3);

        // Accès autorisé pour les 2 restaurants de son ensemble
        assertDoesNotThrow(() -> accessService.assertCanAccessRestaurant(op2, resto1, "/test", "10"));
        assertDoesNotThrow(() -> accessService.assertCanAccessRestaurant(op2, 10L, "/test", "10"));
        assertDoesNotThrow(() -> accessService.assertCanAccessRestaurant(op2, resto2, "/test", "20"));
        assertDoesNotThrow(() -> accessService.assertCanAccessRestaurant(op2, 20L, "/test", "20"));
        assertDoesNotThrow(() -> accessService.assertCanAccessPlat(op2, plat1, "/test", "101"));
        assertDoesNotThrow(() -> accessService.assertCanAccessPlat(op2, plat2, "/test", "102"));
        assertDoesNotThrow(() -> accessService.assertCanAccessCommande(op2, cmd1, "/test", "201"));
        assertDoesNotThrow(() -> accessService.assertCanAccessCommande(op2, cmd2, "/test", "202"));

        // Accès refusé pour un restaurant tiers (resto3) hors ensemble
        assertThrows(AccessDeniedException.class, () ->
                accessService.assertCanAccessRestaurant(op2, resto3, "/test", "30"));
        assertThrows(AccessDeniedException.class, () ->
                accessService.assertCanAccessRestaurant(op2, 30L, "/test", "30"));
        assertThrows(AccessDeniedException.class, () ->
                accessService.assertCanAccessPlat(op2, plat3, "/test", "103"));
        assertThrows(AccessDeniedException.class, () ->
                accessService.assertCanAccessCommande(op2, cmd3, "/test", "203"));

        verify(auditLogRepository, atLeastOnce()).save(any());
    }
}
