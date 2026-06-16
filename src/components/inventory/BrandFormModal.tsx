"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState } from "react";
import { brandsService, BrandItem } from "@/services/brands.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import axios from "axios";

const brandSchema = z.object({
  name: z.string().min(1, "Brand name is required").trim(),
});

type BrandFormValues = z.infer<typeof brandSchema>;

interface BrandFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  brandToEdit?: BrandItem | null;
  onSuccess: () => void;
}

export default function BrandFormModal({
  open,
  onOpenChange,
  brandToEdit,
  onSuccess,
}: BrandFormModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<BrandFormValues>({
    resolver: zodResolver(brandSchema),
  });

  useEffect(() => {
    if (brandToEdit) {
      setValue("name", brandToEdit.name);
    } else {
      reset();
    }
  }, [brandToEdit, setValue, reset]);

  const onSubmit = async (data: BrandFormValues) => {
    setIsLoading(true);
    try {
      if (brandToEdit) {
        await brandsService.update(brandToEdit._id, data.name);
        toast.success("Brand updated successfully");
      } else {
        await brandsService.create(data.name);
        toast.success("Brand created successfully");
      }
      onSuccess();
      onOpenChange(false);
      reset();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const apiErrorData = error.response?.data as { error?: { message?: string } } | undefined;
        toast.error(apiErrorData?.error?.message || "Failed to save brand");
      } else {
        toast.error("Failed to save brand");
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
              {brandToEdit ? "Edit Brand" : "Add New Brand"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-1">
              Provide a name for the brand. Brands are used to organize products and group inventory reports.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="brand-name">Brand Name</Label>
              <Input
                id="brand-name"
                placeholder="e.g. Nestle"
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
              {brandToEdit ? "Save Changes" : "Create Brand"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
