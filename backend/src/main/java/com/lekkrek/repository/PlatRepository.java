package com.lekkrek.repository;

/**
 * ============================================================================
 * 📁 Fichier : PlatRepository.java
 * 📝 Description : Classe métier pour la gestion de PlatRepository dans LekkRek.
 * 🔒 Rôle : Fait partie de l'architecture Backend Spring Boot.
 * 💡 Auteur : Documenté automatiquement (Standard Enterprise)
 * ============================================================================
 */


import com.lekkrek.entity.Plat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

public interface PlatRepository extends JpaRepository<Plat, Long> {

    @Query("SELECT p FROM Plat p WHERE " +
           "(:keyword IS NULL OR LOWER(p.name) LIKE LOWER(CONCAT('%', :keyword, '%')) OR LOWER(p.variantes) LIKE LOWER(CONCAT('%', :keyword, '%'))) AND " +
           "(:resto IS NULL OR p.restaurant.name = :resto) AND " +
           "(:budgetMax IS NULL OR p.price <= :budgetMax) AND " +
           "(:quartier IS NULL OR LOWER(p.restaurant.location) LIKE LOWER(CONCAT('%', :quartier, '%'))) AND " +
           "(:moment IS NULL OR p.moment = :moment)")
    List<Plat> searchPlats(@Param("keyword") String keyword, 
                           @Param("resto") String resto, 
                           @Param("budgetMax") Double budgetMax, 
                           @Param("quartier") String quartier,
                           @Param("moment") String moment);
}
