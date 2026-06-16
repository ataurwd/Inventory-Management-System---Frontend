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
import { 
  Search, 
  RotateCcw,
  DollarSign, 
  BarChart3, 
  Receipt, 
  Wallet,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react";

export default function TransactionsPage() {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(15);
  const [type, setType] = useState<string>("");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const filters = {
    page,
    limit: pageSize,
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

  const hasActiveFilters = search !== "" || searchQuery !== "" || type !== "" || fromDate !== "" || toDate !== "";

  const getPageNumbers = (totalPages: number, currentPage: number) => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      if (start > 2) {
        pages.push("...");
      }

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (end < totalPages - 1) {
        pages.push("...");
      }

      pages.push(totalPages);
    }
    return pages;
  };

  return (
    <div className="p-8 max-w-[1500px] mx-auto space-y-6 animate-fade-in">
      <PageHeader title="Transaction Logs" breadcrumbs={breadcrumbs} />

      {/* Summary Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {loadingSummary || !summary ? (
          Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-2xl border border-border/60" />
          ))
        ) : (
          <>
            <div className="bg-card/45 backdrop-blur-md p-5 flex items-center justify-between border border-border/80 rounded-2xl shadow-xs hover:shadow-md transition-all hover:border-primary/20 duration-300">
              <div className="space-y-1.5 text-left">
                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider block">
                  Total Sales Revenue
                </span>
                <span className="text-2xl font-black text-foreground">${summary.totalRevenue.toFixed(2)}</span>
              </div>
              <div className="p-3 bg-primary/10 rounded-xl text-primary border border-primary/20 shadow-inner">
                <DollarSign className="h-5 w-5" />
              </div>
            </div>

            <div className="bg-card/45 backdrop-blur-md p-5 flex items-center justify-between border border-border/80 rounded-2xl shadow-xs hover:shadow-md transition-all hover:border-primary/20 duration-300">
              <div className="space-y-1.5 text-left">
                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider block">
                  Total Cost of Goods
                </span>
                <span className="text-2xl font-black text-foreground">${summary.totalCost.toFixed(2)}</span>
              </div>
              <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500 border border-amber-500/20 shadow-inner">
                <Wallet className="h-5 w-5" />
              </div>
            </div>

            <div className="bg-card/45 backdrop-blur-md p-5 flex items-center justify-between border border-border/80 rounded-2xl shadow-xs hover:shadow-md transition-all hover:border-primary/20 duration-300">
              <div className="space-y-1.5 text-left">
                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider block">
                  Net Profit
                </span>
                <span className={`text-2xl font-black block ${summary.netProfit >= 0 ? "text-primary" : "text-destructive"}`}>
                  ${summary.netProfit.toFixed(2)}
                </span>
              </div>
              <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500 border border-emerald-500/20 shadow-inner">
                <BarChart3 className="h-5 w-5" />
              </div>
            </div>

            <div className="bg-card/45 backdrop-blur-md p-5 flex items-center justify-between border border-border/80 rounded-2xl shadow-xs hover:shadow-md transition-all hover:border-primary/20 duration-300">
              <div className="space-y-1.5 text-left">
                <span className="text-[10px] text-muted-foreground font-black uppercase tracking-wider block">
                  Total Transactions
                </span>
                <span className="text-2xl font-black text-foreground">{summary.transactionCount}</span>
              </div>
              <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500 border border-blue-500/20 shadow-inner">
                <Receipt className="h-5 w-5" />
              </div>
            </div>
          </>
        )}
      </div>

      {/* Filter Control Bar */}
      <div className="bg-card/45 backdrop-blur-md p-5 border border-border/80 rounded-2xl shadow-xs">
        <form onSubmit={handleSearchSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
            <div className="sm:col-span-4 space-y-1.5 text-left">
              <label htmlFor="search" className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                Search Product
              </label>
              <div className="relative">
                <Input
                  id="search"
                  placeholder="Search by product name..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8.5 h-9 text-xs rounded-lg border-border/85 focus-visible:ring-primary"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
              </div>
            </div>

            <div className="sm:col-span-2 space-y-1.5 text-left">
              <label htmlFor="type" className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
                Type
              </label>
              <select
                id="type"
                value={type}
                onChange={(e) => {
                  setType(e.target.value);
                  setPage(1);
                }}
                className="flex h-9 w-full rounded-lg border border-border/80 bg-background px-3 py-1 text-xs shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
              >
                <option value="">All Types</option>
                <option value="sale">Sale</option>
                <option value="restock">Restock</option>
                <option value="waste">Waste</option>
              </select>
            </div>

            <div className="sm:col-span-2 space-y-1.5 text-left">
              <label htmlFor="from" className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
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
                className="h-9 text-xs rounded-lg border-border/85 cursor-pointer focus-visible:ring-primary"
              />
            </div>

            <div className="sm:col-span-2 space-y-1.5 text-left">
              <label htmlFor="to" className="text-[10px] font-black text-muted-foreground uppercase tracking-wider">
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
                className="h-9 text-xs rounded-lg border-border/85 cursor-pointer focus-visible:ring-primary"
              />
            </div>

            <div className="sm:col-span-2 flex gap-2 w-full">
              <Button type="submit" size="sm" className="flex-1 h-9 text-xs rounded-lg cursor-pointer">
                Filter
              </Button>
              {hasActiveFilters && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleResetFilters}
                  className="h-9 text-xs gap-1.5 cursor-pointer border-border hover:bg-sidebar-accent/50"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Reset
                </Button>
              )}
            </div>
          </div>
        </form>
      </div>

      {/* Transaction Logs Table */}
      <div className="rounded-2xl border border-border bg-card/45 backdrop-blur-md overflow-hidden shadow-md hover:shadow-lg transition-all hover:border-primary/20 duration-300">
        <Table>
          <TableHeader className="bg-muted/40 border-b border-border/40">
            <TableRow>
              <TableHead className="w-[160px] text-xs font-bold uppercase tracking-wider">Date & Time</TableHead>
              <TableHead className="text-xs font-bold uppercase tracking-wider">Product details</TableHead>
              <TableHead className="w-[100px] text-xs font-bold uppercase tracking-wider">Type</TableHead>
              <TableHead className="w-[100px] text-right text-xs font-bold uppercase tracking-wider">Qty</TableHead>
              <TableHead className="w-[100px] text-right text-xs font-bold uppercase tracking-wider">Unit Price</TableHead>
              <TableHead className="w-[100px] text-right text-xs font-bold uppercase tracking-wider">Total</TableHead>
              <TableHead className="w-[150px] text-xs font-bold uppercase tracking-wider">Performed By</TableHead>
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
                <TableCell colSpan={7} className="h-32 text-center text-xs text-muted-foreground font-medium">
                  No transaction logs found matching the active filters.
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((item) => (
                <TableRow key={item._id} className="hover:bg-muted/15 transition-all duration-200 border-b border-border/40 text-xs group">
                  <TableCell className="font-mono text-muted-foreground whitespace-nowrap text-[11px]">
                    {format(new Date(item.timestamp), "MMM dd, yyyy HH:mm")}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-0.5 text-left">
                      <span className="font-semibold text-foreground block">
                        {item.productId?.name || "Deleted Product"}
                      </span>
                      {item.productId && (
                        <span className="text-[10px] text-muted-foreground font-mono block">
                          Barcode: {item.productId.barcode} | Batch: {item.batchNo}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={typeBadgeVariants[item.type]} className="capitalize text-[10px] px-2 py-0.5">
                      {item.type}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium font-mono text-[11px] whitespace-nowrap">
                    {item.qty} {item.productId?.unit}
                  </TableCell>
                  <TableCell className="text-right text-muted-foreground font-mono text-[11px] whitespace-nowrap">
                    ${item.unitPrice.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-right font-bold text-foreground font-mono whitespace-nowrap">
                    ${item.total.toFixed(2)}
                  </TableCell>
                  <TableCell className="text-muted-foreground whitespace-nowrap text-left">
                    {item.performedBy?.name || "System"}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Smart Pagination Footer */}
        {meta && meta.totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t bg-muted/10 border-border/40 px-6 py-4">
            {/* Showing Stats */}
            <div className="text-xs text-muted-foreground font-medium">
              Showing <strong className="text-foreground">{(page - 1) * meta.limit + 1}</strong> to{" "}
              <strong className="text-foreground">
                {Math.min(page * meta.limit, meta.total)}
              </strong>{" "}
              of <strong className="text-foreground">{meta.total}</strong> logs
              {hasActiveFilters && <span className="text-[10px] text-primary ml-1.5 font-semibold uppercase tracking-wider bg-primary/10 px-2 py-0.5 rounded border border-primary/10 animate-pulse">Filtered</span>}
            </div>

            {/* Controls */}
            <div className="flex items-center gap-6 flex-wrap">
              {/* Rows dropdown */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-medium">Rows per page:</span>
                <select
                  className="flex h-8 w-16 rounded-lg border border-border/80 bg-background px-2 py-0.5 text-xs shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
                  value={pageSize}
                  onChange={(e) => {
                    setPageSize(Number(e.target.value));
                    setPage(1);
                  }}
                >
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                  <option value={25}>25</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </div>

              {/* Page Buttons */}
              <div className="flex items-center gap-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(1)}
                  disabled={page === 1}
                  className="h-8 w-8 p-0 flex items-center justify-center hover:bg-sidebar-accent/50 cursor-pointer border-border disabled:opacity-50 disabled:cursor-not-allowed"
                  title="First Page"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  disabled={page === 1}
                  className="h-8 w-8 p-0 flex items-center justify-center hover:bg-sidebar-accent/50 cursor-pointer border-border disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Previous Page"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                {/* Render Ellipsis Page Numbers */}
                {getPageNumbers(meta.totalPages, page).map((pageNum, idx) => (
                  <button
                    key={idx}
                    onClick={() => typeof pageNum === "number" && setPage(pageNum)}
                    disabled={pageNum === "..."}
                    className={`h-8 w-8 text-xs font-semibold rounded-lg transition-all ${
                      pageNum === page
                        ? "bg-primary text-primary-foreground shadow-xs border border-primary/20 cursor-pointer"
                        : pageNum === "..."
                        ? "cursor-default text-muted-foreground"
                        : "hover:bg-sidebar-accent/50 text-muted-foreground hover:text-foreground border border-transparent hover:border-border/50 cursor-pointer"
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage((p) => Math.min(p + 1, meta.totalPages))}
                  disabled={page === meta.totalPages}
                  className="h-8 w-8 p-0 flex items-center justify-center hover:bg-sidebar-accent/50 cursor-pointer border-border disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Next Page"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPage(meta.totalPages)}
                  disabled={page === meta.totalPages}
                  className="h-8 w-8 p-0 flex items-center justify-center hover:bg-sidebar-accent/50 cursor-pointer border-border disabled:opacity-50 disabled:cursor-not-allowed"
                  title="Last Page"
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
