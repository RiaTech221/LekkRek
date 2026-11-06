package com.lekkrek.service;

/**
 * ============================================================================
 * 📁 Fichier : KpiService.java
 * 📝 Description : Interface du service KPI business LekkRek.
 * 🔒 Rôle : Fournit les indicateurs clés de performance.
 * ============================================================================
 */

import com.lekkrek.dto.kpi.KpiSummaryDTO;
import com.lekkrek.dto.kpi.KpiRevenueDTO;
import com.lekkrek.dto.kpi.KpiTransactionVolumeDTO;
import com.lekkrek.dto.kpi.KpiOrderStatsDTO;

import java.time.LocalDate;

public interface KpiService {

    /** Résumé global de tous les KPIs. */
    KpiSummaryDTO getKpiSummary();

    /** KPI chiffre d'affaires, avec filtre de date optionnel. */
    KpiRevenueDTO getRevenue(LocalDate from, LocalDate to);

    /** KPI volume de transactions PayTech, avec filtre de date optionnel. */
    KpiTransactionVolumeDTO getTransactionVolume(LocalDate from, LocalDate to);

    /** KPI statistiques commandes, avec filtre de date optionnel. */
    KpiOrderStatsDTO getOrderStats(LocalDate from, LocalDate to);
}
