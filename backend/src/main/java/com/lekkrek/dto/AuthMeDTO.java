package com.lekkrek.dto;

/**
 * ============================================================================
 * 📁 Fichier : AuthMeDTO.java
 * 📝 Description : Session courante retournée par GET /auth/me.
 * 🔒 Rôle : Le front restaure la session (email + rôles) sans jamais lire le JWT,
 *           qui reste stocké en cookie HttpOnly côté navigateur (Option A).
 * 💡 Auteur : Documenté automatiquement (Standard Enterprise)
 * ============================================================================
 */

import java.util.List;

public record AuthMeDTO(String email, List<String> roles) {}
