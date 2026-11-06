package com.lekkrek.controller;

/**
 * ============================================================================
 * 📁 Fichier : KpiController.java
 * 📝 Description : Controller REST pour les KPIs business LekkRek.
 * 🔒 Rôle : Endpoints admin pour consulter les indicateurs clés.
 * ============================================================================
 */

import com.lekkrek.dto.kpi.KpiSummaryDTO;
import com.lekkrek.dto.kpi.KpiRevenueDTO;
import com.lekkrek.dto.kpi.KpiTransactionVolumeDTO;
import com.lekkrek.dto.kpi.KpiOrderStatsDTO;
import com.lekkrek.service.KpiService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("${api.prefix.admin:/api/v1/admin}/kpi")
@PreAuthorize("hasRole('ADMIN')")
public class KpiController {

    private final KpiService kpiService;

    public KpiController(KpiService kpiService) {
        this.kpiService = kpiService;
    }

    /**
     * GET /api/v1/admin/kpi/summary
     * Résumé global de tous les KPIs métier.
     */
    @GetMapping("/summary")
    public KpiSummaryDTO getKpiSummary() {
        return kpiService.getKpiSummary();
    }

    /**
     * GET /api/v1/admin/kpi/revenue?from=2026-01-01&to=2026-12-31
     * KPI chiffre d'affaires, avec filtre de date optionnel.
     */
    @GetMapping("/revenue")
    public KpiRevenueDTO getRevenue(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return kpiService.getRevenue(from, to);
    }

    /**
     * GET /api/v1/admin/kpi/transactions?from=2026-01-01&to=2026-12-31
     * KPI volume de transactions PayTech.
     */
    @GetMapping("/transactions")
    public KpiTransactionVolumeDTO getTransactionVolume(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return kpiService.getTransactionVolume(from, to);
    }

    /**
     * GET /api/v1/admin/kpi/orders?from=2026-01-01&to=2026-12-31
     * KPI statistiques des commandes.
     */
    @GetMapping("/orders")
    public KpiOrderStatsDTO getOrderStats(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
        return kpiService.getOrderStats(from, to);
    }
}
