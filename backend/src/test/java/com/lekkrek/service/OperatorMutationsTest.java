package com.lekkrek.service;

import com.lekkrek.dto.PlatRequestDTO;
import com.lekkrek.entity.Commande;
import com.lekkrek.entity.Plat;
import com.lekkrek.entity.Restaurant;
import com.lekkrek.entity.Utilisateur;
import com.lekkrek.repository.AuditLogRepository;
import com.lekkrek.repository.CommandeRepository;
import com.lekkrek.repository.PlatRepository;
import com.lekkrek.repository.RestaurantRepository;
import com.lekkrek.repository.UtilisateurRepository;
import com.lekkrek.service.impl.OrderServiceImpl;
import com.lekkrek.service.impl.PlatServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.security.access.AccessDeniedException;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

class OperatorMutationsTest {

    private PlatRepository platRepository;
    private RestaurantRepository restaurantRepository;
    private CommandeRepository commandeRepository;
    private AuditLogRepository auditLogRepository;
    private UtilisateurRepository utilisateurRepository;
    private OperatorAccessService accessService;

    private PlatServiceImpl platService;
    private OrderServiceImpl orderService;

    private Restaurant resto1;
    private Restaurant resto2;
    private Restaurant resto3;

    private Utilisateur op0;
    private Utilisateur op1;
    private Utilisateur op2;
    private Utilisateur adminUser;

    @BeforeEach
    void setUp() {
        platRepository = mock(PlatRepository.class);
        restaurantRepository = mock(RestaurantRepository.class);
        commandeRepository = mock(CommandeRepository.class);
        auditLogRepository = mock(AuditLogRepository.class);
        utilisateurRepository = mock(UtilisateurRepository.class);

        AuditService auditService = new AuditService(auditLogRepository);
        accessService = new OperatorAccessService(utilisateurRepository, restaurantRepository, auditService);

        platService = new PlatServiceImpl(platRepository, restaurantRepository, auditService, accessService);
        orderService = new OrderServiceImpl(commandeRepository, platRepository, auditService, accessService);

        resto1 = new Restaurant();
        resto1.setId(10L);
        resto1.setName("Tonton G");

        resto2 = new Restaurant();
        resto2.setId(20L);
        resto2.setName("La Mariken");

        resto3 = new Restaurant();
        resto3.setId(30L);
        resto3.setName("Chez Raph");

        when(restaurantRepository.findById(10L)).thenReturn(Optional.of(resto1));
        when(restaurantRepository.findById(20L)).thenReturn(Optional.of(resto2));
        when(restaurantRepository.findById(30L)).thenReturn(Optional.of(resto3));

        // Opérateur 0 restaurant
        op0 = new Utilisateur();
        op0.setEmail("op0@lekkrek.com");
        op0.setRole(Utilisateur.Role.OPERATEUR);
        op0.setRestaurants(Collections.emptySet());

        // Opérateur 1 restaurant (resto1)
        op1 = new Utilisateur();
        op1.setEmail("awa@lekkrek.com");
        op1.setRole(Utilisateur.Role.OPERATEUR);
        op1.setRestaurants(Set.of(resto1));

        // Opérateur 2 restaurants (resto1 + resto2)
        op2 = new Utilisateur();
        op2.setEmail("op2@lekkrek.com");
        op2.setRole(Utilisateur.Role.OPERATEUR);
        op2.setRestaurants(Set.of(resto1, resto2));

        // Admin
        adminUser = new Utilisateur();
        adminUser.setEmail("admin@lekkrek.com");
        adminUser.setRole(Utilisateur.Role.ADMIN);

        when(utilisateurRepository.findByEmail("op0@lekkrek.com")).thenReturn(Optional.of(op0));
        when(utilisateurRepository.findByEmail("awa@lekkrek.com")).thenReturn(Optional.of(op1));
        when(utilisateurRepository.findByEmail("op2@lekkrek.com")).thenReturn(Optional.of(op2));
        when(utilisateurRepository.findByEmail("admin@lekkrek.com")).thenReturn(Optional.of(adminUser));
    }

