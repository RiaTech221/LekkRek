package com.lekkrek.config;

/**
 * ============================================================================
 * 📁 Fichier : DataLoader.java
 * 📝 Description : Initialisation minimale conditionnelle (Désactivé par défaut).
 * 🔒 Rôle : Fait partie de l'architecture Backend Spring Boot.
 * 💡 Standard Enterprise : Ne supprime jamais de données réelles.
 * ============================================================================
 */

import com.lekkrek.entity.Utilisateur;
import com.lekkrek.repository.UtilisateurRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
// DataLoader désactivé par défaut : aucune donnée fictive injectée.
// Pour activer temporairement, passer app.dataloader.enabled=true via variable d'environnement ou propriétés.
@ConditionalOnProperty(name = "app.dataloader.enabled", havingValue = "true", matchIfMissing = false)
public class DataLoader {

    @Value("${app.admin.initial-password:password123}")
    private String adminInitialPassword;

    @Bean
    CommandLineRunner initDatabase(UtilisateurRepository userRepo, PasswordEncoder passwordEncoder) {
        return args -> {
            System.out.println("[DataLoader] Vérification de l'intégrité des comptes initiaux...");

            if (userRepo.findByEmail("admin@lekkrek.com").isEmpty()) {
                Utilisateur admin = new Utilisateur();
                admin.setNomComplet("Admin Principal");
                admin.setEmail("admin@lekkrek.com");
                admin.setMotDePasse(passwordEncoder.encode(adminInitialPassword));
                admin.setRole(Utilisateur.Role.ADMIN);
                admin.setActif(true);
                userRepo.save(admin);
                System.out.println("[DataLoader] ✅ Compte admin@lekkrek.com créé.");
            }

            if (userRepo.findByEmail("awa@lekkrek.com").isEmpty()) {
                Utilisateur awa = new Utilisateur();
                awa.setNomComplet("Awa Ndiaye");
                awa.setEmail("awa@lekkrek.com");
                awa.setMotDePasse(passwordEncoder.encode(adminInitialPassword));
                awa.setRole(Utilisateur.Role.OPERATEUR);
                awa.setActif(true);
                userRepo.save(awa);
                System.out.println("[DataLoader] ✅ Compte opérateur awa@lekkrek.com créé.");
            }
        };
    }
}