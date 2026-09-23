"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface FunnelData {
  stage: string;
  count: number;
  percentage: number;
}

interface FunnelChartProps {
  data: FunnelData[];
}

export function FunnelChart({ data }: FunnelChartProps) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Application Funnel</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((d) => {
            const width = maxCount > 0 ? (d.count / maxCount) * 100 : 0;
            return (
              <div key={d.stage} className="space-y-1">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-slate-700 dark:text-slate-300">{d.stage}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {d.count}
                    </Badge>
                    <span className="text-slate-500 dark:text-slate-400 w-12 text-right">
                      {d.percentage}%
                    </span>
                  </div>
                </div>
                <div className="h-8 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden relative">
                  <div
                    className={cn(
                      "h-full rounded-full bg-primary-600 transition-all duration-500 flex items-center justify-end pr-2 text-xs font-medium text-white",
                      width < 15 ? "justify-start pl-2" : "",
                    )}
                    style={{ width: `${width}%` }}
                  >
                    {d.count > 0 && width >= 15 && d.count}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}