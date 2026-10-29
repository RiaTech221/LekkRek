/**
 * ============================================================================
 * 📁 Fichier : services/orderApi.ts
 * 📝 Description : Service API pour la soumission des commandes vers Spring Boot.
 * 🔒 Rôle : Envoie la requête POST /api/v1/public/orders et retourne le DTO.
 * 💡 Auteur : Équipe Mobile
 * ============================================================================
 */

import { API_PREFIX, API_URL } from '@/services/config';
import type { OrderRequest, OrderResponse, OrderTrackingDTO } from '@/types/order';

export async function submitOrder(order: OrderRequest): Promise<OrderResponse> {
  const url = `${API_URL}${API_PREFIX}/orders`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    body: JSON.stringify(order),
    credentials: 'include',
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

export async function trackOrder(orderNumber: string): Promise<OrderTrackingDTO> {
  const cleanNumber = orderNumber.trim();
  if (!cleanNumber) {
    throw new Error('Veuillez renseigner un numéro de commande.');
  }

  const url = `${API_URL}${API_PREFIX}/orders/track/${encodeURIComponent(cleanNumber)}`;

  const response = await fetch(url, {
    method: 'GET',
    headers: {
      Accept: 'application/json',
    },
    credentials: 'include',
  });

  if (response.status === 404) {
    throw new Error('Commande introuvable. Vérifiez votre numéro de commande.');
  }

  if (response.status === 429) {
    throw new Error('Trop de requêtes. Veuillez patienter quelques secondes avant de réactualiser.');
  }

  if (!response.ok) {
    let msg = `Erreur lors du suivi de commande (${response.status})`;
    try {
      const errJson = (await response.json()) as { message?: string };
      if (errJson.message) msg = errJson.message;
    } catch {
      // Ignorer l'erreur de parsing
    }
    throw new Error(msg);
  }

  return (await response.json()) as OrderTrackingDTO;
}
