import api from './api';
import { Sale, CreateSaleDto, UpdateSaleDto, SaleMeta } from '@/types/sales.types';

export const salesService = {
  getAll: async (params?: {
    page?: number;
    limit?: number;
    invoiceNumber?: string;
    customer?: string;
    paymentStatus?: string;
    saleStatus?: string;
    createdBy?: string;
    from?: string;
    to?: string;
    product?: string;
  }) => {
    const { data } = await api.get<{ success: boolean; data: { sales: Sale[]; meta: SaleMeta } }>('/sales', {
      params,
    });
    return data.data;
  },

  getById: async (id: string): Promise<Sale> => {
    const { data } = await api.get<{ success: boolean; data: Sale }>(`/sales/${id}`);
    return data.data;
  },

  create: async (saleData: CreateSaleDto): Promise<Sale> => {
    const { data } = await api.post<{ success: boolean; data: Sale }>('/sales', saleData);
    return data.data;
  },

  update: async (id: string, saleData: UpdateSaleDto): Promise<Sale> => {
    const { data } = await api.put<{ success: boolean; data: Sale }>(`/sales/${id}`, saleData);
    return data.data;
  },

  remove: async (id: string): Promise<{ success: boolean; message: string }> => {
    const { data } = await api.delete<{ success: boolean; data: { success: boolean; message: string } }>(
      `/sales/${id}`
    );
    return data.data;
  },
};
