import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { History, ArrowDownLeft, ArrowUpRight, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Transaction {
  _id: string;
  type: "sale" | "restock" | "waste";
  productId?: { name: string; category: string };
  batchNo: string;
  qty: number;
  unitPrice: number;
  total: number;
  timestamp: string;
  performedBy?: { name: string; role: string };
}

interface RecentTransactionsTableProps {
  transactions: Transaction[];
  className?: string;
}

export default function RecentTransactionsTable({ transactions, className }: RecentTransactionsTableProps) {
  
  const getBadgeIcon = (type: string) => {
    switch (type) {
      case "sale": return <ArrowUpRight className="h-3 w-3 mr-1" />;
      case "restock": return <ArrowDownLeft className="h-3 w-3 mr-1" />;
      case "waste": return <AlertCircle className="h-3 w-3 mr-1" />;
      default: return null;
    }
  };

  const getBadgeVariant = (type: string) => {
    switch (type) {
      case "sale": return "default";
      case "restock": return "outline";
      case "waste": return "destructive";
      default: return "secondary";
    }
  };

  const getBadgeColor = (type: string) => {
    switch (type) {
      case "sale": return "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 border-emerald-500/20";
      case "restock": return "bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-500/20";
      case "waste": return "bg-red-500/10 text-red-500 hover:bg-red-500/20 border-red-500/20";
      default: return "";
    }
  };

  return (
    <Card className={`clay border-none ${className}`}>
      <CardHeader className="py-4 px-5 border-b border-border/40">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <History className="h-4.5 w-4.5 text-primary" />
          Recent Transactions
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-muted/40">
              <TableRow>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider h-9">Date & Time</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider h-9">Product</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider h-9">Type</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider h-9 text-right">Qty</TableHead>
                <TableHead className="text-[10px] font-bold uppercase tracking-wider h-9 text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {transactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-xs text-muted-foreground">
                    No recent transactions found.
                  </TableCell>
                </TableRow>
              ) : (
                transactions.map((tx) => (
                  <TableRow key={tx._id} className="hover:bg-muted/10 text-xs">
                    <TableCell className="whitespace-nowrap">
                      <div className="font-medium text-foreground">
                        {new Date(tx.timestamp).toLocaleDateString()}
                      </div>
                      <div className="text-[10px] text-muted-foreground">
                        {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-semibold text-foreground">
                        {tx.productId ? tx.productId.name : "Unknown Product"}
                      </div>
                      <div className="text-[10px] text-muted-foreground font-mono">
                        Batch: {tx.batchNo}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={getBadgeVariant(tx.type) as any} className={`text-[10px] uppercase font-bold tracking-wider ${getBadgeColor(tx.type)}`}>
                        {getBadgeIcon(tx.type)}
                        {tx.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {tx.type === "sale" || tx.type === "waste" ? "-" : "+"}{tx.qty}
                    </TableCell>
                    <TableCell className={`text-right font-bold ${tx.type === 'sale' ? 'text-emerald-500' : tx.type === 'restock' ? 'text-destructive' : 'text-muted-foreground'}`}>
                      {tx.type === "sale" ? "+" : "-"}${tx.total.toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
