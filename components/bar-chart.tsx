import { useEffect, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";
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

const chartConfig = {
  orders: {
    label: "Orders",
    color: "hsl(var(--chart-1))",
  },
} satisfies ChartConfig;

export function BarChartComponent({ orders }) {
  const [dateRange, setDateRange] = useState("");

  useEffect(() => {
    if (orders && orders.length > 0) {
      // Assuming each order has a 'date' field in ISO format
      const dates = orders.map((order) => new Date(order.created_at));
      const earliestDate = new Date(Math.min(...dates));
      const latestDate = new Date(Math.max(...dates));

      // Format dates
      const formatDate = (date) => {
        return date.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        });
      };

      // Create date range string
      const range = `${formatDate(earliestDate)} - ${formatDate(latestDate)}`;
      setDateRange(range);
    }
  }, [orders]);

  // Process data to group by college
  const collegeData = orders?.reduce((acc, order) => {
    const college = order.college;
    if (!acc[college]) {
      acc[college] = { college, orders: 0 };
    }
    acc[college].orders += 1;
    return acc;
  }, {});

  const chartData = Object.values(collegeData || {});

  return (
    <Card className="flex flex-col">
      <CardHeader className="items-center pb-0">
        <CardTitle>Orders per College</CardTitle>
        <CardDescription>{dateRange || "No orders found"}</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <BarChart data={chartData}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="college"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Bar dataKey="orders" fill="var(--color-orders)" radius={8} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
