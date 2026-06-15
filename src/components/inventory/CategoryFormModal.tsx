"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState } from "react";
import { categoriesService, CategoryItem } from "@/services/categories.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import axios from "axios";

const categorySchema = z.object({
  name: z.string().min(1, "Category name is required").trim(),
});

type CategoryFormValues = z.infer<typeof categorySchema>;

interface CategoryFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  categoryToEdit?: CategoryItem | null;
  onSuccess: () => void;
}

export default function CategoryFormModal({
  open,
  onOpenChange,
  categoryToEdit,
  onSuccess,
}: CategoryFormModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
  });

  useEffect(() => {
    if (categoryToEdit) {
      setValue("name", categoryToEdit.name);
    } else {
      reset();
    }
  }, [categoryToEdit, setValue, reset]);

  const onSubmit = async (data: CategoryFormValues) => {
    setIsLoading(true);
    try {
      if (categoryToEdit) {
        await categoriesService.update(categoryToEdit._id, data.name);
        toast.success("Category updated successfully");
      } else {
        await categoriesService.create(data.name);
        toast.success("Category created successfully");
      }
      onSuccess();
      onOpenChange(false);
      reset();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const apiErrorData = error.response?.data as { error?: { message?: string } } | undefined;
        toast.error(apiErrorData?.error?.message || "Failed to save category");
      } else {
        toast.error("Failed to save category");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-card border border-border rounded-2xl shadow-xl">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">
              {categoryToEdit ? "Edit Category" : "Add New Category"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-1">
              Provide a name for the category. Categories are used to filter products and group inventory reports.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category-name">Category Name</Label>
              <Input
                id="category-name"
                placeholder="e.g. Beverages"
                {...register("name")}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>
          </div>

          <DialogFooter className="mt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="text-xs cursor-pointer border-border hover:bg-sidebar-accent"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={isLoading}
              className="text-xs cursor-pointer"
            >
              {categoryToEdit ? "Save Changes" : "Create Category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
