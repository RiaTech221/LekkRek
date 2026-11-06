package com.lekkrek.dto.accounting;

import java.math.BigDecimal;
import java.util.List;

public record AccountingSummaryDTO(
    BigDecimal globalCa,
    BigDecimal globalBenefice,
    BigDecimal globalAReverser,
    long totalCommandes,
    List<RestaurantAccountingDTO> restaurants
) {}
