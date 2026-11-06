package com.lekkrek.dto.kpi;

/**
 * ============================================================================
 * 📁 Fichier : KpiTransactionVolumeDTO.java
 * 📝 Description : DTO KPI — Volume de transactions PayTech.
 * ============================================================================
 */

import java.math.BigDecimal;
import java.util.Map;

/**
 * Statistiques de volume sur les transactions de paiement.
 *
 * @param total               Nombre total de transactions
 * @param completed           Nombre de transactions réussies
 * @param pending             Nombre de transactions en attente
 * @param cancelled           Nombre de transactions annulées
 * @param failed              Nombre de transactions échouées
 * @param successRate         Taux de réussite en pourcentage
 * @param totalAmountConfirmed Montant total des transactions confirmées
 * @param countByStatus       Répartition par statut (map)
 */
public record KpiTransactionVolumeDTO(
        long total,
        long completed,
        long pending,
        long cancelled,
        long failed,
        double successRate,
        BigDecimal totalAmountConfirmed,
        Map<String, Long> countByStatus
) {}
