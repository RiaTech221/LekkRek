package com.lekkrek.service;

import com.lekkrek.dto.accounting.AccountingSummaryDTO;
import com.lekkrek.dto.accounting.RestaurantReportDTO;

import java.time.LocalDate;

public interface AccountingService {
    AccountingSummaryDTO getAccountingSummary();
    RestaurantReportDTO getRestaurantReport(Long restaurantId, LocalDate startDate, LocalDate endDate);
}
