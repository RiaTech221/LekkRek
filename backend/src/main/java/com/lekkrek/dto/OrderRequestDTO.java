package com.lekkrek.dto;

import java.util.List;

public record OrderRequestDTO(
    String clientName,
    String clientPhone,
    String clientAddress,
    String type,
    String paymentMethod,
    List<Long> platIds
) {}
