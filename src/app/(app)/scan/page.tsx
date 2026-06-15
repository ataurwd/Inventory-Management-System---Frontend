"use client";

import { useState } from "react";
import PageHeader from "@/components/layout/PageHeader";
import { BarcodeScanner } from "@/components/scan/BarcodeScanner";
import { ScanResultModal } from "@/components/scan/ScanResultModal";
import { productsService } from "@/services/products.service";
import { inventoryService } from "@/services/inventory.service";
import { Product } from "@/types/product.types";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Camera, CameraOff, History, ShoppingCart, PlusCircle, AlertCircle, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import axios from "axios";

interface ScannedItem {
  id: string;
  timestamp: Date;
  barcode: string;
  productName?: string;
  status: "success" | "failed";
  mode: "sell" | "restock";
  errorMsg?: string;
  qty?: number;
}

export default function ScanPage() {
  const [mode, setMode] = useState<"sell" | "restock">("sell");
  const [scannerActive, setScannerActive] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [scannedProduct, setScannedProduct] = useState<Product | null>(null);
  const [history, setHistory] = useState<ScannedItem[]>([]);
  const [lastScannedBarcode, setLastScannedBarcode] = useState<string | null>(null);

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Scan to Transaction" },
  ];

  const handleScan = async (barcode: string) => {
    // Prevent scanning the same barcode repeatedly in a short time
    if (barcode === lastScannedBarcode && modalOpen) {
      return;
    }

    setLastScannedBarcode(barcode);
    setScannerActive(false); // Pause scanner while fetching/displaying

    try {
      const product = await productsService.getByBarcode(barcode);
      setScannedProduct(product);
      setModalOpen(true);
    } catch (err: unknown) {
      console.error(err);
      let errorMsg = "Product not found";
      if (axios.isAxiosError(err) && err.response?.data?.error?.message) {
        errorMsg = err.response.data.error.message;
      }
      
      toast.error(`${errorMsg}: ${barcode}`);
      
      // Add failed scan to history
      const newHistoryItem: ScannedItem = {
        id: Math.random().toString(),
        timestamp: new Date(),
        barcode,
        status: "failed",
        mode,
        errorMsg,
      };
      setHistory((prev) => [newHistoryItem, ...prev].slice(0, 5));
      setScannerActive(true); // Resume scanning
    }
  };

  const handleConfirmSale = async (qty: number) => {
    if (!scannedProduct) return;
    try {
      const res = await inventoryService.scanSell(scannedProduct.barcode, qty);
      toast.success(`Sold ${qty} units of ${scannedProduct.name}`);
      
      if (res.lowStockAlert) {
        toast.warning(`Low stock alert: ${scannedProduct.name} is now below safety stock level!`);
      }

      // Add success to history
      const newHistoryItem: ScannedItem = {
        id: Math.random().toString(),
        timestamp: new Date(),
        barcode: scannedProduct.barcode,
        productName: scannedProduct.name,
        status: "success",
        mode: "sell",
        qty,
      };
      setHistory((prev) => [newHistoryItem, ...prev].slice(0, 5));
      setModalOpen(false);
      setScannerActive(true);
    } catch (err: unknown) {
      console.error(err);
      let errorMsg = "Failed to record sale";
      if (axios.isAxiosError(err) && err.response?.data?.error?.message) {
        errorMsg = err.response.data.error.message;
      }
      toast.error(errorMsg);
      // Let modal handle display of error
      throw err;
    }
  };

  const handleConfirmRestock = async (batchData: {
    batch_no: string;
    qty: number;
    manufacture_date?: string;
    expiry_date: string;
  }) => {
    if (!scannedProduct) return;
    try {
      await productsService.addBatch(scannedProduct.id || scannedProduct._id, batchData);
      toast.success(`Restocked ${batchData.qty} units of ${scannedProduct.name} (Batch: ${batchData.batch_no})`);

      // Add success to history
      const newHistoryItem: ScannedItem = {
        id: Math.random().toString(),
        timestamp: new Date(),
        barcode: scannedProduct.barcode,
        productName: scannedProduct.name,
        status: "success",
        mode: "restock",
        qty: batchData.qty,
      };
      setHistory((prev) => [newHistoryItem, ...prev].slice(0, 5));
      setModalOpen(false);
      setScannerActive(true);
    } catch (err: unknown) {
      console.error(err);
      // Let modal handle error display
      throw err;
    }
  };

  const handleCloseModal = (open: boolean) => {
    setModalOpen(open);
    if (!open) {
      setScannerActive(true); // Restart scanner when modal closes
      setLastScannedBarcode(null);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-fade-in">
      <PageHeader title="Scan to Transaction" breadcrumbs={breadcrumbs} />

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Scanner Card */}
        <Card className="md:col-span-7 border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Camera className="h-5 w-5 text-primary" />
              Camera Scanner
            </CardTitle>
            <CardDescription>
              Toggle mode, and align a barcode to trigger sale or restock.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Mode Selector */}
            <div className="flex gap-2 p-1 bg-muted rounded-xl border">
              <Button
                variant={mode === "sell" ? "default" : "ghost"}
                className={`flex-1 h-9 rounded-lg gap-2 text-xs transition-all ${
                  mode === "sell"
                    ? "bg-background text-foreground shadow-sm hover:bg-background border-border"
                    : "text-muted-foreground hover:bg-transparent"
                }`}
                onClick={() => setMode("sell")}
              >
                <ShoppingCart className="h-4 w-4" />
                Deduct Stock (Sale)
              </Button>
              <Button
                variant={mode === "restock" ? "default" : "ghost"}
                className={`flex-1 h-9 rounded-lg gap-2 text-xs transition-all ${
                  mode === "restock"
                    ? "bg-background text-foreground shadow-sm hover:bg-background border-border"
                    : "text-muted-foreground hover:bg-transparent"
                }`}
                onClick={() => setMode("restock")}
              >
                <PlusCircle className="h-4 w-4" />
                Add Stock (Restock)
              </Button>
            </div>

            {/* Scanner Viewport */}
            <div className="w-full flex justify-center">
              {scannerActive ? (
                <BarcodeScanner onScanSuccess={handleScan} />
              ) : (
                <div className="flex flex-col items-center justify-center border border-dashed rounded-xl w-full max-w-md aspect-square bg-muted/10 p-8 text-center space-y-4">
                  <div className="p-4 bg-muted/40 rounded-full text-muted-foreground">
                    <CameraOff className="h-8 w-8" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-semibold text-sm">Scanner Paused</h4>
                    <p className="text-xs text-muted-foreground max-w-[240px] mx-auto">
                      {modalOpen
                        ? "Confirm or cancel the current transaction to resume."
                        : "Click the button below to reactivate scanner."}
                    </p>
                  </div>
                  {!modalOpen && (
                    <Button onClick={() => setScannerActive(true)} size="sm">
                      Reactivate Camera
                    </Button>
                  )}
                </div>
              )}
            </div>

            {scannerActive && (
              <div className="flex justify-center">
                <Button
                  variant="outline"
                  onClick={() => setScannerActive(false)}
                  className="h-8 text-xs text-destructive hover:bg-destructive/5"
                >
                  <CameraOff className="h-3.5 w-3.5 mr-1" />
                  Stop Scanner
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* History Card */}
        <Card className="md:col-span-5 border-border shadow-sm">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <History className="h-5 w-5 text-primary" />
              Scan History
            </CardTitle>
            <CardDescription>
              Recent scans during this session (limit 5).
            </CardDescription>
          </CardHeader>
          <CardContent>
            {history.length === 0 ? (
              <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground space-y-2 border border-dashed rounded-xl">
                <History className="h-6 w-6 opacity-40" />
                <p className="text-xs">No items scanned yet in this session.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-start p-3 bg-muted/30 border rounded-xl text-xs transition-all hover:bg-muted/50"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 font-medium text-foreground">
                        {item.status === "success" ? (
                          <CheckCircle className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
                        ) : (
                          <AlertCircle className="h-3.5 w-3.5 text-destructive shrink-0" />
                        )}
                        <span className="truncate max-w-[140px]">
                          {item.productName || item.barcode}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground font-mono">
                        <span>{item.barcode}</span>
                        <span>•</span>
                        <span>{format(item.timestamp, "HH:mm:ss")}</span>
                      </div>
                      {item.status === "failed" && (
                        <p className="text-[10px] text-destructive italic">
                          {item.errorMsg}
                        </p>
                      )}
                    </div>

                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <Badge variant={item.mode === "sell" ? "default" : "secondary"}>
                        {item.mode === "sell" ? "Deduct" : "Restock"}
                      </Badge>
                      {item.status === "success" && item.qty && (
                        <span className="text-[10px] font-semibold text-muted-foreground">
                          Qty: {item.qty}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <ScanResultModal
        open={modalOpen}
        onOpenChange={handleCloseModal}
        product={scannedProduct}
        mode={mode}
        onConfirmSale={handleConfirmSale}
        onConfirmRestock={handleConfirmRestock}
      />
    </div>
  );
}
