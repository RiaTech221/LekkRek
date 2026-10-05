package com.lekkrek.dto;

/**
 * DTO public pour le suivi de commande.
 * N'expose que les informations nécessaires au client :
 * numéro, statut, restaurant et heure — sans données personnelles ni internes.
 */
public class OrderTrackingDTO {

    private String orderNumber;
    private String status;
    private String type;
    private String restaurantName;
    private String restaurantLocation;
    private Double totalAmount;
    private String createdAt;

    public OrderTrackingDTO() {}

    public OrderTrackingDTO(String orderNumber, String status, String type,
                             String restaurantName, String restaurantLocation,
                             Double totalAmount, String createdAt) {
        this.orderNumber = orderNumber;
        this.status = status;
        this.type = type;
        this.restaurantName = restaurantName;
        this.restaurantLocation = restaurantLocation;
        this.totalAmount = totalAmount;
        this.createdAt = createdAt;
    }

    public String getOrderNumber() { return orderNumber; }
    public String getStatus() { return status; }
    public String getType() { return type; }
    public String getRestaurantName() { return restaurantName; }
    public String getRestaurantLocation() { return restaurantLocation; }
    public Double getTotalAmount() { return totalAmount; }
    public String getCreatedAt() { return createdAt; }
}
