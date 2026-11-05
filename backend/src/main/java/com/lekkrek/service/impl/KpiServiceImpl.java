package com.lekkrek.service.impl;

/**
 * ============================================================================
 * 📁 Fichier : KpiServiceImpl.java
 * 📝 Description : Implémentation des KPIs business LekkRek.
 *                 Calcule les indicateurs à partir de Commande et PaymentTransaction.
 * 🔒 Rôle : Service interne (ADMIN uniquement via le controller).
 * ============================================================================
 */

import com.lekkrek.dto.kpi.*;
import com.lekkrek.entity.Commande;
import com.lekkrek.entity.PaymentTransaction;
import com.lekkrek.repository.CommandeRepository;
import com.lekkrek.repository.PaymentTransactionRepository;
import com.lekkrek.service.KpiService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.*;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class KpiServiceImpl implements KpiService {

    private final CommandeRepository commandeRepository;
    private final PaymentTransactionRepository paymentTransactionRepository;

    public KpiServiceImpl(CommandeRepository commandeRepository,
                          PaymentTransactionRepository paymentTransactionRepository) {
        this.commandeRepository = commandeRepository;
        this.paymentTransactionRepository = paymentTransactionRepository;
    }

    // ─── RÉSUMÉ GLOBAL ──────────────────────────────────────────────────────

    @Override
    public KpiSummaryDTO getKpiSummary() {
        KpiRevenueDTO revenueStats = getRevenue(null, null);
        KpiOrderStatsDTO orderStats = getOrderStats(null, null);
        KpiTransactionVolumeDTO txVolume = getTransactionVolume(null, null);

        BigDecimal averageOrderAmount = orderStats.activeOrders() > 0
                ? orderStats.totalAmountOrders().divide(BigDecimal.valueOf(orderStats.activeOrders()), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        return new KpiSummaryDTO(
                revenueStats.totalRevenue(),
                orderStats.totalOrders(),
                txVolume.total(),
                txVolume.completed(),
                txVolume.pending(),
                txVolume.cancelled(),
                txVolume.failed(),
                txVolume.successRate(),
                averageOrderAmount,
                revenueStats,
                orderStats,
                txVolume
        );
    }

    // ─── KPI CHIFFRE D'AFFAIRES ─────────────────────────────────────────────

    @Override
    public KpiRevenueDTO getRevenue(LocalDate from, LocalDate to) {
        List<Commande> allCommandes = commandeRepository.findAll();

        // Filtrer les commandes non annulées
        List<Commande> activeCommandes = allCommandes.stream()
                .filter(c -> c.getStatus() != Commande.OrderStatus.ANNULEE)
                .collect(Collectors.toList());

        // CA total issu des commandes
        BigDecimal revenueFromOrders = sumCommandeAmounts(activeCommandes);

        // CA des transactions PayTech COMPLETED
        List<PaymentTransaction> completedTx = paymentTransactionRepository.findAll().stream()
                .filter(tx -> tx.getStatus() == PaymentTransaction.TransactionStatus.COMPLETED)
                .collect(Collectors.toList());

        BigDecimal totalRevenue = completedTx.stream()
                .map(PaymentTransaction::getAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        // Utiliser le max entre CA commandes et CA paiements confirmés
        if (totalRevenue.compareTo(BigDecimal.ZERO) == 0) {
            totalRevenue = revenueFromOrders;
        }

        // CA par période
        LocalDate today = LocalDate.now();
        LocalDate startOfWeek = today.with(DayOfWeek.MONDAY);
        LocalDate startOfMonth = today.withDayOfMonth(1);

        BigDecimal todayRevenue = sumCommandeAmountsByDate(activeCommandes, today, today);
        BigDecimal thisWeekRevenue = sumCommandeAmountsByDate(activeCommandes, startOfWeek, today);
        BigDecimal thisMonthRevenue = sumCommandeAmountsByDate(activeCommandes, startOfMonth, today);

        return new KpiRevenueDTO(
                totalRevenue,
                revenueFromOrders,
                todayRevenue,
                thisWeekRevenue,
                thisMonthRevenue,
                from != null ? from.toString() : null,
                to != null ? to.toString() : null
        );
    }

    // ─── KPI VOLUME DE TRANSACTIONS ─────────────────────────────────────────

    @Override
    public KpiTransactionVolumeDTO getTransactionVolume(LocalDate from, LocalDate to) {
        List<PaymentTransaction> allTx = paymentTransactionRepository.findAll();

        // Filtrer par date si spécifié
        if (from != null || to != null) {
            allTx = allTx.stream()
                    .filter(tx -> {
                        LocalDate txDate = tx.getCreatedAt() != null ? tx.getCreatedAt().toLocalDate() : null;
                        if (txDate == null) return false;
                        if (from != null && txDate.isBefore(from)) return false;
                        if (to != null && txDate.isAfter(to)) return false;
                        return true;
                    })
                    .collect(Collectors.toList());
        }

        long total = allTx.size();
        long completed = allTx.stream().filter(tx -> tx.getStatus() == PaymentTransaction.TransactionStatus.COMPLETED).count();
        long pending = allTx.stream().filter(tx -> tx.getStatus() == PaymentTransaction.TransactionStatus.PENDING).count();
        long cancelled = allTx.stream().filter(tx -> tx.getStatus() == PaymentTransaction.TransactionStatus.CANCELLED).count();
        long failed = allTx.stream().filter(tx -> tx.getStatus() == PaymentTransaction.TransactionStatus.FAILED).count();

        double successRate = total > 0 ? Math.round((double) completed / total * 10000.0) / 100.0 : 0.0;

        BigDecimal totalConfirmed = allTx.stream()
                .filter(tx -> tx.getStatus() == PaymentTransaction.TransactionStatus.COMPLETED)
                .map(PaymentTransaction::getAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Long> countByStatus = new LinkedHashMap<>();
        countByStatus.put("PENDING", pending);
        countByStatus.put("COMPLETED", completed);
        countByStatus.put("CANCELLED", cancelled);
        countByStatus.put("FAILED", failed);

        return new KpiTransactionVolumeDTO(total, completed, pending, cancelled, failed, successRate, totalConfirmed, countByStatus);
    }

    // ─── KPI STATISTIQUES COMMANDES ─────────────────────────────────────────

    @Override
    public KpiOrderStatsDTO getOrderStats(LocalDate from, LocalDate to) {
        List<Commande> allCommandes = commandeRepository.findAll();

        // Filtrer par date si spécifié
        if (from != null || to != null) {
            allCommandes = allCommandes.stream()
                    .filter(c -> {
                        LocalDate cDate = c.getCreatedAt() != null ? c.getCreatedAt().toLocalDate() : null;
                        if (cDate == null) return false;
                        if (from != null && cDate.isBefore(from)) return false;
                        if (to != null && cDate.isAfter(to)) return false;
                        return true;
                    })
                    .collect(Collectors.toList());
        }

        long totalOrders = allCommandes.size();
        long cancelledOrders = allCommandes.stream()
                .filter(c -> c.getStatus() == Commande.OrderStatus.ANNULEE)
                .count();
        long activeOrders = totalOrders - cancelledOrders;

        // Par statut
        Map<String, Long> countByStatus = allCommandes.stream()
                .collect(Collectors.groupingBy(c -> c.getStatus().name(), Collectors.counting()));

        // Par type (LIVRAISON, EMPORTER, SUR_PLACE)
        Map<String, Long> countByType = allCommandes.stream()
                .collect(Collectors.groupingBy(c -> c.getType().name(), Collectors.counting()));

        // Par mode de paiement
        Map<String, Long> countByPaymentMethod = allCommandes.stream()
                .filter(c -> c.getPaymentMethod() != null)
                .collect(Collectors.groupingBy(c -> c.getPaymentMethod().name(), Collectors.counting()));

        BigDecimal totalAmountOrders = allCommandes.stream()
                .filter(c -> c.getStatus() != Commande.OrderStatus.ANNULEE)
                .map(Commande::getTotalAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal averageAmount = activeOrders > 0
                ? totalAmountOrders.divide(BigDecimal.valueOf(activeOrders), 2, RoundingMode.HALF_UP)
                : BigDecimal.ZERO;

        return new KpiOrderStatsDTO(
                totalOrders, activeOrders, cancelledOrders,
                countByStatus, countByType, countByPaymentMethod,
                totalAmountOrders, averageAmount
        );
    }

    // ─── MÉTHODES UTILITAIRES ───────────────────────────────────────────────

    private BigDecimal sumCommandeAmounts(List<Commande> commandes) {
        return commandes.stream()
                .map(Commande::getTotalAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private BigDecimal sumCommandeAmountsByDate(List<Commande> commandes, LocalDate from, LocalDate to) {
        return commandes.stream()
                .filter(c -> {
                    LocalDate cDate = c.getCreatedAt() != null ? c.getCreatedAt().toLocalDate() : null;
                    if (cDate == null) return false;
                    return !cDate.isBefore(from) && !cDate.isAfter(to);
                })
                .map(Commande::getTotalAmount)
                .filter(Objects::nonNull)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }
}
