"use client";

import { useState } from "react";
import Link from "next/link";
import { Product } from "@/types/product.types";
import { productsService } from "@/services/products.service";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Pencil, Eye, Trash2, Package, ShieldAlert, Barcode } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface ProductTableProps {
  products: Product[];
  isLoading: boolean;
  onDeleteSuccess: () => void;
}

export default function ProductTable({ products, isLoading, onDeleteSuccess }: ProductTableProps) {
  const { role } = useAuth();
  const isAdmin = role === "admin";
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteClick = (product: Product) => {
    setSelectedProduct(product);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedProduct) return;
    setIsDeleting(true);
    try {
      await productsService.remove(selectedProduct._id);
      toast.success("Product deleted successfully");
      setDeleteDialogOpen(false);
      onDeleteSuccess();
    } catch {
      toast.error("Failed to delete product");
    } finally {
      setIsDeleting(false);
      setSelectedProduct(null);
    }
  };

  const getStatusBadge = (stock: number, safety: number) => {
    if (stock < safety) {
      return <Badge variant="critical">Critical</Badge>;
    }
    if (stock < safety * 1.5) {
      return <Badge variant="warning">Warning</Badge>;
    }
    return <Badge variant="safe">Safe</Badge>;
  };

  const getStockBar = (stock: number, safety: number) => {
    const max = Math.max(safety * 2, stock);
    const percentage = max > 0 ? Math.min(100, (stock / max) * 100) : 0;
    
    let color = "bg-primary";
    if (stock < safety) {
      color = "bg-destructive";
    } else if (stock < safety * 1.5) {
      color = "bg-[oklch(0.72_0.18_55)]"; // warning amber
    } else {
      color = "bg-[oklch(0.70_0.18_145)]"; // safe green
    }
    
    return (
      <div className="w-full max-w-[140px] space-y-1">
        <div className="flex items-center justify-between text-[10px]">
          <span className="font-semibold text-foreground">{stock} units</span>
          <span className="text-muted-foreground font-medium">Min: {safety}</span>
        </div>
        <div className="h-1.5 w-full bg-secondary border border-border/10 rounded-full overflow-hidden">
          <div 
            className={`h-full ${color} rounded-full transition-all duration-500`} 
            style={{ width: `${percentage}%` }} 
          />
        </div>
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-border bg-card/45 backdrop-blur-md overflow-hidden p-6 shadow-md">
        <Table>
          <TableHeader className="bg-sidebar/30">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Barcode</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Stock Level</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, idx) => (
              <TableRow key={idx}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 rounded-lg" />
                    <div className="space-y-1.5">
                      <Skeleton className="h-4 w-[160px]" />
                      <Skeleton className="h-3 w-[80px]" />
                    </div>
                  </div>
                </TableCell>
                <TableCell><Skeleton className="h-4 w-[85px] rounded" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[70px] rounded" /></TableCell>
                <TableCell><Skeleton className="h-6 w-[120px] rounded" /></TableCell>
                <TableCell><Skeleton className="h-5 w-[60px] rounded-full" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-8 w-[90px] ml-auto rounded-lg" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-16 border border-dashed rounded-2xl bg-card/40 backdrop-blur-md text-center space-y-4 animate-fade-in border-border/80">
        <div className="p-4 bg-muted/40 rounded-full text-muted-foreground border border-border/50">
          <ShieldAlert className="h-8 w-8 text-primary" />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-lg text-foreground">No products found</h3>
          <p className="text-xs text-muted-foreground max-w-sm">
            Try adjusting your search queries or category filters to find the products.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="rounded-2xl border border-border bg-card/45 backdrop-blur-md overflow-hidden shadow-md hover:shadow-lg transition-all hover:border-primary/20 duration-300">
        <Table>
          <TableHeader className="bg-muted/40 border-b border-border/40">
            <TableRow>
              <TableHead className="font-bold text-xs">Product Details</TableHead>
              <TableHead className="font-bold text-xs">Barcode</TableHead>
              <TableHead className="font-bold text-xs">Category</TableHead>
              <TableHead className="font-bold text-xs">Stock Level</TableHead>
              <TableHead className="font-bold text-xs">Status</TableHead>
              <TableHead className="font-bold text-xs text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product._id} className="hover:bg-muted/15 transition-all duration-200 group border-b border-border/40">
                <TableCell className="py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 border border-primary/15 text-primary transition-all group-hover:scale-105 shadow-inner">
                      <Package className="h-4.5 w-4.5" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <Link 
                          href={`/inventory/${product._id}`}
                          className="font-semibold text-sm text-foreground hover:text-primary transition-colors truncate"
                        >
                          {product.name}
                        </Link>
                        {product.brand && (
                          <span className="text-[9px] bg-muted px-1.5 py-0.5 border rounded-sm font-medium text-muted-foreground uppercase tracking-wider">
                            {product.brand}
                          </span>
                        )}
                      </div>
                      <span className="text-[10px] text-muted-foreground">
                        Unit: {product.unit || "pcs"} | Cost: ${product.costPrice.toFixed(2)} | Price: ${product.sellingPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="inline-flex items-center gap-1 bg-secondary text-secondary-foreground font-mono text-[10px] px-2 py-0.5 rounded border border-border/50">
                    <Barcode className="h-3 w-3 opacity-60" />
                    {product.barcode}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className="border-border/60 hover:bg-transparent capitalize text-[10px] px-2 py-0.5">
                    {product.category}
                  </Badge>
                </TableCell>
                <TableCell className="py-3.5">
                  {getStockBar(product.totalStock, product.safetyStockLevel)}
                </TableCell>
                <TableCell>
                  {getStatusBadge(product.totalStock, product.safetyStockLevel)}
                </TableCell>
                <TableCell className="text-right py-3.5">
                  <div className="flex justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                    <Link href={`/inventory/${product._id}`} passHref>
                      <Button variant="ghost" size="icon-sm" title="View Details" className="h-8 w-8 hover:text-primary cursor-pointer hover:bg-sidebar-accent/30 rounded-lg">
                        <Eye className="h-4 w-4" />
                      </Button>
                    </Link>
                    <Link href={`/inventory/${product._id}?edit=true`} passHref>
                      <Button variant="ghost" size="icon-sm" title="Edit Product" className="h-8 w-8 hover:text-primary cursor-pointer hover:bg-sidebar-accent/30 rounded-lg">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </Link>
                    {isAdmin && (
                      <Button
                        variant="ghost"
                        size="icon-sm"
                        title="Delete Product"
                        onClick={() => handleDeleteClick(product)}
                        className="h-8 w-8 hover:text-destructive cursor-pointer hover:bg-destructive/10 rounded-lg"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md bg-card border border-border rounded-2xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">Confirm Deletion</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-1">
              Are you sure you want to delete <strong>{selectedProduct?.name}</strong>? This action hides it from active listings.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" size="sm" onClick={() => setDeleteDialogOpen(false)} className="text-xs border-border hover:bg-sidebar-accent cursor-pointer">
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              isLoading={isDeleting}
              onClick={handleConfirmDelete}
              className="text-xs cursor-pointer"
            >
              Delete Product
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
