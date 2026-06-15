"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useState } from "react";

const batchSchema = z
  .object({
    batch_no: z.string().min(1, "Batch number is required"),
    qty: z
      .number({ message: "Quantity is required and must be a number" })
      .positive("Quantity must be greater than 0"),
    manufacture_date: z.string().optional(),
    expiry_date: z.string().min(1, "Expiry date is required"),
  })
  .refine(
    (data) => {
      const expiry = new Date(data.expiry_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return expiry > today;
    },
    {
      message: "Expiry date must be in the future",
      path: ["expiry_date"],
    }
  )
  .refine(
    (data) => {
      if (!data.manufacture_date) return true;
      return new Date(data.manufacture_date) < new Date(data.expiry_date);
    },
    {
      message: "Manufacture date must be before expiry date",
      path: ["manufacture_date"],
    }
  );

type BatchFormValues = z.infer<typeof batchSchema>;

interface BatchFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: {
    batch_no: string;
    qty: number;
    manufacture_date?: string;
    expiry_date: string;
  }) => Promise<void>;
}

export default function BatchForm({
  open,
  onOpenChange,
  onSubmit,
}: BatchFormProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<BatchFormValues>({
    resolver: zodResolver(batchSchema),
    defaultValues: {
      batch_no: "",
      qty: undefined,
      manufacture_date: "",
      expiry_date: "",
    },
  });

  const handleFormSubmit = async (data: BatchFormValues) => {
    setIsLoading(true);
    try {
      await onSubmit({
        batch_no: data.batch_no,
        qty: data.qty,
        manufacture_date: data.manufacture_date || undefined,
        expiry_date: data.expiry_date,
      });
      reset();
      onOpenChange(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        if (!val) reset();
        onOpenChange(val);
      }}
    >
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Add New Batch</DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          className="space-y-5 pt-2"
        >
          <div className="grid grid-cols-2 gap-4">
            {/* Batch Number */}
            <div className="space-y-2">
              <Label htmlFor="batch_no">Batch Number</Label>
              <Input
                id="batch_no"
                placeholder="e.g. B-2024-001"
                {...register("batch_no")}
              />
              {errors.batch_no && (
                <p className="text-xs text-destructive">
                  {errors.batch_no.message}
                </p>
              )}
            </div>

            {/* Quantity */}
            <div className="space-y-2">
              <Label htmlFor="qty">Quantity</Label>
              <Input
                id="qty"
                type="number"
                placeholder="0"
                {...register("qty", { valueAsNumber: true })}
              />
              {errors.qty && (
                <p className="text-xs text-destructive">
                  {errors.qty.message}
                </p>
              )}
            </div>

            {/* Manufacture Date */}
            <div className="space-y-2">
              <Label htmlFor="manufacture_date">
                Manufacture Date{" "}
                <span className="text-muted-foreground text-xs">(optional)</span>
              </Label>
              <Input
                id="manufacture_date"
                type="date"
                {...register("manufacture_date")}
              />
              {errors.manufacture_date && (
                <p className="text-xs text-destructive">
                  {errors.manufacture_date.message}
                </p>
              )}
            </div>

            {/* Expiry Date */}
            <div className="space-y-2">
              <Label htmlFor="expiry_date">Expiry Date</Label>
              <Input
                id="expiry_date"
                type="date"
                {...register("expiry_date")}
              />
              {errors.expiry_date && (
                <p className="text-xs text-destructive">
                  {errors.expiry_date.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                reset();
                onOpenChange(false);
              }}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isLoading}>
              Add Batch
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
