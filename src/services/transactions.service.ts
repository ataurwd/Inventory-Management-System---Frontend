import api from './api';

export interface TransactionItem {
  _id: string;
  type: 'sale' | 'restock' | 'waste';
  productId: {
    _id: string;
    name: string;
    barcode: string;
    unit: string;
  } | null;
  batchNo: string;
  qty: number;
  unitPrice: number;
  total: number;
  performedBy: {
    _id: string;
    name: string;
    email: string;
  } | null;
  timestamp: string;
}

export interface TransactionMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface TransactionSummary {
  totalRevenue: number;
  totalCost: number;
  netProfit: number;
  transactionCount: number;
}

export const transactionsService = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    type?: string;
    from?: string;
    to?: string;
    search?: string;
  }) => {
    const { data } = await api.get<{ success: boolean; data: TransactionItem[]; meta: TransactionMeta }>(
      '/transactions',
      { params }
    );
    return data;
  },

  getSummary: async (from?: string, to?: string): Promise<TransactionSummary> => {
    const { data } = await api.get<{ success: boolean; data: TransactionSummary }>('/transactions/summary', {
      params: { from, to },
    });
    return data.data;
  },
};
