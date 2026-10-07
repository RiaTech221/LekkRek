package com.lekkrek.dto.accounting;

import java.math.BigDecimal;
import java.util.List;

public record RestaurantReportDTO(
    Long restaurantId,
    String restaurantName,
    BigDecimal commissionRate,
    BigDecimal caTotal,
    BigDecimal beneficeLekkRek,
    BigDecimal aReverser,
    long nbCommandes,
    List<TransactionAccountingDTO> transactions
) {}
