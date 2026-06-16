"use client";

import { useState } from "react";
import useSWR from "swr";
import { format, parseISO } from "date-fns";
import PageHeader from "@/components/layout/PageHeader";
import { useAuth } from "@/hooks/useAuth";
import { useUsers } from "@/hooks/useUsers";
import { usersService } from "@/services/users.service";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import UserFormModal from "@/components/settings/UserFormModal";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Pencil, Trash2, Shield, User as UserIcon, Lock, Users } from "lucide-react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";

// Profile update schema
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").trim(),
});

// Password change schema
const passwordSchema = z.object({
  currentPassword: z.string().min(1, "Current password is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
  confirmPassword: z.string().min(6, "Confirmation password must be at least 6 characters"),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type ProfileFormValues = z.infer<typeof profileSchema>;
type PasswordFormValues = z.infer<typeof passwordSchema>;

export default function SettingsPage() {
  const { user, setUser } = useAuth();
  const isAdmin = user?.role === "admin";
  const { users, isLoading: usersLoading, mutate: mutateUsers } = useUsers();

  const [activeTab, setActiveTab] = useState<"users" | "profile">("users");
  const [modalOpen, setModalOpen] = useState(false);
  const [userToEdit, setUserToEdit] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Profile Form
  const {
    register: registerProfile,
    handleSubmit: handleSubmitProfile,
    formState: { errors: profileErrors },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.name || "",
    },
  });

  // Password Form
  const {
    register: registerPassword,
    handleSubmit: handleSubmitPassword,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });

  const handleAddUserClick = () => {
    setUserToEdit(null);
    setModalOpen(true);
  };

  const handleEditUserClick = (targetUser: any) => {
    setUserToEdit(targetUser);
    setModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await usersService.remove(deleteId);
      toast.success("User deactivated successfully");
      mutateUsers();
      setDeleteId(null);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        const apiErrorData = error.response?.data as { error?: { message?: string } } | undefined;
        toast.error(apiErrorData?.error?.message || "Failed to deactivate user");
      } else {
        toast.error("Failed to deactivate user");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdateProfile = async (data: ProfileFormValues) => {
    if (!user) return;
    setIsUpdatingProfile(true);
    try {
      const updatedUser = await usersService.update(user.id, { name: data.name });
      setUser({ ...user, name: updatedUser.name });
      toast.success("Profile details updated successfully");
    } catch {
      toast.error("Failed to update profile details");
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handlePasswordChange = async (data: PasswordFormValues) => {
    if (!user) return;
    setIsChangingPassword(true);
    try {
      await usersService.update(user.id, { password: data.newPassword });
      toast.success("Password updated successfully");
      resetPassword();
    } catch {
      toast.error("Failed to update password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge variant="critical">Administrator</Badge>;
      case "manager":
        return <Badge variant="warning">Manager</Badge>;
      default:
        return <Badge variant="safe">Cashier</Badge>;
    }
  };

  const breadcrumbs = [
    { label: "Dashboard", href: "/dashboard" },
    { label: "Settings" }
  ];

  return (
    <div className="p-8 max-w-6xl mx-auto space-y-6 animate-fade-in">
      <PageHeader
        title="Settings & System Accounts"
        breadcrumbs={breadcrumbs}
        action={
          activeTab === "users"
            ? {
                label: "Add User Account",
                onClick: handleAddUserClick,
              }
            : undefined
        }
      />

      {/* Tabs Menu Navigation */}
      <div className="flex gap-2 p-1.5 bg-sidebar rounded-xl border border-border/80 w-max shadow-sm">
        <button
          onClick={() => setActiveTab("users")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === "users"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
          }`}
        >
          <Users className="h-4 w-4" />
          User Management
        </button>
        <button
          onClick={() => setActiveTab("profile")}
          className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeTab === "profile"
              ? "bg-primary text-primary-foreground shadow-xs"
              : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
          }`}
        >
          <UserIcon className="h-4 w-4" />
          Profile Settings
        </button>
      </div>

      {activeTab === "users" ? (
        /* ──── USER MANAGEMENT TAB ──── */
        <Card className="border border-border bg-card/45 backdrop-blur-md p-6 shadow-sm rounded-2xl">
          <div className="flex items-center gap-2 mb-5">
            <Shield className="h-5 w-5 text-primary" />
            <h3 className="font-bold text-base text-foreground">Registered System Accounts</h3>
          </div>

          {usersLoading ? (
            <div className="space-y-2.5">
              {Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-12 w-full animate-pulse" />
              ))}
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground text-xs">
              No registered user accounts found.
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-border/80 bg-background/30">
              <Table>
                <TableHeader className="bg-muted/40 border-b border-border/40">
                  <TableRow>
                    <TableHead className="font-bold text-xs">Name</TableHead>
                    <TableHead className="font-bold text-xs">Email Address</TableHead>
                    <TableHead className="font-bold text-xs">Role</TableHead>
                    <TableHead className="font-bold text-xs">Last Login</TableHead>
                    <TableHead className="font-bold text-xs text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((targetUser) => {
                    const targetUserId = targetUser._id || targetUser.id;
                    return (
                      <TableRow key={targetUserId} className="hover:bg-muted/15 transition-all duration-200 border-b border-border/40 group">
                        <TableCell className="font-semibold text-foreground py-3.5">
                          {targetUser.name}
                          {targetUserId === user?.id && (
                            <span className="ml-2 text-[9px] bg-primary/10 text-primary border border-primary/20 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                              You
                            </span>
                          )}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-xs font-mono">{targetUser.email}</TableCell>
                        <TableCell>{getRoleBadge(targetUser.role)}</TableCell>
                        <TableCell className="text-muted-foreground text-xs font-mono">
                          {targetUser.lastLogin ? (
                            format(parseISO(targetUser.lastLogin as any), "MMM dd, yyyy HH:mm")
                          ) : (
                            <span className="text-muted-foreground/35 italic">Never logged in</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1.5 opacity-85 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => handleEditUserClick(targetUser)}
                              className="h-8 w-8 hover:text-primary cursor-pointer hover:bg-sidebar-accent/30 rounded-lg"
                              title="Edit User"
                            >
                              <Pencil className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            {isAdmin && targetUserId !== user?.id && (
                              <Button
                                variant="ghost"
                                size="icon-sm"
                                onClick={() => setDeleteId(targetUserId)}
                                className="h-8 w-8 hover:text-destructive cursor-pointer hover:bg-destructive/10 rounded-lg"
                                title="Delete Account"
                              >
                                <Trash2 className="h-4 w-4" />
                                <span className="sr-only">Delete</span>
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </Card>
      ) : (
        /* ──── PROFILE SETTINGS TAB ──── */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Update Info */}
          <Card className="border border-border bg-card/45 backdrop-blur-md p-6 shadow-sm rounded-2xl">
            <div className="flex items-center gap-2 mb-5">
              <UserIcon className="h-5 w-5 text-primary" />
              <h3 className="font-bold text-base text-foreground">Personal Information</h3>
            </div>

            <form onSubmit={handleSubmitProfile(handleUpdateProfile)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="profile-email">Email Address (Read-only)</Label>
                <Input
                  id="profile-email"
                  value={user?.email || ""}
                  disabled
                  className="bg-muted text-muted-foreground opacity-60 cursor-not-allowed font-mono text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="profile-name">Full Name</Label>
                <Input
                  id="profile-name"
                  placeholder="Your Full Name"
                  {...registerProfile("name")}
                />
                {profileErrors.name && <p className="text-xs text-destructive">{profileErrors.name.message}</p>}
              </div>

              <Button
                type="submit"
                size="sm"
                isLoading={isUpdatingProfile}
                className="text-xs cursor-pointer w-full"
              >
                Update Details
              </Button>
            </form>
          </Card>

          {/* Change Password */}
          <Card className="border border-border bg-card/45 backdrop-blur-md p-6 shadow-sm rounded-2xl">
            <div className="flex items-center gap-2 mb-5">
              <Lock className="h-5 w-5 text-primary" />
              <h3 className="font-bold text-base text-foreground">Security Settings</h3>
            </div>

            <form onSubmit={handleSubmitPassword(handlePasswordChange)} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="current-pw">Current Password</Label>
                <Input
                  id="current-pw"
                  type="password"
                  placeholder="••••••••"
                  {...registerPassword("currentPassword")}
                />
                {passwordErrors.currentPassword && <p className="text-xs text-destructive">{passwordErrors.currentPassword.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="new-pw">New Password</Label>
                <Input
                  id="new-pw"
                  type="password"
                  placeholder="At least 6 characters"
                  {...registerPassword("newPassword")}
                />
                {passwordErrors.newPassword && <p className="text-xs text-destructive">{passwordErrors.newPassword.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="confirm-pw">Confirm New Password</Label>
                <Input
                  id="confirm-pw"
                  type="password"
                  placeholder="Verify password"
                  {...registerPassword("confirmPassword")}
                />
                {passwordErrors.confirmPassword && <p className="text-xs text-destructive">{passwordErrors.confirmPassword.message}</p>}
              </div>

              <Button
                type="submit"
                size="sm"
                isLoading={isChangingPassword}
                className="text-xs cursor-pointer w-full bg-primary"
              >
                Update Password
              </Button>
            </form>
          </Card>
        </div>
      )}

      {/* User Form Modal */}
      <UserFormModal
        open={modalOpen}
        onOpenChange={setModalOpen}
        userToEdit={userToEdit}
        onSuccess={mutateUsers}
      />

      {/* Delete User Modal */}
      <Dialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="sm:max-w-md bg-card border border-border rounded-2xl shadow-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">Confirm Account Deactivation</DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground pt-1">
              Are you sure you want to deactivate this account? The user will be instantly blocked from logging in.
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
              Deactivate User
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
