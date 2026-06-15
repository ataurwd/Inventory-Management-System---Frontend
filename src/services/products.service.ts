import api from './api';
import { Product, CreateProductDto, UpdateProductDto } from '@/types/product.types';

export interface AddBatchDto {
  batch_no: string;
  qty: number;
  manufacture_date?: string;
  expiry_date: string;
}

export interface UpdateBatchDto {
  qty?: number;
  expiry_date?: string;
}

export const productsService = {
  getAll: async (filters?: { search?: string; category?: string }) => {
    const { data } = await api.get<{ success: boolean; data: Product[] }>('/products', { params: filters });
    return data.data;
  },

  getById: async (id: string) => {
    const { data } = await api.get<{ success: boolean; data: Product }>(`/products/${id}`);
    return data.data;
  },

  getByBarcode: async (barcode: string) => {
    const { data } = await api.get<{ success: boolean; data: Product }>(`/products/barcode/${barcode}`);
    return data.data;
  },

  create: async (productData: CreateProductDto) => {
    const { data } = await api.post<{ success: boolean; data: Product }>('/products', productData);
    return data.data;
  },

  update: async (id: string, productData: UpdateProductDto) => {
    const { data } = await api.put<{ success: boolean; data: Product }>(`/products/${id}`, productData);
    return data.data;
  },

  remove: async (id: string) => {
    const { data } = await api.delete<{ success: boolean; data: { message: string } }>(`/products/${id}`);
    return data.data;
  },

  // ─── Batch Operations ────────────────────────────────────────────
  addBatch: async (productId: string, batchData: AddBatchDto) => {
    const { data } = await api.post<{ success: boolean; data: Product }>(`/products/${productId}/batches`, batchData);
    return data.data;
  },

  updateBatch: async (productId: string, batchNo: string, updates: UpdateBatchDto) => {
    const { data } = await api.put<{ success: boolean; data: Product }>(`/products/${productId}/batches/${batchNo}`, updates);
    return data.data;
  },

  removeBatch: async (productId: string, batchNo: string) => {
    const { data } = await api.delete<{ success: boolean; data: Product }>(`/products/${productId}/batches/${batchNo}`);
    return data.data;
  },
};

