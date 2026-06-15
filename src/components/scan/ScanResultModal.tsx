"use client";

import { useState, useEffect } from "react";
import { Product } from "@/types/product.types";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar, Package, Layers, Plus, Minus, Check } from "lucide-react";
import { format } from "date-fns";

interface ScanResultModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product: Product | null;
  mode: "sell" | "restock";
  onConfirmSale: (qty: number) => Promise<void>;
  onConfirmRestock: (batchData: {
    batch_no: string;
    qty: number;
    manufacture_date?: string;
    expiry_date: string;
  }) => Promise<void>;
}

export function ScanResultModal({
  open,
  onOpenChange,
  product,
  mode,
  onConfirmSale,
  onConfirmRestock,
}: ScanResultModalProps) {
  const [qty, setQty] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Restock Form State
  const [batchNo, setBatchNo] = useState("");
  const [restockQty, setRestockQty] = useState(1);
  const [expiryDate, setExpiryDate] = useState("");
  const [mfgDate, setMfgDate] = useState("");
  const [formError, setFormError] = useState("");

  // Reset form when modal opens/changes or product changes
  useEffect(() => {
    if (open) {
      setQty(1);
      setBatchNo("");
      setRestockQty(1);
      setExpiryDate("");
      setMfgDate("");
      setFormError("");
      setSubmitting(false);
    }
  }, [open, product]);

  if (!product) return null;

  // Find next expiry batch
  const activeBatches = product.batches || [];
  const sortedBatches = [...activeBatches].sort(
    (a, b) => new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime()
  );
  const nextExpiryBatch = sortedBatches[0];
  const formattedExpiry = nextExpiryBatch
    ? format(new Date(nextExpiryBatch.expiry_date), "MMM dd, yyyy")
    : "No active batches";

  const handleSaleSubmit = async () => {
    if (qty > product.totalStock) {
      setFormError("Quantity exceeds available stock");
      return;
    }
    setSubmitting(true);
    setFormError("");
    try {
      await onConfirmSale(qty);
      onOpenChange(false);
    } catch (err: any) {
      setFormError(err.response?.data?.error?.message || "Failed to record sale");
    } finally {
      setSubmitting(false);
    }
  };

  const handleRestockSubmit = async () => {
    if (!batchNo.trim()) {
      setFormError("Batch number is required");
      return;
    }
    if (restockQty <= 0) {
      setFormError("Quantity must be greater than 0");
      return;
    }
    if (!expiryDate) {
      setFormError("Expiry date is required");
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const selectedExpiry = new Date(expiryDate);
    if (selectedExpiry <= today) {
      setFormError("Expiry date must be in the future");
      return;
    }

    setSubmitting(true);
    setFormError("");

    try {
      await onConfirmRestock({
        batch_no: batchNo.trim(),
        qty: restockQty,
        expiry_date: expiryDate,
        manufacture_date: mfgDate || undefined,
      });
      onOpenChange(false);
    } catch (err: any) {
      setFormError(err.response?.data?.error?.message || "Failed to add restock batch");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant={mode === "sell" ? "default" : "secondary"}>
              {mode === "sell" ? "FIFO Sale" : "Restock Batch"}
            </Badge>
            <span className="text-xs text-muted-foreground font-mono">
              {product.barcode}
            </span>
          </div>
          <DialogTitle className="text-lg font-bold">{product.name}</DialogTitle>
          <DialogDescription>
            Manage inventory level for this scanned item.
          </DialogDescription>
        </DialogHeader>

        {/* Product Details Section */}
        <div className="grid grid-cols-2 gap-3 p-3 bg-muted/40 rounded-xl border text-xs">
          <div className="space-y-1">
            <span className="text-muted-foreground block">Category</span>
            <span className="font-semibold text-foreground flex items-center gap-1">
              <Package className="h-3.5 w-3.5 text-muted-foreground" />
              {product.category}
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-muted-foreground block">Stock Level</span>
            <span className="font-semibold text-foreground flex items-center gap-1">
              <Layers className="h-3.5 w-3.5 text-muted-foreground" />
              {product.totalStock} {product.unit}
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-muted-foreground block">Selling Price</span>
            <span className="font-semibold text-foreground">
              ${product.sellingPrice.toFixed(2)}
            </span>
          </div>
          <div className="space-y-1">
            <span className="text-muted-foreground block">Next Expiry</span>
            <span className="font-semibold text-foreground flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              {formattedExpiry}
            </span>
          </div>
        </div>

        {formError && (
          <div className="p-2.5 text-xs text-destructive bg-destructive/10 border border-destructive/20 rounded-lg text-center">
            {formError}
          </div>
        )}

        {/* Dynamic Mode Forms */}
        {mode === "sell" ? (
          <div className="space-y-4 py-2">
            <div className="flex flex-col items-center justify-center space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                Quantity to Sell ({product.unit})
              </label>
              <div className="flex items-center gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                  disabled={qty <= 1}
                  onClick={() => setQty(qty - 1)}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="text-2xl font-bold w-12 text-center">{qty}</span>
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-full"
                  disabled={qty >= product.totalStock}
                  onClick={() => setQty(qty + 1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="flex justify-between items-center border-t pt-3">
              <span className="text-sm font-medium text-muted-foreground">
                Total Selling Value
              </span>
              <span className="text-xl font-bold text-primary">
                ${(qty * product.sellingPrice).toFixed(2)}
              </span>
            </div>
          </div>
        ) : (
          <div className="space-y-3 py-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Batch Number
                </label>
                <Input
                  placeholder="e.g. B-01"
                  value={batchNo}
                  onChange={(e) => setBatchNo(e.target.value)}
                  className="h-8 text-xs animate-in fade-in"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Quantity ({product.unit})
                </label>
                <Input
                  type="number"
                  min="1"
                  value={restockQty}
                  onChange={(e) => setRestockQty(parseInt(e.target.value) || 1)}
                  className="h-8 text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Manufacture Date
                </label>
                <Input
                  type="date"
                  value={mfgDate}
                  onChange={(e) => setMfgDate(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-muted-foreground">
                  Expiry Date
                </label>
                <Input
                  type="date"
                  value={expiryDate}
                  onChange={(e) => setExpiryDate(e.target.value)}
                  className="h-8 text-xs"
                />
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="mt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="h-8 text-xs"
            disabled={submitting}
          >
            Cancel
          </Button>
          {mode === "sell" ? (
            <Button
              onClick={handleSaleSubmit}
              isLoading={submitting}
              className="h-8 text-xs bg-primary"
              disabled={product.totalStock === 0}
            >
              <Check className="h-3.5 w-3.5 mr-1" />
              Confirm Sale
            </Button>
          ) : (
            <Button
              onClick={handleRestockSubmit}
              isLoading={submitting}
              className="h-8 text-xs"
            >
              <Plus className="h-3.5 w-3.5 mr-1" />
              Add Stock Batch
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
