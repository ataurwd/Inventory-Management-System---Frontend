import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Forecast } from '../../services/forecasts.service';
import { TrendingUp, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ForecastCardProps {
  forecast: Forecast;
}

export function ForecastCard({ forecast }: ForecastCardProps) {
  const { productId, predictedDemand, confidence, recommendedOrderQty, currentStock } = forecast;
  const isPopulated = typeof productId !== 'string';
  const name = isPopulated ? (productId as any).name : 'Unknown Product';
  const category = isPopulated ? (productId as any).category : '';

  const getConfidenceColor = (conf: number) => {
    if (conf >= 0.8) return 'bg-green-500';
    if (conf >= 0.5) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const isInsufficientData = predictedDemand === 0 && confidence === 0;

  return (
    <Card className="flex flex-col h-full hover:border-primary/50 transition-colors">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-bold">{name}</CardTitle>
            <p className="text-xs text-muted-foreground">{category}</p>
          </div>
          {isInsufficientData ? (
            <Badge variant="outline" className="bg-muted text-muted-foreground">Not enough data</Badge>
          ) : (
            <Badge variant="outline" className={recommendedOrderQty > 0 ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-emerald-500/10 text-emerald-500 border-emerald-500/20"}>
              {recommendedOrderQty > 0 ? "Order Recommended" : "Stock Sufficient"}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col justify-between space-y-4">
        {isInsufficientData ? (
          <div className="flex flex-col items-center justify-center py-6 text-muted-foreground space-y-2">
            <AlertCircle className="h-8 w-8 opacity-50" />
            <span className="text-sm">Not enough sales history yet</span>
          </div>
        ) : (
          <>
            <div className="space-y-1">
              <p className="text-sm font-medium text-muted-foreground">Predicted demand (next 30 days):</p>
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                <span className="text-2xl font-bold">{predictedDemand} <span className="text-sm font-normal text-muted-foreground">units</span></span>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between items-center text-sm">
                <span className="text-muted-foreground">AI Confidence:</span>
                <span className="font-medium">{Math.round(confidence * 100)}%</span>
              </div>
              <Progress value={confidence * 100} indicatorClassName={getConfidenceColor(confidence)} />
            </div>

            <div className="bg-muted/50 rounded-lg p-3 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Current Stock:</span>
                <span className="font-medium">{currentStock}</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Recommended Order:</span>
                <span className={recommendedOrderQty > 0 ? "text-amber-500" : "text-emerald-500"}>
                  {recommendedOrderQty} units
                </span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
