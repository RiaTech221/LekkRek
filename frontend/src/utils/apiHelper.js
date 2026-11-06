/**
 * ============================================================================
 * 📁 Fichier : apiHelper.js
 * 💡 Utilitaire pour gérer les requêtes API et extraire les messages d'erreur backend
 * ============================================================================
 */

/**
 * Extrait le message d'erreur d'une réponse HTTP fetch.
 * Analyse les formats JSON retournés par Spring Boot ({ message, error, status }).
 */
export async function handleApiResponse(res, defaultMessage = "Une erreur est survenue") {
  if (res.ok) {
    // Si la réponse n'a pas de contenu (ex: 204 No Content ou DELETE)
    const contentType = res.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      return await res.json();
    }
    return null;
  }

  let errorMessage = defaultMessage;
  try {
    const errorData = await res.json();
    if (errorData && errorData.message) {
      errorMessage = errorData.message;
    } else if (errorData && errorData.error) {
      errorMessage = errorData.error;
    }
  } catch (e) {
    // Si la réponse n'est pas du JSON, essayer de lire le texte
    try {
      const text = await res.text();
      if (text && text.trim().length > 0) {
        errorMessage = text;
      }
    } catch (_) {}
  }

  throw new Error(errorMessage);
}
