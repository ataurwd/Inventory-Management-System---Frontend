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
import { Pencil, Eye, Trash2, ShieldAlert } from "lucide-react";

interface ProductTableProps {
  products: Product[];
  isLoading: boolean;
  onDeleteSuccess: () => void;
}

export default function ProductTable({ products, isLoading, onDeleteSuccess }: ProductTableProps) {
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

  if (isLoading) {
    return (
      <div className="border rounded-xl bg-card overflow-hidden">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Barcode</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Total Stock</TableHead>
              <TableHead>Safety Level</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, idx) => (
              <TableRow key={idx}>
                <TableCell><Skeleton className="h-4 w-[180px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                <TableCell><Skeleton className="h-4 w-[60px]" /></TableCell>
                <TableCell><Skeleton className="h-6 w-[80px] rounded-full" /></TableCell>
                <TableCell className="text-right"><Skeleton className="h-8 w-[60px] ml-auto rounded-lg" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 border border-dashed rounded-2xl bg-card/50 text-center space-y-4">
        <div className="p-3 bg-muted rounded-full text-muted-foreground">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <div className="space-y-1">
          <h3 className="font-semibold text-lg">No products found</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Try adjusting your search filters or add a new product to the inventory database.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-xl bg-card overflow-hidden shadow-lg border-border">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Barcode</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Total Stock</TableHead>
              <TableHead>Safety Level</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product._id}>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell className="text-muted-foreground font-mono text-xs">{product.barcode}</TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell className="font-bold">{product.totalStock}</TableCell>
                <TableCell className="text-muted-foreground">{product.safetyStockLevel}</TableCell>
                <TableCell>{getStatusBadge(product.totalStock, product.safetyStockLevel)}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Link href={`/inventory/${product._id}`} passHref>
                    <Button variant="outline" size="icon-sm" title="View Product">
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                  <Link href={`/inventory/${product._id}?edit=true`} passHref>
                    <Button variant="outline" size="icon-sm" title="Edit Product">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                  <Button
                    variant="destructive"
                    size="icon-sm"
                    title="Delete Product"
                    onClick={() => handleDeleteClick(product)}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Delete Product</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <strong>{selectedProduct?.name}</strong>? This action will hide the product from the active inventory list.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              isLoading={isDeleting}
              onClick={handleConfirmDelete}
            >
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
