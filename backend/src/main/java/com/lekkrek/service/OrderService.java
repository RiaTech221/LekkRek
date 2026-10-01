package com.lekkrek.service;

import com.lekkrek.entity.Commande;
import com.lekkrek.dto.OrderRequestDTO;

import java.util.List;

public interface OrderService {
    Commande createOrder(OrderRequestDTO request);
    List<Commande> getAllOrders();
    Commande updateOrderStatus(Long id, String status);
    Commande getOrderByNumber(String orderNumber);
}
