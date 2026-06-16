import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { TrendingUp, Package } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TopSellingProductsProps {
  products: {
    productId: string;
    name: string;
    category: string;
    totalQty: number;
    totalRevenue: number;
  }[];
  className?: string;
  hideRevenue?: boolean;
}

export default function TopSellingProducts({ products, className, hideRevenue = false }: TopSellingProductsProps) {
  const maxQty = Math.max(...products.map(p => p.totalQty), 1);

  return (
    <Card className={`clay border-none ${className}`}>
      <CardHeader className="py-4 px-5 border-b border-border/40 flex flex-row items-center justify-between">
        <CardTitle className="text-sm font-semibold flex items-center gap-2">
          <TrendingUp className="h-4.5 w-4.5 text-primary" />
          Top Selling Products
        </CardTitle>
        <Badge variant="outline" className="text-[10px]">All Time</Badge>
      </CardHeader>
      <CardContent className="p-0">
        {products.length === 0 ? (
          <div className="p-8 flex flex-col items-center justify-center text-muted-foreground gap-3">
            <Package className="h-8 w-8 opacity-20" />
            <p className="text-xs">No sales data available yet.</p>
          </div>
        ) : (
          <div className="divide-y divide-border/40">
            {products.map((product, index) => {
              const widthPct = (product.totalQty / maxQty) * 100;
              return (
                <div key={product.productId} className="p-4 hover:bg-muted/10 transition-colors group">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex gap-3 items-center">
                      <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">
                        #{index + 1}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                          {product.name}
                        </p>
                        <p className="text-[10px] text-muted-foreground">
                          {product.category}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      {!hideRevenue && (
                        <p className="text-xs font-bold text-foreground">
                          ${product.totalRevenue.toFixed(2)}
                        </p>
                      )}
                      <p className="text-[10px] text-muted-foreground">
                        {product.totalQty} sold
                      </p>
                    </div>
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full transition-all duration-1000 ease-out" 
                      style={{ width: `${widthPct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
