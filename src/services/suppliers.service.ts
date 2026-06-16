import api from './api';

export interface SupplierItem {
  _id: string;
  name: string;
  contactEmail?: string;
  phone?: string;
  address?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSupplierDto {
  name: string;
  contactEmail?: string;
  phone?: string;
  address?: string;
}

export const suppliersService = {
  getAll: async (): Promise<SupplierItem[]> => {
    const { data } = await api.get<{ success: boolean; data: SupplierItem[] }>('/suppliers');
    return data.data;
  },

  getById: async (id: string): Promise<SupplierItem> => {
    const { data } = await api.get<{ success: boolean; data: SupplierItem }>(`/suppliers/${id}`);
    return data.data;
  },

  create: async (payload: CreateSupplierDto): Promise<SupplierItem> => {
    const { data } = await api.post<{ success: boolean; data: SupplierItem }>('/suppliers', payload);
    return data.data;
  },

  update: async (id: string, payload: Partial<CreateSupplierDto>): Promise<SupplierItem> => {
    const { data } = await api.put<{ success: boolean; data: SupplierItem }>(`/suppliers/${id}`, payload);
    return data.data;
  },

  remove: async (id: string): Promise<void> => {
    await api.delete(`/suppliers/${id}`);
  },
};
