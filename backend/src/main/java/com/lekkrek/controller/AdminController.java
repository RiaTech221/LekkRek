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
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("${api.prefix.admin:/api/v1/admin}")
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = "*")
public class AdminController {

    private final UtilisateurRepository utilisateurRepository;
    private final RestaurantRepository restaurantRepository;
    private final PasswordEncoder passwordEncoder;

    public AdminController(UtilisateurRepository utilisateurRepository, RestaurantRepository restaurantRepository, PasswordEncoder passwordEncoder) {
        this.utilisateurRepository = utilisateurRepository;
        this.restaurantRepository = restaurantRepository;
        this.passwordEncoder = passwordEncoder;
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
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/operators/{id}")
    
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
            return ResponseEntity.ok(utilisateurRepository.save(op));
        }).orElse(ResponseEntity.notFound().build());
    }

public ResponseEntity<?> deleteOperator(@PathVariable Long id) {
        return utilisateurRepository.findById(id).map(op -> {
            utilisateurRepository.delete(op);
            return ResponseEntity.ok().build();
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
        return ResponseEntity.ok(restaurantRepository.save(restaurant));
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
            return ResponseEntity.ok(restaurantRepository.save(resto));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/restaurants/{id}")
    public ResponseEntity<?> deleteRestaurant(@PathVariable Long id) {
        return restaurantRepository.findById(id).map(resto -> {
            restaurantRepository.delete(resto);
            return ResponseEntity.ok().build();
        }).orElse(ResponseEntity.notFound().build());
    }
}
