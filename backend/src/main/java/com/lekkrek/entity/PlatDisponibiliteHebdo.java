package com.lekkrek.entity;

/**
 * ============================================================================
 * 📁 Fichier : PlatDisponibiliteHebdo.java
 * 📝 Description : Entité représentant la grille hebdomadaire de disponibilité des plats.
 * 🔒 Rôle : Fait partie de l'architecture Backend Spring Boot (module Menu / Planning).
 * 💡 Aligné exactement sur 01-migration-lekkrek.sql
 * ============================================================================
 */

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

@Entity
@Table(
    name = "plat_disponibilites_hebdo",
    uniqueConstraints = {
        @UniqueConstraint(name = "uk_plat_jour_moment", columnNames = {"plat_id", "jour_semaine", "moment"})
    }
)
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PlatDisponibiliteHebdo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "plat_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private Plat plat;

    @Column(name = "jour_semaine", length = 10, nullable = false)
    private String jourSemaine; // LUNDI, MARDI, MERCREDI, JEUDI, VENDREDI, SAMEDI, DIMANCHE

    @Column(nullable = false, length = 50)
    private String moment = "dejeuner";

    @Column(nullable = false, columnDefinition = "boolean default true")
    private boolean actif = true;
}
