import api from './api';

export interface RevenueReportItem {
  date: string;
  revenue: number;
  cost: number;
  profit: number;
}

export interface WasteReportItem {
  date: string;
  qty: number;
  loss: number;
}

export interface ReportData {
  revenue: RevenueReportItem[];
  waste: WasteReportItem[];
}

export interface ExpiryAlertItem {
  productId: string;
  productName: string;
  barcode: string;
  batchNo: string;
  qty: number;
  expiryDate: string;
  daysRemaining: number;
}

export const reportsService = {
  getReport: async (params?: {
    from?: string;
    to?: string;
    groupBy?: 'day' | 'week';
  }): Promise<ReportData> => {
    const { data } = await api.get<{ success: boolean; data: ReportData }>('/transactions/report', {
      params,
    });
    return data.data;
  },

  getExpiryAlerts: async (days: number = 30): Promise<ExpiryAlertItem[]> => {
    const { data } = await api.get<{ success: boolean; data: ExpiryAlertItem[] }>('/inventory/expiry-alerts', {
      params: { days },
    });
    return data.data;
  },
};
