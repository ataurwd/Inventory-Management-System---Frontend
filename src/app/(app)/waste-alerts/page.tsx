"use client";

import React from 'react';
import { useExpiryAlerts } from '../../../hooks/useExpiryAlerts';
import PageHeader from '../../../components/layout/PageHeader';
import { Card, CardContent } from '../../../components/ui/card';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '../../../components/ui/table';
import { Badge } from '../../../components/ui/badge';
import { AlertTriangle, Gift, Tag, PackagePlus, Info } from 'lucide-react';
import { Spinner } from '../../../components/ui/spinner';

export default function WasteAlertsPage() {
  const { alerts, isLoading, isError } = useExpiryAlerts();

  if (isLoading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center text-destructive p-8 bg-destructive/10 rounded-xl">
        Failed to load waste alerts. Please try again later.
      </div>
    );
  }

  const totalUnitsAtRisk = alerts.reduce((sum, item) => sum + item.qty, 0);
  const totalEstimatedLoss = alerts.reduce((sum, item) => sum + item.estimatedLoss, 0);

  const getRiskBadge = (days: number) => {
    if (days <= 7) return <Badge variant="destructive" className="animate-pulse">{days} Days</Badge>;
    if (days <= 15) return <Badge className="bg-orange-500 hover:bg-orange-600">{days} Days</Badge>;
    return <Badge className="bg-yellow-500 hover:bg-yellow-600">{days} Days</Badge>;
  };

  const getSuggestionChip = (suggestion: string) => {
    let Icon = Info;
    let colorClass = "bg-muted text-muted-foreground";

    if (suggestion.includes("BOGO")) {
      Icon = Gift;
      colorClass = "bg-green-500/10 text-green-600 border-green-500/20";
    } else if (suggestion.includes("25%")) {
      Icon = Tag;
      colorClass = "bg-blue-500/10 text-blue-600 border-blue-500/20";
    } else if (suggestion.includes("Bundle")) {
      Icon = PackagePlus;
      colorClass = "bg-purple-500/10 text-purple-600 border-purple-500/20";
    }

    return (
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${colorClass} w-max`}>
        <Icon className="h-3.5 w-3.5" />
        {suggestion}
      </div>
    );
  };

  return (
    <div className="space-y-6 my-10 max-w-7xl mx-auto">
      <PageHeader 
        title="Waste & Expiry Alerts" 
        breadcrumbs={[{ label: 'Dashboard', href: '/dashboard' }, { label: 'Waste Alerts' }]}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="bg-destructive/5 border-destructive/20">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-destructive/10 rounded-full">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Total Units At Risk</p>
              <h3 className="text-3xl font-bold">{totalUnitsAtRisk.toLocaleString()}</h3>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-orange-500/5 border-orange-500/20">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-3 bg-orange-500/10 rounded-full">
              <Tag className="h-6 w-6 text-orange-500" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground font-medium">Estimated Loss if Unsold</p>
              <h3 className="text-3xl font-bold">${totalEstimatedLoss.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Batch No</TableHead>
                <TableHead className="text-right">Qty</TableHead>
                <TableHead>Expiry Date</TableHead>
                <TableHead>Days Left</TableHead>
                <TableHead className="text-right">Est. Loss</TableHead>
                <TableHead>Suggested Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {alerts.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No products expiring within the next 30 days. You're doing great!
                  </TableCell>
                </TableRow>
              ) : (
                alerts.map((item, index) => (
                  <TableRow key={`${item.productId}-${item.batchNo}-${index}`}>
                    <TableCell className="font-medium">{item.name}</TableCell>
                    <TableCell><Badge variant="outline" className="font-mono">{item.batchNo}</Badge></TableCell>
                    <TableCell className="text-right">{item.qty}</TableCell>
                    <TableCell>{new Date(item.expiryDate).toLocaleDateString()}</TableCell>
                    <TableCell>{getRiskBadge(item.daysRemaining)}</TableCell>
                    <TableCell className="text-right font-medium">${item.estimatedLoss.toFixed(2)}</TableCell>
                    <TableCell>{getSuggestionChip(item.suggestion)}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
