"use client";

import { useState } from "react";
import useSWR from "swr";
import PageHeader from "@/components/layout/PageHeader";
import { useTransactions } from "@/hooks/useTransactions";
import { transactionsService } from "@/services/transactions.service";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Search, ArrowLeft, ArrowRight, DollarSign, BarChart3, Receipt, Wallet } from "lucide-react";

export default function TransactionsPage() {
  const [page, setPage] = useState(1);
  const [type, setType] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filters = {
    page,
    limit: 15,
    type: type || undefined,
    from: fromDate || undefined,
    to: toDate || undefined,
    search: searchQuery || undefined,
  };

  const { transactions, meta, isLoading } = useTransactions(filters);

  const { data: summary, isLoading: loadingSummary } = useSWR(
    ["/transactions/summary", fromDate, toDate],
    () => transactionsService.getSummary(fromDate || undefined, toDate || undefined)
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(search);
    setPage(1);
  };

  const handleResetFilters = () => {
    setSearch("");
    setSearchQuery("");
    setType("");
    setFromDate("");
    setToDate("");
    setPage(1);
  };

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Transactions" },
  ];

  const typeBadgeVariants = {
    sale: "secondary" as const,
    restock: "safe" as const,
    waste: "critical" as const,
  };

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-fade-in">
      <PageHeader title="Transaction Logs" breadcrumbs={breadcrumbs} />

      {/* Summary Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loadingSummary || !summary ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))
        ) : (
          <>
            <Card className="p-4 flex items-center justify-between shadow-sm border border-border">
              <div className="space-y-1.5">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider block">
                  Total Sales Revenue
                </span>
                <span className="text-xl font-bold">${summary.totalRevenue.toFixed(2)}</span>
              </div>
              <div className="p-2.5 bg-primary/10 rounded-xl text-primary border">
                <DollarSign className="h-5 w-5" />
              </div>
            </Card>

            <Card className="p-4 flex items-center justify-between shadow-sm border border-border">
              <div className="space-y-1.5">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider block">
                  Total Cost of Goods
                </span>
                <span className="text-xl font-bold">${summary.totalCost.toFixed(2)}</span>
              </div>
              <div className="p-2.5 bg-amber-500/10 rounded-xl text-amber-500 border">
                <Wallet className="h-5 w-5" />
              </div>
            </Card>

            <Card className="p-4 flex items-center justify-between shadow-sm border border-border">
              <div className="space-y-1.5">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider block">
                  Net Profit
                </span>
                <span className={`text-xl font-bold ${summary.netProfit >= 0 ? "text-emerald-500" : "text-destructive"}`}>
                  ${summary.netProfit.toFixed(2)}
                </span>
              </div>
              <div className="p-2.5 bg-emerald-500/10 rounded-xl text-emerald-500 border">
                <BarChart3 className="h-5 w-5" />
              </div>
            </Card>

            <Card className="p-4 flex items-center justify-between shadow-sm border border-border">
              <div className="space-y-1.5">
                <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider block">
                  Total Transactions
                </span>
                <span className="text-xl font-bold">{summary.transactionCount}</span>
              </div>
              <div className="p-2.5 bg-blue-500/10 rounded-xl text-blue-500 border">
                <Receipt className="h-5 w-5" />
              </div>
            </Card>
          </>
        )}
      </div>

      {/* Filter Control Bar */}
      <Card className="p-4 border border-border shadow-sm">
        <form onSubmit={handleSearchSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-4 space-y-1">
              <label htmlFor="search" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Search Product
              </label>
              <div className="relative">
                <Input
                  id="search"
                  placeholder="Product name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 h-8.5 text-xs rounded-lg"
                />
                <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground" />
              </div>
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label htmlFor="type" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Type
              </label>
              <select
                id="type"
                value={type}
                onChange={(e) => {
                  setType(e.target.value);
                  setPage(1);
                }}
                className="w-full text-xs h-8.5 rounded-lg border border-input bg-background px-3 text-foreground shadow-sm focus:outline-none focus:ring-1 focus:ring-ring"
              >
                <option value="">All Types</option>
                <option value="sale">Sale</option>
                <option value="restock">Restock</option>
                <option value="waste">Waste</option>
              </select>
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label htmlFor="from" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                From Date
              </label>
              <Input
                id="from"
                type="date"
                value={fromDate}
                onChange={(e) => {
                  setFromDate(e.target.value);
                  setPage(1);
                }}
                className="h-8.5 text-xs rounded-lg"
              />
            </div>

            <div className="sm:col-span-2 space-y-1">
              <label htmlFor="to" className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                To Date
              </label>
              <Input
                id="to"
                type="date"
                value={toDate}
                onChange={(e) => {
                  setToDate(e.target.value);
                  setPage(1);
                }}
                className="h-8.5 text-xs rounded-lg"
              />
            </div>

            <div className="sm:col-span-2 flex gap-2 w-full">
              <Button type="submit" size="sm" className="flex-1 h-8.5 text-xs rounded-lg">
                Filter
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="h-8.5 text-xs rounded-lg"
              >
                Reset
              </Button>
            </div>
          </div>
        </form>
      </Card>

      {/* Transaction Logs Table */}
      <Card className="border border-border bg-card/45 backdrop-blur-md overflow-hidden shadow-md hover:shadow-lg transition-all hover:border-primary/20 duration-300 rounded-2xl">
        <div className="overflow-x-auto bg-background/30">
          <Table>
            <TableHeader className="bg-muted/40 border-b border-border/40">
              <TableRow>
                <TableHead className="w-[160px] text-xs font-bold uppercase tracking-wider">Date & Time</TableHead>
                <TableHead className="text-xs font-bold uppercase tracking-wider">Product</TableHead>
                <TableHead className="w-[100px] text-xs font-bold uppercase tracking-wider">Type</TableHead>
                <TableHead className="w-[80px] text-right text-xs font-bold uppercase tracking-wider">Qty</TableHead>
                <TableHead className="w-[100px] text-right text-xs font-bold uppercase tracking-wider">Unit Price</TableHead>
                <TableHead className="w-[100px] text-right text-xs font-bold uppercase tracking-wider">Total</TableHead>
                <TableHead className="w-[140px] text-xs font-bold uppercase tracking-wider">Performed By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                Array.from({ length: 5 }).map((_, rowIndex) => (
                  <TableRow key={rowIndex}>
                    {Array.from({ length: 7 }).map((_, colIndex) => (
                      <TableCell key={colIndex}>
                        <Skeleton className="h-4 w-full" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-32 text-center text-xs text-muted-foreground">
                    No transactions found matching the filters.
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((item) => (
                  <TableRow key={item._id} className="hover:bg-muted/15 transition-all duration-200 border-b border-border/40 text-xs">
                    <TableCell className="font-mono text-muted-foreground whitespace-nowrap text-[11px]">
                      {format(new Date(item.timestamp), "MMM dd, yyyy HH:mm")}
                    </TableCell>
                    <TableCell>
                      <div className="space-y-0.5">
                        <span className="font-semibold text-foreground block">
                          {item.productId?.name || "Deleted Product"}
                        </span>
                        {item.productId && (
                          <span className="text-[10px] text-muted-foreground font-mono">
                            {item.productId.barcode} (Batch: {item.batchNo})
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={typeBadgeVariants[item.type]} className="capitalize text-[10px] px-2 py-0.5">
                        {item.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium font-mono text-[11px]">
                      {item.qty} {item.productId?.unit}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground font-mono text-[11px]">
                      ${item.unitPrice.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-bold text-foreground font-mono">
                      ${item.total.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-muted-foreground whitespace-nowrap">
                      {item.performedBy?.name || "System"}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Bar */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between border-t bg-muted/20 px-4 py-3 sm:px-6">
            <div className="text-xs text-muted-foreground">
              Showing <span className="font-medium">{(page - 1) * meta.limit + 1}</span> to{" "}
              <span className="font-medium">
                {Math.min(page * meta.limit, meta.total)}
              </span>{" "}
              of <span className="font-medium">{meta.total}</span> logs
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
                disabled={page <= 1}
                className="h-8 text-xs gap-1.5"
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
                className="h-8 text-xs gap-1.5"
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
