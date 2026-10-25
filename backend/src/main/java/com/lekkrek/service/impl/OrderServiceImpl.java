package com.lekkrek.service.impl;

/**
 * ============================================================================
 * 📁 Fichier : OrderServiceImpl.java
 * 📝 Description : Classe métier pour la gestion de OrderServiceImpl dans LekkRek.
 * 🔒 Rôle : Fait partie de l'architecture Backend Spring Boot.
 * 💡 Auteur : Documenté automatiquement (Standard Enterprise)
 * ============================================================================
 */


import com.lekkrek.entity.Commande;
import com.lekkrek.entity.CommandeItem;
import com.lekkrek.entity.Plat;
import com.lekkrek.entity.Restaurant;
import com.lekkrek.dto.OrderRequestDTO;
import com.lekkrek.dto.OrderResponseDTO;
import com.lekkrek.dto.OrderTrackingDTO;
import com.lekkrek.repository.CommandeRepository;
import com.lekkrek.repository.PlatRepository;
import com.lekkrek.service.OrderService;
import com.lekkrek.service.AuditService;
import org.springframework.stereotype.Service;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

import com.lekkrek.entity.Utilisateur;
import com.lekkrek.service.OperatorAccessService;
import java.util.Collections;
import java.util.Optional;

@Service
@Transactional
public class OrderServiceImpl implements OrderService {

    private final CommandeRepository commandeRepository;
    private final PlatRepository platRepository;
    private final AuditService auditService;
    private final OperatorAccessService operatorAccessService;

    public OrderServiceImpl(CommandeRepository commandeRepository,
                            PlatRepository platRepository,
                            AuditService auditService,
                            OperatorAccessService operatorAccessService) {
        this.commandeRepository = commandeRepository;
        this.platRepository = platRepository;
        this.auditService = auditService;
        this.operatorAccessService = operatorAccessService;
    }

