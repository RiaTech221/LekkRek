package com.lekkrek.controller;

/**
 * ============================================================================
 * 📁 Fichier : AdminController.java
 * 📝 Description : Classe métier pour la gestion de AdminController dans LekkRek.
 * 🔒 Rôle : Fait partie de l'architecture Backend Spring Boot.
 * 💡 Auteur : Documenté automatiquement (Standard Enterprise)
 * ============================================================================
 */


import com.lekkrek.entity.Utilisateur;
import com.lekkrek.entity.Restaurant;
import com.lekkrek.repository.UtilisateurRepository;
import com.lekkrek.repository.RestaurantRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

import com.lekkrek.service.AuditService;

@RestController
@RequestMapping("${api.prefix.admin:/api/v1/admin}")
@PreAuthorize("hasRole('ADMIN')")
public class AdminController {

    private final UtilisateurRepository utilisateurRepository;
    private final RestaurantRepository restaurantRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    public AdminController(UtilisateurRepository utilisateurRepository, RestaurantRepository restaurantRepository, PasswordEncoder passwordEncoder, AuditService auditService) {
        this.utilisateurRepository = utilisateurRepository;
        this.restaurantRepository = restaurantRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditService = auditService;
    }

    // ==========================================
    // GESTION DES OPERATEURS
    // ==========================================

    @GetMapping("/operators")
    public ResponseEntity<List<Utilisateur>> getOperators() {
        return ResponseEntity.ok(utilisateurRepository.findByRole(Utilisateur.Role.OPERATEUR));
    }

    @PostMapping("/operators")
    public ResponseEntity<?> createOperator(@RequestBody Utilisateur operator) {
        if (utilisateurRepository.findByEmail(operator.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body("Cet email est déjà utilisé.");
        }
        
        operator.setRole(Utilisateur.Role.OPERATEUR);
        operator.setMotDePasse(passwordEncoder.encode(operator.getMotDePasse()));
        operator.setActif(true);
        
        Utilisateur saved = utilisateurRepository.save(operator);
        auditService.logCurrentAction("CREATE_OPERATOR", "Utilisateur", saved.getId().toString(), null, "Création opérateur: " + saved.getEmail() + " (" + saved.getNomComplet() + ")");
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/operators/{id}")
    public ResponseEntity<Utilisateur> updateOperator(@PathVariable Long id, @RequestBody Utilisateur operatorDetails) {
        return utilisateurRepository.findById(id).map(op -> {
            op.setNomComplet(operatorDetails.getNomComplet());
            op.setEmail(operatorDetails.getEmail());
            if (operatorDetails.getMotDePasse() != null && !operatorDetails.getMotDePasse().isEmpty()) {
                op.setMotDePasse(passwordEncoder.encode(operatorDetails.getMotDePasse()));
            }
            op.setActif(operatorDetails.getActif());
            if (operatorDetails.getPhotoUrl() != null) {
                op.setPhotoUrl(operatorDetails.getPhotoUrl());
            }
            if (operatorDetails.getRestaurantAssigne() != null) {
                op.setRestaurantAssigne(operatorDetails.getRestaurantAssigne());
            }
            Utilisateur updated = utilisateurRepository.save(op);
            auditService.logCurrentAction("UPDATE_OPERATOR", "Utilisateur", id.toString(), null, "Modification opérateur: " + op.getEmail());
            return ResponseEntity.ok(updated);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/operators/{id}")
    public ResponseEntity<?> deleteOperator(@PathVariable Long id) {
        return utilisateurRepository.findById(id).map(op -> {
            utilisateurRepository.delete(op);
            auditService.logCurrentAction("DELETE_OPERATOR", "Utilisateur", id.toString(), op.getEmail(), "Suppression opérateur: " + op.getEmail());
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }

    // SOL-195 : Réinitialiser l'accès d'un utilisateur interne
    @PatchMapping("/users/{id}/reset-password")
    public ResponseEntity<?> resetUserPassword(@PathVariable Long id, @RequestBody Map<String, String> body) {
        String newPassword = body.get("newPassword");
        if (newPassword == null || newPassword.length() < 6) {
            return ResponseEntity.badRequest().body("Le mot de passe doit contenir au moins 6 caractères.");
        }
        return utilisateurRepository.findById(id).map(user -> {
            user.setMotDePasse(passwordEncoder.encode(newPassword));
            utilisateurRepository.save(user);
            auditService.logCurrentAction("RESET_PASSWORD", "Utilisateur", id.toString(), null, "Réinitialisation mot de passe: " + user.getEmail());
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }

    // SOL-196 : Toggle actif/inactif d'un utilisateur
    @PatchMapping("/users/{id}/toggle-active")
    public ResponseEntity<Utilisateur> toggleUserActive(@PathVariable Long id) {
        return utilisateurRepository.findById(id).map(user -> {
            boolean newState = !Boolean.TRUE.equals(user.getActif());
            user.setActif(newState);
            utilisateurRepository.save(user);
            auditService.logCurrentAction(
                newState ? "ACTIVATE_USER" : "DEACTIVATE_USER",
                "Utilisateur", id.toString(), null,
                (newState ? "Activation" : "Désactivation") + " utilisateur: " + user.getEmail()
            );
            return ResponseEntity.ok(user);
        }).orElse(ResponseEntity.notFound().build());
    }

    // ==========================================
    // GESTION DES RESTAURANTS
    // ==========================================

    @GetMapping("/restaurants")
    public ResponseEntity<List<Restaurant>> getAllRestaurants() {
        return ResponseEntity.ok(restaurantRepository.findAll());
    }

    @PostMapping("/restaurants")
    public ResponseEntity<Restaurant> createRestaurant(@RequestBody Restaurant restaurant) {
        restaurant.setActive(true);
        Restaurant saved = restaurantRepository.save(restaurant);
        auditService.logCurrentAction("CREATE_RESTAURANT", "Restaurant", saved.getId().toString(), null, "Création restaurant: " + saved.getName());
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/restaurants/{id}")
    public ResponseEntity<Restaurant> updateRestaurant(@PathVariable Long id, @RequestBody Restaurant restaurantDetails) {
        return restaurantRepository.findById(id).map(resto -> {
            resto.setName(restaurantDetails.getName());
            resto.setLocation(restaurantDetails.getLocation());
            resto.setOperatorName(restaurantDetails.getOperatorName());
            resto.setImage(restaurantDetails.getImage());
            if (restaurantDetails.getCommissionRate() != null) {
                resto.setCommissionRate(restaurantDetails.getCommissionRate());
            }
            resto.setActive(restaurantDetails.isActive());
            Restaurant updated = restaurantRepository.save(resto);
            auditService.logCurrentAction("UPDATE_RESTAURANT", "Restaurant", id.toString(), null, "Modification restaurant: " + resto.getName() + " (Commission: " + resto.getCommissionRate() + "%)");
            return ResponseEntity.ok(updated);
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/restaurants/{id}")
    public ResponseEntity<?> deleteRestaurant(@PathVariable Long id) {
        return restaurantRepository.findById(id).map(resto -> {
            restaurantRepository.delete(resto);
            auditService.logCurrentAction("DELETE_RESTAURANT", "Restaurant", id.toString(), resto.getName(), "Suppression restaurant: " + resto.getName());
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
