package com.lekkrek.dto.kpi;

/**
 * ============================================================================
 * 📁 Fichier : KpiSummaryDTO.java
 * 📝 Description : DTO de résumé global des KPI business LekkRek.
 * ============================================================================
 */

import java.math.BigDecimal;

/**
 * Agrègue les principaux indicateurs clés de performance (KPI) de la plateforme.
 *
 * @param totalRevenue              Chiffre d'affaires total (paiements COMPLETED)
 * @param totalOrders               Nombre total de commandes (hors ANNULEE)
 * @param totalTransactions         Nombre total de transactions de paiement
 * @param completedTransactions     Transactions réussies
 * @param pendingTransactions       Transactions en attente
 * @param cancelledTransactions     Transactions annulées
 * @param failedTransactions        Transactions échouées
 * @param successRate               Taux de réussite (%)
 * @param averageOrderAmount        Montant moyen par commande
 * @param revenueStats              Détail chiffre d'affaires par période
 * @param orderStats                Statistiques commandes
 * @param transactionVolume         Volume de transactions
 */
public record KpiSummaryDTO(
        BigDecimal totalRevenue,
        long totalOrders,
        long totalTransactions,
        long completedTransactions,
        long pendingTransactions,
        long cancelledTransactions,
        long failedTransactions,
        double successRate,
        BigDecimal averageOrderAmount,
        KpiRevenueDTO revenueStats,
        KpiOrderStatsDTO orderStats,
        KpiTransactionVolumeDTO transactionVolume
) {}
