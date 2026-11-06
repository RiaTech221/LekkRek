/**
 * ============================================================================
 * 📁 Fichier : hooks/useOrderTracking.ts
 * 📝 Description : Hook de persistance et de synchronisation du suivi de commande.
 * 🔒 Rôle : Stocke les commandes récentes dans AsyncStorage ('lekkrek_recent_orders'),
 *           mémorise la commande active sans forcer l'utilisateur à taper un code,
 *           et fournit les méthodes d'actualisation en temps réel.
 * 💡 Auteur : Équipe Mobile
 * ============================================================================
 */

import { useCallback, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { trackOrder } from '@/services/orderApi';
import type { ActiveOrderInfo, OrderTrackingStatus } from '@/types/order';

export const RECENT_ORDERS_STORAGE_KEY = 'lekkrek_recent_orders';
export const ACTIVE_ORDER_STORAGE_KEY = 'lekkrek_active_order';

const TERMINAL_STATUSES: OrderTrackingStatus[] = ['LIVREE', 'ANNULEE'];

export function useOrderTracking() {
  const [activeOrder, setActiveOrder] = useState<ActiveOrderInfo | null>(null);
  const [recentOrders, setRecentOrders] = useState<ActiveOrderInfo[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Charge les commandes enregistrées au montage
  const loadOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const [rawRecent, rawActive] = await Promise.all([
        AsyncStorage.getItem(RECENT_ORDERS_STORAGE_KEY),
        AsyncStorage.getItem(ACTIVE_ORDER_STORAGE_KEY),
      ]);

      const parsedRecent: ActiveOrderInfo[] = rawRecent ? (JSON.parse(rawRecent) as ActiveOrderInfo[]) : [];
      setRecentOrders(parsedRecent);

      if (rawActive) {
        const parsedActive: ActiveOrderInfo = JSON.parse(rawActive) as ActiveOrderInfo;
        setActiveOrder(parsedActive);
      } else if (parsedRecent.length > 0) {
        // Fallback : si la dernière commande n'est pas encore terminée, elle est active
        const latest = parsedRecent[0];
        if (!TERMINAL_STATUSES.includes(latest.status)) {
          setActiveOrder(latest);
        }
      }
    } catch {
      // Ignorer l'erreur de parsing local
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadOrders();
    }, 0);
    return () => clearTimeout(timer);
  }, [loadOrders]);

  /**
   * Enregistre une nouvelle commande passée par l'utilisateur.
   */
  const saveOrder = useCallback(async (newOrder: ActiveOrderInfo) => {
    try {
      // Met à jour la liste des commandes récentes (max 5)
      setRecentOrders((prev) => {
        const filtered = prev.filter((o) => o.orderNumber !== newOrder.orderNumber);
        const updated = [newOrder, ...filtered].slice(0, 5);
        void AsyncStorage.setItem(RECENT_ORDERS_STORAGE_KEY, JSON.stringify(updated));
        return updated;
      });

      // Définit la commande comme active
      setActiveOrder(newOrder);
      await AsyncStorage.setItem(ACTIVE_ORDER_STORAGE_KEY, JSON.stringify(newOrder));
    } catch {
      // Gestion silencieuse des erreurs de stockage
    }
  }, []);

  /**
   * Actualise le statut d'une commande auprès du serveur backend.
   */
  const refreshStatus = useCallback(async (orderNumber: string): Promise<ActiveOrderInfo | null> => {
    try {
      const dto = await trackOrder(orderNumber);
      const updated: ActiveOrderInfo = {
        orderNumber: dto.orderNumber,
        status: dto.status,
        restaurantName: dto.restaurantName,
        totalAmount: Number(dto.totalAmount) || undefined,
        createdAt: dto.createdAt,
      };

      // Met à jour dans l'historique local
      setRecentOrders((prev) => {
        const next = prev.map((o) => (o.orderNumber === orderNumber ? { ...o, ...updated } : o));
        void AsyncStorage.setItem(RECENT_ORDERS_STORAGE_KEY, JSON.stringify(next));
        return next;
      });

      // Si c'est la commande active
      setActiveOrder((current) => {
        if (current && current.orderNumber === orderNumber) {
          void AsyncStorage.setItem(ACTIVE_ORDER_STORAGE_KEY, JSON.stringify(updated));
          return updated;
        }
        return current;
      });

      return updated;
    } catch {
      return null;
    }
  }, []);

  /**
   * Clôture ou masque la commande active lorsque le client le souhaite ou après livraison.
   */
  const dismissActiveOrder = useCallback(async () => {
    await AsyncStorage.removeItem(ACTIVE_ORDER_STORAGE_KEY);
    setActiveOrder(null);
  }, []);

  return {
    activeOrder,
    recentOrders,
    isLoading,
    saveOrder,
    refreshStatus,
    dismissActiveOrder,
    reloadOrders: loadOrders,
  };
}
