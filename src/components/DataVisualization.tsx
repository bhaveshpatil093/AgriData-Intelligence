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
  // Safety checks
  if (!data) {
    console.warn("DataVisualization: No data provided");
    return null;
  }

  // Ensure data.data exists and is an array
  if (!data.data || !Array.isArray(data.data) || data.data.length === 0) {
    console.warn("DataVisualization: Invalid or empty data array", data);
    return null;
  }

  // Ensure data.type is valid
  if (data.type && !["bar", "line", "table"].includes(data.type)) {
    console.warn("DataVisualization: Invalid type", data.type);
    return null;
  }

  // Debug logging
  console.log("DataVisualization rendering:", {
    type: data.type,
    title: data.title,
    dataLength: data.data.length,
    xKey: data.xKey,
    yKey: data.yKey,
    firstRow: data.data[0],
  });

  if (data.type === "table") {
    const firstRow = data.data[0];
    if (!firstRow || typeof firstRow !== "object") {
      return null;
    }

    return (
      <Card className="mt-4 border-2 border-border/50 shadow-lg bg-card/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold">{data.title || "Data Table"}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-border/30">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="border-b bg-gradient-to-r from-muted/50 to-muted/30">
                  {Object.keys(firstRow).map((key) => (
                    <th key={key} className="text-left p-3 font-semibold text-foreground">
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {data.data.map((row, index) => (
                  <tr 
                    key={index} 
                    className="border-b hover:bg-primary/5 transition-colors even:bg-muted/20"
                  >
                    {Object.keys(firstRow).map((key) => (
                      <td key={key} className="p-3">
                        {row[key] !== undefined && row[key] !== null ? String(row[key]) : "-"}
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

  // Determine chart configuration with fallbacks
  const type = data.type || "bar";
  
  // Determine xKey - try common field names
  const firstDataPoint = data.data[0];
  const possibleXKeys = data.xKey 
    ? [data.xKey]
    : firstDataPoint 
      ? Object.keys(firstDataPoint).filter(k => 
          ["name", "State", "District", "Year", "Crop", "label"].includes(k) ||
          typeof firstDataPoint[k] === "string"
        )
      : ["name"];
  const xKey = possibleXKeys[0] || "name";

  // Determine yKey - numeric fields (handle spaces and special characters)
  const possibleYKeys = data.yKey
    ? [data.yKey]
    : firstDataPoint
      ? Object.keys(firstDataPoint).filter(k => 
          typeof firstDataPoint[k] === "number" && 
          !["Year"].includes(k)
        )
      : ["value"];
  
  // Use the provided yKey if it exists, otherwise use the first numeric field
  const yKey = (data.yKey && firstDataPoint && firstDataPoint[data.yKey] !== undefined)
    ? data.yKey
    : (possibleYKeys[0] || "value");
  const hasMultipleSeries = data.series && Array.isArray(data.series) && data.series.length > 0;

  return (
    <Card className="mt-4 border-2 border-border/50 shadow-lg bg-card border-border">
      <CardHeader className="pb-3">
        <CardTitle className="text-base sm:text-lg font-semibold">{data.title || "Data Visualization"}</CardTitle>
      </CardHeader>
      <CardContent className="overflow-x-auto">
        <ResponsiveContainer width="100%" height={350} minHeight={250}>
          {type === "bar" ? (
            <BarChart data={data.data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey={xKey} 
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              {hasMultipleSeries ? (
                data.series!.map((key, index) => (
                  <Bar
                    key={key}
                    dataKey={key}
                    fill={`hsl(var(--chart-${(index % 5) + 1}))`}
                    name={key}
                  />
                ))
              ) : (
                <Bar 
                  dataKey={yKey}
                  fill="hsl(var(--chart-1))" 
                  name={yKey}
                />
              )}
            </BarChart>
          ) : (
            <LineChart data={data.data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey={xKey}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis />
              <Tooltip />
              <Legend />
              {hasMultipleSeries ? (
                data.series!.map((key, index) => (
                  <Line
                    key={key}
                    type="monotone"
                    dataKey={key}
                    stroke={`hsl(var(--chart-${(index % 5) + 1}))`}
                    strokeWidth={2}
                    name={key}
                  />
                ))
              ) : (
                <Line
                  type="monotone"
                  dataKey={yKey}
                  stroke="hsl(var(--chart-1))"
                  strokeWidth={2}
                  name={yKey}
                />
              )}
            </LineChart>
          )}
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
