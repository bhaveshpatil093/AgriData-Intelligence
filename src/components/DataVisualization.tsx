import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface DataVisualizationProps {
  data: {
    type: "bar" | "line" | "table";
    title: string;
    data: any[];
    xKey?: string;
    yKey?: string;
    series?: string[];
  };
}

export const DataVisualization = ({ data }: DataVisualizationProps) => {
  if (data.type === "table") {
    return (
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-lg">{data.title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  {Object.keys(data.data[0] || {}).map((key) => (
                    <th key={key} className="text-left p-2 font-semibold">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.data.map((row, index) => (
                  <tr key={index} className="border-b">
                    {Object.values(row).map((value: any, i) => (
                      <td key={i} className="p-2">
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle className="text-lg">{data.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          {data.type === "bar" ? (
            <BarChart data={data.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={data.xKey || "name"} />
              <YAxis />
              <Tooltip />
              <Legend />
              {data.series?.map((key, index) => (
                <Bar
                  key={key}
                  dataKey={key}
                  fill={`hsl(var(--chart-${(index % 5) + 1}))`}
                />
              )) || <Bar dataKey={data.yKey || "value"} fill="hsl(var(--chart-1))" />}
            </BarChart>
          ) : (
            <LineChart data={data.data}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey={data.xKey || "name"} />
              <YAxis />
              <Tooltip />
              <Legend />
              {data.series?.map((key, index) => (
                <Line
                  key={key}
                  type="monotone"
                  dataKey={key}
                  stroke={`hsl(var(--chart-${(index % 5) + 1}))`}
                  strokeWidth={2}
                />
              )) || (
                <Line
                  type="monotone"
                  dataKey={data.yKey || "value"}
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                />
              )}
            </LineChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
