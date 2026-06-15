import api from './api';

export interface CategoryItem {
  _id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  productCount?: number;
}

export const categoriesService = {
  getAll: async (): Promise<CategoryItem[]> => {
    const { data } = await api.get<{ success: boolean; data: CategoryItem[] }>('/categories');
    return data.data;
  },

  create: async (name: string): Promise<CategoryItem> => {
    const { data } = await api.post<{ success: boolean; data: CategoryItem }>('/categories', { name });
    return data.data;
  },

  update: async (id: string, name: string): Promise<CategoryItem> => {
    const { data } = await api.put<{ success: boolean; data: CategoryItem }>(`/categories/${id}`, { name });
    return data.data;
  },

  remove: async (id: string): Promise<{ success: boolean }> => {
    const { data } = await api.delete<{ success: boolean; data: { success: boolean } }>(`/categories/${id}`);
    return data.data;
  },
};
