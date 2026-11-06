package com.lekkrek.dto.kpi;

/**
 * ============================================================================
 * 📁 Fichier : KpiRevenueDTO.java
 * 📝 Description : DTO KPI — Chiffre d'affaires par période.
 * ============================================================================
 */

import java.math.BigDecimal;

/**
 * Détail du chiffre d'affaires.
 *
 * @param totalRevenue       CA total confirmé (paiements COMPLETED)
 * @param revenueFromOrders  CA issu des commandes (totalAmount Commandes non annulées)
 * @param todayRevenue       CA du jour
 * @param thisWeekRevenue    CA de la semaine en cours
 * @param thisMonthRevenue   CA du mois en cours
 * @param periodFrom         Date de début du filtre (nullable)
 * @param periodTo           Date de fin du filtre (nullable)
 */
public record KpiRevenueDTO(
        BigDecimal totalRevenue,
        BigDecimal revenueFromOrders,
        BigDecimal todayRevenue,
        BigDecimal thisWeekRevenue,
        BigDecimal thisMonthRevenue,
        String periodFrom,
        String periodTo
) {}
