/**
 * ============================================================================
 * 📁 Fichier : types/order.ts
 * 📝 Description : Types TypeScript pour les commandes côté client mobile.
 * 🔒 Rôle : Contrat d'interface pour la soumission et le suivi des commandes.
 * 💡 Auteur : Équipe Mobile
 * ============================================================================
 */

export type OrderType = 'SUR_PLACE' | 'EMPORTER' | 'LIVRAISON';

export type PaymentMethod = 'WAVE' | 'ORANGE_MONEY' | 'SAMIR_PAY' | 'ESPECES';

export interface OrderRequest {
  clientName: string;
  clientPhone: string;
  clientAddress?: string;
  type: OrderType;
  paymentMethod: PaymentMethod;
  platIds: number[];
}

export interface OrderResponse {
  orderNumber: string;
  status: string;
  type: string;
  restaurantName: string;
  totalAmount: number;
  message?: string;
}

export type OrderTrackingStatus =
  | 'NOUVELLE'
  | 'EN_PREPARATION'
  | 'PRETE'
  | 'LIVREE'
  | 'ANNULEE';

export interface ActiveOrderInfo {
  orderNumber: string;
  status: OrderTrackingStatus;
  restaurantName?: string;
  totalAmount?: number;
}
