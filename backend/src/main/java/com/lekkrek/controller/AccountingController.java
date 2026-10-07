package com.lekkrek.controller;

import com.lekkrek.dto.accounting.AccountingSummaryDTO;
import com.lekkrek.dto.accounting.RestaurantReportDTO;
import com.lekkrek.service.AccountingService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("${api.prefix.admin:/api/v1/admin}/accounting")
@PreAuthorize("hasRole('ADMIN')")
public class AccountingController {

    private final AccountingService accountingService;

    public AccountingController(AccountingService accountingService) {
        this.accountingService = accountingService;
    }

    @GetMapping("/summary")
    public AccountingSummaryDTO getAccountingSummary() {
        return accountingService.getAccountingSummary();
    }

    @GetMapping("/restaurants/{id}")
    public RestaurantReportDTO getRestaurantReport(
            @PathVariable Long id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate) {
        return accountingService.getRestaurantReport(id, startDate, endDate);
    }
}
