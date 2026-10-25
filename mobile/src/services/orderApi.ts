/**
 * ============================================================================
 * 📁 Fichier : services/orderApi.ts
 * 📝 Description : Service API pour la soumission des commandes vers Spring Boot.
 * 🔒 Rôle : Envoie la requête POST /api/v1/public/orders et retourne le DTO.
 * 💡 Auteur : Équipe Mobile
 * ============================================================================
 */

import { API_PREFIX, API_URL } from '@/services/config';
import type { OrderRequest, OrderResponse } from '@/types/order';

export async function submitOrder(order: OrderRequest): Promise<OrderResponse> {
  const url = `${API_URL}${API_PREFIX}/orders`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(order),
  });

  if (!response.ok) {
    let errorMessage = `Erreur serveur (${response.status})`;
    try {
      const errorJson = (await response.json()) as { message?: string };
      if (errorJson.message) {
        errorMessage = errorJson.message;
      }
    } catch {
      // Ignorer l'erreur de parsing JSON
    }
    throw new Error(errorMessage);
  }

  return (await response.json()) as OrderResponse;
}
