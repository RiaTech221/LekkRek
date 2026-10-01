package com.lekkrek.controller;

import com.lekkrek.entity.Commande;
import com.lekkrek.dto.OrderRequestDTO;
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
    public Commande createOrder(@RequestBody OrderRequestDTO request) {
        return orderService.createOrder(request);
    }

    @GetMapping("/track/{orderNumber}")
    public Commande trackOrder(@PathVariable String orderNumber) {
        return orderService.getOrderByNumber(orderNumber);
    }
}
