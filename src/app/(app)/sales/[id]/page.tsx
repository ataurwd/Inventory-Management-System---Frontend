"use client";

import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { salesService } from "@/services/sales.service";
import PageHeader from "@/components/layout/PageHeader";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import {
  Printer,
  Edit,
  ArrowLeft,
  FileText,
  CreditCard,
  User,
  ShoppingBag,
  Info,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";

export default function SaleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const saleId = params.id as string;
  const { role } = useAuth();
  const isAdmin = role === "admin";

  const { data: sale, error, isLoading, mutate } = useSWR(
    saleId ? `/sales/${saleId}` : null,
    () => salesService.getById(saleId)
  );

  const handlePrint = () => {
    window.print();
  };

  const handleDelete = async () => {
    if (!isAdmin) {
      toast.error("Permission denied. Only admins can delete sales.");
      return;
    }

    if (!confirm(`Are you sure you want to delete sale ${sale?.invoiceNumber}? This will restore stock levels.`)) {
      return;
    }

    try {
      await salesService.remove(saleId);
      toast.success("Sale transaction deleted and stock restored.");
      router.push("/sales");
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete sale record");
    }
  };

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Sales Management", href: "/sales" },
    { label: sale?.invoiceNumber || "Details" },
  ];

  if (error) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-4">
        <div className="flex flex-col items-center justify-center p-16 border border-dashed rounded-2xl bg-card text-center space-y-4">
          <Info className="h-8 w-8 text-destructive" />
          <h3 className="font-semibold text-lg">Sale transaction not found</h3>
          <p className="text-sm text-muted-foreground">The transaction you are looking for does not exist or has been removed.</p>
          <Button variant="outline" onClick={() => router.push("/sales")}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Sales
          </Button>
        </div>
      </div>
    );
  }

  if (isLoading || !sale) {
    return (
      <div className="p-8 max-w-4xl mx-auto space-y-6">
        <Skeleton className="h-8 w-64" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Skeleton className="h-40 rounded-xl md:col-span-2" />
          <Skeleton className="h-40 rounded-xl" />
        </div>
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

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

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6 animate-fade-in relative">
      
      {/* Print Style Injector */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-invoice, #printable-invoice * {
            visibility: visible;
          }
          #printable-invoice {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            border: none !important;
            box-shadow: none !important;
            background: white !important;
            color: black !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>

      {/* Header controls (hidden on print) */}
      <div className="no-print">
        <PageHeader
          title={`Invoice ${sale.invoiceNumber}`}
          breadcrumbs={breadcrumbs}
          action={{
            label: "Print Invoice",
            onClick: handlePrint,
          }}
        />
      </div>

      {/* Extra Action Buttons (hidden on print) */}
      <div className="flex gap-2 justify-end no-print">
        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/sales/${saleId}/edit`)}
          className="h-8.5 text-xs rounded-lg cursor-pointer gap-1.5 border-border hover:bg-sidebar-accent/50"
        >
          <Edit className="h-3.5 w-3.5" />
          Edit Sale
        </Button>
        {isAdmin && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            className="h-8.5 text-xs rounded-lg cursor-pointer gap-1.5 border-border hover:bg-destructive/5 hover:text-destructive hover:border-destructive/30"
          >
            Delete Sale
          </Button>
        )}
      </div>

      {/* INVOICE CONTENT (printable card) */}
      <Card id="printable-invoice" className="border border-border shadow-md overflow-hidden bg-card text-foreground">
        
        {/* Invoice Header */}
        <div className="border-b border-border/40 p-6 sm:p-8 flex flex-col sm:flex-row justify-between gap-4 bg-muted/20">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20 text-primary">
                <ShoppingBag className="h-4 w-4" />
              </div>
              <span className="text-lg font-bold tracking-tight text-foreground">SmartStock POS</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1 max-w-[200px]">
              123 Commercial St, Business Hub, City 1000
            </p>
          </div>
          
          <div className="sm:text-right space-y-1">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest block">Invoice Receipt</span>
            <span className="text-lg font-mono font-extrabold text-primary block">{sale.invoiceNumber}</span>
            <span className="text-xs text-muted-foreground block">
              Date: {format(new Date(sale.saleDate), "MMMM dd, yyyy hh:mm a")}
            </span>
          </div>
        </div>

        {/* Invoice Metadata Info */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-6 sm:p-8 border-b border-border/30 text-xs">
          
          {/* Customer info */}
          <div className="space-y-2">
            <span className="font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <User className="h-3.5 w-3.5 text-primary" />
              Customer Info
            </span>
            <div className="space-y-0.5 font-medium">
              <div className="text-foreground text-sm font-semibold">{sale.customerName}</div>
              {sale.customerPhone && (
                <div className="text-muted-foreground font-mono">{sale.customerPhone}</div>
              )}
            </div>
          </div>

          {/* Payment metadata */}
          <div className="space-y-2">
            <span className="font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <CreditCard className="h-3.5 w-3.5 text-primary" />
              Payment Details
            </span>
            <div className="space-y-1.5 font-medium">
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground">Status:</span>
                <Badge variant={paymentBadgeVariants[sale.paymentStatus]} className="capitalize">
                  {sale.paymentStatus}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Method:</span>{" "}
                <span className="capitalize text-foreground font-semibold">{sale.paymentMethod.replace("_", " ")}</span>
              </div>
            </div>
          </div>

          {/* Transaction status */}
          <div className="space-y-2">
            <span className="font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
              <FileText className="h-3.5 w-3.5 text-primary" />
              Sale Info
            </span>
            <div className="space-y-1.5 font-medium">
              <div className="flex items-center gap-1.5">
                <span className="text-muted-foreground">Order Status:</span>
                <Badge variant={saleBadgeVariants[sale.saleStatus]} className="capitalize">
                  {sale.saleStatus}
                </Badge>
              </div>
              <div>
                <span className="text-muted-foreground">Rep:</span>{" "}
                <span className="text-foreground font-semibold">
                  {typeof sale.createdBy === "object" ? sale.createdBy.name : "System"}
                </span>
              </div>
            </div>
          </div>

        </div>

        {/* Sold Products Table */}
        <div className="p-6 sm:p-8">
          <Table>
            <TableHeader className="bg-muted/30">
              <TableRow>
                <TableHead className="text-xs font-bold uppercase tracking-wider">Item Description</TableHead>
                <TableHead className="w-[100px] text-right text-xs font-bold uppercase tracking-wider">Price</TableHead>
                <TableHead className="w-[100px] text-center text-xs font-bold uppercase tracking-wider">Qty</TableHead>
                <TableHead className="w-[120px] text-right text-xs font-bold uppercase tracking-wider">Line Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sale.products.map((item) => (
                <TableRow key={item.productId} className="hover:bg-transparent border-b text-xs">
                  <TableCell className="py-3.5">
                    <div className="space-y-0.5">
                      <span className="font-bold text-foreground block">{item.name}</span>
                      <span className="text-[10px] text-muted-foreground font-mono block">
                        Barcode: {item.barcode}
                      </span>
                      {/* Batch tracking */}
                      {item.batches && item.batches.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-1 text-[9px]">
                          {item.batches.map((b) => (
                            <span
                              key={b.batchNo}
                              className="px-1.5 py-0.5 rounded-sm bg-muted text-muted-foreground font-mono"
                            >
                              Batch: {b.batchNo} ({b.qty} units) Exp: {format(new Date(b.expiryDate), "yyyy-MM-dd")}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground">
                    ${item.unitPrice.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-center font-medium">
                    {item.qty}
                  </TableCell>
                  <TableCell className="text-right font-bold text-foreground">
                    ${(item.qty * item.unitPrice).toFixed(2)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Invoice Summary Totals */}
        <div className="border-t border-border/30 p-6 sm:p-8 bg-muted/10 flex flex-col sm:flex-row justify-between gap-6 text-xs">
          
          {/* Notes */}
          <div className="sm:max-w-md space-y-1">
            <span className="font-bold text-muted-foreground uppercase tracking-wider block">Receipt Notes</span>
            <p className="text-muted-foreground italic leading-relaxed">
              {sale.notes || "No notes written on this sale."}
            </p>
          </div>

          {/* Mathematical breakdowns */}
          <div className="w-full sm:w-64 space-y-2">
            <div className="flex justify-between items-center text-muted-foreground">
              <span>Subtotal</span>
              <span className="font-medium text-foreground">${sale.subtotal.toFixed(2)}</span>
            </div>
            {sale.discount > 0 && (
              <div className="flex justify-between items-center text-destructive">
                <span>Discount</span>
                <span className="font-medium">-${sale.discount.toFixed(2)}</span>
              </div>
            )}
            {sale.tax > 0 && (
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Tax/VAT</span>
                <span className="font-medium text-foreground">+${sale.tax.toFixed(2)}</span>
              </div>
            )}
            
            <div className="border-t border-border/40 my-1 pt-1">
              <div className="flex justify-between items-center text-sm font-bold text-foreground">
                <span>Grand Total</span>
                <span>${sale.grandTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-muted-foreground pt-1">
              <span>Paid Amount</span>
              <span className="font-bold text-emerald-500">${sale.paidAmount.toFixed(2)}</span>
            </div>

            <div className="flex justify-between items-center border-t border-border/40 border-dashed pt-1">
              <span className="font-bold text-muted-foreground">Due Amount</span>
              <span className={`font-extrabold ${sale.dueAmount > 0 ? "text-destructive" : "text-emerald-500"}`}>
                ${sale.dueAmount.toFixed(2)}
              </span>
            </div>
          </div>

        </div>

        {/* Receipt Footer Message */}
        <div className="text-center p-6 border-t border-border/30 text-[10px] text-muted-foreground">
          <p className="font-medium">Thank you for shopping with us!</p>
          <p className="mt-0.5">Please keep this invoice receipt for auditing or returns.</p>
        </div>

      </Card>

    </div>
  );
}
