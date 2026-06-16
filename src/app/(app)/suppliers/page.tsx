"use client";

import { useState } from "react";
import { useSuppliers } from "@/hooks/useSuppliers";
import { suppliersService, SupplierItem } from "@/services/suppliers.service";
import PageHeader from "@/components/layout/PageHeader";
import SupplierTable from "@/components/suppliers/SupplierTable";
import SupplierForm from "@/components/suppliers/SupplierForm";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Truck, FolderOpen } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import axios from "axios";

export default function SuppliersPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [supplierToEdit, setSupplierToEdit] = useState<SupplierItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const { suppliers, isLoading, mutate } = useSuppliers();
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const handleAddClick = () => {
    setSupplierToEdit(null);
    setModalOpen(true);
  };

  const handleEditClick = (supplier: SupplierItem) => {
    setSupplierToEdit(supplier);
    setModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await suppliersService.remove(deleteId);
      toast.success("Supplier deleted successfully");
      mutate();
      setDeleteId(null);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const apiErrorData = error.response?.data as { error?: { message?: string } } | undefined;
        toast.error(apiErrorData?.error?.message || "Failed to delete supplier");
      } else {
        toast.error("Failed to delete supplier");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const breadcrumbs = [
    { label: "App", href: "/dashboard" },
    { label: "Suppliers" }
  ];

  return (
    <div className="p-8 max-w-5xl mx-auto space-y-6 animate-fade-in">
      <PageHeader
        title="Supplier Management"
        breadcrumbs={breadcrumbs}
        action={
          isAdmin
            ? {
                label: "Add Supplier",
                onClick: handleAddClick,
              }
            : undefined
        }
      />

      <div className="rounded-2xl border border-border bg-card/40 backdrop-blur-md p-6 shadow-sm">
        <h3 className="font-bold text-base text-foreground mb-4 flex items-center gap-2">
          <Truck className="h-5 w-5 text-primary" />
          Active Suppliers
        </h3>

        {isLoading ? (
          <div className="space-y-2.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full animate-pulse" />
            ))}
          </div>
        ) : suppliers.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground text-xs flex flex-col items-center gap-3">
            <FolderOpen className="h-10 w-10 text-muted-foreground/50" />
            No suppliers found. {isAdmin && "Click 'Add Supplier' to create one."}
          </div>
        ) : (
          <SupplierTable
            suppliers={suppliers}
            onEdit={handleEditClick}
            onDelete={setDeleteId}
          />
        )}
      </div>

      {isAdmin && (
        <SupplierForm
          open={modalOpen}
          onOpenChange={setModalOpen}
          supplierToEdit={supplierToEdit}
          onSuccess={mutate}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="sm:max-w-md bg-card border border-border rounded-2xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">Confirm Deletion</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-1">
              Are you sure you want to delete this supplier? This action cannot be undone.
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
              Delete Supplier
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
