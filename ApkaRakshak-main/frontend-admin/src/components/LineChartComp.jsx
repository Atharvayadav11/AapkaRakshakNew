import { TrendingUp } from "lucide-react";
import { CartesianGrid, Line, LineChart, XAxis } from "recharts";
import axios from "axios";
import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";

export const description = "A multiple line chart";

const chartData = [
  { month: "September", year2023: 168, year2024: 162 },
  { month: "May", year2023: 157, year2024: 177 },
  { month: "March", year2023: 165, year2024: 153 },
  { month: "December", year2023: 162, year2024: 150 },
  { month: "October", year2023: 174, year2024: 176 },
  { month: "August", year2023: 180, year2024: 147 },
  { month: "November", year2023: 168, year2024: 174 },
  { month: "February", year2023: 181, year2024: 148 },
  { month: "January", year2023: 135, year2024: 188 },
  { month: "July", year2023: 167, year2024: 172 },
  { month: "June", year2023: 152, year2024: 164 },
  { month: "April", year2023: 158, year2024: 147 },
];



const chartConfig = {
  desktop: {
    label: "Desktop",
    color: "hsl(var(--chart-1))",
  },
  mobile: {
    label: "Mobile",
    color: "hsl(var(--chart-2))",
  },
};

export function LineChartComp() {
  const [data,setData] = useState([])
  useEffect(() => {
    // Function to fetch data
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/firs/lastTwoYears');
        setData(response.data); // Set the data in state
      } catch (err) {
        console.log(err)
      }
    };

    fetchData(); // Call the function
  }, []); // Empty dependency array means this runs once after the first render


  return (
    <Card>
      <CardHeader>
        <CardTitle>Line Chart - Multiple</CardTitle>
        <CardDescription>January - June 2024</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            data={data}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
            <Line
              dataKey="year2023"
              type="monotone"
              stroke="var(--color-desktop)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              dataKey="year2024"
              type="monotone"
              stroke="var(--color-mobile)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      
    </Card>
  );
}
