import api from './api';

export interface WasteRiskItem {
  batch_no: string;
  qty: number;
  expiry_date: string;
  risk_level: 'High' | 'Medium' | 'Low';
}

export interface Forecast {
  _id: string;
  productId: {
    _id: string;
    name: string;
    barcode: string;
    unit: string;
    category: string;
  } | string;
  generatedAt: string;
  predictedDemand: number;
  currentStock: number;
  confidence: number;
  recommendedOrderQty: number;
  wasteRiskItems: WasteRiskItem[];
}

export const forecastsService = {
  getAll: async (): Promise<Forecast[]> => {
    const { data } = await api.get('/forecasts');
    return data.data.forecasts;
  },

  getByProduct: async (productId: string): Promise<Forecast | null> => {
    const { data } = await api.get(`/forecasts/${productId}`);
    return data.data.forecast;
  },

  triggerManual: async (): Promise<{ message: string }> => {
    const { data } = await api.post('/forecasts/trigger');
    return data.data;
  },
};
