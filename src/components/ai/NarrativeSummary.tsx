import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../ui/card';
import { Sparkles } from 'lucide-react';

export function NarrativeSummary() {
  return (
    <Card className="bg-primary/5 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center text-primary">
          <Sparkles className="mr-2 h-5 w-5" />
          AI Insights
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Based on the 30-day forecast, you have a solid inventory position for most products.
          However, please pay attention to the Smart Shopping List below to avoid stockouts on 
          high-demand items. Overstock risk is currently low.
        </p>
      </CardContent>
    </Card>
  );
}
