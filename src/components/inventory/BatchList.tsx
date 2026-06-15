"use client";

import { Batch } from "@/types/product.types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Trash2, Package, AlertTriangle } from "lucide-react";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface BatchListProps {
  batches: Batch[];
  productName: string;
  onRemove: (batchNo: string) => Promise<void>;
}

function daysUntilExpiry(expiryDate: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const expiry = new Date(expiryDate);
  expiry.setHours(0, 0, 0, 0);
  return Math.ceil((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function getExpiryBadge(days: number) {
  if (days < 0) {
    return <Badge variant="critical">Expired</Badge>;
  }
  if (days <= 7) {
    return <Badge variant="critical">{days}d left</Badge>;
  }
  if (days <= 30) {
    return <Badge variant="warning">{days}d left</Badge>;
  }
  return <Badge variant="safe">{days}d left</Badge>;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function BatchList({ batches, productName, onRemove }: BatchListProps) {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBatch, setSelectedBatch] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Sort batches by expiry date ascending
  const sorted = [...batches].sort(
    (a, b) => new Date(a.expiry_date).getTime() - new Date(b.expiry_date).getTime()
  );

  const handleDeleteClick = (batchNo: string) => {
    setSelectedBatch(batchNo);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedBatch) return;
    setIsDeleting(true);
    try {
      await onRemove(selectedBatch);
      setDeleteDialogOpen(false);
    } finally {
      setIsDeleting(false);
      setSelectedBatch(null);
    }
  };

  if (sorted.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-10 border border-dashed rounded-2xl bg-card/50 text-center space-y-3">
        <div className="p-3 bg-muted rounded-full text-muted-foreground">
          <Package className="h-7 w-7" />
        </div>
        <div className="space-y-1">
          <h3 className="font-semibold text-base">No batches yet</h3>
          <p className="text-sm text-muted-foreground max-w-sm">
            Add a batch to start tracking stock quantities and expiry dates for this product.
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="border rounded-xl bg-card overflow-hidden shadow-md border-border">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead>Batch No.</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Manufacture Date</TableHead>
              <TableHead>Expiry Date</TableHead>
              <TableHead>Days Remaining</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sorted.map((batch) => {
              const days = daysUntilExpiry(batch.expiry_date);
              return (
                <TableRow
                  key={batch.batch_no}
                  className={days < 0 ? "opacity-60 bg-destructive/5" : ""}
                >
                  <TableCell className="font-mono text-sm font-medium">
                    {batch.batch_no}
                  </TableCell>
                  <TableCell className="font-bold">{batch.qty}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {batch.manufacture_date
                      ? formatDate(batch.manufacture_date)
                      : "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDate(batch.expiry_date)}
                  </TableCell>
                  <TableCell>{getExpiryBadge(days)}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="destructive"
                      size="icon-sm"
                      title="Remove Batch"
                      onClick={() => handleDeleteClick(batch.batch_no)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {/* Delete Confirmation */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Remove Batch
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to remove batch{" "}
              <strong className="text-foreground">{selectedBatch}</strong> from{" "}
              <strong className="text-foreground">{productName}</strong>? This
              action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              isLoading={isDeleting}
              onClick={handleConfirmDelete}
            >
              Remove
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
