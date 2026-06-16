"use client";

import { useState } from "react";
import useSWR from "swr";
import { format, parseISO } from "date-fns";
import { brandsService, BrandItem } from "@/services/brands.service";
import PageHeader from "@/components/layout/PageHeader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import BrandFormModal from "@/components/inventory/BrandFormModal";
import { Edit2, Trash2, FolderOpen, Tag } from "lucide-react";
import { toast } from "sonner";
import axios from "axios";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

export default function BrandsPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [brandToEdit, setBrandToEdit] = useState<BrandItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch brands using SWR
  const { data: brands, isLoading, mutate } = useSWR(
    "/brands",
    () => brandsService.getAll()
  );

  const handleAddClick = () => {
    setBrandToEdit(null);
    setModalOpen(true);
  };

  const handleEditClick = (brand: BrandItem) => {
    setBrandToEdit(brand);
    setModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await brandsService.remove(deleteId);
      toast.success("Brand deleted successfully");
      mutate();
      setDeleteId(null);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const apiErrorData = error.response?.data as { error?: { message?: string } } | undefined;
        toast.error(apiErrorData?.error?.message || "Failed to delete brand");
      } else {
        toast.error("Failed to delete brand");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const breadcrumbs = [
    { label: "App", href: "/dashboard" },
    { label: "Inventory", href: "/inventory" },
    { label: "Brands" }
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6 animate-fade-in">
      <PageHeader
        title="Brand Management"
        breadcrumbs={breadcrumbs}
        action={{
          label: "Add Brand",
          onClick: handleAddClick,
        }}
      />

      <div className="rounded-2xl border border-border bg-card/45 backdrop-blur-md p-6 shadow-md hover:shadow-lg transition-all hover:border-primary/20 duration-300">
        <h3 className="font-bold text-base text-foreground mb-4 flex items-center gap-2">
          <Tag className="h-5 w-5 text-primary" />
          Product Brands list
        </h3>

        {isLoading || !brands ? (
          <div className="space-y-2.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full animate-pulse" />
            ))}
          </div>
        ) : brands.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground text-xs flex flex-col items-center gap-3">
            <FolderOpen className="h-10 w-10 text-muted-foreground/50" />
            No brands defined yet. Click "Add Brand" above to create one.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl bg-background/30">
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead className="font-bold text-xs">Brand Name</TableHead>
                  <TableHead className="font-bold text-xs text-center">Products Count</TableHead>
                  <TableHead className="font-bold text-xs">Date Created</TableHead>
                  <TableHead className="font-bold text-xs text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {brands.map((brand) => (
                  <TableRow key={brand._id} className="hover:bg-muted/15 transition-all duration-200 border-b border-border/40 group">
                    <TableCell className="font-semibold text-foreground">{brand.name}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="border-border/60 hover:bg-transparent text-[10px] px-2 py-0.5">
                        {brand.productCount ?? 0} items
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs font-mono">
                      {format(parseISO(brand.createdAt), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleEditClick(brand)}
                          className="h-8 w-8 hover:text-primary cursor-pointer hover:bg-sidebar-accent/30 rounded-lg"
                        >
                          <Edit2 className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setDeleteId(brand._id)}
                          className="h-8 w-8 hover:text-destructive cursor-pointer hover:bg-destructive/10 rounded-lg"
                        >
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete</span>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <BrandFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        brandToEdit={brandToEdit}
        onSuccess={mutate}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="sm:max-w-md bg-card border border-border rounded-2xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">Confirm Deletion</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-1">
              Are you sure you want to delete this brand? This action cannot be undone. 
              Note that you cannot delete brands that are currently assigned to products.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeleteId(null)}
              className="text-xs cursor-pointer border-border hover:bg-sidebar-accent"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteConfirm}
              isLoading={isDeleting}
              className="text-xs cursor-pointer"
            >
              Delete Brand
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
