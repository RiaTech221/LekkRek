package com.lekkrek.controller;

/**
 * ============================================================================
 * 📁 Fichier : AuthController.java
 * 📝 Description : Contrôleur d'authentification pour LekkRek.
 *                 Gère la connexion, la génération de tokens JWT (cookie HttpOnly & Bearer),
 *                 la session /me, le logout, et le changement obligatoire de mot de passe
 *                 sécurisé lors de la 1ère connexion d'un opérateur.
 * 🔒 Rôle : Fait partie de l'architecture Backend Spring Boot.
 * 💡 Auteur : Standard Enterprise Security
 * ============================================================================
 */

import com.lekkrek.dto.AuthMeDTO;
import com.lekkrek.dto.ChangePasswordRequestDTO;
import com.lekkrek.dto.JwtResponseDTO;
import com.lekkrek.dto.LoginRequestDTO;
import com.lekkrek.dto.RestaurantSummaryDTO;
import com.lekkrek.entity.Utilisateur;
import com.lekkrek.repository.RestaurantRepository;
import com.lekkrek.repository.UtilisateurRepository;
import com.lekkrek.security.AuthCookieService;
import com.lekkrek.security.JwtUtils;
import com.lekkrek.service.AuditService;
import com.lekkrek.service.OperatorAccessService;
import jakarta.validation.Valid;
import org.springframework.http.HttpHeaders;
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
    private final AuthCookieService authCookieService;

    public AuthController(AuthenticationManager authenticationManager,
                          JwtUtils jwtUtils,
                          UtilisateurRepository utilisateurRepository,
                          RestaurantRepository restaurantRepository,
                          OperatorAccessService operatorAccessService,
                          PasswordEncoder passwordEncoder,
                          AuditService auditService,
                          AuthCookieService authCookieService) {
        this.authenticationManager = authenticationManager;
        this.jwtUtils = jwtUtils;
        this.utilisateurRepository = utilisateurRepository;
        this.restaurantRepository = restaurantRepository;
        this.operatorAccessService = operatorAccessService;
        this.passwordEncoder = passwordEncoder;
        this.auditService = auditService;
        this.authCookieService = authCookieService;
    }

    /**
     * Authentification utilisateur par email et mot de passe.
     * Renvoie le token JWT (dans le corps et en cookie HttpOnly pour le web),
     * les rôles, les restaurants assignés et l'état doitChangerMotDePasse.
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

        // Option A : le JWT est décliné en double —
        //  - cookie HttpOnly pour le web (jamais lisible par le JS → anti-vol par XSS) ;
        //  - corps JSON pour le mobile Expo (header Authorization: Bearer).
        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, authCookieService.buildLoginCookie(jwt).toString())
                .body(new JwtResponseDTO(
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
     * Requiert une authentification valide (Bearer Token ou cookie de session).
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

        // 3. Exigence stricte de sécurité (mot de passe fort)
        String newPwd = request.newPassword();
        if (newPwd.length() < 8) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Le mot de passe doit comporter au moins 8 caractères."));
        }
        if (!newPwd.matches(".*[A-Z].*")) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Le mot de passe doit contenir au moins une lettre majuscule."));
        }
        if (!newPwd.matches(".*[a-z].*")) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Le mot de passe doit contenir au moins une lettre minuscule."));
        }
        if (!newPwd.matches(".*\\d.*")) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Le mot de passe doit contenir au moins un chiffre."));
        }
        if (!newPwd.matches(".*[^A-Za-z0-9].*")) {
            return ResponseEntity.badRequest()
                    .body(Map.of("message", "Le mot de passe doit contenir au moins un caractère spécial (ex: @, #, $, !, %, etc.)."));
        }

        // 4. Mise à jour sécurisée du mot de passe et levée du drapeau d'obligation
        user.setMotDePasse(passwordEncoder.encode(newPwd));
        user.setDoitChangerMotDePasse(false);
        utilisateurRepository.save(user);

        // 5. Audit de sécurité
        auditService.logCurrentAction("CHANGE_PASSWORD", "Utilisateur", user.getId().toString(), null,
                "Changement de mot de passe réussi pour : " + user.getEmail());

        // 6. Régénération du token et rafraîchissement du cookie de session pour continuer la navigation
        String newJwt = jwtUtils.generateJwtToken(authentication);

        return ResponseEntity.ok()
                .header(HttpHeaders.SET_COOKIE, authCookieService.buildLoginCookie(newJwt).toString())
                .body(Map.of(
                        "message", "Votre mot de passe a été mis à jour avec succès. Votre espace est désormais déverrouillé.",
                        "token", newJwt
                ));
    }

    /**
     * Déconnexion : efface le cookie de session côté navigateur.
     * Le JWT reste valide jusqu'à son expiration (durée configurée) — une
     * révocation instantanée côté serveur correspond à l'option B (session serveur).
     */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.noContent()
                .header(HttpHeaders.SET_COOKIE, authCookieService.buildClearCookie().toString())
                .build();
    }

    /**
     * Session courante : email + rôles + restaurants + doitChangerMotDePasse de l'utilisateur authentifié.
     * Le front l'appelle au chargement pour restaurer la session (le JWT n'étant
     * plus lisible côté JS — stocké en cookie HttpOnly). 401 sinon.
     */
    @GetMapping("/me")
    public ResponseEntity<?> currentUser(Authentication authentication) {
        if (authentication == null || !(authentication.getPrincipal() instanceof UserDetails principal)) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("message", "Non authentifié"));
        }
        List<String> roles = principal.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .collect(Collectors.toList());

        Utilisateur user = utilisateurRepository.findByEmail(principal.getUsername()).orElse(null);
        List<RestaurantSummaryDTO> restaurantList = (user != null && user.getRestaurants() != null)
                ? user.getRestaurants().stream()
                        .map(r -> new RestaurantSummaryDTO(r.getId(), r.getName()))
                        .sorted(java.util.Comparator.comparing(RestaurantSummaryDTO::name, String.CASE_INSENSITIVE_ORDER))
                        .collect(Collectors.toList())
                : List.of();

        boolean doitChangerMotDePasse = user != null && Boolean.TRUE.equals(user.getDoitChangerMotDePasse());

        return ResponseEntity.ok(new AuthMeDTO(principal.getUsername(), roles, restaurantList, doitChangerMotDePasse));
    }
}
