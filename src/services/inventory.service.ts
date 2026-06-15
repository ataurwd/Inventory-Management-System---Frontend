import api from './api';

export interface ScanSellResponse {
  success: boolean;
  transactions: any[];
  lowStockAlert: boolean;
  product: {
    id: string;
    name: string;
    totalStock: number;
    safetyStockLevel: number;
  };
}

export const inventoryService = {
  scanSell: async (barcode: string, qty: number): Promise<ScanSellResponse> => {
    const { data } = await api.post<{ success: boolean; data: ScanSellResponse }>('/inventory/scan-sell', { barcode, qty });
    return data.data;
  },
  getLowStock: async () => {
    const { data } = await api.get<{ success: boolean; data: any[] }>('/inventory/low-stock');
    return data.data;
  },
  getExpiryAlerts: async () => {
    const { data } = await api.get<{ success: boolean; data: any[] }>('/inventory/expiry-alerts');
    return data.data;
  }
};
