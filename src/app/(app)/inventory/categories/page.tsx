"use client";

import { useState } from "react";
import useSWR from "swr";
import { format, parseISO } from "date-fns";
import { categoriesService, CategoryItem } from "@/services/categories.service";
import PageHeader from "@/components/layout/PageHeader";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import CategoryFormModal from "@/components/inventory/CategoryFormModal";
import { Edit2, Trash2, FolderOpen, Layers } from "lucide-react";
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

export default function CategoriesPage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [categoryToEdit, setCategoryToEdit] = useState<CategoryItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch categories using SWR
  const { data: categories, isLoading, mutate } = useSWR(
    "/categories",
    () => categoriesService.getAll()
  );

  const handleAddClick = () => {
    setCategoryToEdit(null);
    setModalOpen(true);
  };

  const handleEditClick = (category: CategoryItem) => {
    setCategoryToEdit(category);
    setModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await categoriesService.remove(deleteId);
      toast.success("Category deleted successfully");
      mutate();
      setDeleteId(null);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const apiErrorData = error.response?.data as { error?: { message?: string } } | undefined;
        toast.error(apiErrorData?.error?.message || "Failed to delete category");
      } else {
        toast.error("Failed to delete category");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const breadcrumbs = [
    { label: "App", href: "/dashboard" },
    { label: "Inventory", href: "/inventory" },
    { label: "Categories" }
  ];

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6 animate-fade-in">
      <PageHeader
        title="Category Management"
        breadcrumbs={breadcrumbs}
        action={{
          label: "Add Category",
          onClick: handleAddClick,
        }}
      />

      <div className="rounded-2xl border border-border bg-card/40 backdrop-blur-md p-6 shadow-sm">
        <h3 className="font-bold text-base text-foreground mb-4 flex items-center gap-2">
          <Layers className="h-5 w-5 text-primary" />
          Product Categories list
        </h3>

        {isLoading || !categories ? (
          <div className="space-y-2.5">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full animate-pulse" />
            ))}
          </div>
        ) : categories.length === 0 ? (
          <div className="text-center py-10 text-muted-foreground text-xs flex flex-col items-center gap-3">
            <FolderOpen className="h-10 w-10 text-muted-foreground/50" />
            No categories defined yet. Click "Add Category" above to create one.
          </div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-border/80">
            <Table>
              <TableHeader className="bg-sidebar/30">
                <TableRow>
                  <TableHead className="font-bold">Category Name</TableHead>
                  <TableHead className="font-bold text-center">Products Count</TableHead>
                  <TableHead className="font-bold">Date Created</TableHead>
                  <TableHead className="font-bold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((cat) => (
                  <TableRow key={cat._id} className="hover:bg-sidebar-accent/15 transition-colors">
                    <TableCell className="font-semibold text-foreground">{cat.name}</TableCell>
                    <TableCell className="text-center font-medium text-muted-foreground">
                      {cat.productCount ?? 0}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs">
                      {format(parseISO(cat.createdAt), "MMM dd, yyyy")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => handleEditClick(cat)}
                          className="hover:text-primary cursor-pointer"
                        >
                          <Edit2 className="h-4 w-4" />
                          <span className="sr-only">Edit</span>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => setDeleteId(cat._id)}
                          className="hover:text-destructive cursor-pointer"
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
      <CategoryFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        categoryToEdit={categoryToEdit}
        onSuccess={mutate}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="sm:max-w-md bg-card border border-border rounded-2xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">Confirm Deletion</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-1">
              Are you sure you want to delete this category? This action cannot be undone. 
              Note that you cannot delete categories that are currently assigned to products.
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
              Delete Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
