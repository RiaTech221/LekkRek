package com.lekkrek.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "platform_settings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PlatformSettings {

    @Id
    private Long id; // Toujours 1, car il n'y a qu'une seule configuration globale

    @Column(nullable = false)
    private String platformName;

    private String supportEmail;
    private String supportPhone;
    
    @Column(nullable = false)
    private String defaultCurrency;

    private String instagramUrl;
    private String facebookUrl;
    private String tiktokUrl;
}
