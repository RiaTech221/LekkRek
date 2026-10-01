package com.lekkrek.controller;

import com.lekkrek.entity.Commande;
import com.lekkrek.entity.Plat;
import com.lekkrek.dto.PlatRequestDTO;
import com.lekkrek.service.OrderService;
import com.lekkrek.service.PlatService;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("${api.prefix.operator:/api/v1/operator}")
@CrossOrigin(origins = "*")
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

    // --- PLATS ---
    @GetMapping("/plats")
    public List<Plat> getAllPlats() {
        return platService.getAllPlats();
    }

    @PostMapping("/plats")
    public Plat createPlat(@RequestBody PlatRequestDTO request) {
        return platService.createPlat(request);
    }

    @PutMapping("/plats/{id}")
    public Plat updatePlat(@PathVariable Long id, @RequestBody PlatRequestDTO request) {
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
}
