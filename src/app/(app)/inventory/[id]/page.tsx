"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import useSWR from "swr";
import { productsService } from "@/services/products.service";
import { Product } from "@/types/product.types";
import PageHeader from "@/components/layout/PageHeader";
import BatchList from "@/components/inventory/BatchList";
import BatchForm from "@/components/inventory/BatchForm";
import ExpiryTimeline from "@/components/inventory/ExpiryTimeline";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Package,
  DollarSign,
  ShieldCheck,
  Layers,
  BarChart3,
  Plus,
  ArrowLeft,
  Download,
} from "lucide-react";
import axios from "axios";
import QRCode from "qrcode";
import { useAuth } from "@/hooks/useAuth";
import ProductForm from "@/components/inventory/ProductForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const productId = params.id as string;
  const [batchFormOpen, setBatchFormOpen] = useState(false);
  const [editFormOpen, setEditFormOpen] = useState(false);
  const { role } = useAuth();
  const canEdit = role === "admin" || role === "manager";
  const searchParams = useSearchParams();
  const shouldEditOnMount = searchParams.get("edit") === "true";
  const [qrCodeUrl, setQrCodeUrl] = useState<string>("");

  useEffect(() => {
    if (shouldEditOnMount && canEdit) {
      setEditFormOpen(true);
      // Clean up the URL query param so it doesn't reopen if the user closes it and refreshes or navigates back
      const newUrl = window.location.pathname;
      window.history.replaceState({ ...window.history.state, as: newUrl, url: newUrl }, "", newUrl);
    }
  }, [shouldEditOnMount, canEdit]);

  const fetcher = async () => {
    return productsService.getById(productId);
  };

  const { data: product, error, isLoading, mutate } = useSWR<Product>(
    productId ? `/products/${productId}` : null,
    fetcher
  );

  useEffect(() => {
    if (product?.barcode) {
      QRCode.toDataURL(product.barcode, { width: 300, margin: 2 })
        .then((url) => setQrCodeUrl(url))
        .catch((err) => console.error("Error generating QR code", err));
    }
  }, [product?.barcode]);

  const handleAddBatch = async (batchData: {
    batch_no: string;
    qty: number;
    manufacture_date?: string;
    expiry_date: string;
  }) => {
    try {
      await productsService.addBatch(productId, batchData);
      toast.success(`Batch ${batchData.batch_no} added successfully`);
      mutate();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        if (err.response?.status === 409) {
          toast.error("Batch number already exists for this product");
        } else {
          const apiErr = err.response?.data as { error?: { message?: string } } | undefined;
          toast.error(apiErr?.error?.message || "Failed to add batch");
        }
      } else {
        toast.error("Failed to add batch");
      }
      throw err; // re-throw so the form stays open
    }
  };

  const handleRemoveBatch = async (batchNo: string) => {
    try {
      await productsService.removeBatch(productId, batchNo);
      toast.success(`Batch ${batchNo} removed successfully`);
      mutate();
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        const apiErr = err.response?.data as { error?: { message?: string } } | undefined;
        toast.error(apiErr?.error?.message || "Failed to remove batch");
      } else {
        toast.error("Failed to remove batch");
      }
    }
  };

  const getStockStatus = (stock: number, safety: number) => {
    if (stock < safety) return { variant: "critical" as const, label: "Critical" };
    if (stock < safety * 1.5) return { variant: "warning" as const, label: "Warning" };
    return { variant: "safe" as const, label: "Safe" };
  };

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Inventory", href: "/inventory" },
    { label: product?.name || "Product Detail" },
  ];

  if (error) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <div className="flex flex-col items-center justify-center p-16 border border-dashed rounded-2xl bg-card/50 text-center space-y-4">
          <div className="p-3 bg-destructive/10 rounded-full text-destructive">
            <Package className="h-8 w-8" />
          </div>
          <h3 className="font-semibold text-lg">Product not found</h3>
          <p className="text-sm text-muted-foreground">
            The product you&apos;re looking for doesn&apos;t exist or has been removed.
          </p>
          <Button variant="outline" onClick={() => router.push("/inventory")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Inventory
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading || !product) {
    return (
      <div className="p-8 max-w-5xl mx-auto space-y-6 animate-fade-in">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-28 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  const status = getStockStatus(product.totalStock, product.safetyStockLevel);

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-fade-in">
      <PageHeader
        title={product.name}
        breadcrumbs={breadcrumbs}
        action={
          canEdit
            ? {
                label: "Edit Product",
                onClick: () => setEditFormOpen(true),
              }
            : undefined
        }
      />

      {/* ─── Product Info Cards ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Stock */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground font-medium">Total Stock</span>
            <div className="p-2 bg-primary/10 rounded-lg text-primary">
              <Layers className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{product.totalStock}</span>
            <span className="text-xs text-muted-foreground">{product.unit}</span>
          </div>
          <Badge variant={status.variant}>{status.label}</Badge>
        </div>

        {/* Safety Level */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground font-medium">Min Stock</span>
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold">{product.safetyStockLevel}</span>
            <span className="text-xs text-muted-foreground">{product.unit}</span>
          </div>
        </div>

        {/* Cost Price */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground font-medium">Cost Price</span>
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
              <DollarSign className="h-4 w-4" />
            </div>
          </div>
          <span className="text-2xl font-bold">${product.costPrice.toFixed(2)}</span>
        </div>

        {/* Selling Price */}
        <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground font-medium">Selling Price</span>
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
              <BarChart3 className="h-4 w-4" />
            </div>
          </div>
          <span className="text-2xl font-bold">${product.sellingPrice.toFixed(2)}</span>
        </div>
      </div>

      {/* ─── Product Metadata & QR Code ─────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
        {/* Metadata Details */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm md:col-span-2 flex flex-col justify-between">
          <div className="grid grid-cols-2 gap-6 text-sm">
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Barcode</span>
              <p className="font-mono text-base font-semibold text-foreground mt-0.5">{product.barcode}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Brand</span>
              <p className="text-base font-semibold text-foreground mt-0.5">{product.brand || "N/A"}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Category</span>
              <p className="text-base font-semibold text-foreground mt-0.5">{product.category}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Unit</span>
              <p className="text-base font-semibold text-foreground mt-0.5">{product.unit}</p>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Active Batches</span>
              <p className="text-base font-semibold text-foreground mt-0.5">{product.batches.length} tracked</p>
            </div>
          </div>
        </div>

        {/* QR Code Card */}
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm flex flex-col items-center justify-between space-y-4">
          <div className="flex flex-col items-center space-y-2">
            <span className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Product Barcode QR</span>
            {qrCodeUrl ? (
              <img
                src={qrCodeUrl}
                alt="Product QR Code"
                className="w-28 h-28 rounded-lg border bg-white p-1.5 shadow-xs transition-transform hover:scale-105 duration-200"
              />
            ) : (
              <div className="w-28 h-28 rounded-lg border bg-muted animate-pulse" />
            )}
            <span className="font-mono text-xs font-semibold text-muted-foreground">{product.barcode}</span>
          </div>
          
          {qrCodeUrl && (
            <a
              href={qrCodeUrl}
              download={`${product.name.replace(/\s+/g, "_")}_qr_${product.barcode}.png`}
              className="w-full"
            >
              <Button variant="outline" size="sm" className="w-full gap-2">
                <Download className="h-4 w-4" />
                Download QR
              </Button>
            </a>
          )}
        </div>
      </div>

      {/* ─── Batch Management Section ────────────────────────────────── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Stock Batches</h2>
          <Button onClick={() => setBatchFormOpen(true)}>
            <Plus className="h-4 w-4 mr-1.5" />
            Add Batch
          </Button>
        </div>

        <BatchList
          batches={product.batches}
          productName={product.name}
          onRemove={handleRemoveBatch}
        />
      </div>

      {/* ─── Expiry Timeline ─────────────────────────────────────────── */}
      {product.batches.length > 0 && (
        <div className="bg-card border border-border rounded-xl p-6 shadow-sm">
          <ExpiryTimeline batches={product.batches} />
        </div>
      )}

      {/* ─── Batch Form Modal ────────────────────────────────────────── */}
      <BatchForm
        open={batchFormOpen}
        onOpenChange={setBatchFormOpen}
        onSubmit={handleAddBatch}
      />

      {/* ─── Edit Product Form Modal ─────────────────────────────────── */}
      {canEdit && (
        <Dialog open={editFormOpen} onOpenChange={setEditFormOpen}>
          <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Product Details</DialogTitle>
            </DialogHeader>
            <div className="pt-2">
              <ProductForm
                productToEdit={product}
                onSuccess={() => {
                  setEditFormOpen(false);
                  mutate();
                }}
                onCancel={() => setEditFormOpen(false)}
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
