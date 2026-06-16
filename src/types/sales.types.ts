import { User } from './user.types';

export interface SoldProductBatch {
  batchNo: string;
  qty: number;
  expiryDate: string;
}

export interface SoldProduct {
  productId: string;
  name: string;
  barcode: string;
  qty: number;
  unitPrice: number;
  total: number;
  batches: SoldProductBatch[];
}

export interface Sale {
  _id: string;
  invoiceNumber: string;
  saleDate: string;
  customerName: string;
  customerPhone?: string;
  products: SoldProduct[];
  subtotal: number;
  discount: number;
  tax: number;
  grandTotal: number;
  paidAmount: number;
  dueAmount: number;
  paymentStatus: 'paid' | 'partial' | 'unpaid';
  saleStatus: 'completed' | 'draft' | 'canceled';
  paymentMethod: 'cash' | 'card' | 'bank_transfer' | 'mobile_banking' | 'other';
  notes?: string;
  createdBy: User | { _id: string; name: string; email: string };
  createdAt: string;
  updatedAt: string;
}

export interface CreateSaleDto {
  customerName: string;
  customerPhone?: string;
  products: {
    productId: string;
    name: string;
    barcode: string;
    qty: number;
    unitPrice: number;
  }[];
  discount?: number;
  tax?: number;
  paidAmount?: number;
  saleStatus?: 'completed' | 'draft' | 'canceled';
  paymentMethod?: 'cash' | 'card' | 'bank_transfer' | 'mobile_banking' | 'other';
  notes?: string;
}

export interface UpdateSaleDto extends Partial<CreateSaleDto> {}

export interface SaleMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}
