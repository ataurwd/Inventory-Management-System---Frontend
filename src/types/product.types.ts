export interface Batch {
  batch_no: string;
  qty: number;
  manufacture_date?: string; // ISO date string
  expiry_date: string; // ISO date string
}

export interface Product {
  id: string;
  _id: string;
  name: string;
  barcode: string;
  category: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  safetyStockLevel: number;
  supplierId: {
    _id: string;
    name: string;
  } | string | null;
  batches: Batch[];
  totalStock: number; // dynamic total stock count from backend
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateProductDto {
  name: string;
  barcode: string;
  category: string;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  safetyStockLevel?: number;
  supplierId?: string | null;
  batches?: Batch[];
}

export type UpdateProductDto = Partial<CreateProductDto>;
