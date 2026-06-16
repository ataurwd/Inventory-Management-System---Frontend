"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
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
  AlertTriangle,
  Coins,
  Check,
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

export default function NewSalePage() {
  const router = useRouter();
  
  // Refs for focusing inputs
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
  const [customerName, setCustomerName] = useState("Walk-in Customer");
  const [customerPhone, setCustomerPhone] = useState("");
  const [discount, setDiscount] = useState<number>(0);
  const [tax, setTax] = useState<number>(0);
  const [paidAmount, setPaidAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<"cash" | "card" | "bank_transfer" | "mobile_banking" | "other">("cash");
  const [saleStatus, setSaleStatus] = useState<"completed" | "draft">("completed");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  // Fetch all products on mount
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await productsService.getAll();
        setAllProducts(data);
      } catch (err) {
        console.error(err);
        toast.error("Failed to load products for checkout");
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();

    // Focus barcode search on load
    if (barcodeInputRef.current) {
      barcodeInputRef.current.focus();
    }
  }, []);

  // Keyboard Shortcuts (F2: barcode search, F4: focus discount/paidAmount)
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

  // Calculate totals
  const subtotal = selectedItems.reduce((sum, item) => sum + item.qty * item.unitPrice, 0);
  const totalQty = selectedItems.reduce((sum, item) => sum + item.qty, 0);
  const grandTotal = Math.max(0, subtotal - discount + tax);
  const paidAmountVal = paidAmount || 0;
  const changeAmount = paidAmountVal > grandTotal ? paidAmountVal - grandTotal : 0;
  const dueAmount = grandTotal > paidAmountVal ? grandTotal - paidAmountVal : 0;

  // Sync paid amount when cash is selected or when clicking full payment
  const handleSetFullPayment = () => {
    setPaidAmount(parseFloat(grandTotal.toFixed(2)));
  };

  // Generate quick cash buttons dynamically based on grandTotal
  const getQuickCashSuggestions = (total: number) => {
    if (total <= 0) return [];
    const suggestions = new Set<number>();
    
    // Always suggest exact amount
    suggestions.add(parseFloat(total.toFixed(2)));
    
    // Suggest next dollar if not whole
    const nextDollar = Math.ceil(total);
    if (nextDollar > total) suggestions.add(nextDollar);
    
    // Next multiples of 5, 10, 20, 50, 100
    const denominations = [5, 10, 20, 50, 100];
    for (const denom of denominations) {
      if (denom > total) {
        suggestions.add(denom);
      } else {
        const nextMultiple = Math.ceil(total / denom) * denom;
        if (nextMultiple > total) {
          suggestions.add(nextMultiple);
        }
      }
    }
    
    return Array.from(suggestions).sort((a, b) => a - b).slice(0, 5); // Limit to 5 options max
  };

  // Add Item to sale (either new or increment qty)
  const addItem = (product: Product) => {
    const existingIndex = selectedItems.findIndex((item) => item.productId === (product._id || product.id));

    if (existingIndex > -1) {
      const newItems = [...selectedItems];
      const targetQty = newItems[existingIndex].qty + 1;
      
      if (targetQty > product.totalStock) {
        playBeep(true);
        toast.error(`Cannot exceed available stock level (${product.totalStock} ${product.unit} available)`);
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
    
    // Reset search query
    setNameSearch("");
    setShowDropdown(false);
  };

  // Handle barcode scanner input (carriage return on Enter key)
  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!barcodeInput.trim()) return;

    const matchedProduct = allProducts.find((p) => p.barcode === barcodeInput.trim() && !p.isDeleted);
    
    if (matchedProduct) {
      addItem(matchedProduct);
      setBarcodeInput("");
    } else {
      playBeep(true);
      toast.error(`Product with barcode ${barcodeInput} not found`);
      setBarcodeInput("");
    }

    barcodeInputRef.current?.focus();
  };

  // Update item quantity
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

  // Remove item
  const handleRemoveItem = (index: number) => {
    setSelectedItems(selectedItems.filter((_, i) => i !== index));
    playBeep(false);
  };

  // Submit Sale handler
  const handleSubmitSale = async () => {
    if (selectedItems.length === 0) {
      toast.error("Please add at least one product to the sale.");
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
        discount: discount || undefined,
        tax: tax || undefined,
        paidAmount: paidAmount || undefined,
        saleStatus,
        paymentMethod,
        notes: notes.trim() || undefined,
      };

      const result = await salesService.create(saleDto);
      toast.success(`Sale transaction created successfully! Invoice: ${result.invoiceNumber}`);
      router.push("/sales");
    } catch (err: any) {
      console.error(err);
      const apiErr = err.response?.data?.error?.message || "Failed to complete sale transaction";
      toast.error(apiErr);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter products by manual search input
  const filteredProducts = nameSearch.trim()
    ? allProducts
        .filter(
          (p) =>
            !p.isDeleted &&
            (p.name.toLowerCase().includes(nameSearch.toLowerCase()) ||
              p.barcode.includes(nameSearch))
        )
        .slice(0, 30) // Increased from 5 to show more results
    : [];

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Sales Management", href: "/sales" },
    { label: "POS Checkout" },
  ];

  return (
    <div className="p-8 max-w-[1280px] mx-auto space-y-6 animate-fade-in">
      <PageHeader title="POS Checkout" breadcrumbs={breadcrumbs} />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT PANEL: SEARCH & SELECTED PRODUCTS */}
        <div className="lg:col-span-8 space-y-4">
          
          {/* Product Searches */}
          <Card className="border border-border shadow-md bg-card/45 backdrop-blur-md overflow-visible">
            <CardHeader className="py-4 px-5 border-b border-border/40">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <ShoppingCart className="h-4.5 w-4.5 text-primary animate-pulse" />
                Select Products
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5 pt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                {/* Barcode Scanner Input */}
                <form onSubmit={handleBarcodeSubmit} className="space-y-1.5">
                  <label htmlFor="barcode-scanner" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Barcode className="h-4 w-4 text-primary" />
                    Barcode Scanner [F2]
                  </label>
                  <Input
                    id="barcode-scanner"
                    ref={barcodeInputRef}
                    placeholder="Scan product barcode..."
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    className="h-10 text-sm font-mono border-border/80 focus-visible:ring-primary"
                  />
                </form>

                {/* Name AutoSearch */}
                <div className="space-y-1.5 relative z-50">
                  <label htmlFor="name-search" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Search className="h-4 w-4 text-primary" />
                    Manual Name Search
                  </label>
                  <Input
                    id="name-search"
                    ref={nameInputRef}
                    placeholder="Search product name..."
                    value={nameSearch}
                    onChange={(e) => {
                      setNameSearch(e.target.value);
                      setShowDropdown(true);
                    }}
                    onFocus={() => setShowDropdown(true)}
                    className="h-10 text-sm border-border/80 focus-visible:ring-primary"
                  />

                  {/* Autocomplete Dropdown list */}
                  {showDropdown && nameSearch.trim() && (
                    <div className="absolute top-[72px] z-[100] w-full bg-card border border-border shadow-xl rounded-xl overflow-y-auto max-h-[300px] divide-y divide-border">
                      {filteredProducts.length === 0 ? (
                        <div className="p-3 text-xs text-muted-foreground text-center">No products found</div>
                      ) : (
                        filteredProducts.map((product) => (
                          <button
                            key={product._id || product.id}
                            type="button"
                            onClick={() => addItem(product)}
                            className="w-full text-left p-3 hover:bg-muted/50 transition-colors flex justify-between items-center text-xs cursor-pointer"
                          >
                            <div>
                              <div className="font-semibold text-foreground">{product.name}</div>
                              <div className="text-[10px] text-muted-foreground font-mono">{product.barcode}</div>
                            </div>
                            <div className="text-right">
                              <div className="font-bold text-primary">${product.sellingPrice.toFixed(2)}</div>
                              <div className="text-[10px] text-muted-foreground">
                                Stock: {product.totalStock} {product.unit}
                              </div>
                            </div>
                          </button>
                        ))
                      )}
                    </div>
                  )}
                </div>

              </div>
            </CardContent>
          </Card>

          {/* Cart Table List */}
          <Card className="border border-border shadow-md overflow-hidden bg-card/30 backdrop-blur-md">
            <div className="overflow-x-auto min-h-[300px]">
              <Table>
                <TableHeader className="bg-muted/40">
                  <TableRow>
                    <TableHead className="text-xs font-bold uppercase tracking-wider">Product Description</TableHead>
                    <TableHead className="w-[120px] text-right text-xs font-bold uppercase tracking-wider">Unit Price</TableHead>
                    <TableHead className="w-[140px] text-center text-xs font-bold uppercase tracking-wider">Quantity</TableHead>
                    <TableHead className="w-[120px] text-right text-xs font-bold uppercase tracking-wider">Line Total</TableHead>
                    <TableHead className="w-[60px] text-right text-xs font-bold uppercase tracking-wider"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedItems.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-64 text-center text-xs text-muted-foreground">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <ShoppingCart className="h-8 w-8 opacity-40 text-primary animate-pulse" />
                          <p className="max-w-[250px]">Order is empty. Scan barcodes or search product names to begin.</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    selectedItems.map((item, index) => (
                      <TableRow key={item.productId} className="hover:bg-muted/10 text-xs transition-colors group">
                        <TableCell>
                          <div className="space-y-0.5">
                            <span className="font-semibold text-foreground block group-hover:text-primary transition-colors">{item.name}</span>
                            <div className="flex items-center gap-1.5 text-[10px] font-mono">
                              <span className="text-muted-foreground">{item.barcode}</span>
                              <span className="text-muted-foreground/50">•</span>
                              <span className={item.totalStock <= 5 ? "text-destructive font-bold" : "text-muted-foreground"}>
                                Stock: {item.totalStock} {item.unit}
                              </span>
                              {item.totalStock <= 5 && (
                                <Badge variant="critical" className="h-4 py-0 text-[8px] tracking-tight bg-destructive/10 text-destructive border-none">Low Stock</Badge>
                              )}
                            </div>
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
                              className="h-7 w-7 rounded-md border-border hover:bg-sidebar-accent/50 cursor-pointer"
                            >
                              -
                            </Button>
                            <Input
                              type="number"
                              value={item.qty}
                              onChange={(e) => handleQuantityChange(index, parseInt(e.target.value, 10))}
                              className="h-7 w-12 text-center text-xs font-semibold p-0 border-border/80 focus-visible:ring-primary rounded-md"
                              min={1}
                              max={item.totalStock}
                            />
                            <Button
                              variant="outline"
                              size="icon"
                              onClick={() => handleQuantityChange(index, item.qty + 1)}
                              disabled={item.qty >= item.totalStock}
                              className="h-7 w-7 rounded-md border-border hover:bg-sidebar-accent/50 cursor-pointer"
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
            
            {/* Legend Bar */}
            <div className="flex items-center gap-4 text-[10px] text-muted-foreground border-t border-border/30 bg-muted/10 px-4 py-2 font-medium">
              <div className="flex items-center gap-1">
                <Keyboard className="h-3.5 w-3.5 text-primary" />
                <span>Hotkeys:</span>
              </div>
              <div><kbd className="px-1.5 py-0.5 border rounded-sm bg-background">F2</kbd> Focus Barcode</div>
              <div><kbd className="px-1.5 py-0.5 border rounded-sm bg-background">Enter</kbd> (in barcode field) Add Product</div>
            </div>
          </Card>

        </div>

        {/* RIGHT PANEL: STICKY ORDER CHECKOUT SUMMARY */}
        <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-20">
          
          {/* Customer info card */}
          <Card className="border border-border shadow-md bg-card/45 backdrop-blur-md">
            <CardHeader className="py-4 px-5 border-b border-border/40">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <User className="h-4.5 w-4.5 text-primary" />
                Customer details
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-3">
              <div className="space-y-1">
                <label htmlFor="customer-name" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Customer Name
                </label>
                <Input
                  id="customer-name"
                  placeholder="Enter name..."
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className="h-9 text-xs border-border/80 focus-visible:ring-primary"
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="customer-phone" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                  Phone Number
                </label>
                <Input
                  id="customer-phone"
                  placeholder="Enter phone (optional)..."
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="h-9 text-xs border-border/80 focus-visible:ring-primary"
                />
              </div>
            </CardContent>
          </Card>

          {/* Checkout Totals & Submit */}
          <Card className="border border-border shadow-md bg-card/45 backdrop-blur-md">
            <CardHeader className="py-4 px-5 border-b border-border/40">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <CreditCard className="h-4.5 w-4.5 text-primary" />
                Payment & Totals
              </CardTitle>
            </CardHeader>
            <CardContent className="p-5 space-y-4">
              
              {/* Financial Math Summaries */}
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
                    <label htmlFor="discount" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Discount ($)</label>
                    <Input
                      id="discount"
                      type="number"
                      value={discount || ""}
                      onChange={(e) => setDiscount(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="h-8 text-xs text-right border-border/80 focus-visible:ring-primary"
                      min={0}
                    />
                  </div>
                  <div className="space-y-1">
                    <label htmlFor="tax" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Tax/VAT ($)</label>
                    <Input
                      id="tax"
                      type="number"
                      value={tax || ""}
                      onChange={(e) => setTax(Math.max(0, parseFloat(e.target.value) || 0))}
                      className="h-8 text-xs text-right border-border/80 focus-visible:ring-primary"
                      min={0}
                    />
                  </div>
                </div>
              </div>

              {/* Order Grand Total */}
              <div className="flex justify-between items-center bg-primary/5 border border-primary/20 rounded-xl p-3 shadow-inner">
                <span className="text-xs font-bold text-primary uppercase">Grand Total (Bill)</span>
                <span className="text-xl font-extrabold text-foreground">${grandTotal.toFixed(2)}</span>
              </div>

              {/* Payment configs */}
              <div className="space-y-3 text-xs pt-1 border-t border-border/30">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label htmlFor="payment-method-pos" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Method</label>
                    <select
                      id="payment-method-pos"
                      value={paymentMethod}
                      onChange={(e: any) => setPaymentMethod(e.target.value)}
                      className="w-full text-xs h-8.5 rounded-lg border border-border bg-background px-2 text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary cursor-pointer"
                    >
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="mobile_banking">Mobile Bank</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div className="space-y-1">
                    <label htmlFor="sale-status-pos" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Sale Status</label>
                    <select
                      id="sale-status-pos"
                      value={saleStatus}
                      onChange={(e: any) => setSaleStatus(e.target.value)}
                      className="w-full text-xs h-8.5 rounded-lg border border-border bg-background px-2 text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary cursor-pointer"
                    >
                      <option value="completed">Completed</option>
                      <option value="draft">Draft (No stock deduct)</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between items-center">
                    <label htmlFor="paid-amount" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
                      <Coins className="h-3.5 w-3.5 text-primary" />
                      Cash Given ($)
                    </label>
                    <button
                      type="button"
                      onClick={handleSetFullPayment}
                      className="text-[10px] text-primary hover:underline font-bold bg-transparent border-none cursor-pointer p-0"
                    >
                      Exact Payment
                    </button>
                  </div>
                  <Input
                    id="paid-amount"
                    type="number"
                    value={paidAmount || ""}
                    onChange={(e) => setPaidAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="h-9 text-xs text-right border-border/80 font-bold text-foreground focus-visible:ring-primary"
                    min={0}
                  />

                  {/* Quick Cash Suggestions */}
                  {grandTotal > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      {getQuickCashSuggestions(grandTotal).map((cash) => (
                        <button
                          key={cash}
                          type="button"
                          onClick={() => setPaidAmount(cash)}
                          className={`px-2 py-1 text-[10px] font-semibold border rounded-lg cursor-pointer transition-all ${
                            paidAmount === cash
                              ? "bg-primary text-primary-foreground border-primary shadow-xs scale-95"
                              : "bg-background text-muted-foreground border-border hover:bg-muted/50 hover:text-foreground"
                          }`}
                        >
                          {cash === grandTotal ? "Exact" : `$${cash}`}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Ledger calculations return / due amount panels */}
                <div className="space-y-2 pt-2 border-t border-border/30">
                  {paidAmountVal > 0 && (
                    changeAmount > 0 ? (
                      <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-[oklch(0.70_0.18_145_/_0.1)] border border-[oklch(0.70_0.18_145_/_0.3)] text-[oklch(0.50_0.18_145)] glow-success animate-fade-in">
                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                          <span className="flex items-center gap-1">
                            <Check className="h-3.5 w-3.5" />
                            Change to Return
                          </span>
                        </div>
                        <div className="text-2xl font-black font-mono tracking-tight">
                          ${changeAmount.toFixed(2)}
                        </div>
                        <span className="text-[9px] font-medium opacity-80">
                          Give this change back to the customer.
                        </span>
                      </div>
                    ) : dueAmount > 0 ? (
                      <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-destructive/10 border border-destructive/30 text-destructive glow-danger animate-fade-in">
                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                          <span className="flex items-center gap-1">
                            <AlertTriangle className="h-3.5 w-3.5" />
                            Balance Due
                          </span>
                        </div>
                        <div className="text-2xl font-black font-mono tracking-tight">
                          ${dueAmount.toFixed(2)}
                        </div>
                        <span className="text-[9px] font-medium opacity-80">
                          Customer still owes this amount.
                        </span>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1.5 p-3 rounded-xl bg-primary/10 border border-primary/30 text-primary animate-fade-in">
                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-wider">
                          <span className="flex items-center gap-1">
                            <Check className="h-3.5 w-3.5" />
                            Paid in Full
                          </span>
                        </div>
                        <div className="text-2xl font-black font-mono tracking-tight">
                          $0.00
                        </div>
                        <span className="text-[9px] font-medium opacity-80">
                          No change or balance due.
                        </span>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* Notes / Comments */}
              <div className="space-y-1 pt-1 border-t border-border/30">
                <label htmlFor="checkout-notes" className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1 block">
                  <Notebook className="h-3 w-3" />
                  Notes / Internal comments
                </label>
                <textarea
                  id="checkout-notes"
                  placeholder="Write sale comments..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full h-16 rounded-lg border border-border/85 bg-background p-2.5 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary placeholder:text-muted-foreground resize-none"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-2 pt-2">
                <Button
                  onClick={handleSubmitSale}
                  disabled={isSubmitting || selectedItems.length === 0}
                  className="w-full h-10 font-semibold cursor-pointer text-sm shadow-md transition-all active:scale-[0.98]"
                >
                  {isSubmitting ? (
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
                  ) : saleStatus === "completed" ? (
                    "Complete Order & Deduct Stock"
                  ) : (
                    "Save Order Draft"
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => {
                    if (confirm("Are you sure you want to cancel? This will discard your current draft.")) {
                      router.push("/sales");
                    }
                  }}
                  className="w-full h-9 text-xs cursor-pointer border-border hover:bg-destructive/5 hover:text-destructive hover:border-destructive/30"
                >
                  Discard Order
                </Button>
              </div>

            </CardContent>
          </Card>

        </div>

      </div>
    </div>
  );
}
