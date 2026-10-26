package com.lekkrek.controller;

/**
 * ============================================================================
 * 📁 Fichier : AuthControllerTest.java
 * 📝 Description : Tests unitaires pour l'authentification et le changement
 *                 de mot de passe obligatoire dès la 1ère connexion.
 * 🔒 Rôle : Validation de la logique métier et de sécurité dans LekkRek.
 * 💡 Auteur : Standard Enterprise Security
 * ============================================================================
 */

import com.lekkrek.dto.ChangePasswordRequestDTO;
import com.lekkrek.dto.JwtResponseDTO;
import com.lekkrek.dto.LoginRequestDTO;
import com.lekkrek.entity.Utilisateur;
import com.lekkrek.repository.RestaurantRepository;
import com.lekkrek.repository.UtilisateurRepository;
import com.lekkrek.security.JwtUtils;
import com.lekkrek.service.AuditService;
import com.lekkrek.service.OperatorAccessService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

class AuthControllerTest {

    private AuthenticationManager authenticationManager;
    private JwtUtils jwtUtils;
    private UtilisateurRepository utilisateurRepository;
    private RestaurantRepository restaurantRepository;
    private OperatorAccessService operatorAccessService;
    private PasswordEncoder passwordEncoder;
    private AuditService auditService;
    private AuthController authController;

    @BeforeEach
    void setUp() {
        authenticationManager = mock(AuthenticationManager.class);
        jwtUtils = mock(JwtUtils.class);
        utilisateurRepository = mock(UtilisateurRepository.class);
        restaurantRepository = mock(RestaurantRepository.class);
        operatorAccessService = mock(OperatorAccessService.class);
        passwordEncoder = mock(PasswordEncoder.class);
        auditService = mock(AuditService.class);

        authController = new AuthController(
                authenticationManager,
                jwtUtils,
                utilisateurRepository,
                restaurantRepository,
                operatorAccessService,
                passwordEncoder,
                auditService
        );
    }

    @Test
    void testLoginWithProvisionalPasswordReturnsFlagTrue() {
        LoginRequestDTO request = new LoginRequestDTO("awa@lekkrek.com", "provisoire123");

        UserDetails userDetails = new User("awa@lekkrek.com", "encoded", List.of(new SimpleGrantedAuthority("ROLE_OPERATEUR")));
        Authentication auth = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

        when(authenticationManager.authenticate(any())).thenReturn(auth);
        when(jwtUtils.generateJwtToken(auth)).thenReturn("mock-jwt-token");

        Utilisateur operator = new Utilisateur();
        operator.setEmail("awa@lekkrek.com");
        operator.setRole(Utilisateur.Role.OPERATEUR);
        operator.setDoitChangerMotDePasse(true);

        when(utilisateurRepository.findByEmail("awa@lekkrek.com")).thenReturn(Optional.of(operator));

        ResponseEntity<?> response = authController.authenticateUser(request);
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody() instanceof JwtResponseDTO);

        JwtResponseDTO body = (JwtResponseDTO) response.getBody();
        assertEquals("mock-jwt-token", body.token());
        assertEquals("awa@lekkrek.com", body.email());
        assertTrue(body.doitChangerMotDePasse(), "Le drapeau doitChangerMotDePasse doit être à true pour un compte provisoire");
    }

    @Test
    void testChangePasswordSuccess() {
        UserDetails userDetails = new User("awa@lekkrek.com", "encodedOld", List.of(new SimpleGrantedAuthority("ROLE_OPERATEUR")));
        Authentication auth = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

        Utilisateur operator = new Utilisateur();
        operator.setId(5L);
        operator.setEmail("awa@lekkrek.com");
        operator.setMotDePasse("encodedOld");
        operator.setDoitChangerMotDePasse(true);

        when(utilisateurRepository.findByEmail("awa@lekkrek.com")).thenReturn(Optional.of(operator));
        when(passwordEncoder.matches("provisoire123", "encodedOld")).thenReturn(true);
        when(passwordEncoder.matches("nouveauPass123", "encodedOld")).thenReturn(false);
        when(passwordEncoder.encode("nouveauPass123")).thenReturn("encodedNew");

        ChangePasswordRequestDTO request = new ChangePasswordRequestDTO("provisoire123", "nouveauPass123");
        ResponseEntity<?> response = authController.changePassword(request, auth);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertFalse(operator.getDoitChangerMotDePasse(), "Le drapeau doitChangerMotDePasse doit repasser à false après mise à jour");
        assertEquals("encodedNew", operator.getMotDePasse());

        verify(utilisateurRepository).save(operator);
        verify(auditService).logCurrentAction(eq("CHANGE_PASSWORD"), eq("Utilisateur"), eq("5"), isNull(), any());
    }

    @Test
    void testChangePasswordFailsIfWrongCurrentPassword() {
        UserDetails userDetails = new User("awa@lekkrek.com", "encodedOld", List.of(new SimpleGrantedAuthority("ROLE_OPERATEUR")));
        Authentication auth = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

        Utilisateur operator = new Utilisateur();
        operator.setEmail("awa@lekkrek.com");
        operator.setMotDePasse("encodedOld");

        when(utilisateurRepository.findByEmail("awa@lekkrek.com")).thenReturn(Optional.of(operator));
        when(passwordEncoder.matches("wrongPass", "encodedOld")).thenReturn(false);

        ChangePasswordRequestDTO request = new ChangePasswordRequestDTO("wrongPass", "nouveauPass123");
        ResponseEntity<?> response = authController.changePassword(request, auth);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        verify(utilisateurRepository, never()).save(any());
    }

    @Test
    void testChangePasswordFailsIfNewMatchesOld() {
        UserDetails userDetails = new User("awa@lekkrek.com", "encodedOld", List.of(new SimpleGrantedAuthority("ROLE_OPERATEUR")));
        Authentication auth = new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());

        Utilisateur operator = new Utilisateur();
        operator.setEmail("awa@lekkrek.com");
        operator.setMotDePasse("encodedOld");

        when(utilisateurRepository.findByEmail("awa@lekkrek.com")).thenReturn(Optional.of(operator));
        when(passwordEncoder.matches("samePassword123", "encodedOld")).thenReturn(true);

        ChangePasswordRequestDTO request = new ChangePasswordRequestDTO("samePassword123", "samePassword123");
        ResponseEntity<?> response = authController.changePassword(request, auth);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
        verify(utilisateurRepository, never()).save(any());
    }
}
