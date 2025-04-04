import { useQuery } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

type MetricsData = {
  id: number;
  userId: number;
  followers: number;
  engagement: number;
  impressions: number;
  aiEfficiency: number;
  date: string;
};

// This hook fetches metrics data and provides trend calculation
export function useMetrics(timeframe: string = "week") {
  // Get the metrics data
  const { data: metrics, isLoading, error } = useQuery<MetricsData>({
    queryKey: ["/api/metrics", timeframe],
  });

  // Simulate trend data based on timeframe (in real app, we'd fetch this from the API)
  const calculateTrends = () => {
    // Default trends
    const defaultTrends = {
      followers: { value: 5.2, direction: "up" as const },
      engagement: { value: 18.7, direction: "up" as const },
      impressions: { value: 12.4, direction: "up" as const },
      aiEfficiency: { value: 3.1, direction: "up" as const }
    };
    
    // Adjust trends based on timeframe
    switch (timeframe) {
      case "day":
        return {
          followers: { value: 1.2, direction: "up" as const },
          engagement: { value: 5.7, direction: "up" as const },
          impressions: { value: 8.4, direction: "up" as const },
          aiEfficiency: { value: 0.5, direction: "neutral" as const }
        };
      case "week":
        return defaultTrends;
      case "month":
        return {
          followers: { value: 15.8, direction: "up" as const },
          engagement: { value: 22.3, direction: "up" as const },
          impressions: { value: 42.6, direction: "up" as const },
          aiEfficiency: { value: 5.9, direction: "up" as const }
        };
      case "quarter":
        return {
          followers: { value: 43.1, direction: "up" as const },
          engagement: { value: 37.2, direction: "up" as const },
          impressions: { value: 86.4, direction: "up" as const },
          aiEfficiency: { value: 12.3, direction: "up" as const }
        };
      default:
        return defaultTrends;
    }
  };

  // Get trend data
  const trends = calculateTrends();

  // Generate historical data points for charts
  const generateHistoricalData = () => {
    const points = timeframe === "day" ? 24 : 
                 timeframe === "week" ? 7 : 
                 timeframe === "month" ? 30 : 
                 timeframe === "quarter" ? 90 : 7;
    
    return {
      followers: Array.from({ length: points }, (_, i) => Math.floor(100 + i * 2 + Math.random() * 10)),
      engagement: Array.from({ length: points }, (_, i) => (2 + i * 0.1 + Math.random() * 0.5).toFixed(1)),
      impressions: Array.from({ length: points }, (_, i) => Math.floor(800 + i * 20 + Math.random() * 100)),
    };
  };

  return {
    metrics,
    isLoading,
    error,
    trends,
    historicalData: generateHistoricalData(),
  };
}
