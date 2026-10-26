package com.lekkrek.controller;

/**
 * ============================================================================
 * 📁 Fichier : AuthController.java
 * 📝 Description : Contrôleur d'authentification pour LekkRek.
 *                 Gère la connexion, la génération de tokens JWT, et le changement
 *                 obligatoire de mot de passe lors de la 1ère connexion d'un opérateur.
 * 🔒 Rôle : Fait partie de l'architecture Backend Spring Boot.
 * 💡 Auteur : Standard Enterprise Security
 * ============================================================================
 */

import com.lekkrek.dto.ChangePasswordRequestDTO;
import com.lekkrek.dto.JwtResponseDTO;
import com.lekkrek.dto.LoginRequestDTO;
import com.lekkrek.dto.RestaurantSummaryDTO;
import com.lekkrek.entity.Utilisateur;
import com.lekkrek.repository.RestaurantRepository;
import com.lekkrek.repository.UtilisateurRepository;
import com.lekkrek.security.JwtUtils;
import com.lekkrek.service.AuditService;
import com.lekkrek.service.OperatorAccessService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("${api.prefix.public:/api/v1}/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtils jwtUtils;
    private final UtilisateurRepository utilisateurRepository;
    private final RestaurantRepository restaurantRepository;
    private final OperatorAccessService operatorAccessService;
    private final PasswordEncoder passwordEncoder;
    private final AuditService auditService;

    public AuthController(AuthenticationManager authenticationManager,
                          JwtUtils jwtUtils,
                          UtilisateurRepository utilisateurRepository,
                          RestaurantRepository restaurantRepository,
                          OperatorAccessService operatorAccessService,
                          PasswordEncoder passwordEncoder,
                          AuditService auditService) {
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
        this.utilisateurRepository = utilisateurRepository;
        this.restaurantRepository = restaurantRepository;
        this.operatorAccessService = operatorAccessService;
        this.passwordEncoder = passwordEncoder;
        this.auditService = auditService;
    }

    /**
     * Authentification utilisateur par email et mot de passe.
     * Renvoie le token JWT, les rôles, les restaurants assignés et l'état doitChangerMotDePasse.
     */
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
        List<RestaurantSummaryDTO> restaurantList = (user != null && user.getRestaurants() != null)
                ? user.getRestaurants().stream()
                        .map(r -> new RestaurantSummaryDTO(r.getId(), r.getName()))
                        .sorted(java.util.Comparator.comparing(RestaurantSummaryDTO::name, String.CASE_INSENSITIVE_ORDER))
                        .collect(Collectors.toList())
                : List.of();

        boolean doitChangerMotDePasse = user != null && Boolean.TRUE.equals(user.getDoitChangerMotDePasse());

        return ResponseEntity.ok(new JwtResponseDTO(
                jwt,
                "Bearer",
                userDetails.getUsername(),
                roles,
                restaurantList,
                doitChangerMotDePasse
        ));
    }

    /**
     * Endpoint sécurisé de modification de mot de passe (notamment lors de la première connexion
     * d'un opérateur avec un mot de passe provisoire).
     * Requiert une authentification valide (Bearer Token).
     */
    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@Valid @RequestBody ChangePasswordRequestDTO request,
                                            Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetails principal)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Session non authentifiée ou expirée."));
        }

        Utilisateur user = utilisateurRepository.findByEmail(principal.getUsername()).orElse(null);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("message", "Utilisateur introuvable."));
        }

        // 1. Vérification que l'ancien mot de passe fourni correspond au hachage en base
        if (!passwordEncoder.matches(request.currentPassword(), user.getMotDePasse())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Le mot de passe actuel (provisoire) est incorrect."));
        }

        // 2. Vérification que le nouveau mot de passe est distinct de l'actuel
        if (passwordEncoder.matches(request.newPassword(), user.getMotDePasse())) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Le nouveau mot de passe doit être différent du mot de passe provisoire."));
        }

        // 3. Mise à jour sécurisée du mot de passe et levée du drapeau d'obligation
        user.setMotDePasse(passwordEncoder.encode(request.newPassword()));
        user.setDoitChangerMotDePasse(false);
        utilisateurRepository.save(user);

        // 4. Audit de sécurité
        auditService.logCurrentAction("CHANGE_PASSWORD", "Utilisateur", user.getId().toString(), null,
                "Changement de mot de passe réussi pour : " + user.getEmail());

        return ResponseEntity.ok(Map.of(
                "message", "Votre mot de passe a été mis à jour avec succès. Votre espace est désormais déverrouillé."
        ));
    }
}
