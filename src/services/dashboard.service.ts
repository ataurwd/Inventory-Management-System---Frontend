import api from './api';

export interface DashboardStats {
  totalProducts: number;
  todayRevenue: number;
  totalLowStockAlerts: number;
  totalExpiryAlerts: number;
  weeklyRevenue: { date: string; revenue: number }[];
}

export interface WasteRiskItem {
  productId: string;
  name: string;
  category: string;
  batchNo: string;
  qty: number;
  costPrice: number;
  expiryDate: string;
  daysRemaining: number;
  estimatedLoss: number;
  suggestion: string;
  risk: 'critical' | 'high' | 'medium';
}

export const dashboardService = {
  getStats: async (): Promise<DashboardStats> => {
    const { data } = await api.get<{ success: boolean; data: DashboardStats }>('/dashboard/stats');
    return data.data;
  },
  getWasteRisk: async (): Promise<WasteRiskItem[]> => {
    const { data } = await api.get<{ success: boolean; data: WasteRiskItem[] }>('/dashboard/waste-risk');
    return data.data;
  },
};
