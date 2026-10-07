package com.lekkrek.util;

import java.util.regex.Pattern;

/**
 * Utilitaire de validation et de normalisation des numéros de téléphone sénégalais.
 * Préfixes valides : 70, 75, 76, 77, 78 ou 33 (suivis de 7 chiffres).
 * Accepte les formats avec ou sans indicatif (+221, 00221, 221), avec ou sans espaces/tirets.
 */
public final class PhoneNumberUtil {

    // Accepte optionnellement +221, 00221 ou 221, suivi de 70, 75, 76, 77, 78 ou 33 et de 7 chiffres
    public static final String SENEGAL_PHONE_REGEX = "^(?:(?:\\+|00)?221)?[\\s.-]?(70|75|76|77|78|33)[\\s.-]?[0-9]{3}[\\s.-]?[0-9]{2}[\\s.-]?[0-9]{2}$";
    private static final Pattern PATTERN = Pattern.compile(SENEGAL_PHONE_REGEX);

    private PhoneNumberUtil() {}

    /**
     * Vérifie si le numéro fourni correspond à un numéro sénégalais valide.
     */
    public static boolean isValid(String phone) {
        if (phone == null || phone.isBlank()) {
            return false;
        }
        return PATTERN.matcher(phone.trim()).matches();
    }

    /**
     * Normalise le numéro au format canonique à 9 chiffres : ex. 771234567.
     * Supprime les séparateurs et le code pays (+221, 00221, 221).
     */
    public static String normalize(String phone) {
        if (phone == null) {
            return null;
        }
        // Supprime tout sauf les chiffres
        String digits = phone.replaceAll("[^0-9]", "");

        // Supprime le préfixe pays 221 ou 00221 s'il est présent
        if (digits.startsWith("00221") && digits.length() == 14) {
            digits = digits.substring(5);
        } else if (digits.startsWith("221") && digits.length() == 12) {
            digits = digits.substring(3);
        }

        return digits;
    }
}