    @Override
    public OrderResponseDTO createOrder(OrderRequestDTO request) {
        Commande commande = new Commande();
        commande.setOrderNumber("CMD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        commande.setClientName(request.clientName());
        commande.setClientPhone(com.lekkrek.util.PhoneNumberUtil.normalize(request.clientPhone()));
        commande.setClientAddress(request.clientAddress());
        commande.setType(Commande.OrderType.valueOf(request.type()));
        commande.setPaymentMethod(Commande.PaymentMethod.valueOf(request.paymentMethod()));
        
        java.math.BigDecimal total = java.math.BigDecimal.ZERO;
        Restaurant resto = null;

        for (Long platId : request.platIds()) {
            Plat plat = platRepository.findById(platId).orElseThrow(() -> new RuntimeException("Plat non trouve"));
            if (resto == null) resto = plat.getRestaurant();
            
            CommandeItem item = new CommandeItem();
            item.setCommande(commande);
            item.setPlat(plat);
            item.setQuantity(1);
            item.setUnitPrice(plat.getPrice());
            
            commande.getItems().add(item);
            total = total.add(plat.getPrice());
        }

        commande.setRestaurant(resto);

        // Validation des modes de service et supplément de livraison
        if (resto != null) {
            String restoNom = resto.getName() != null ? resto.getName() : "ce restaurant";
            if (commande.getType() == Commande.OrderType.LIVRAISON) {
                if (Boolean.FALSE.equals(resto.getLivraison())) {
                    throw new IllegalArgumentException("Le restaurant '" + restoNom + "' ne propose pas le service de livraison.");
                }
                if (resto.getSupplementLivraison() != null && resto.getSupplementLivraison().compareTo(java.math.BigDecimal.ZERO) > 0) {
                    total = total.add(resto.getSupplementLivraison());
                }
            } else if (commande.getType() == Commande.OrderType.EMPORTER) {
                if (Boolean.FALSE.equals(resto.getAEmporter())) {
                    throw new IllegalArgumentException("Le restaurant '" + restoNom + "' ne propose pas le service à emporter.");
                }
            } else if (commande.getType() == Commande.OrderType.SUR_PLACE) {
                if (Boolean.FALSE.equals(resto.getSurPlace())) {
                    throw new IllegalArgumentException("Le restaurant '" + restoNom + "' ne propose pas le service sur place.");
                }
            }
        }

        commande.setTotalAmount(total);
        commande.setStatus(Commande.OrderStatus.NOUVELLE);
        
        if (commande.getPaymentMethod() == Commande.PaymentMethod.ESPECES) {
            commande.setPaymentStatus(Commande.PaymentStatus.ATTENTE);
        } else {
            commande.setPaymentStatus(Commande.PaymentStatus.PAYE);
        }

        Commande saved = commandeRepository.save(commande);

        return new OrderResponseDTO(
                saved.getOrderNumber(),
                saved.getStatus().name(),
                saved.getType().name(),
                saved.getRestaurant() != null ? saved.getRestaurant().getName() : null,
                saved.getTotalAmount(),
                "Votre commande a été enregistrée avec succès."
        );
    }

    @Override
    public List<Commande> getAllOrders() {
        Utilisateur user = operatorAccessService.getCurrentUser();
        if (user.getRole() == Utilisateur.Role.ADMIN) {
            return commandeRepository.findAll();
        }

        // Rôle OPERATEUR : filtrage strict par ses restaurants assignés (0..n)
        java.util.Set<Long> assignedIds = operatorAccessService.getRestaurantIdsOf(user);
        if (assignedIds.isEmpty()) {
            return Collections.emptyList();
        }

        return commandeRepository.findByRestaurantIdInOrderByCreatedAtDesc(assignedIds);
    }

    @Override
    public Commande updateOrderStatus(Long id, String status) {
        Commande commande = commandeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Commande non trouvee"));

        Utilisateur user = operatorAccessService.getCurrentUser();
        operatorAccessService.assertCanAccessCommande(user, commande, "/api/v1/operator/orders/" + id + "/status", id.toString());

        String oldStatus = commande.getStatus().name();
        commande.setStatus(Commande.OrderStatus.valueOf(status));
        Commande saved = commandeRepository.save(commande);
        
        String currentUser = user.getEmail();
        String currentRole = user.getRole().name();
        
        auditService.logAction(
                currentUser,
                currentRole,
                "UPDATE_STATUS",
                "Commande",
                saved.getOrderNumber(),
                oldStatus,
                status
        );
        
        return saved;
    }

    @Override
    public Commande getOrderByNumber(String orderNumber) {
        return commandeRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new com.lekkrek.exception.ResourceNotFoundException("Commande introuvable avec le numéro : " + orderNumber));
    }

    @Override
    public OrderTrackingDTO getOrderTrackingByNumber(String orderNumber) {
        Commande c = commandeRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new com.lekkrek.exception.ResourceNotFoundException("Commande introuvable avec le numéro : " + orderNumber));
        return new OrderTrackingDTO(
                c.getOrderNumber(),
                c.getStatus().name(),
                c.getType().name(),
                c.getRestaurant() != null ? c.getRestaurant().getName() : null,
                c.getRestaurant() != null ? c.getRestaurant().getLocation() : null,
                c.getTotalAmount(),
                c.getCreatedAt() != null ? c.getCreatedAt().toString() : null
        );
    }

    @Override
    public Commande updatePaymentStatus(Long id, String paymentStatus) {
        Commande commande = commandeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Commande non trouvee"));

        Utilisateur user = operatorAccessService.getCurrentUser();
        operatorAccessService.assertCanAccessCommande(user, commande, "/api/v1/operator/orders/" + id + "/payment-status", id.toString());

        String oldStatus = commande.getPaymentStatus().name();
        commande.setPaymentStatus(Commande.PaymentStatus.valueOf(paymentStatus));
        Commande saved = commandeRepository.save(commande);
        
        String currentUser = user.getEmail();
        String currentRole = user.getRole().name();
        
        auditService.logAction(
                currentUser,
                currentRole,
                "UPDATE_PAYMENT",
                "Commande",
                saved.getOrderNumber(),
                oldStatus,
                paymentStatus
        );
        
        return saved;
    }
}

