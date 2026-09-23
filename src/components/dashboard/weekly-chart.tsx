"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface WeeklyData {
  week: string;
  count: number;
}

interface WeeklyApplicationsChartProps {
  data: WeeklyData[];
}

function getWeekNumber(dateStr: string): number {
  const date = new Date(dateStr);
  const target = new Date(date.valueOf());
  const dayNr = (date.getDay() + 6) % 7;
  target.setDate(target.getDate() - dayNr + 3);
  const firstThursday = target.valueOf();
  target.setMonth(0, 1);
  if (target.getDay() !== 4) {
    target.setMonth(0, 1 + ((4 - target.getDay()) + 7) % 7);
  }
  return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000);
}

const gridLevels = [0, 0.25, 0.5, 0.75, 1] as const;

export function WeeklyApplicationsChart({ data }: WeeklyApplicationsChartProps) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Applications per Week</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="relative h-[220px] w-full">
          <svg viewBox="0 0 800 220" className="w-full h-full" role="img" aria-label="Weekly applications chart">
            <defs>
              <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.3" />
                <stop offset="100%" stopColor="#4f46e5" stopOpacity="0" />
              </linearGradient>
            </defs>
            
            {/* Grid lines */}
            {gridLevels.map((v: number, i: number) => (
              <line
                key={i}
                x1="40"
                y1={20 + (200 - 40) * v}
                x2="780"
                y2={20 + (200 - 40) * v}
                stroke="#e2e8f0"
                strokeWidth="1"
                strokeDasharray="4,4"
              />
            ))}
            
            {/* Area */}
            <path
              d={data.length > 1
                ? `M 40 ${220 - 40 - (data[0].count / maxCount) * (200 - 40)} ` +
                  data
                    .map((d, i) => {
                      const x = 40 + (740 / (data.length - 1)) * i;
                      const y = 220 - 40 - (d.count / maxCount) * (200 - 40);
                      return `${i === 0 ? "" : "L"} ${x} ${y}`;
                    })
                    .join(" ") +
                  ` L ${40 + (740 / (data.length - 1)) * (data.length - 1)} ${220 - 40} L 40 ${220 - 40} Z`
                : `M 40 ${220 - 40} L 780 ${220 - 40} L 40 ${220 - 40} Z`}
              fill="url(#areaGradient)"
            />
            
            {/* Line */}
            <path
              d={data.length > 1
                ? `M 40 ${220 - 40 - (data[0].count / maxCount) * (200 - 40)} ` +
                  data
                    .map((d, i) => {
                      const x = 40 + (740 / (data.length - 1)) * i;
                      const y = 220 - 40 - (d.count / maxCount) * (200 - 40);
                      return `${i === 0 ? "" : "L"} ${x} ${y}`;
                    })
                    .join(" ")
                : ""}
              stroke="#4f46e5"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Dots */}
            {data.map((d, i) => {
              const x = 40 + (740 / (data.length - 1)) * i;
              const y = 220 - 40 - (d.count / maxCount) * (200 - 40);
              return (
                <circle
                  key={i}
                  cx={x}
                  cy={y}
                  r={4}
                  fill="#4f46e5"
                  stroke="#fff"
                  strokeWidth={2}
                  className="hover:r-6 transition-r duration-150"
                />
              );
            })}
            
            {/* X-axis labels */}
            {data.map((d, i) => {
              const x = 40 + (740 / (data.length - 1)) * i;
              return (
                <text
                  key={i}
                  x={x}
                  y={210}
                  textAnchor="middle"
                  fontSize="10"
                  fill="#94a3b8"
                  transform={`rotate(-45 ${x} ${210})`}
                >
                  W{getWeekNumber(d.week)}
                </text>
              );
            })}
          </svg>
        </div>
      </CardContent>
    </Card>
  );
}