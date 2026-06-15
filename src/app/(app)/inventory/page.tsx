"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import ProductTable from "@/components/inventory/ProductTable";
import { useProducts } from "@/hooks/useProducts";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

export default function InventoryPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [category, setCategory] = useState("");

  // Debounce search input by 300ms
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(handler);
  }, [search]);

  const { products: allProducts } = useProducts();
  const { products, isLoading, mutate } = useProducts({
    search: debouncedSearch,
    category: category || undefined,
  });

  const defaultCategories = ["Grocery", "Dairy", "Beverages", "Bakery", "Meat/Poultry", "Snacks", "Household"];
  const uniqueProductCategories = allProducts
    ? Array.from(new Set(allProducts.map((p) => p.category)))
    : [];
  const categories = Array.from(new Set([...defaultCategories, ...uniqueProductCategories])).sort();

  const breadcrumbs = [
    { label: "App", href: "/dashboard" },
    { label: "Inventory" }
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6 animate-fade-in">
      <PageHeader
        title="Inventory"
        breadcrumbs={breadcrumbs}
        action={{
          label: "Add Product",
          onClick: () => router.push("/inventory/new"),
        }}
      />

      {/* Filters Area */}
      <div className="flex flex-col sm:flex-row gap-4 items-center bg-card border border-border p-4 rounded-xl shadow-md">
        <div className="relative w-full sm:flex-1">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground pointer-events-none" />
          <Input
            placeholder="Search by product name or barcode..."
            className="pl-9 h-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="w-full sm:w-48">
          <select
            id="category-filter"
            className="flex h-9 w-full rounded-lg border border-input bg-background px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
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
