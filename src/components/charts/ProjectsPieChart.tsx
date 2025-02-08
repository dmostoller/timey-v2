"use client";

import * as React from "react";
import { Label, Pie, PieChart } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface ProjectChartData {
  name: string;
  value: number;
  earnings: number;
  formattedTime: string;
  formattedEarnings: string;
  fill?: string;
}

interface ProjectsPieChartProps {
  data: ProjectChartData[];
  formatTime: (seconds: number) => string;
  formatMoney: (amount: number) => string;
}

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export function ProjectsPieChart({
  data,
  formatTime,
  formatMoney,
}: ProjectsPieChartProps) {
  const totalTime = React.useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.value, 0);
  }, [data]);

  const chartData = React.useMemo(() => {
    return data.map((item, index) => ({
      ...item,
      formattedTime: formatTime(item.value),
      formattedEarnings: formatMoney(item.earnings),
      fill: CHART_COLORS[index % CHART_COLORS.length],
    }));
  }, [data, formatTime, formatMoney]);

  const chartConfig = React.useMemo(() => {
    const config: ChartConfig = {
      projects: {
        label: "Projects",
      },
    };

    chartData.forEach((project, index) => {
      config[project.name] = {
        label: project.name,
        color: CHART_COLORS[index % CHART_COLORS.length],
      };
    });

    return config;
  }, [chartData]);

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <CardTitle>Projects</CardTitle>
        <CardDescription>Time tracked by project</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[300px]"
        >
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={60}
              strokeWidth={5}
            >
              <Label
                content={({ viewBox }) => {
                  if (viewBox && "cx" in viewBox && "cy" in viewBox) {
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor="middle"
                        dominantBaseline="middle"
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className="fill-foreground text-3xl font-bold"
                        >
                          {formatTime(totalTime)}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + 24}
                          className="fill-muted-foreground"
                        >
                          Total Time
                        </tspan>
                      </text>
                    );
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
