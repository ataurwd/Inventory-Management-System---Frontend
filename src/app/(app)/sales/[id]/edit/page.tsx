"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import useSWR from "swr";
import PageHeader from "@/components/layout/PageHeader";
import { productsService } from "@/services/products.service";
import { salesService } from "@/services/sales.service";
import { Product } from "@/types/product.types";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Search,
  ShoppingCart,
  Trash2,
  Barcode,
  Keyboard,
  User,
  CreditCard,
  Notebook,
  Info,
} from "lucide-react";

interface SelectedItem {
  productId: string;
  name: string;
  barcode: string;
  qty: number;
  unitPrice: number;
  totalStock: number;
  unit: string;
}

export default function EditSalePage() {
  const router = useRouter();
  const params = useParams();
  const saleId = params.id as string;
  
  // Refs
  const barcodeInputRef = useRef<HTMLInputElement>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);

  // States
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [selectedItems, setSelectedItems] = useState<SelectedItem[]>([]);

  // Search states
  const [barcodeInput, setBarcodeInput] = useState("");
  const [nameSearch, setNameSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);

  // Checkout states
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [discount, setDiscount] = useState<number>(0);
  const [tax, setTax] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "bank_transfer" | "mobile_banking" | "other">("cash");
  const [saleStatus, setSaleStatus] = useState<"completed" | "draft" | "canceled">("completed");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch sale details
  const { data: sale, error: saleError, isLoading: loadingSale } = useSWR(
    saleId ? `/sales/${saleId}` : null,
    () => salesService.getById(saleId)
  );

  // Sound feedback helper
  const playBeep = (isError = false) => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      if (isError) {
        osc.type = "sawtooth";
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        gain.gain.setValueAtTime(0.3, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.25);
      } else {
        osc.type = "sine";
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        osc.start();
        osc.stop(ctx.currentTime + 0.08);
      }
    } catch (e) {
      console.error("Audio error", e);
    }
  };

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productsService.getAll();
        setAllProducts(data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load products");
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  // Prepopulate states once sale and products are loaded
  useEffect(() => {
    if (sale && allProducts.length > 0) {
      const mappedItems = sale.products.map((item) => {
        const productRef = allProducts.find((p) => (p._id || p.id) === item.productId);
        // Available limit = current available stock + previously deducted quantity if sale was completed
        const prevStockDeducted = sale.saleStatus === "completed" ? item.qty : 0;
        const totalStockAvailable = (productRef?.totalStock || 0) + prevStockDeducted;

        return {
          productId: item.productId,
          name: item.name,
          barcode: item.barcode,
          qty: item.qty,
          unitPrice: item.unitPrice,
          totalStock: totalStockAvailable,
          unit: productRef?.unit || "units",
        };
      });

      setSelectedItems(mappedItems);
      setCustomerName(sale.customerName);
      setCustomerPhone(sale.customerPhone || "");
      setDiscount(sale.discount);
      setTax(sale.tax);
      setPaidAmount(sale.paidAmount);
      setPaymentMethod(sale.paymentMethod);
      setSaleStatus(sale.saleStatus);
      setNotes(sale.notes || "");
    }
  }, [sale, allProducts]);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "F2") {
        e.preventDefault();
        barcodeInputRef.current?.focus();
        toast.info("Barcode field focused");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Math totals
  const subtotal = selectedItems.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
  const totalQty = selectedItems.reduce((sum, item) => sum + item.qty, 0);
  const grandTotal = Math.max(0, subtotal - discount + tax);
  const dueAmount = Math.max(0, grandTotal - paidAmount);

  const handleSetFullPayment = () => {
    setPaidAmount(parseFloat(grandTotal.toFixed(2)));
  };

  const addItem = (product: Product) => {
    const existingIndex = selectedItems.findIndex((item) => item.productId === (product._id || product.id));

    if (existingIndex > -1) {
      const newItems = [...selectedItems];
      const targetQty = newItems[existingIndex].qty + 1;
      
      if (targetQty > newItems[existingIndex].totalStock) {
        playBeep(true);
        toast.error(`Cannot exceed available stock level (${newItems[existingIndex].totalStock} ${newItems[existingIndex].unit} available)`);
        return;
      }
      
      newItems[existingIndex].qty = targetQty;
      setSelectedItems(newItems);
      playBeep(false);
    } else {
      if (product.totalStock < 1) {
        playBeep(true);
        toast.error(`Product ${product.name} is currently out of stock`);
        return;
      }

      setSelectedItems([
        ...selectedItems,
        {
          productId: product._id || product.id,
          name: product.name,
          barcode: product.barcode,
          qty: 1,
          unitPrice: product.sellingPrice,
          totalStock: product.totalStock,
          unit: product.unit,
        },
      ]);
      playBeep(false);
    }
    
    setNameSearch("");
    setShowDropdown(false);
  };

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    // Check in local cart items first to get actual limit
    const cartItem = selectedItems.find((item) => item.barcode === barcodeInput.trim());
    const matchedProduct = allProducts.find((p) => p.barcode === barcodeInput.trim() && !p.isDeleted);
    
    if (matchedProduct) {
      // Set correct simulated stock boundary
      const prevStockDeducted = (sale?.saleStatus === "completed" && cartItem) ? cartItem.qty : 0;
      matchedProduct.totalStock = (matchedProduct.totalStock || 0) + prevStockDeducted;
      
      addItem(matchedProduct);
      setBarcodeInput("");
    } else {
      playBeep(true);
      toast.error(`Product with barcode ${barcodeInput} not found`);
      setBarcodeInput("");
    }

    barcodeInputRef.current?.focus();
  };

  const handleQuantityChange = (index: number, newQty: number) => {
    if (isNaN(newQty) || newQty < 1) return;
    
    const item = selectedItems[index];
    if (newQty > item.totalStock) {
      toast.error(`Quantity exceeds available stock level of ${item.totalStock}`);
      return;
    }

    const newItems = [...selectedItems];
    newItems[index].qty = newQty;
    setSelectedItems(newItems);
  };

  const handleRemoveItem = (index: number) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
    playBeep(false);
  };

  const handleUpdateSale = async () => {
    if (selectedItems.length === 0) {
      toast.error("Please add at least one product.");
      return;
    }

    if (!customerName.trim()) {
      toast.error("Please enter a customer name.");
      return;
    }

    setIsSubmitting(true);
    try {
      const saleDto = {
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim() || undefined,
        products: selectedItems.map((item) => ({
          productId: item.productId,
          name: item.name,
          barcode: item.barcode,
          qty: item.qty,
          unitPrice: item.unitPrice,
        })),
        discount: discount,
        tax: tax,
        paidAmount: paidAmount,
        saleStatus,
        paymentMethod,
        notes: notes.trim() || undefined,
      };

      await salesService.update(saleId, saleDto);
      toast.success(`Sale ${sale?.invoiceNumber} updated successfully!`);
      router.push(`/sales/${saleId}`);
    } catch (err: any) {
      console.error(err);
      const apiErr = err.response?.data?.error?.message || "Failed to update sale";
      toast.error(apiErr);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredProducts = nameSearch.trim()
    ? allProducts
        .filter(
          (p) =>
            !p.isDeleted &&
            (p.name.toLowerCase().includes(nameSearch.toLowerCase()) ||
              p.barcode.includes(nameSearch))
        )
        .slice(0, 5)
    : [];

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Sales Management", href: "/sales" },
    { label: sale?.invoiceNumber || "Edit", href: `/sales/${saleId}` },
    { label: "Edit Sale" },
  ];

  if (saleError) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-4">
        <div className="flex flex-col items-center justify-center p-16 border border-dashed rounded-2xl bg-card text-center space-y-4">
          <Info className="h-8 w-8 text-destructive" />
          <h3 className="font-semibold text-lg">Sale transaction not found</h3>
          <Button variant="outline" onClick={() => router.push("/sales")}>
            Back to Sales
          </Button>
        </div>
      </div>
    );
  }

  if (loadingSale || loadingProducts || !sale) {
    return (
      <div className="p-8 max-w-[1280px] mx-auto text-center py-20 text-muted-foreground text-xs">
        Loading sale record for editing...
      </div>
    );
  }

  return (
    <div className="p-8 max-w-[1280px] mx-auto space-y-6 animate-fade-in">
      <PageHeader title={`Edit Sale ${sale.invoiceNumber}`} breadcrumbs={breadcrumbs} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT PANEL */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Product selection card */}
          <Card className="border border-border shadow-xs bg-card/45 backdrop-blur-md">
            <CardHeader className="py-4 px-5">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <ShoppingCart className="h-4.5 w-4.5 text-primary" />
                Edit Products List
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 pt-0 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Barcode scanner */}
                <form onSubmit={handleBarcodeSubmit} className="space-y-1.5">
                  <label htmlFor="edit-barcode-scanner" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Barcode className="h-4 w-4 text-primary" />
                    Barcode Scanner [F2]
                  </label>
                  <Input
                    id="edit-barcode-scanner"
                    ref={barcodeInputRef}
                    placeholder="Scan product barcode..."
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    className="h-10 text-sm font-mono border-border/80"
                  />
                </form>

                {/* Name manual search */}
                <div className="space-y-1.5 relative">
                  <label htmlFor="edit-name-search" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Search className="h-4 w-4 text-primary" />
                    Manual Name Search
                  </label>
                  <Input
                    id="edit-name-search"
                    ref={nameInputRef}
                    placeholder="Search product name..."
                    value={nameSearch}
                    onChange={(e) => {
                      setNameSearch(e.target.value);
                      setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    className="h-10 text-sm border-border/80"
                  />

                  {/* Dropdown list */}
                  {showDropdown && nameSearch.trim() && (
                    <div className="absolute top-[72px] z-50 w-full bg-card border border-border shadow-lg rounded-xl overflow-hidden divide-y divide-border">
                      {filteredProducts.length === 0 ? (
                        <div className="p-3 text-xs text-muted-foreground text-center">No products found</div>
                      ) : (
                        filteredProducts.map((product) => {
                          const cartItem = selectedItems.find((item) => item.productId === (product._id || product.id));
                          const prevQty = (sale.saleStatus === "completed" && cartItem) ? cartItem.qty : 0;
                          const simulatedStock = product.totalStock + prevQty;

                          return (
                            <button
                              key={product._id || product.id}
                              type="button"
                              onClick={() => {
                                const pClone = { ...product, totalStock: simulatedStock };
                                addItem(pClone);
                              }}
                              className="w-full text-left p-3 hover:bg-muted/50 transition-colors flex justify-between items-center text-xs"
                            >
                              <div>
                                <div className="font-semibold text-foreground">{product.name}</div>
                                <div className="text-[10px] text-muted-foreground font-mono">{product.barcode}</div>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-primary">${product.sellingPrice.toFixed(2)}</div>
                                <div className="text-[10px] text-muted-foreground">
                                  Stock: {simulatedStock} {product.unit}
                                </div>
                              </div>
                            </button>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>

              </div>
            </CardContent>
          </Card>

          {/* Cart items table */}
          <Card className="border border-border shadow-xs overflow-hidden bg-card/30 backdrop-blur-md">
            <div className="overflow-x-auto min-h-[300px]">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead className="text-xs font-bold uppercase tracking-wider">Product Description</TableHead>
                    <TableHead className="w-[100px] text-right text-xs font-bold uppercase tracking-wider">Price</TableHead>
                    <TableHead className="w-[140px] text-center text-xs font-bold uppercase tracking-wider">Quantity</TableHead>
                    <TableHead className="w-[120px] text-right text-xs font-bold uppercase tracking-wider">Line Total</TableHead>
                    <TableHead className="w-[60px] text-right text-xs font-bold uppercase tracking-wider"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-64 text-center text-xs text-muted-foreground">
                        Order list is empty. Add items to edit.
                      </TableCell>
                    </TableRow>
                  ) : (
                    selectedItems.map((item, index) => (
                      <TableRow key={item.productId} className="hover:bg-muted/10 text-xs">
                        <TableCell>
                          <div className="space-y-0.5">
                            <span className="font-semibold text-foreground block">{item.name}</span>
                            <span className="text-[10px] text-muted-foreground font-mono">
                              {item.barcode} • Stock Limit: {item.totalStock} {item.unit}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium text-muted-foreground">
                          ${item.unitPrice.toFixed(2)}
                        </TableCell>
                        <TableCell className="text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleQuantityChange(index, item.qty - 1)}
                              disabled={item.qty <= 1}
                              className="h-7 w-7 rounded-md border-border cursor-pointer hover:bg-sidebar-accent/50"
                            >
                              -
                            </Button>
                            <Input
                              type="number"
                              value={item.qty}
                              onChange={(e) => handleQuantityChange(index, parseInt(e.target.value, 10))}
                              className="h-7 w-12 text-center text-xs font-semibold p-0 border-border/80 rounded-md"
                              min={1}
                              max={item.totalStock}
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleQuantityChange(index, item.qty + 1)}
                              disabled={item.qty >= item.totalStock}
                              className="h-7 w-7 rounded-md border-border cursor-pointer hover:bg-sidebar-accent/50"
                            >
                              +
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-bold text-foreground">
                          ${(item.qty * item.unitPrice).toFixed(2)}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleRemoveItem(index)}
                            className="h-7 w-7 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>

        </div>

        {/* RIGHT PANEL: SUMMARY & PAYMENT UPDATES */}
        <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-20">
          
          {/* Customer details card */}
          <Card className="border border-border shadow-xs bg-card/45 backdrop-blur-md">
            <CardHeader className="py-4 px-5 border-b border-border/40">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <User className="h-4.5 w-4.5 text-primary" />
                Customer details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              <div className="space-y-1">
                <label htmlFor="edit-customer-name" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Customer Name
                </label>
                <Input
                  id="edit-customer-name"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="h-9 text-xs border-border/80"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="edit-customer-phone" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Phone Number
                </label>
                <Input
                  id="edit-customer-phone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="h-9 text-xs border-border/80"
                />
              </div>
            </CardContent>
          </Card>

          {/* Totals & calculations */}
          <Card className="border border-border shadow-xs bg-card/45 backdrop-blur-md">
            <CardHeader className="py-4 px-5 border-b border-border/40">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <CreditCard className="h-4.5 w-4.5 text-primary" />
                Payment & Totals
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              
              <div className="space-y-2 border-b border-border/30 pb-3 text-xs">
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Total Items</span>
                  <span className="font-semibold">{totalQty} units</span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Subtotal</span>
                  <span className="font-semibold">${subtotal.toFixed(2)}</span>
                </div>
                
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <label htmlFor="edit-discount" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Discount ($)</label>
                    <Input
                      id="edit-discount"
                      type="number"
                      value={discount || ""}
                      onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="h-8 text-xs text-right border-border/80"
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="edit-tax" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Tax ($)</label>
                    <Input
                      id="edit-tax"
                      type="number"
                      value={tax || ""}
                      onChange={(e) => setTax(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="h-8 text-xs text-right border-border/80"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-between items-center bg-primary/5 border border-primary/20 rounded-xl p-3">
                <span className="text-xs font-bold text-primary uppercase">Grand Total</span>
                <span className="text-xl font-extrabold text-foreground">${grandTotal.toFixed(2)}</span>
              </div>

              <div className="space-y-3 text-xs pt-1 border-t border-border/30">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="edit-payment-method" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Method</label>
                    <select
                      id="edit-payment-method"
                      value={paymentMethod}
                      onChange={(e: any) => setPaymentMethod(e.target.value)}
                      className="w-full text-xs h-8.5 rounded-lg border border-border bg-background px-2 text-foreground focus:outline-hidden cursor-pointer"
                    >
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="mobile_banking">Mobile Bank</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label htmlFor="edit-sale-status" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Sale Status</label>
                    <select
                      id="edit-sale-status"
                      value={saleStatus}
                      onChange={(e: any) => setSaleStatus(e.target.value)}
                      className="w-full text-xs h-8.5 rounded-lg border border-border bg-background px-2 text-foreground focus:outline-hidden cursor-pointer"
                    >
                      <option value="completed">Completed</option>
                      <option value="draft">Draft (Restore stock)</option>
                      <option value="canceled">Canceled (Restore stock)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between items-center">
                    <label htmlFor="edit-paid-amount" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                      Paid Amount ($)
                    </label>
                    <button
                      type="button"
                      onClick={handleSetFullPayment}
                      className="text-[10px] text-primary hover:underline font-bold bg-transparent border-none cursor-pointer p-0"
                    >
                      Set Full Payment
                    </button>
                  </div>
                  <Input
                    id="edit-paid-amount"
                    type="number"
                    value={paidAmount || ""}
                    onChange={(e) => setPaidAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="h-8.5 text-xs text-right border-border/80 font-bold text-foreground"
                  />
                </div>

                <div className="flex justify-between items-center text-xs pt-1">
                  <span className="font-semibold text-muted-foreground">Due / Balance</span>
                  <span className={`font-bold ${dueAmount > 0 ? "text-destructive" : "text-emerald-500"}`}>
                    ${dueAmount.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-1 pt-1 border-t border-border/30">
                <label htmlFor="edit-checkout-notes" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1 block">
                  <Notebook className="h-3 w-3" />
                  Notes / Internal comments
                </label>
                <textarea
                  id="edit-checkout-notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full h-16 rounded-lg border border-border bg-background p-2.5 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary placeholder:text-muted-foreground resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 pt-2">
                <Button
                  onClick={handleUpdateSale}
                  disabled={isSubmitting || selectedItems.length === 0}
                  className="w-full h-10 font-semibold cursor-pointer text-sm shadow-md transition-all active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  ) : (
                    "Save Changes & Update Stock"
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => router.push(`/sales/${saleId}`)}
                  className="w-full h-9 text-xs cursor-pointer border-border hover:bg-muted/40"
                >
                  Discard Changes
                </Button>
              </div>

            </CardContent>
          </Card>

        </div>

      </div>
    </div>
  );
}
