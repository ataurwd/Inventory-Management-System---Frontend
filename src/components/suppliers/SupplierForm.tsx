"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState } from "react";
import { suppliersService, SupplierItem } from "@/services/suppliers.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import axios from "axios";

const supplierSchema = z.object({
  name: z.string().min(1, "Supplier name is required").trim(),
  contactEmail: z.string().trim().email("Invalid email address").or(z.literal("")).optional(),
  phone: z.string().trim().optional(),
  address: z.string().trim().optional(),
});

type SupplierFormValues = z.infer<typeof supplierSchema>;

interface SupplierFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  supplierToEdit?: SupplierItem | null;
  onSuccess: () => void;
}

export default function SupplierForm({
  open,
  onOpenChange,
  supplierToEdit,
  onSuccess,
}: SupplierFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<SupplierFormValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: {
      name: "",
      contactEmail: "",
      phone: "",
      address: "",
    },
  });

  useEffect(() => {
    if (supplierToEdit) {
      setValue("name", supplierToEdit.name);
      setValue("contactEmail", supplierToEdit.contactEmail || "");
      setValue("phone", supplierToEdit.phone || "");
      setValue("address", supplierToEdit.address || "");
    } else {
      reset({
        name: "",
        contactEmail: "",
        phone: "",
        address: "",
      });
    }
  }, [supplierToEdit, setValue, reset]);

  const onSubmit = async (data: SupplierFormValues) => {
    setIsLoading(true);
    // Convert empty strings to undefined or null backend support
    const payload = {
      name: data.name,
      contactEmail: data.contactEmail || undefined,
      phone: data.phone || undefined,
      address: data.address || undefined,
    };

    try {
      if (supplierToEdit) {
        await suppliersService.update(supplierToEdit._id, payload);
        toast.success("Supplier updated successfully");
      } else {
        await suppliersService.create(payload);
        toast.success("Supplier created successfully");
      }
      onSuccess();
      onOpenChange(false);
      reset();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const apiErrorData = error.response?.data as { error?: { message?: string } } | undefined;
        toast.error(apiErrorData?.error?.message || "Failed to save supplier");
      } else {
        toast.error("Failed to save supplier");
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
              {supplierToEdit ? "Edit Supplier" : "Add New Supplier"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-1">
              Provide the details of the supplier below.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="supplier-name">Supplier Name</Label>
              <Input
                id="supplier-name"
                placeholder="e.g. Acme Corp"
                {...register("name")}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier-email">Email Address</Label>
              <Input
                id="supplier-email"
                type="email"
                placeholder="e.g. contact@acme.com"
                {...register("contactEmail")}
              />
              {errors.contactEmail && <p className="text-xs text-destructive">{errors.contactEmail.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier-phone">Phone Number</Label>
              <Input
                id="supplier-phone"
                placeholder="e.g. +1 (555) 019-2834"
                {...register("phone")}
              />
              {errors.phone && <p className="text-xs text-destructive">{errors.phone.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="supplier-address">Address</Label>
              <Input
                id="supplier-address"
                placeholder="e.g. 123 Main St, New York, NY"
                {...register("address")}
              />
              {errors.address && <p className="text-xs text-destructive">{errors.address.message}</p>}
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
              {supplierToEdit ? "Save Changes" : "Create Supplier"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
