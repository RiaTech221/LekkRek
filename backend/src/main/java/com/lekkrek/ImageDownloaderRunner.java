package com.lekkrek;

/**
 * ============================================================================
 * 📁 Fichier : ImageDownloaderRunner.java
 * 📝 Description : Runner de migration pour télécharger et sécuriser les images externes.
 * 🔒 Rôle : Fait partie de l'architecture Backend Spring Boot.
 * 🛡️ Sécurité : Protégé contre le SSRF, timeouts stricts, limite de taille (5MB),
 *               et désactivé par défaut via configuration.
 * ============================================================================
 */

import com.lekkrek.entity.Plat;
import com.lekkrek.entity.Restaurant;
import com.lekkrek.repository.PlatRepository;
import com.lekkrek.repository.RestaurantRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.io.InputStream;
import java.io.OutputStream;
import java.net.HttpURLConnection;
import java.net.InetAddress;
import java.net.URI;
import java.net.URL;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Component
@ConditionalOnProperty(name = "lekkrek.image-migration.enabled", havingValue = "true", matchIfMissing = false)
public class ImageDownloaderRunner implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(ImageDownloaderRunner.class);

    private static final int CONNECT_TIMEOUT_MS = 5000;
    private static final int READ_TIMEOUT_MS = 5000;
    private static final long MAX_IMAGE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

    private static final Set<String> ALLOWED_DOMAINS = Set.of(
            "images.unsplash.com",
            "unsplash.com",
            "res.cloudinary.com",
            "images.pexels.com",
            "cdn.pixabay.com"
    );

    private final PlatRepository platRepository;
    private final RestaurantRepository restaurantRepository;

    public ImageDownloaderRunner(PlatRepository platRepository, RestaurantRepository restaurantRepository) {
        this.platRepository = platRepository;
        this.restaurantRepository = restaurantRepository;
    }

    @Override
    public void run(String... args) {
        log.info("====== DÉMARRAGE DU TÉLÉCHARGEMENT DES IMAGES EXISTANTES ======");
        Path uploadDir = Paths.get("uploads");
        if (!Files.exists(uploadDir)) {
            try {
                Files.createDirectories(uploadDir);
            } catch (Exception ignored) {}
        }

        // Migrate Restaurants
        List<Restaurant> restaurants = restaurantRepository.findAll();
        for (Restaurant r : restaurants) {
            if (r.getImage() != null && r.getImage().startsWith("http") && !r.getImage().contains("localhost:8080")) {
                String newUrl = downloadAndSave(r.getImage());
                if (newUrl != null) {
                    r.setImage(newUrl);
                    restaurantRepository.save(r);
                    log.info("Migrated Restaurant: {}", r.getName());
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
                    log.info("Migrated Plat: {}", p.getName());
                }
            }
        }
        log.info("====== FIN DU TÉLÉCHARGEMENT ======");
    }

    private String downloadAndSave(String imageUrl) {
        Path dest = null;
        try {
            URI uri = URI.create(imageUrl);
            validateUri(uri);

            URL url = uri.toURL();
            String extension = ".jpg";
            String path = uri.getPath();
            if (path != null && path.toLowerCase().endsWith(".png")) {
                extension = ".png";
            } else if (path != null && path.toLowerCase().endsWith(".webp")) {
                extension = ".webp";
            }
            String uniqueName = UUID.randomUUID().toString() + extension;
            dest = Paths.get("uploads", uniqueName);

            HttpURLConnection httpcon = (HttpURLConnection) url.openConnection();
            httpcon.setConnectTimeout(CONNECT_TIMEOUT_MS);
            httpcon.setReadTimeout(READ_TIMEOUT_MS);
            httpcon.setInstanceFollowRedirects(false); // Empêche les redirections SSRF vers des réseaux internes
            httpcon.setRequestProperty("User-Agent", "LekkRek-ImageMigration/1.0");

            int responseCode = httpcon.getResponseCode();
            if (responseCode != HttpURLConnection.HTTP_OK) {
                log.warn("Échec téléchargement image (code HTTP {}) : {}", responseCode, imageUrl);
                return null;
            }

            long contentLength = httpcon.getContentLengthLong();
            if (contentLength > MAX_IMAGE_SIZE_BYTES) {
                log.warn("Image trop volumineuse (> 5MB) rejetée : {}", imageUrl);
                return null;
            }

            long totalBytes = 0;
            byte[] buffer = new byte[8192];
            int bytesRead;
            try (InputStream in = httpcon.getInputStream();
                 OutputStream out = Files.newOutputStream(dest)) {
                while ((bytesRead = in.read(buffer)) != -1) {
                    totalBytes += bytesRead;
                    if (totalBytes > MAX_IMAGE_SIZE_BYTES) {
                        throw new IOException("Taille de l'image dépasse la limite maximale de 5MB");
                    }
                    out.write(buffer, 0, bytesRead);
                }
            }

            return "/uploads/" + uniqueName;
        } catch (Exception e) {
            log.error("Failed to download image safely [{}]: {}", imageUrl, e.getMessage());
            if (dest != null) {
                try {
                    Files.deleteIfExists(dest);
                } catch (IOException ignored) {}
            }
            return null;
        }
    }

    private void validateUri(URI uri) throws SecurityException {
        String scheme = uri.getScheme();
        if (scheme == null || (!scheme.equalsIgnoreCase("http") && !scheme.equalsIgnoreCase("https"))) {
            throw new SecurityException("Protocole non autorisé : " + scheme);
        }

        String host = uri.getHost();
        if (host == null || host.trim().isEmpty()) {
            throw new SecurityException("Hôte manquant dans l'URL");
        }

        // Vérification de la liste blanche de domaines
        boolean isDomainAllowed = ALLOWED_DOMAINS.stream()
                .anyMatch(domain -> host.equalsIgnoreCase(domain) || host.endsWith("." + domain));
        if (!isDomainAllowed) {
            throw new SecurityException("Domaine non autorisé pour la migration : " + host);
        }

        // Vérification anti-SSRF sur la résolution DNS
        try {
            InetAddress address = InetAddress.getByName(host);
            if (address.isLoopbackAddress()
                    || address.isAnyLocalAddress()
                    || address.isLinkLocalAddress()
                    || address.isSiteLocalAddress()
                    || address.getHostAddress().equals("169.254.169.254")
                    || address.getHostAddress().equals("0.0.0.0")) {
                throw new SecurityException("Adresse IP privée ou locale interdite (SSRF protection) : " + host);
            }
        } catch (Exception e) {
            if (e instanceof SecurityException) {
                throw (SecurityException) e;
            }
            throw new SecurityException("Impossible de résoudre l'hôte : " + host, e);
        }
    }
}
