package com.lekkrek.service.impl;

import com.lekkrek.entity.Commande;
import com.lekkrek.entity.CommandeItem;
import com.lekkrek.entity.Plat;
import com.lekkrek.entity.Restaurant;
import com.lekkrek.dto.OrderRequestDTO;
import com.lekkrek.repository.CommandeRepository;
import com.lekkrek.repository.PlatRepository;
import com.lekkrek.service.OrderService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@Transactional
public class OrderServiceImpl implements OrderService {

    private final CommandeRepository commandeRepository;
    private final PlatRepository platRepository;

    public OrderServiceImpl(CommandeRepository commandeRepository, PlatRepository platRepository) {
        this.commandeRepository = commandeRepository;
        this.platRepository = platRepository;
    }

    @Override
    public Commande createOrder(OrderRequestDTO request) {
        Commande commande = new Commande();
        commande.setOrderNumber("CMD-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        commande.setClientName(request.clientName());
        commande.setClientPhone(request.clientPhone());
        commande.setClientAddress(request.clientAddress());
        commande.setType(Commande.OrderType.valueOf(request.type()));
        commande.setPaymentMethod(Commande.PaymentMethod.valueOf(request.paymentMethod()));
        
        double total = 0;
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
            total += plat.getPrice();
        }

        commande.setRestaurant(resto);
        commande.setTotalAmount(total);
        commande.setStatus(Commande.OrderStatus.NOUVELLE);
        
        if (commande.getPaymentMethod() == Commande.PaymentMethod.SUR_PLACE) {
            commande.setPaymentStatus(Commande.PaymentStatus.ATTENTE);
        } else {
            commande.setPaymentStatus(Commande.PaymentStatus.PAYE);
        }

        return commandeRepository.save(commande);
    }

    @Override
    public List<Commande> getAllOrders() {
        return commandeRepository.findAll();
    }

    @Override
    public Commande updateOrderStatus(Long id, String status) {
        Commande commande = commandeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Commande non trouvee"));
        commande.setStatus(Commande.OrderStatus.valueOf(status));
        return commandeRepository.save(commande);
    }

    @Override
    public Commande getOrderByNumber(String orderNumber) {
        return commandeRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new RuntimeException("Commande introuvable"));
    }
}