    private void authenticateAs(String email, String role) {
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(
                        email,
                        "password",
                        List.of(new SimpleGrantedAuthority("ROLE_" + role))
                )
        );
    }

    // ==========================================
    // CAS 0 RESTAURANT
    // ==========================================

    @Test
    void testOperatorWith0RestaurantsCannotCreatePlat() {
        authenticateAs("op0@lekkrek.com", "OPERATEUR");
        PlatRequestDTO request = new PlatRequestDTO("Plat Test", "Desc", BigDecimal.valueOf(3000), "img", "dejeuner", null, "DISPO", 10L);

        assertThrows(AccessDeniedException.class, () -> platService.createPlat(request));
        verify(platRepository, never()).save(any());
        verify(auditLogRepository, atLeastOnce()).save(any());
    }

    @Test
    void testOperatorWith0RestaurantsCannotUpdatePlat() {
        authenticateAs("op0@lekkrek.com", "OPERATEUR");
        Plat plat = new Plat();
        plat.setId(101L);
        plat.setRestaurant(resto1);
        when(platRepository.findById(101L)).thenReturn(Optional.of(plat));

        PlatRequestDTO request = new PlatRequestDTO("Modif", "Desc", BigDecimal.valueOf(3000), "img", "dejeuner", null, "DISPO", 10L);

        assertThrows(AccessDeniedException.class, () -> platService.updatePlat(101L, request));
        verify(platRepository, never()).save(any());
        verify(auditLogRepository, atLeastOnce()).save(any());
    }

    // ==========================================
    // CAS 1 RESTAURANT (op1 -> resto1 ID 10)
    // ==========================================

    @Test
    void testOperatorWith1RestaurantCreatePlatDefaultsToHisRestaurant() {
        authenticateAs("awa@lekkrek.com", "OPERATEUR");
        // Body sans restaurantId
        PlatRequestDTO request = new PlatRequestDTO("Yassa Poulet", "Desc", BigDecimal.valueOf(3500), "img", "dejeuner", null, "DISPO", null);

        when(platRepository.save(any(Plat.class))).thenAnswer(invocation -> {
            Plat p = invocation.getArgument(0);
            p.setId(99L);
            return p;
        });

        Plat saved = platService.createPlat(request);

        assertNotNull(saved);
        assertEquals(10L, saved.getRestaurant().getId());
        assertEquals("Tonton G", saved.getRestaurant().getName());
        verify(platRepository).save(any(Plat.class));
    }

    @Test
    void testOperatorWith1RestaurantCreatePlatInOtherRestaurantThrows403() {
        authenticateAs("awa@lekkrek.com", "OPERATEUR");
        // Tentative explicite de créer dans resto2 (ID 20) hors de son ensemble
        PlatRequestDTO request = new PlatRequestDTO("Tiep Bou Dienn", "Desc", BigDecimal.valueOf(4000), "img", "dejeuner", null, "DISPO", 20L);

        assertThrows(AccessDeniedException.class, () -> platService.createPlat(request));
        verify(platRepository, never()).save(any());
        verify(auditLogRepository, atLeastOnce()).save(any());
    }

    @Test
    void testOperatorWith1RestaurantUpdateOwnPlatSucceeds() {
        authenticateAs("awa@lekkrek.com", "OPERATEUR");
        Plat plat = new Plat();
        plat.setId(101L);
        plat.setName("Mafé");
        plat.setRestaurant(resto1);

        when(platRepository.findById(101L)).thenReturn(Optional.of(plat));
        when(platRepository.save(any(Plat.class))).thenAnswer(invocation -> invocation.getArgument(0));

        PlatRequestDTO request = new PlatRequestDTO("Mafé Spécial", "Desc", BigDecimal.valueOf(3800), "img", "dejeuner", null, "DISPO", 10L);

        Plat updated = platService.updatePlat(101L, request);
        assertEquals("Mafé Spécial", updated.getName());
        assertEquals(10L, updated.getRestaurant().getId());
    }

    @Test
    void testOperatorWith1RestaurantCannotMovePlatToOtherRestaurant() {
        authenticateAs("awa@lekkrek.com", "OPERATEUR");
        Plat plat = new Plat();
        plat.setId(101L);
        plat.setName("Mafé");
        plat.setRestaurant(resto1);

        when(platRepository.findById(101L)).thenReturn(Optional.of(plat));

        // Tente de changer le restaurantId vers resto2 (ID 20)
        PlatRequestDTO request = new PlatRequestDTO("Mafé", "Desc", BigDecimal.valueOf(3800), "img", "dejeuner", null, "DISPO", 20L);

        assertThrows(AccessDeniedException.class, () -> platService.updatePlat(101L, request));
        verify(platRepository, never()).save(any());
        verify(auditLogRepository, atLeastOnce()).save(any());
    }

    @Test
    void testOperatorWith1RestaurantCannotAccessOtherRestaurantMutations() {
        authenticateAs("awa@lekkrek.com", "OPERATEUR");
        Plat platAutre = new Plat();
        platAutre.setId(201L);
        platAutre.setRestaurant(resto2);
        when(platRepository.findById(201L)).thenReturn(Optional.of(platAutre));

        // Update plat autre
        assertThrows(AccessDeniedException.class, () ->
                platService.updatePlat(201L, new PlatRequestDTO("Hack", "Desc", BigDecimal.valueOf(100), "img", "dejeuner", null, "DISPO", 20L)));

        // Delete plat autre
        assertThrows(AccessDeniedException.class, () -> platService.deletePlat(201L));

        // Update status plat autre
        assertThrows(AccessDeniedException.class, () -> platService.updatePlatStatus(201L, "EPUISE"));

        // Duplicate hier resto autre
        assertThrows(AccessDeniedException.class, () -> platService.duplicateYesterdayPlats(20L));

        // Commandes autre resto
        Commande cmdAutre = new Commande();
        cmdAutre.setId(501L);
        cmdAutre.setRestaurant(resto2);
        when(commandeRepository.findById(501L)).thenReturn(Optional.of(cmdAutre));

        assertThrows(AccessDeniedException.class, () -> orderService.updateOrderStatus(501L, "EN_PREPARATION"));
        assertThrows(AccessDeniedException.class, () -> orderService.updatePaymentStatus(501L, "PAYE"));
    }

    // ==========================================
    // CAS 2 RESTAURANTS (op2 -> resto1 ID 10 + resto2 ID 20)
    // ==========================================

    @Test
    void testOperatorWith2RestaurantsCreatePlatsInBoth() {
        authenticateAs("op2@lekkrek.com", "OPERATEUR");

        when(platRepository.save(any(Plat.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Création dans resto1 (10)
        PlatRequestDTO req1 = new PlatRequestDTO("Plat Resto 1", "Desc", BigDecimal.valueOf(3000), "img", "dejeuner", null, "DISPO", 10L);
        Plat p1 = platService.createPlat(req1);
        assertEquals(10L, p1.getRestaurant().getId());

        // Création dans resto2 (20)
        PlatRequestDTO req2 = new PlatRequestDTO("Plat Resto 2", "Desc", BigDecimal.valueOf(4000), "img", "dejeuner", null, "DISPO", 20L);
        Plat p2 = platService.createPlat(req2);
        assertEquals(20L, p2.getRestaurant().getId());
    }

    @Test
    void testOperatorWith2RestaurantsCreatePlatWithoutRestoThrowsAmbiguity() {
        authenticateAs("op2@lekkrek.com", "OPERATEUR");
        // Sans restaurantId alors qu'il a 2 restaurants => IllegalArgumentException
        PlatRequestDTO req = new PlatRequestDTO("Plat Ambigü", "Desc", BigDecimal.valueOf(3000), "img", "dejeuner", null, "DISPO", null);
        assertThrows(IllegalArgumentException.class, () -> platService.createPlat(req));
    }

    @Test
    void testOperatorWith2RestaurantsCreatePlatIn3rdRestaurantThrows403() {
        authenticateAs("op2@lekkrek.com", "OPERATEUR");
        // Création dans resto3 (ID 30) hors de son ensemble => 403
        PlatRequestDTO req3 = new PlatRequestDTO("Plat Piraté", "Desc", BigDecimal.valueOf(3000), "img", "dejeuner", null, "DISPO", 30L);
        assertThrows(AccessDeniedException.class, () -> platService.createPlat(req3));
        verify(auditLogRepository, atLeastOnce()).save(any());
    }

    @Test
    void testOperatorWith2RestaurantsCanMovePlatBetweenHisRestaurants() {
        authenticateAs("op2@lekkrek.com", "OPERATEUR");
        Plat plat = new Plat();
        plat.setId(101L);
        plat.setName("Plat Mobile");
        plat.setRestaurant(resto1); // initialement chez resto1 (10L)

        when(platRepository.findById(101L)).thenReturn(Optional.of(plat));
        when(platRepository.save(any(Plat.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Transfert vers resto2 (20L) qui fait aussi partie de ses restaurants
        PlatRequestDTO request = new PlatRequestDTO("Plat Mobile", "Desc", BigDecimal.valueOf(3500), "img", "dejeuner", null, "DISPO", 20L);
        Plat updated = platService.updatePlat(101L, request);

        assertEquals(20L, updated.getRestaurant().getId());
        assertEquals("La Mariken", updated.getRestaurant().getName());
    }

    @Test
    void testOperatorWith2RestaurantsCannotMovePlatToExternalRestaurant() {
        authenticateAs("op2@lekkrek.com", "OPERATEUR");
        Plat plat = new Plat();
        plat.setId(101L);
        plat.setName("Plat");
        plat.setRestaurant(resto1);

        when(platRepository.findById(101L)).thenReturn(Optional.of(plat));

        // Transfert vers resto3 (30L) qui est extérieur => 403
        PlatRequestDTO request = new PlatRequestDTO("Plat", "Desc", BigDecimal.valueOf(3500), "img", "dejeuner", null, "DISPO", 30L);
        assertThrows(AccessDeniedException.class, () -> platService.updatePlat(101L, request));
        verify(auditLogRepository, atLeastOnce()).save(any());
    }

    // ==========================================
    // CAS ADMIN : ACCÈS TOTAL
    // ==========================================

    @Test
    void testAdminHasAccessToAllMutations() {
        authenticateAs("admin@lekkrek.com", "ADMIN");

        when(platRepository.save(any(Plat.class))).thenAnswer(invocation -> invocation.getArgument(0));

        // Création dans n'importe quel restaurant
        PlatRequestDTO reqAdmin = new PlatRequestDTO("Plat Admin", "Desc", BigDecimal.valueOf(5000), "img", "dejeuner", null, "DISPO", 30L);
        Plat p = platService.createPlat(reqAdmin);
        assertEquals(30L, p.getRestaurant().getId());

        // Modification plat de resto3
        Plat platResto3 = new Plat();
        platResto3.setId(301L);
        platResto3.setRestaurant(resto3);
        when(platRepository.findById(301L)).thenReturn(Optional.of(platResto3));

        PlatRequestDTO reqModif = new PlatRequestDTO("Plat Modifié", "Desc", BigDecimal.valueOf(5200), "img", "dejeuner", null, "DISPO", 10L);
        Plat modif = platService.updatePlat(301L, reqModif);
        assertEquals(10L, modif.getRestaurant().getId()); // transfert autorisé pour l'admin
    }
}
