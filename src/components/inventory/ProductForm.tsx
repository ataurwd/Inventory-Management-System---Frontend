"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { productsService } from "@/services/products.service";
import { categoriesService } from "@/services/categories.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import useSWR from "swr";
import { toast } from "sonner";
import { useState, useEffect } from "react";
import axios from "axios";
import Link from "next/link";

import { Product, Batch } from "@/types/product.types";

const productSchema = z
  .object({
    name: z.string().min(1, "Product name is required"),
    barcode: z.string().min(8, "Barcode must be at least 8 characters"),
    category: z.string().min(1, "Category is required"),
    unit: z.string().min(1, "Unit is required"),
    costPrice: z.number({ message: "Cost price is required and must be a number" }).nonnegative("Cost price cannot be negative"),
    sellingPrice: z.number({ message: "Selling price is required and must be a number" }).nonnegative("Selling price cannot be negative"),
    safetyStockLevel: z.number({ message: "Safety stock level must be a number" }).nonnegative("Safety stock level cannot be negative"),
    initialStock: z.union([z.number(), z.nan()]).optional(),
    expiryDate: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.initialStock !== undefined && !Number.isNaN(data.initialStock)) {
        return data.initialStock >= 0;
      }
      return true;
    },
    {
      message: "Initial stock cannot be negative",
      path: ["initialStock"],
    }
  )
  .refine(
    (data) => {
      const hasStock = data.initialStock !== undefined && !Number.isNaN(data.initialStock) && data.initialStock > 0;
      if (hasStock) {
        return !!data.expiryDate && data.expiryDate.trim() !== "";
      }
      return true;
    },
    {
      message: "Expiry date is required when initial stock is specified",
      path: ["expiryDate"],
    }
  )
  .refine(
    (data) => {
      if (!data.expiryDate || data.expiryDate.trim() === "") return true;
      const expiry = new Date(data.expiryDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return expiry > today;
    },
    {
      message: "Expiry date must be in the future",
      path: ["expiryDate"],
    }
  );

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormProps {
  onSuccess: (newProduct?: Product) => void;
  onCancel?: () => void;
  productToEdit?: Product;
}

const generate8LetterBarcode = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let barcode = "";
  for (let i = 0; i < 8; i++) {
    barcode += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return barcode;
};

const formatDateForInput = (dateStr?: string | Date): string => {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().split("T")[0];
};

export default function ProductForm({ onSuccess, onCancel, productToEdit }: ProductFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  // Fetch categories list dynamically from database
  const { data: categoriesData } = useSWR(
    "/categories",
    () => categoriesService.getAll()
  );

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    reset,
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: productToEdit?.name || "",
      barcode: productToEdit?.barcode || "",
      category: productToEdit?.category || "",
      unit: productToEdit?.unit || "pcs",
      costPrice: productToEdit?.costPrice,
      sellingPrice: productToEdit?.sellingPrice,
      safetyStockLevel: productToEdit?.safetyStockLevel ?? 0,
      initialStock: productToEdit
        ? productToEdit.batches.length === 1
          ? productToEdit.batches[0].qty
          : productToEdit.totalStock
        : undefined,
      expiryDate: productToEdit
        ? productToEdit.batches.length === 1
          ? formatDateForInput(productToEdit.batches[0].expiry_date)
          : ""
        : "",
    },
  });

  // Automatically pre-populate form on component mount/update
  useEffect(() => {
    if (productToEdit) {
      reset({
        name: productToEdit.name,
        barcode: productToEdit.barcode,
        category: productToEdit.category,
        unit: productToEdit.unit,
        costPrice: productToEdit.costPrice,
        sellingPrice: productToEdit.sellingPrice,
        safetyStockLevel: productToEdit.safetyStockLevel,
        initialStock: productToEdit.batches.length === 1
          ? productToEdit.batches[0].qty
          : productToEdit.totalStock,
        expiryDate: productToEdit.batches.length === 1
          ? formatDateForInput(productToEdit.batches[0].expiry_date)
          : "",
      });
    } else {
      setValue("barcode", generate8LetterBarcode());
    }
  }, [productToEdit, setValue, reset]);

  const onSubmit = async (data: ProductFormValues) => {
    setIsLoading(true);
    try {
      if (productToEdit) {
        const { initialStock, expiryDate, ...updateData } = data;
        
        // Handle batches updating during edit
        const qty = initialStock !== undefined && !Number.isNaN(initialStock) ? initialStock : 0;
        let updatedBatches = [...productToEdit.batches];
        
        if (productToEdit.batches.length === 0) {
          if (qty > 0 && expiryDate) {
            const batchNo = `B-INIT-${generate8LetterBarcode()}`;
            updatedBatches.push({
              batch_no: batchNo,
              qty,
              expiry_date: new Date(expiryDate).toISOString(),
            });
          }
        } else if (productToEdit.batches.length === 1) {
          if (qty > 0) {
            updatedBatches[0] = {
              ...updatedBatches[0],
              qty,
              expiry_date: expiryDate ? new Date(expiryDate).toISOString() : updatedBatches[0].expiry_date,
            };
          } else {
            // If quantity is set to 0, we can remove the batch
            updatedBatches = [];
          }
        }
        
        await productsService.update(productToEdit._id, {
          ...updateData,
          batches: updatedBatches,
        });
        toast.success("Product updated successfully");
      } else {
        const { initialStock, expiryDate, ...createData } = data;
        const qty = initialStock !== undefined && !Number.isNaN(initialStock) ? initialStock : 0;
        const batches: Batch[] = [];
        if (qty > 0 && expiryDate) {
          const batchNo = `B-INIT-${generate8LetterBarcode()}`;
          batches.push({
            batch_no: batchNo,
            qty,
            expiry_date: new Date(expiryDate).toISOString(),
          });
        }
        const createdProduct = await productsService.create({
          ...createData,
          batches,
        });
        toast.success("Product created successfully");
        onSuccess(createdProduct);
        return;
      }
      onSuccess();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 409) {
          toast.error("Product with this barcode already exists");
        } else {
          const apiErrorData = error.response?.data as { error?: { message?: string } } | undefined;
          toast.error(apiErrorData?.error?.message || `Failed to ${productToEdit ? 'update' : 'create'} product`);
        }
      } else {
        toast.error(`Failed to ${productToEdit ? 'update' : 'create'} product`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const categories = categoriesData?.map((cat) => cat.name) || [];

  const formClassName = productToEdit
    ? "space-y-6 w-full"
    : "space-y-6 max-w-2xl bg-card border border-border p-8 rounded-2xl shadow-xl";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={formClassName}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Name */}
        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="name">Product Name</Label>
          <Input id="name" placeholder="e.g. Milk Powder 1kg" {...register("name")} />
          {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
        </div>

        {/* Barcode */}
        <div className="space-y-2">
          <Label htmlFor="barcode">Barcode</Label>
          <div className="flex gap-2">
            <Input id="barcode" placeholder="e.g. ABCDEFGH" {...register("barcode")} className="flex-1" />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const code = generate8LetterBarcode();
                setValue("barcode", code, { shouldValidate: true });
                toast.success(`Generated barcode: ${code}`);
              }}
              className="h-9 whitespace-nowrap cursor-pointer"
            >
              Generate
            </Button>
          </div>
          {errors.barcode && <p className="text-xs text-destructive">{errors.barcode.message}</p>}
        </div>

        {/* Unit */}
        <div className="space-y-2">
          <Label htmlFor="unit">Unit</Label>
          <Input id="unit" placeholder="e.g. pcs, kg, bag" {...register("unit")} />
          {errors.unit && <p className="text-xs text-destructive">{errors.unit.message}</p>}
        </div>

        {/* Category */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <Label htmlFor="category">Category</Label>
            <Link
              href="/inventory/categories"
              className="text-xs text-primary hover:underline cursor-pointer"
            >
              Manage list
            </Link>
          </div>

          <select
            id="category"
            className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
            {...register("category")}
          >
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          {errors.category && <p className="text-xs text-destructive">{errors.category.message}</p>}
        </div>

        {/* Safety Stock Level */}
        <div className="space-y-2">
          <Label htmlFor="safetyStockLevel">Safety Stock Level</Label>
          <Input id="safetyStockLevel" type="number" {...register("safetyStockLevel", { valueAsNumber: true })} />
          {errors.safetyStockLevel && <p className="text-xs text-destructive">{errors.safetyStockLevel.message}</p>}
        </div>

        {/* Cost Price */}
        <div className="space-y-2">
          <Label htmlFor="costPrice">Cost Price ($)</Label>
          <Input id="costPrice" type="number" step="0.01" placeholder="0.00" {...register("costPrice", { valueAsNumber: true })} />
          {errors.costPrice && <p className="text-xs text-destructive">{errors.costPrice.message}</p>}
        </div>

        {/* Selling Price */}
        <div className="space-y-2">
          <Label htmlFor="sellingPrice">Selling Price ($)</Label>
          <Input id="sellingPrice" type="number" step="0.01" placeholder="0.00" {...register("sellingPrice", { valueAsNumber: true })} />
          {errors.sellingPrice && <p className="text-xs text-destructive">{errors.sellingPrice.message}</p>}
        </div>

        {/* Stock Quantity & Expiry Date (shown for new products or edit of products with <= 1 batch) */}
        {(!productToEdit || productToEdit.batches.length <= 1) ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="initialStock">
                {productToEdit ? "Stock Quantity" : "Initial Stock Quantity"}
              </Label>
              <Input
                id="initialStock"
                type="number"
                placeholder={productToEdit ? "0" : "e.g. 100 (optional)"}
                {...register("initialStock", { valueAsNumber: true })}
              />
              {errors.initialStock && <p className="text-xs text-destructive">{errors.initialStock.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="expiryDate">Expiry Date</Label>
              <Input
                id="expiryDate"
                type="date"
                {...register("expiryDate")}
              />
              {errors.expiryDate && <p className="text-xs text-destructive">{errors.expiryDate.message}</p>}
            </div>
          </>
        ) : (
          /* When there are multiple batches, display total stock as read-only and show a helper message */
          <div className="md:col-span-2 p-4 bg-muted/40 border rounded-xl space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground font-medium">Total Stock (Read-Only)</span>
                <p className="text-sm font-bold text-foreground">{productToEdit.totalStock} {productToEdit.unit}</p>
              </div>
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground font-medium">Expiry Date</span>
                <p className="text-xs text-muted-foreground italic">Multiple batches tracking</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              ℹ️ This product has multiple batches. Please manage stock quantities and expiry dates individually from the product details page.
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-4 pt-4 border-t border-border">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel} className="w-full md:w-auto">
            Cancel
          </Button>
        )}
        <Button type="submit" isLoading={isLoading} className="w-full md:w-auto">
          {productToEdit ? "Save Changes" : "Create Product"}
        </Button>
      </div>
    </form>
  );
}
