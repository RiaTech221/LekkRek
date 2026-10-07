package com.lekkrek.dto.accounting;

import java.math.BigDecimal;

public record RestaurantAccountingDTO(
    Long id,
    String name,
    String location,
    String image,
    String operatorName,
    boolean active,
    BigDecimal commissionRate,
    BigDecimal caTotal,
    long nbCommandes,
    BigDecimal beneficeLekkRek,
    BigDecimal aReverser
) {}
