import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../ui/table';
import { Badge } from '../ui/badge';
import { Forecast } from '../../services/forecasts.service';
import { Button } from '../ui/button';
import { Download } from 'lucide-react';

interface ShoppingListProps {
  forecasts: Forecast[];
}

export function ShoppingList({ forecasts }: ShoppingListProps) {
  // Only show products that actually need ordering
  const itemsToOrder = forecasts
    .filter(f => f.recommendedOrderQty > 0)
    .sort((a, b) => b.recommendedOrderQty - a.recommendedOrderQty);

  if (itemsToOrder.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Smart Shopping List</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground py-4 text-center">No items currently need restocking based on AI forecasts.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Smart Shopping List</CardTitle>
          <p className="text-sm text-muted-foreground">Auto-generated purchase orders based on AI demand forecasting</p>
        </div>
        <Button variant="outline" size="sm" className="hidden sm:flex">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead className="text-right">Current Stock</TableHead>
                <TableHead className="text-right">Predicted Demand</TableHead>
                <TableHead className="text-right text-amber-500">Order Qty</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {itemsToOrder.map((f) => {
                const name = typeof f.productId !== 'string' ? (f.productId as any).name : 'Unknown';
                const category = typeof f.productId !== 'string' ? (f.productId as any).category : '';
                const unit = typeof f.productId !== 'string' ? (f.productId as any).unit : '';
                const supplierName = typeof f.productId !== 'string' && f.productId.supplierId && typeof f.productId.supplierId === 'object'
                  ? f.productId.supplierId.name
                  : 'N/A';
                
                return (
                  <TableRow key={f._id}>
                    <TableCell className="font-medium">{name}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{category}</Badge>
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">{supplierName}</TableCell>
                    <TableCell className="text-right">{f.currentStock} {unit}</TableCell>
                    <TableCell className="text-right">{f.predictedDemand} {unit}</TableCell>
                    <TableCell className="text-right font-bold text-amber-500">
                      {f.recommendedOrderQty} {unit}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
