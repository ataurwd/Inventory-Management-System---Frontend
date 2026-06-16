"use client";

import { SupplierItem } from "@/services/suppliers.service";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Edit2, Trash2 } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

interface SupplierTableProps {
  suppliers: SupplierItem[];
  onEdit: (supplier: SupplierItem) => void;
  onDelete: (id: string) => void;
}

export default function SupplierTable({ suppliers, onEdit, onDelete }: SupplierTableProps) {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  return (
    <div className="overflow-hidden rounded-xl border border-border/80 bg-card/25 backdrop-blur-xs">
      <Table>
        <TableHeader className="bg-sidebar/30">
          <TableRow>
            <TableHead className="font-bold">Supplier Name</TableHead>
            <TableHead className="font-bold">Email Address</TableHead>
            <TableHead className="font-bold">Phone Number</TableHead>
            <TableHead className="font-bold">Address</TableHead>
            {isAdmin && <TableHead className="font-bold text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {suppliers.map((supplier) => (
            <TableRow key={supplier._id} className="hover:bg-sidebar-accent/15 transition-colors">
              <TableCell className="font-semibold text-foreground">{supplier.name}</TableCell>
              <TableCell className="text-muted-foreground">
                {supplier.contactEmail || <span className="text-muted-foreground/45 italic text-xs">Not provided</span>}
              </TableCell>
              <TableCell className="text-muted-foreground font-mono text-xs">
                {supplier.phone || <span className="text-muted-foreground/45 italic text-xs">Not provided</span>}
              </TableCell>
              <TableCell className="text-muted-foreground max-w-xs truncate">
                {supplier.address || <span className="text-muted-foreground/45 italic text-xs">Not provided</span>}
              </TableCell>
              {isAdmin && (
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onEdit(supplier)}
                      className="hover:text-primary cursor-pointer"
                    >
                      <Edit2 className="h-4 w-4" />
                      <span className="sr-only">Edit</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onDelete(supplier._id)}
                      className="hover:text-destructive cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  </div>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
