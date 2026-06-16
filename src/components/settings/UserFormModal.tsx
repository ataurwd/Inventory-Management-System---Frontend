"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useEffect, useState } from "react";
import { User } from "@/types/user.types";
import { usersService } from "@/services/users.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import axios from "axios";

const baseUserSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").trim(),
  email: z.string().email("Please enter a valid email address").trim(),
  role: z.enum(["admin", "manager", "cashier"]),
});

const createUserSchema = baseUserSchema.extend({
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const editUserSchema = baseUserSchema.extend({
  password: z.string().optional().or(z.literal("")),
});

type UserFormValues = z.infer<typeof createUserSchema>;

interface UserFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userToEdit?: User | null;
  onSuccess: () => void;
}

export default function UserFormModal({
  open,
  onOpenChange,
  userToEdit,
  onSuccess,
}: UserFormModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const activeSchema = userToEdit ? editUserSchema : createUserSchema;

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(activeSchema) as any,
  });

  useEffect(() => {
    if (userToEdit) {
      setValue("name", userToEdit.name);
      setValue("email", userToEdit.email);
      setValue("role", userToEdit.role);
      setValue("password", "");
    } else {
      reset();
    }
  }, [userToEdit, setValue, reset, open]);

  const onSubmit = async (data: UserFormValues) => {
    setIsLoading(true);
    try {
      if (userToEdit) {
        // Edit Mode
        const payload: any = {
          name: data.name,
          email: data.email,
          role: data.role,
        };
        if (data.password) {
          payload.password = data.password;
        }
        await usersService.update(userToEdit.id, payload);
        toast.success("User updated successfully");
      } else {
        // Create Mode
        await usersService.create({
          name: data.name,
          email: data.email,
          role: data.role,
          password: data.password,
        });
        toast.success("User created successfully");
      }
      onSuccess();
      onOpenChange(false);
      reset();
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const apiErrorData = error.response?.data as { error?: { message?: string } } | undefined;
        toast.error(apiErrorData?.error?.message || "Failed to save user");
      } else {
        toast.error("Failed to save user");
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
              {userToEdit ? "Edit User Account" : "Add New User Account"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-1">
              Provide account credentials and define their access level role.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Name */}
            <div className="space-y-1.5">
              <Label htmlFor="user-name">Full Name</Label>
              <Input
                id="user-name"
                placeholder="e.g. John Doe"
                {...register("name")}
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
            </div>

            {/* Email */}
            <div className="space-y-1.5">
              <Label htmlFor="user-email">Email Address</Label>
              <Input
                id="user-email"
                type="email"
                placeholder="e.g. john@example.com"
                {...register("email")}
              />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <Label htmlFor="user-password">
                Password {userToEdit && <span className="text-muted-foreground/50 text-[10px] font-normal">(Leave blank to keep current)</span>}
              </Label>
              <Input
                id="user-password"
                type="password"
                placeholder={userToEdit ? "••••••••" : "At least 6 characters"}
                {...register("password")}
              />
              {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
            </div>

            {/* Role select */}
            <div className="space-y-1.5">
              <Label htmlFor="user-role">Access Role</Label>
              <select
                id="user-role"
                {...register("role")}
                className="flex h-9 w-full rounded-lg border border-border bg-background px-3 py-1 text-sm shadow-xs transition-colors placeholder:text-muted-foreground focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring cursor-pointer"
              >
                <option value="cashier">Cashier</option>
                <option value="manager">Manager</option>
                <option value="admin">Administrator</option>
              </select>
              {errors.role && <p className="text-xs text-destructive">{errors.role.message}</p>}
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
              {userToEdit ? "Save Changes" : "Create Account"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
