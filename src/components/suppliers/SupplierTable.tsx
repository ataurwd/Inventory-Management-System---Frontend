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
    <div className="overflow-hidden rounded-xl border border-border/80 bg-background/30">
      <Table>
        <TableHeader className="bg-muted/40 border-b border-border/40">
          <TableRow>
            <TableHead className="font-bold text-xs">Supplier Name</TableHead>
            <TableHead className="font-bold text-xs">Email Address</TableHead>
            <TableHead className="font-bold text-xs">Phone Number</TableHead>
            <TableHead className="font-bold text-xs">Address</TableHead>
            <TableHead className="font-bold text-xs text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {suppliers.map((supplier) => (
            <TableRow key={supplier._id} className="hover:bg-muted/15 transition-all duration-200 border-b border-border/40 group">
              <TableCell className="font-semibold text-foreground">{supplier.name}</TableCell>
              <TableCell className="text-muted-foreground text-xs font-mono">
                {supplier.contactEmail || <span className="text-muted-foreground/35 italic">Not provided</span>}
              </TableCell>
              <TableCell className="text-muted-foreground font-mono text-xs">
                {supplier.phone || <span className="text-muted-foreground/35 italic">Not provided</span>}
              </TableCell>
              <TableCell className="text-muted-foreground max-w-xs truncate text-xs">
                {supplier.address || <span className="text-muted-foreground/35 italic">Not provided</span>}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-1.5 opacity-80 group-hover:opacity-100 transition-opacity">
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => onEdit(supplier)}
                    className="h-8 w-8 hover:text-primary cursor-pointer hover:bg-sidebar-accent/30 rounded-lg"
                  >
                    <Edit2 className="h-4 w-4" />
                    <span className="sr-only">Edit</span>
                  </Button>
                  {isAdmin && (
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => onDelete(supplier._id)}
                      className="h-8 w-8 hover:text-destructive cursor-pointer hover:bg-destructive/10 rounded-lg"
                    >
                      <Trash2 className="h-4 w-4" />
                      <span className="sr-only">Delete</span>
                    </Button>
                  )}
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
