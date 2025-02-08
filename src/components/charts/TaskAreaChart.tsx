"use client";

import * as React from "react";
import { Area, AreaChart, CartesianGrid, XAxis } from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { TrendingUp, ChevronDown } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from "@/lib/utils";

interface TaskChartData {
  date: string;
  project: string;
  duration: number;
  formattedTime?: string;
}

interface TaskAreaChartProps {
  data: TaskChartData[];
  formatTime: (seconds: number) => string;
}

const CHART_COLORS = [
  "hsl(var(--chart-1))",
  "hsl(var(--chart-2))",
  "hsl(var(--chart-3))",
  "hsl(var(--chart-4))",
  "hsl(var(--chart-5))",
];

export function TaskAreaChart({ data, formatTime }: TaskAreaChartProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  // Get unique projects
  const projects = React.useMemo(() => {
    return Array.from(new Set(data.map((item) => item.project)));
  }, [data]);

  // Generate chart config dynamically
  const chartConfig = React.useMemo(() => {
    const config: ChartConfig = {
      tasks: {
        label: "Tasks",
      },
    };

    projects.forEach((project, index) => {
      config[project] = {
        label: project,
        color: CHART_COLORS[index % CHART_COLORS.length],
      };
    });

    return config;
  }, [projects]);

  const chartData = React.useMemo(() => {
    // Group tasks by date and project
    const groupedData = data.reduce(
      (acc, task) => {
        const date = task.date;
        if (!acc[date]) {
          acc[date] = {};
        }
        if (!acc[date][task.project]) {
          acc[date][task.project] = 0;
        }
        acc[date][task.project] += task.duration;
        return acc;
      },
      {} as Record<string, Record<string, number>>,
    );

    // Convert to array format for chart and sort by date
    return Object.entries(groupedData)
      .map(([date, projects]) => ({
        date,
        ...projects,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }, [data]);

  // Calculate trend
  const trend = React.useMemo(() => {
    if (chartData.length < 2) return 0;
    const lastDay = Object.values(chartData[chartData.length - 1]).reduce(
      (sum, val) => (typeof val === "number" ? sum + val : sum),
      0,
    );
    const previousDay = Object.values(chartData[chartData.length - 2]).reduce(
      (sum, val) => (typeof val === "number" ? sum + val : sum),
      0,
    );
    return previousDay ? ((lastDay - previousDay) / previousDay) * 100 : 0;
  }, [chartData]);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="w-full">
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-accent/50 transition-colors">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Tasks Over Time</CardTitle>
                <CardDescription>Task duration by project</CardDescription>
              </div>
              <ChevronDown
                className={cn(
                  "h-4 w-4 text-muted-foreground transition-transform duration-200",
                  isOpen && "transform rotate-180",
                )}
              />
            </div>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent>
            <ChartContainer
              config={chartConfig}
              className="max-h-[400px] w-full flex-1"
            >
              <AreaChart
                data={chartData}
                margin={{ left: 12, right: 12 }}
                height={300}
                accessibilityLayer
              >
                <CartesianGrid vertical={false} />
                <XAxis
                  dataKey="date"
                  tickLine={false}
                  axisLine={false}
                  tickMargin={8}
                  tickFormatter={(value) =>
                    new Date(value).toLocaleDateString()
                  }
                />
                <ChartTooltip
                  cursor={false}
                  content={
                    <ChartTooltipContent
                      formatter={(value) => formatTime(Number(value))}
                    />
                  }
                />
                {projects.map((project, index) => (
                  <Area
                    key={project}
                    dataKey={project}
                    name={project}
                    type="monotone"
                    fill={CHART_COLORS[index % CHART_COLORS.length]}
                    fillOpacity={0.4}
                    stroke={CHART_COLORS[index % CHART_COLORS.length]}
                    stackId="a"
                  />
                ))}
              </AreaChart>
            </ChartContainer>
          </CardContent>
          <CardFooter>
            <div className="flex w-full items-start gap-2 text-sm">
              <div className="grid gap-2">
                <div className="flex items-center gap-2 font-medium leading-none">
                  {trend > 0 ? "Trending up" : "Trending down"} by{" "}
                  {Math.abs(trend).toFixed(1)}% this period{" "}
                  <TrendingUp className="h-4 w-4" />
                </div>
                <div className="flex items-center gap-2 leading-none text-muted-foreground">
                  Task duration over time
                </div>
              </div>
            </div>
          </CardFooter>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}
