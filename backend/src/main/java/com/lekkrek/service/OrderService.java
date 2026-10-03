package com.lekkrek.service;

/**
 * ============================================================================
 * 📁 Fichier : OrderService.java
 * 📝 Description : Classe métier pour la gestion de OrderService dans LekkRek.
 * 🔒 Rôle : Fait partie de l'architecture Backend Spring Boot.
 * 💡 Auteur : Documenté automatiquement (Standard Enterprise)
 * ============================================================================
 */


import com.lekkrek.entity.Commande;
import com.lekkrek.dto.OrderRequestDTO;

import java.util.List;

public interface OrderService {
    Commande createOrder(OrderRequestDTO request);
    List<Commande> getAllOrders();
    Commande updateOrderStatus(Long id, String status);
    Commande getOrderByNumber(String orderNumber);
}
