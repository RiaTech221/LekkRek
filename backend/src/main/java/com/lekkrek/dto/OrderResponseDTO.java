package com.lekkrek.dto;

/**
 * DTO de confirmation de commande retourné au client après un POST /orders.
 * N'expose que les informations nécessaires à la confirmation :
 * numéro de commande, statut initial et montant total.
 * Aucune donnée personnelle ni interne n'est incluse.
 */
public class OrderResponseDTO {

    private String orderNumber;
    private String status;
    private String type;
    private String restaurantName;
    private BigDecimal totalAmount;
    private String message;

    public OrderResponseDTO() {}

    public OrderResponseDTO(String orderNumber, String status, String type,
                             String restaurantName, BigDecimal totalAmount, String message) {
        this.orderNumber = orderNumber;
        this.status = status;
        this.type = type;
        this.restaurantName = restaurantName;
        this.totalAmount = totalAmount;
        this.message = message;
    }

    public String getOrderNumber() { return orderNumber; }
    public String getStatus() { return status; }
    public String getType() { return type; }
    public String getRestaurantName() { return restaurantName; }
    public BigDecimal getTotalAmount() { return totalAmount; }
    public String getMessage() { return message; }
}
