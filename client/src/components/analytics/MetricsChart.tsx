import React, { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface MetricsChartProps {
  followers: number[];
  engagement: number[];
  impressions: number[];
  timeframe: string;
}

const MetricsChart: React.FC<MetricsChartProps> = ({
  followers,
  engagement,
  impressions,
  timeframe,
}) => {
  const [activeMetric, setActiveMetric] = useState<string>("all");

  // Generate labels based on timeframe
  const generateLabels = () => {
    const today = new Date();
    
    switch (timeframe) {
      case "day":
        return Array.from({ length: 24 }, (_, i) => `${i}:00`);
      case "week":
        return Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(today.getDate() - 6 + i);
          return date.toLocaleDateString('en-US', { weekday: 'short' });
        });
      case "month":
        return Array.from({ length: 30 }, (_, i) => {
          const date = new Date();
          date.setDate(today.getDate() - 29 + i);
          return `${date.getMonth() + 1}/${date.getDate()}`;
        });
      case "quarter":
        return Array.from({ length: 12 }, (_, i) => {
          const date = new Date();
          date.setDate(1);
          date.setMonth(today.getMonth() - 11 + i);
          return date.toLocaleDateString('en-US', { month: 'short' });
        });
      default:
        return Array.from({ length: 7 }, (_, i) => {
          const date = new Date();
          date.setDate(today.getDate() - 6 + i);
          return date.toLocaleDateString('en-US', { weekday: 'short' });
        });
    }
  };

  // Prepare data for the chart
  const chartData = () => {
    const labels = generateLabels();
    const displayedFollowers = followers.slice(0, labels.length);
    const displayedEngagement = engagement.slice(0, labels.length);
    const displayedImpressions = impressions.slice(0, labels.length);
    
    return labels.map((label, index) => ({
      name: label,
      followers: displayedFollowers[index],
      engagement: displayedEngagement[index],
      impressions: displayedImpressions[index],
    }));
  };

  // Custom tooltip to match the cyber theme
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-spaceBlack p-2 border border-neonGreen/30 rounded">
          <p className="text-matrixGreen text-xs mb-1">{`${label}`}</p>
          {payload.map((entry: any, index: number) => (
            <p key={`item-${index}`} className="text-xs" style={{ color: entry.color }}>
              {`${entry.name}: ${entry.value}`}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="h-[300px]">
      <div className="flex justify-between items-center mb-4">
        <div className="flex gap-1">
          <button
            className={`text-xs px-2 py-1 rounded ${
              activeMetric === "all"
                ? "bg-neonGreen/20 text-neonGreen border border-neonGreen/40"
                : "text-matrixGreen/70 border border-transparent"
            }`}
            onClick={() => setActiveMetric("all")}
          >
            All Metrics
          </button>
          <button
            className={`text-xs px-2 py-1 rounded ${
              activeMetric === "followers"
                ? "bg-neonGreen/20 text-neonGreen border border-neonGreen/40"
                : "text-matrixGreen/70 border border-transparent"
            }`}
            onClick={() => setActiveMetric("followers")}
          >
            Followers
          </button>
          <button
            className={`text-xs px-2 py-1 rounded ${
              activeMetric === "engagement"
                ? "bg-cyberBlue/20 text-cyberBlue border border-cyberBlue/40"
                : "text-matrixGreen/70 border border-transparent"
            }`}
            onClick={() => setActiveMetric("engagement")}
          >
            Engagement
          </button>
          <button
            className={`text-xs px-2 py-1 rounded ${
              activeMetric === "impressions"
                ? "bg-electricPurple/20 text-electricPurple border border-electricPurple/40"
                : "text-matrixGreen/70 border border-transparent"
            }`}
            onClick={() => setActiveMetric("impressions")}
          >
            Impressions
          </button>
        </div>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData()}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(57, 255, 20, 0.1)" />
          <XAxis 
            dataKey="name" 
            tick={{ fill: '#CCFFCC', fontSize: 10 }}
            axisLine={{ stroke: 'rgba(57, 255, 20, 0.3)' }}
          />
          <YAxis 
            yAxisId="left"
            orientation="left"
            tick={{ fill: '#CCFFCC', fontSize: 10 }}
            axisLine={{ stroke: 'rgba(57, 255, 20, 0.3)' }}
            hide={activeMetric !== "all" && activeMetric !== "followers"}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            tick={{ fill: '#CCFFCC', fontSize: 10 }}
            axisLine={{ stroke: 'rgba(57, 255, 20, 0.3)' }}
            hide={activeMetric !== "all" && activeMetric !== "engagement"}
          />
          <YAxis 
            yAxisId="far-right"
            orientation="right"
            tick={{ fill: '#CCFFCC', fontSize: 10 }}
            axisLine={{ stroke: 'rgba(57, 255, 20, 0.3)' }}
            hide={activeMetric !== "all" && activeMetric !== "impressions"}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ fontSize: '10px', color: '#CCFFCC' }}
            formatter={(value) => <span className="text-matrixGreen">{value}</span>}
          />
          {(activeMetric === "all" || activeMetric === "followers") && (
            <Line
              yAxisId="left"
              type="monotone"
              dataKey="followers"
              stroke="#39FF14"
              activeDot={{ r: 8, fill: '#39FF14', stroke: 'rgba(57, 255, 20, 0.3)' }}
              strokeWidth={2}
              dot={{ fill: '#39FF14', r: 4, strokeWidth: 0 }}
            />
          )}
          {(activeMetric === "all" || activeMetric === "engagement") && (
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="engagement"
              stroke="#00FFFF"
              activeDot={{ r: 8, fill: '#00FFFF', stroke: 'rgba(0, 255, 255, 0.3)' }}
              strokeWidth={2}
              dot={{ fill: '#00FFFF', r: 4, strokeWidth: 0 }}
            />
          )}
          {(activeMetric === "all" || activeMetric === "impressions") && (
            <Line
              yAxisId="far-right"
              type="monotone"
              dataKey="impressions"
              stroke="#9D00FF"
              activeDot={{ r: 8, fill: '#9D00FF', stroke: 'rgba(157, 0, 255, 0.3)' }}
              strokeWidth={2}
              dot={{ fill: '#9D00FF', r: 4, strokeWidth: 0 }}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default MetricsChart;
