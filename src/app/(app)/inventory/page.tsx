"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import ProductTable from "@/components/inventory/ProductTable";
import { useProducts } from "@/hooks/useProducts";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, RotateCcw, Box } from "lucide-react";
import useSWR from "swr";
import { brandsService } from "@/services/brands.service";

function InventoryPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const [search, setSearch] = useState(() => searchParams.get("search") || "");
  const [debouncedSearch, setDebouncedSearch] = useState(() => searchParams.get("search") || "");
  const [category, setCategory] = useState(() => searchParams.get("category") || "");
  const [brand, setBrand] = useState(() => searchParams.get("brand") || "");
  const [status, setStatus] = useState(() => searchParams.get("status") || "all");

  // Fetch brands list dynamically from database
  const { data: brandsData } = useSWR(
    "/brands",
    () => brandsService.getAll()
  );

  const updateUrl = (newFilters: { search?: string; category?: string; brand?: string; status?: string }) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (newFilters.search !== undefined) {
      if (newFilters.search) params.set("search", newFilters.search);
      else params.delete("search");
    }
    
    if (newFilters.category !== undefined) {
      if (newFilters.category) params.set("category", newFilters.category);
      else params.delete("category");
    }

    if (newFilters.brand !== undefined) {
      if (newFilters.brand) params.set("brand", newFilters.brand);
      else params.delete("brand");
    }
    
    if (newFilters.status !== undefined) {
      if (newFilters.status && newFilters.status !== "all") params.set("status", newFilters.status);
      else params.delete("status");
    }
    
    router.replace(`${pathname}?${params.toString()}`);
  };

  // Debounce search input by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
      updateUrl({ search });
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const { products: allProducts } = useProducts();
  const { products, isLoading, mutate } = useProducts({
    search: debouncedSearch,
    category: category || undefined,
    brand: brand || undefined,
    status: status !== "all" ? status : undefined,
  });

  const defaultCategories = ["Grocery", "Dairy", "Beverages", "Bakery", "Meat/Poultry", "Snacks", "Household"];
  const uniqueProductCategories = allProducts
    ? Array.from(new Set(allProducts.map((p) => p.category)))
    : [];
  const categories = Array.from(new Set([...defaultCategories, ...uniqueProductCategories])).sort();

  const handleReset = () => {
    setSearch("");
    setCategory("");
    setBrand("");
    setStatus("all");
    router.replace(pathname);
  };

  const breadcrumbs = [
    { label: "App", href: "/dashboard" },
    { label: "Inventory" }
  ];

  const hasActiveFilters = search !== "" || category !== "" || brand !== "" || status !== "all";

  return (
    <div className="p-8 max-w-[1500px] mx-auto space-y-6 animate-fade-in">
      <PageHeader
        title="Inventory Catalog"
        breadcrumbs={breadcrumbs}
        action={{
          label: "Add Product",
          onClick: () => router.push("/inventory/new"),
        }}
      />

      {/* Advanced Filters Area */}
      <div className="flex flex-col gap-4 bg-card/45 backdrop-blur-md border border-border/80 p-5 rounded-2xl shadow-xs">
        <div className="flex flex-col md:flex-row gap-3 items-center w-full">
          {/* Search Box */}
          <div className="relative w-full md:flex-1">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search by product name or barcode..."
              className="pl-9 h-9 border-border/80 focus-visible:ring-primary"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Category Dropdown */}
          <div className="w-full md:w-48">
            <select
              id="category-filter"
              className="flex h-9 w-full rounded-lg border border-border/80 bg-background px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
              value={category}
              onChange={(e) => {
                const val = e.target.value;
                setCategory(val);
                updateUrl({ category: val });
              }}
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Brand Dropdown */}
          <div className="w-full md:w-48">
            <select
              id="brand-filter"
              className="flex h-9 w-full rounded-lg border border-border/80 bg-background px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
              value={brand}
              onChange={(e) => {
                const val = e.target.value;
                setBrand(val);
                updateUrl({ brand: val });
              }}
            >
              <option value="">All Brands</option>
              {brandsData?.map((b) => (
                <option key={b._id} value={b.name}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Dropdown */}
          <div className="w-full md:w-48">
            <select
              id="status-filter"
              className="flex h-9 w-full rounded-lg border border-border/80 bg-background px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
              value={status}
              onChange={(e) => {
                const val = e.target.value;
                setStatus(val);
                updateUrl({ status: val });
              }}
            >
              <option value="all">All Statuses</option>
              <option value="critical">Critical (Under Safety)</option>
              <option value="warning">Warning (Near Safety)</option>
              <option value="safe">Safe (Healthy Stock)</option>
            </select>
          </div>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="w-full md:w-auto h-9 text-xs gap-1.5 cursor-pointer border-border hover:bg-sidebar-accent/50"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </Button>
          )}
        </div>

        {/* Catalog Status Info Bar */}
        {!isLoading && (
          <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border/40 pt-3">
            <div className="flex items-center gap-1.5 font-medium">
              <Box className="h-4 w-4 text-primary" />
              <span>
                Showing <strong>{products.length}</strong> of <strong>{allProducts.length}</strong> catalog items
              </span>
            </div>
            {hasActiveFilters && (
              <span className="italic text-[10px] opacity-70">
                Filters active
              </span>
            )}
          </div>
        )}
      </div>

      {/* Product List Table */}
      <ProductTable
        products={products}
        isLoading={isLoading}
        onDeleteSuccess={mutate}
      />
    </div>
  );
}

export default function InventoryPage() {
  return (
    <Suspense fallback={
      <div className="p-8 max-w-[1500px] mx-auto text-center py-20 text-muted-foreground text-xs">
        Loading catalog...
      </div>
    }>
      <InventoryPageContent />
    </Suspense>
  );
}
