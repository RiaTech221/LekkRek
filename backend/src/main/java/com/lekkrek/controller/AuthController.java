package com.lekkrek.controller;

/**
 * ============================================================================
 * 📁 Fichier : AuthController.java
 * 📝 Description : Classe métier pour la gestion de AuthController dans LekkRek.
 * 🔒 Rôle : Fait partie de l'architecture Backend Spring Boot.
 * 💡 Auteur : Documenté automatiquement (Standard Enterprise)
 * ============================================================================
 */


import com.lekkrek.dto.JwtResponseDTO;
import com.lekkrek.dto.LoginRequestDTO;
import com.lekkrek.security.JwtUtils;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;
import com.lekkrek.entity.Restaurant;
import com.lekkrek.entity.Utilisateur;
import com.lekkrek.repository.RestaurantRepository;
import com.lekkrek.repository.UtilisateurRepository;
import com.lekkrek.service.OperatorAccessService;

@RestController
@RequestMapping("${api.prefix.public:/api/v1}/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final UtilisateurRepository utilisateurRepository;
    private final RestaurantRepository restaurantRepository;
    private final OperatorAccessService operatorAccessService;

    public AuthController(AuthenticationManager authenticationManager,
                          JwtUtils jwtUtils,
                          UtilisateurRepository utilisateurRepository,
                          RestaurantRepository restaurantRepository,
                          OperatorAccessService operatorAccessService) {
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
        this.utilisateurRepository = utilisateurRepository;
        this.restaurantRepository = restaurantRepository;
        this.operatorAccessService = operatorAccessService;
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequestDTO loginRequest) {

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.email(), loginRequest.password()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetails userDetails = (UserDetails) authentication.getPrincipal();
        List<String> roles = userDetails.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        Utilisateur user = utilisateurRepository.findByEmail(userDetails.getUsername()).orElse(null);
        List<com.lekkrek.dto.RestaurantSummaryDTO> restaurantList = (user != null && user.getRestaurants() != null)
                ? user.getRestaurants().stream()
                        .map(r -> new com.lekkrek.dto.RestaurantSummaryDTO(r.getId(), r.getName()))
                        .sorted(java.util.Comparator.comparing(com.lekkrek.dto.RestaurantSummaryDTO::name, String.CASE_INSENSITIVE_ORDER))
                        .collect(Collectors.toList())
                : List.of();

        return ResponseEntity.ok(new JwtResponseDTO(jwt, "Bearer", userDetails.getUsername(), roles, restaurantList));
    }
}
