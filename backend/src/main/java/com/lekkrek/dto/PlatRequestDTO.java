package com.lekkrek.dto;

public record PlatRequestDTO(
        String name,
        String description,
        Double price,
        String image,
        String moment,
        String status,
        Long restaurantId
) {}
