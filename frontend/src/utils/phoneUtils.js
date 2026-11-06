/**
 * Utilitaire de validation et de normalisation des numéros de téléphone sénégalais.
 * Préfixes valides : 70, 75, 76, 77, 78 ou 33 (suivis de 7 chiffres).
 * Accepte avec ou sans indicatif (+221, 00221, 221), avec ou sans espaces/tirets.
 */

// Regex acceptant optionnellement l'indicatif (+221, 00221, 221) et les espaces/tirets
export const SENEGAL_PHONE_REGEX = /^(?:(?:\+|00)?221)?[\s.-]?(70|75|76|77|78|33)[\s.-]?[0-9]{3}[\s.-]?[0-9]{2}[\s.-]?[0-9]{2}$/;

/**
 * Valide si la chaîne correspond à un numéro sénégalais valide.
 * @param {string} phone
 * @returns {boolean}
 */
export function validateSenegalPhone(phone) {
  if (!phone || typeof phone !== 'string') return false;
  return SENEGAL_PHONE_REGEX.test(phone.trim());
}

/**
 * Normalise le numéro au format canonique à 9 chiffres : ex. '771234567'.
 * @param {string} phone
 * @returns {string}
 */
export function normalizeSenegalPhone(phone) {
  if (!phone || typeof phone !== 'string') return '';
  let digits = phone.replace(/[^0-9]/g, '');
  if (digits.startsWith('00221') && digits.length === 14) {
    digits = digits.substring(5);
  } else if (digits.startsWith('221') && digits.length === 12) {
    digits = digits.substring(3);
  }
  return digits;
}
