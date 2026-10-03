package com.lekkrek;

/**
 * ============================================================================
 * 📁 Fichier : ImageDownloaderRunner.java
 * 📝 Description : Classe métier pour la gestion de ImageDownloaderRunner dans LekkRek.
 * 🔒 Rôle : Fait partie de l'architecture Backend Spring Boot.
 * 💡 Auteur : Documenté automatiquement (Standard Enterprise)
 * ============================================================================
 */


import com.lekkrek.entity.Plat;
import com.lekkrek.entity.Restaurant;
import com.lekkrek.repository.PlatRepository;
import com.lekkrek.repository.RestaurantRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.io.InputStream;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

@Component
public class ImageDownloaderRunner implements CommandLineRunner {

    private final PlatRepository platRepository;
    private final RestaurantRepository restaurantRepository;

    public ImageDownloaderRunner(PlatRepository platRepository, RestaurantRepository restaurantRepository) {
        this.platRepository = platRepository;
        this.restaurantRepository = restaurantRepository;
    }

    @Override
    public void run(String... args) {
        System.out.println("====== DÉMARRAGE DU TÉLÉCHARGEMENT DES IMAGES EXISTANTES ======");
        Path uploadDir = Paths.get("uploads");
        if (!Files.exists(uploadDir)) {
            try { Files.createDirectories(uploadDir); } catch (Exception ignored) {}
        }

        // Migrate Restaurants
        List<Restaurant> restaurants = restaurantRepository.findAll();
        for (Restaurant r : restaurants) {
            if (r.getImage() != null && r.getImage().startsWith("http") && !r.getImage().contains("localhost:8080")) {
                String newUrl = downloadAndSave(r.getImage());
                if (newUrl != null) {
                    r.setImage(newUrl);
                    restaurantRepository.save(r);
                    System.out.println("Migrated Restaurant: " + r.getName());
                }
            }
        }

        // Migrate Plats
        List<Plat> plats = platRepository.findAll();
        for (Plat p : plats) {
            if (p.getImage() != null && p.getImage().startsWith("http") && !p.getImage().contains("localhost:8080")) {
                String newUrl = downloadAndSave(p.getImage());
                if (newUrl != null) {
                    p.setImage(newUrl);
                    platRepository.save(p);
                    System.out.println("Migrated Plat: " + p.getName());
                }
            }
        }
        System.out.println("====== FIN DU TÉLÉCHARGEMENT ======");
    }

    private String downloadAndSave(String imageUrl) {
        try {
            URL url = new URL(imageUrl);
            String extension = ".jpg";
            if (imageUrl.contains(".png")) extension = ".png";
            String uniqueName = UUID.randomUUID().toString() + extension;
            Path dest = Paths.get("uploads", uniqueName);

            java.net.HttpURLConnection httpcon = (java.net.HttpURLConnection) url.openConnection();
            httpcon.addRequestProperty("User-Agent", "Mozilla/5.0");
            try (InputStream in = httpcon.getInputStream()) {
                Files.copy(in, dest, StandardCopyOption.REPLACE_EXISTING);
            }
            return "http://localhost:8080/uploads/" + uniqueName;
        } catch (Exception e) {
            System.err.println("Failed to download: " + imageUrl);
            return null;
        }
    }
}
