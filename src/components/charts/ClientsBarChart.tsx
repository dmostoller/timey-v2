import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, CartesianGrid, XAxis } from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

interface ClientChartData {
  name: string;
  time: number;
  earnings: number;
}

interface ClientsBarChartProps {
  data: ClientChartData[];
  formatTime: (seconds: number) => string;
  formatMoney: (amount: number) => string;
}

const chartConfig = {
  desktop: {
    label: "Name",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Earned",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function ClientsBarChart({ data }: ClientsBarChartProps) {
  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>Clients</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 items-center justify-center">
        <ChartContainer
          className="min-h-[300px] w-full max-w-[800px]"
          config={chartConfig}
        >
          <BarChart data={data} accessibilityLayer>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tickMargin={10}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator="dashed" />}
            />
            <Bar dataKey="earnings" fill="hsl(var(--chart-1))" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
