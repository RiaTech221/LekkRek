package com.lekkrek.dto.accounting;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record TransactionAccountingDTO(
    Long id,
    String orderNumber,
    LocalDateTime createdAt,
    String clientName,
    String status,
    String paymentMethod,
    String paymentStatus,
    BigDecimal totalAmount,
    BigDecimal beneficeLekkRek,
    BigDecimal aReverser
) {}
