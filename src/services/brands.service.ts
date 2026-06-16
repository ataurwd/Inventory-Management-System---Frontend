import api from './api';

export interface BrandItem {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  productCount?: number;
}

export const brandsService = {
  getAll: async (): Promise<BrandItem[]> => {
    const { data } = await api.get<{ success: boolean; data: BrandItem[] }>('/brands');
    return data.data;
  },

  create: async (name: string): Promise<BrandItem> => {
    const { data } = await api.post<{ success: boolean; data: BrandItem }>('/brands', { name });
    return data.data;
  },

  update: async (id: string, name: string): Promise<BrandItem> => {
    const { data } = await api.put<{ success: boolean; data: BrandItem }>(`/brands/${id}`, { name });
    return data.data;
  },

  remove: async (id: string): Promise<{ success: boolean }> => {
    const { data } = await api.delete<{ success: boolean; data: { success: boolean } }>(`/brands/${id}`);
    return data.data;
  },
};
