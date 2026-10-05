package com.lekkrek.controller;

/**
 * ============================================================================
 * 📁 Fichier : OrderController.java
 * 📝 Description : Classe métier pour la gestion de OrderController dans LekkRek.
 * 🔒 Rôle : Fait partie de l'architecture Backend Spring Boot.
 * 💡 Auteur : Documenté automatiquement (Standard Enterprise)
 * ============================================================================
 */


import com.lekkrek.entity.Commande;
import com.lekkrek.dto.OrderRequestDTO;
import com.lekkrek.dto.OrderResponseDTO;
import com.lekkrek.dto.OrderTrackingDTO;
import com.lekkrek.service.OrderService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("${api.prefix.public}/orders")
@CrossOrigin(origins = "*")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public OrderResponseDTO createOrder(@RequestBody OrderRequestDTO request) {
        return orderService.createOrder(request);
    }

    @GetMapping("/track/{orderNumber}")
    public OrderTrackingDTO trackOrder(@PathVariable String orderNumber) {
        return orderService.getOrderTrackingByNumber(orderNumber);
    }
}
