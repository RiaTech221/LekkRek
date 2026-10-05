package com.lekkrek.controller;

/**
 * ============================================================================
 * 📁 Fichier : FileUploadController.java
 * 📝 Description : Classe métier pour la gestion de FileUploadController dans LekkRek.
 * 🛠 Rôle : Fait partie de l'architecture Backend Spring Boot.
 * 👨‍💻 Auteur : Documenté automatiquement (Standard Enterprise)
 * ============================================================================
 */


import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/upload")
public class FileUploadController {

    private static final String UPLOAD_DIR = "uploads/";

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATEUR')")
    public ResponseEntity<?> uploadFile(@RequestParam("file") MultipartFile file) {
        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "Le fichier est vide."));
        }

        try {
            // Création du répertoire s'il n'existe pas
            File directory = new File(UPLOAD_DIR);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            // Génération d'un nom de fichier unique sécurisé
            String originalName = file.getOriginalFilename();
            String extension = originalName != null && originalName.contains(".") 
                               ? originalName.substring(originalName.lastIndexOf(".")).toLowerCase() 
                               : "";

            // Validation de l'extension
            if (!extension.equals(".jpg") && !extension.equals(".jpeg") && !extension.equals(".png") && !extension.equals(".webp")) {
                return ResponseEntity.badRequest().body(Map.of("error", "Seules les images (.jpg, .jpeg, .png, .webp) sont autorisées."));
            }

            // Validation de la taille (5 Mo = 5 * 1024 * 1024 octets)
            if (file.getSize() > 5 * 1024 * 1024) {
                return ResponseEntity.badRequest().body(Map.of("error", "Le fichier dépasse la taille maximale autorisée (5 Mo)."));
            }

            String uniqueName = UUID.randomUUID().toString() + extension;

            // Enregistrement sur le disque local
            Path path = Paths.get(UPLOAD_DIR + uniqueName);
            Files.write(path, file.getBytes());

            // L'URL publique pour accéder à l'image
            String fileUrl = "http://localhost:8080/uploads/" + uniqueName;

            return ResponseEntity.ok(Map.of("url", fileUrl));

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(Map.of("error", "Erreur lors de la sauvegarde du fichier."));
        }
    }
}
