package com.lekkrek.controller;

/**
 * ============================================================================
 * 📁 Fichier : OperatorController.java
 * 📝 Description : Classe métier pour la gestion de OperatorController dans LekkRek.
 * 🔒 Rôle : Fait partie de l'architecture Backend Spring Boot.
 * 💡 Auteur : Documenté automatiquement (Standard Enterprise)
 * ============================================================================
 */


import com.lekkrek.entity.Commande;
import com.lekkrek.entity.Plat;
import com.lekkrek.dto.PlatRequestDTO;
import com.lekkrek.service.OrderService;
import com.lekkrek.service.PlatService;
import org.springframework.security.access.prepost.PreAuthorize;
<<<<<<< HEAD
=======
import jakarta.validation.Valid;
>>>>>>> develop
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("${api.prefix.operator:/api/v1/operator}")
@PreAuthorize("hasAnyRole('ADMIN', 'OPERATEUR')")
<<<<<<< HEAD
@CrossOrigin(origins = "*")
=======
>>>>>>> develop
public class OperatorController {

    private final OrderService orderService;
    private final PlatService platService;

    public OperatorController(OrderService orderService, PlatService platService) {
        this.orderService = orderService;
        this.platService = platService;
    }

    // --- ORDERS ---
    @GetMapping("/orders")
    public List<Commande> getAllOrders() {
        return orderService.getAllOrders();
    }

    @PutMapping("/orders/{id}/status")
    public Commande updateOrderStatus(@PathVariable Long id, @RequestParam String status) {
        return orderService.updateOrderStatus(id, status);
    }

    @PutMapping("/orders/{id}/payment-status")
    public Commande updateOrderPaymentStatus(@PathVariable Long id, @RequestParam String status) {
        return orderService.updatePaymentStatus(id, status);
    }

    // --- PLATS ---
    @GetMapping("/plats")
    public List<Plat> getAllPlats() {
        return platService.getAllPlats();
    }

    @PostMapping("/plats")
    public Plat createPlat(@Valid @RequestBody PlatRequestDTO request) {
        return platService.createPlat(request);
    }

    @PutMapping("/plats/{id}")
    public Plat updatePlat(@PathVariable Long id, @Valid @RequestBody PlatRequestDTO request) {
        return platService.updatePlat(id, request);
    }

    @DeleteMapping("/plats/{id}")
    public void deletePlat(@PathVariable Long id) {
        platService.deletePlat(id);
    }

    @PutMapping("/plats/{id}/status")
    public Plat updatePlatStatus(@PathVariable Long id, @RequestParam String status) {
        return platService.updatePlatStatus(id, status);
    }

    @PostMapping("/restaurants/{restaurantId}/plats/duplicate")
    public void duplicateYesterdayPlats(@PathVariable Long restaurantId) {
        platService.duplicateYesterdayPlats(restaurantId);
    }
}

