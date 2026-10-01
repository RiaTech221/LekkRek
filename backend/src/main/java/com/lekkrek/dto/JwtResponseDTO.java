package com.lekkrek.dto;

import java.util.List;

public record JwtResponseDTO(String token, String type, String email, List<String> roles) {
    public JwtResponseDTO(String token, String email, List<String> roles) {
        this(token, "Bearer", email, roles);
    }
}
