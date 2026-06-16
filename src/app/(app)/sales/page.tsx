"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import { useSales } from "@/hooks/useSales";
import { salesService } from "@/services/sales.service";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import {
  Search,
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  Eye,
  Edit2,
  Trash2,
  Download,
  ShoppingBag,
  Plus,
} from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";

function SalesPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { role } = useAuth();
  const isAdmin = role === "admin";

  const [page, setPage] = useState(1);
  const [invoice, setInvoice] = useState(() => searchParams.get("invoice") || "");
  const [customer, setCustomer] = useState(() => searchParams.get("customer") || "");
  const [paymentStatus, setPaymentStatus] = useState(() => searchParams.get("paymentStatus") || "");
  const [saleStatus, setSaleStatus] = useState(() => searchParams.get("saleStatus") || "");
  const [fromDate, setFromDate] = useState(() => searchParams.get("from") || "");
  const [toDate, setToDate] = useState(() => searchParams.get("to") || "");
  const [product, setProduct] = useState(() => searchParams.get("product") || "");

  const [debouncedInvoice, setDebouncedInvoice] = useState(invoice);
  const [debouncedCustomer, setDebouncedCustomer] = useState(customer);
  const [debouncedProduct, setDebouncedProduct] = useState(product);

  const filters = {
    page,
    limit: 15,
    invoiceNumber: debouncedInvoice || undefined,
    customer: debouncedCustomer || undefined,
    product: debouncedProduct || undefined,
    paymentStatus: paymentStatus || undefined,
    saleStatus: saleStatus || undefined,
    from: fromDate || undefined,
    to: toDate || undefined,
  };

  const { sales, meta, isLoading, mutate } = useSales(filters);

  // Debounces
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedInvoice(invoice);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [invoice]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedCustomer(customer);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [customer]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedProduct(product);
      setPage(1);
    }, 400);
    return () => clearTimeout(handler);
  }, [product]);

  const handleResetFilters = () => {
    setInvoice("");
    setCustomer("");
    setProduct("");
    setPaymentStatus("");
    setSaleStatus("");
    setFromDate("");
    setToDate("");
    setPage(1);
  };

  const handleDelete = async (id: string, invoiceNum: string) => {
    if (!isAdmin) {
      toast.error("Permission denied. Only administrators can delete sales.");
      return;
    }

    if (!confirm(`Are you sure you want to delete sale ${invoiceNum}? This will restore stock quantities to inventory.`)) {
      return;
    }

    try {
      await salesService.remove(id);
      toast.success(`Sale ${invoiceNum} deleted and stock restored.`);
      mutate();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete sale");
    }
  };

  const handleExportCSV = async () => {
    try {
      toast.info("Preparing export...");
      const data = await salesService.getAll({ limit: 1000 });
      if (!data || data.sales.length === 0) {
        toast.warning("No sales records found to export.");
        return;
      }
      const headers = [
        "Invoice Number",
        "Sale Date",
        "Customer Name",
        "Customer Phone",
        "Subtotal",
        "Discount",
        "Tax",
        "Grand Total",
        "Paid Amount",
        "Due Amount",
        "Payment Status",
        "Sale Status",
        "Payment Method",
        "Created By",
      ];
      const rows = data.sales.map((s) => [
        s.invoiceNumber,
        format(new Date(s.saleDate), "yyyy-MM-dd HH:mm"),
        s.customerName,
        s.customerPhone || "",
        s.subtotal,
        s.discount,
        s.tax,
        s.grandTotal,
        s.paidAmount,
        s.dueAmount,
        s.paymentStatus,
        s.saleStatus,
        s.paymentMethod,
        typeof s.createdBy === "object" ? s.createdBy.name : s.createdBy,
      ]);
      const csvContent =
        "data:text/csv;charset=utf-8," +
        [
          headers.join(","),
          ...rows.map((e) => e.map((val) => `"${String(val).replace(/"/g, '""')}"`).join(",")),
        ].join("\n");
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `sales_report_${format(new Date(), "yyyyMMdd_HHmmss")}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success("CSV report exported successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to export sales data");
    }
  };

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Sales Management" },
  ];

  const paymentBadgeVariants = {
    paid: "safe" as const,
    partial: "warning" as const,
    unpaid: "critical" as const,
  };

  const saleBadgeVariants = {
    completed: "safe" as const,
    draft: "secondary" as const,
    canceled: "critical" as const,
  };

  const hasActiveFilters =
    invoice !== "" ||
    customer !== "" ||
    product !== "" ||
    paymentStatus !== "" ||
    saleStatus !== "" ||
    fromDate !== "" ||
    toDate !== "";

  return (
    <div className="p-8 max-w-[1200px] mx-auto space-y-6 animate-fade-in">
      <PageHeader
        title="Sales Records"
        breadcrumbs={breadcrumbs}
        action={{
          label: "New Sale (POS)",
          onClick: () => router.push("/sales/new"),
        }}
      />

      {/* Filter Control Bar */}
      <Card className="p-5 border border-border shadow-xs bg-card/45 backdrop-blur-md">
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Invoice Search */}
            <div className="space-y-1.5">
              <label htmlFor="invoice-search" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Invoice Number
              </label>
              <div className="relative">
                <Input
                  id="invoice-search"
                  placeholder="INV-..."
                  value={invoice}
                  onChange={(e) => setInvoice(e.target.value)}
                  className="pl-8 h-9 text-xs rounded-lg border-border/80"
                />
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </div>

            {/* Customer Search */}
            <div className="space-y-1.5">
              <label htmlFor="customer-search" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Customer Name
              </label>
              <div className="relative">
                <Input
                  id="customer-search"
                  placeholder="Search customer..."
                  value={customer}
                  onChange={(e) => setCustomer(e.target.value)}
                  className="pl-8 h-9 text-xs rounded-lg border-border/80"
                />
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </div>

            {/* Product Search */}
            <div className="space-y-1.5">
              <label htmlFor="product-search" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Product Name
              </label>
              <div className="relative">
                <Input
                  id="product-search"
                  placeholder="Search items..."
                  value={product}
                  onChange={(e) => setProduct(e.target.value)}
                  className="pl-8 h-9 text-xs rounded-lg border-border/80"
                />
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </div>

            {/* Payment Status Dropdown */}
            <div className="space-y-1.5">
              <label htmlFor="payment-status" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Payment Status
              </label>
              <select
                id="payment-status"
                value={paymentStatus}
                onChange={(e) => {
                  setPaymentStatus(e.target.value);
                  setPage(1);
                }}
                className="w-full text-xs h-9 rounded-lg border border-border bg-background px-3 text-foreground shadow-xs focus:outline-hidden focus:ring-1 focus:ring-ring cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="paid">Paid</option>
                <option value="partial">Partially Paid</option>
                <option value="unpaid">Unpaid</option>
              </select>
            </div>

            {/* Sale Status Dropdown */}
            <div className="space-y-1.5">
              <label htmlFor="sale-status" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                Sale Status
              </label>
              <select
                id="sale-status"
                value={saleStatus}
                onChange={(e) => {
                  setSaleStatus(e.target.value);
                  setPage(1);
                }}
                className="w-full text-xs h-9 rounded-lg border border-border bg-background px-3 text-foreground shadow-xs focus:outline-hidden focus:ring-1 focus:ring-ring cursor-pointer"
              >
                <option value="">All Statuses</option>
                <option value="completed">Completed</option>
                <option value="draft">Draft</option>
                <option value="canceled">Canceled</option>
              </select>
            </div>

            {/* Date From */}
            <div className="space-y-1.5">
              <label htmlFor="from-date" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                From Date
              </label>
              <Input
                id="from-date"
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setPage(1);
                }}
                className="h-9 text-xs rounded-lg border-border/80"
              />
            </div>

            {/* Date To */}
            <div className="space-y-1.5">
              <label htmlFor="to-date" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider block">
                To Date
              </label>
              <Input
                id="to-date"
                type="date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setPage(1);
                }}
                className="h-9 text-xs rounded-lg border-border/80"
              />
            </div>

            {/* Buttons */}
            <div className="flex gap-2 w-full pt-5">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleExportCSV}
                className="flex-1 h-9 text-xs rounded-lg cursor-pointer gap-1.5 border-border hover:bg-sidebar-accent/50"
              >
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
              {hasActiveFilters && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleResetFilters}
                  className="flex-1 h-9 text-xs rounded-lg cursor-pointer gap-1.5 border-border hover:bg-sidebar-accent/50"
                >
                  <RotateCcw className="h-4 w-4" />
                  Reset
                </Button>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Sales Logs Table */}
      <Card className="border border-border bg-card/45 backdrop-blur-md overflow-hidden shadow-md hover:shadow-lg transition-all hover:border-primary/20 duration-300 rounded-2xl">
        <div className="overflow-x-auto bg-background/30">
          <Table>
            <TableHeader className="bg-muted/40 border-b border-border/40">
              <TableRow>
                <TableHead className="w-[140px] text-xs font-bold uppercase tracking-wider">Invoice</TableHead>
                <TableHead className="w-[140px] text-xs font-bold uppercase tracking-wider">Date</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider">Customer</TableHead>
                <TableHead className="w-[120px] text-right text-xs font-bold uppercase tracking-wider">Grand Total</TableHead>
                <TableHead className="w-[120px] text-xs font-bold uppercase tracking-wider">Payment Status</TableHead>
                <TableHead className="w-[110px] text-xs font-bold uppercase tracking-wider">Sale Status</TableHead>
                <TableHead className="w-[130px] text-xs font-bold uppercase tracking-wider">Created By</TableHead>
                <TableHead className="w-[140px] text-right text-xs font-bold uppercase tracking-wider">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {Array.from({ length: 8 }).map((_, colIndex) => (
                      <TableCell key={colIndex}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : sales.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="h-32 text-center text-xs text-muted-foreground">
                    No sales records found matching the filters.
                  </TableCell>
                </TableRow>
              ) : (
                sales.map((item) => (
                  <TableRow key={item._id} className="hover:bg-muted/15 transition-all duration-200 group border-b border-border/40 text-xs">
                    <TableCell className="font-mono font-bold text-foreground">
                      {item.invoiceNumber}
                    </TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap font-mono text-[11px]">
                      {format(new Date(item.saleDate), "MMM dd, yyyy HH:mm")}
                    </TableCell>
                    <TableCell>
                      <div className="font-medium text-foreground">{item.customerName}</div>
                      {item.customerPhone && (
                        <div className="text-[10px] text-muted-foreground font-mono">{item.customerPhone}</div>
                      )}
                    </TableCell>
                    <TableCell className="text-right font-bold text-foreground font-mono">
                      ${item.grandTotal.toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={paymentBadgeVariants[item.paymentStatus]} className="capitalize text-[10px] px-2 py-0.5">
                        {item.paymentStatus === "partial" ? "Partial" : item.paymentStatus}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={saleBadgeVariants[item.saleStatus]} className="capitalize text-[10px] px-2 py-0.5">
                        {item.saleStatus}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground truncate max-w-[120px]">
                      {typeof item.createdBy === "object" ? item.createdBy.name : "System"}
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap">
                      <div className="flex justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/sales/${item._id}`)}
                          className="h-8 w-8 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                          title="View Details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => router.push(`/sales/${item._id}/edit`)}
                          className="h-8 w-8 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground cursor-pointer"
                          title="Edit Sale"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        {isAdmin && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(item._id, item.invoiceNumber)}
                            className="h-8 w-8 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive cursor-pointer"
                            title="Delete Record"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Bar */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border/40 bg-muted/10 px-4 py-3 sm:px-6">
            <div className="text-xs text-muted-foreground">
              Showing <span className="font-medium">{(page - 1) * meta.limit + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(page * meta.limit, meta.total)}
              </span>{" "}
              of <span className="font-medium">{meta.total}</span> records
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page <= 1}
                className="h-8 text-xs gap-1.5 cursor-pointer border-border hover:bg-sidebar-accent/50"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                Prev
              </Button>
              <span className="text-xs text-muted-foreground font-semibold px-2">
                Page {page} of {meta.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(p + 1, meta.totalPages))}
                disabled={page >= meta.totalPages}
                className="h-8 text-xs gap-1.5 cursor-pointer border-border hover:bg-sidebar-accent/50"
              >
                Next
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

export default function SalesPage() {
  return (
    <Suspense fallback={
      <div className="p-8 max-w-[1200px] mx-auto text-center py-20 text-muted-foreground text-xs">
        Loading sales records...
      </div>
    }>
      <SalesPageContent />
    </Suspense>
  );
}
