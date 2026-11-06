package com.lekkrek.dto.kpi;

/**
 * ============================================================================
 * 📁 Fichier : KpiOrderStatsDTO.java
 * 📝 Description : DTO KPI — Statistiques sur les commandes LekkRek.
 * ============================================================================
 */

import java.math.BigDecimal;
import java.util.Map;

/**
 * Statistiques détaillées sur les commandes.
 *
 * @param totalOrders         Nombre total de commandes
 * @param activeOrders        Commandes non annulées
 * @param cancelledOrders     Commandes annulées
 * @param countByStatus       Répartition par statut (NOUVELLE, EN_PREPARATION, PRETE, LIVREE, ANNULEE)
 * @param countByType         Répartition par type (LIVRAISON, EMPORTER, SUR_PLACE)
 * @param countByPaymentMethod Répartition par mode de paiement (WAVE, ORANGE_MONEY, ESPECES, SAMIR_PAY)
 * @param totalAmountOrders   Montant total des commandes actives
 * @param averageAmount       Montant moyen par commande active
 */
public record KpiOrderStatsDTO(
        long totalOrders,
        long activeOrders,
        long cancelledOrders,
        Map<String, Long> countByStatus,
        Map<String, Long> countByType,
        Map<String, Long> countByPaymentMethod,
        BigDecimal totalAmountOrders,
        BigDecimal averageAmount
) {}
