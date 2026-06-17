import { useEffect } from 'react';
import { socket } from '../lib/socket';
import { useAuth } from './useAuth';
import { useNotificationsStore } from '../store/notifications.store';

export function useSocket() {
  const { user, isAuthenticated } = useAuth();
  const { addNotification } = useNotificationsStore();

  useEffect(() => {
    if (!isAuthenticated || !user) {
      if (socket.connected) {
        socket.disconnect();
      }
      return;
    }

    const token = localStorage.getItem('auth_token');
    if (token) {
      socket.auth = { token };
    }
    socket.connect();

    socket.on('connect', () => {
      console.log('🔌 Socket connected successfully');
    });

    socket.on('disconnect', () => {
      console.log('🔌 Socket disconnected');
    });

    socket.on('LOW_STOCK_ALERT', (data: { productId: string; name: string; currentQty: number; safetyLevel: number }) => {
      addNotification({
        type: 'low-stock',
        title: 'Low Stock Alert',
        message: `${data.name} is low on stock: ${data.currentQty} remaining (Safety: ${data.safetyLevel})`,
      });
    });

    socket.on('EXPIRY_ALERT', (data: { productId: string; name: string; batchNo: string; daysToExpiry: number }) => {
      addNotification({
        type: 'expiry',
        title: 'Expiry Alert',
        message: `${data.name} (Batch: ${data.batchNo}) is expiring in ${data.daysToExpiry} days!`,
      });
    });

    socket.on('FORECAST_READY', (data: { generatedAt: Date; productCount: number }) => {
      addNotification({
        type: 'info',
        title: 'Forecasts Ready',
        message: `AI forecasts updated for ${data.productCount} products.`,
      });
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('LOW_STOCK_ALERT');
      socket.off('EXPIRY_ALERT');
      socket.off('FORECAST_READY');
      socket.disconnect();
    };
  }, [user, isAuthenticated, addNotification]);
}
