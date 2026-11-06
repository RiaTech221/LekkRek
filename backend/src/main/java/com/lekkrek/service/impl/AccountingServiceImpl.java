package com.lekkrek.service.impl;

import com.lekkrek.dto.accounting.*;
import com.lekkrek.entity.Commande;
import com.lekkrek.entity.Restaurant;
import com.lekkrek.repository.CommandeRepository;
import com.lekkrek.repository.RestaurantRepository;
import com.lekkrek.service.AccountingService;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class AccountingServiceImpl implements AccountingService {

    private static final BigDecimal HUNDRED = new BigDecimal("100");
    private static final BigDecimal DEFAULT_COMMISSION = new BigDecimal("10.0");

    private final CommandeRepository commandeRepository;
    private final RestaurantRepository restaurantRepository;

    public AccountingServiceImpl(CommandeRepository commandeRepository, RestaurantRepository restaurantRepository) {
        this.commandeRepository = commandeRepository;
        this.restaurantRepository = restaurantRepository;
    }

    @Override
    public AccountingSummaryDTO getAccountingSummary() {
        List<Restaurant> restaurants = restaurantRepository.findAll();
        List<Commande> allCommandes = commandeRepository.findAll();

        List<RestaurantAccountingDTO> restaurantDTOs = new ArrayList<>();
        BigDecimal globalCa = BigDecimal.ZERO;
        BigDecimal globalBenefice = BigDecimal.ZERO;
        BigDecimal globalAReverser = BigDecimal.ZERO;
        long totalCommandes = 0;

        for (Restaurant resto : restaurants) {
            BigDecimal rate = resto.getCommissionRate() != null ? resto.getCommissionRate() : DEFAULT_COMMISSION;

            BigDecimal caResto = BigDecimal.ZERO;
            long nbCommandesResto = 0;

            for (Commande cmd : allCommandes) {
                if (cmd.getRestaurant() != null && cmd.getRestaurant().getId().equals(resto.getId())
                        && cmd.getStatus() != Commande.OrderStatus.ANNULEE) {
                    BigDecimal montant = cmd.getTotalAmount() != null ? cmd.getTotalAmount() : BigDecimal.ZERO;
                    caResto = caResto.add(montant);
                    nbCommandesResto++;
                }
            }

            BigDecimal beneficeResto = caResto.multiply(rate).divide(HUNDRED, 2, RoundingMode.HALF_UP);
            BigDecimal aReverserResto = caResto.subtract(beneficeResto);

            restaurantDTOs.add(new RestaurantAccountingDTO(
                    resto.getId(),
                    resto.getName(),
                    resto.getLocation(),
                    resto.getImage(),
                    resto.getOperatorName(),
                    resto.isActive(),
                    rate,
                    caResto,
                    nbCommandesResto,
                    beneficeResto,
                    aReverserResto
            ));

            globalCa = globalCa.add(caResto);
            globalBenefice = globalBenefice.add(beneficeResto);
            globalAReverser = globalAReverser.add(aReverserResto);
            totalCommandes += nbCommandesResto;
        }

        return new AccountingSummaryDTO(globalCa, globalBenefice, globalAReverser, totalCommandes, restaurantDTOs);
    }

    @Override
    public RestaurantReportDTO getRestaurantReport(Long restaurantId, LocalDate startDate, LocalDate endDate) {
        Restaurant resto = restaurantRepository.findById(restaurantId)
                .orElseThrow(() -> new RuntimeException("Restaurant non trouvé : " + restaurantId));

        BigDecimal rate = resto.getCommissionRate() != null ? resto.getCommissionRate() : DEFAULT_COMMISSION;

        List<Commande> commandes = commandeRepository.findByRestaurantIdOrderByCreatedAtDesc(restaurantId);

        LocalDateTime startDateTime = startDate != null ? startDate.atStartOfDay() : null;
        LocalDateTime endDateTime = endDate != null ? endDate.atTime(LocalTime.MAX) : null;

        List<TransactionAccountingDTO> transactions = new ArrayList<>();
        BigDecimal caTotal = BigDecimal.ZERO;
        BigDecimal beneficeTotal = BigDecimal.ZERO;
        BigDecimal aReverserTotal = BigDecimal.ZERO;
        long nbCommandes = 0;

        for (Commande cmd : commandes) {
            LocalDateTime createdAt = cmd.getCreatedAt();
            if (startDateTime != null && createdAt.isBefore(startDateTime)) {
                continue;
            }
            if (endDateTime != null && createdAt.isAfter(endDateTime)) {
                continue;
            }

            boolean isAnnulee = cmd.getStatus() == Commande.OrderStatus.ANNULEE;
            BigDecimal montant = (cmd.getTotalAmount() != null && !isAnnulee) ? cmd.getTotalAmount() : BigDecimal.ZERO;

            BigDecimal benefice = isAnnulee ? BigDecimal.ZERO
                    : montant.multiply(rate).divide(HUNDRED, 2, RoundingMode.HALF_UP);
            BigDecimal aReverser = isAnnulee ? BigDecimal.ZERO : montant.subtract(benefice);

            if (!isAnnulee) {
                caTotal = caTotal.add(montant);
                beneficeTotal = beneficeTotal.add(benefice);
                aReverserTotal = aReverserTotal.add(aReverser);
                nbCommandes++;
            }

            transactions.add(new TransactionAccountingDTO(
                    cmd.getId(),
                    cmd.getOrderNumber(),
                    cmd.getCreatedAt(),
                    cmd.getClientName(),
                    cmd.getStatus().name(),
                    cmd.getPaymentMethod() != null ? cmd.getPaymentMethod().name() : "N/A",
                    cmd.getPaymentStatus() != null ? cmd.getPaymentStatus().name() : "N/A",
                    cmd.getTotalAmount() != null ? cmd.getTotalAmount() : BigDecimal.ZERO,
                    benefice,
                    aReverser
            ));
        }

        return new RestaurantReportDTO(
                resto.getId(),
                resto.getName(),
                rate,
                caTotal,
                beneficeTotal,
                aReverserTotal,
                nbCommandes,
                transactions
        );
    }
}
