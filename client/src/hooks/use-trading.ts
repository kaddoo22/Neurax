import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { TradingCall } from "@/types";

export function useTrading() {
  const { toast } = useToast();

  // Get all trading calls
  const { 
    data: tradingCalls, 
    isLoading: isLoadingCalls,
    error: tradingCallsError
  } = useQuery<TradingCall[]>({
    queryKey: ["/api/trading/calls"],
  });

  // Generate new trading call
  const generateCallMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/trading/generate-call");
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/trading/calls"] });
      toast({
        title: "Trading Call Generated",
        description: `New ${data.tradingCall.position} position on ${data.tradingCall.asset}`,
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to generate trading call: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Close trading call
  const closeCallMutation = useMutation({
    mutationFn: async ({ 
      id, 
      currentPrice 
    }: { 
      id: number; 
      currentPrice: string 
    }) => {
      const response = await apiRequest("POST", `/api/trading/close-call/${id}`, {
        currentPrice,
      });
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/trading/calls"] });
      
      // Calculate profit/loss for the toast message
      const profitLoss = parseFloat(data.call.profitLoss);
      const isProfit = profitLoss > 0;
      
      toast({
        title: isProfit ? "Position Closed - Profit!" : "Position Closed - Loss",
        description: `${data.call.position} ${data.call.asset}: ${isProfit ? '+' : ''}${data.call.profitLoss}%`,
        variant: isProfit ? "default" : "destructive",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to close trading call: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Get market data
  const { 
    data: marketData, 
    isLoading: isLoadingMarket,
    error: marketError
  } = useQuery({
    queryKey: ["/api/crypto/market"],
  });

  // Get active and closed calls
  const activeCalls = (tradingCalls || []).filter(
    (call) => call.status === "ACTIVE"
  );
  
  const closedCalls = (tradingCalls || []).filter(
    (call) => call.status === "CLOSED"
  );

  // Calculate success rate
  const calculateSuccessRate = () => {
    if (!closedCalls.length) return 0;
    
    const successfulCalls = closedCalls.filter(
      (call) => parseFloat(call.profitLoss || "0") > 0
    );
    
    return (successfulCalls.length / closedCalls.length) * 100;
  };

  // Calculate overall ROI
  const calculateOverallROI = () => {
    if (!closedCalls.length) return 0;
    
    const totalROI = closedCalls.reduce(
      (sum, call) => sum + parseFloat(call.profitLoss || "0"),
      0
    );
    
    return totalROI / closedCalls.length;
  };

  return {
    tradingCalls: tradingCalls || [],
    activeCalls,
    closedCalls,
    isLoadingCalls,
    tradingCallsError,
    generateCall: generateCallMutation.mutate,
    isGeneratingCall: generateCallMutation.isPending,
    closeCall: closeCallMutation.mutate,
    isClosingCall: closeCallMutation.isPending,
    marketData,
    isLoadingMarket,
    marketError,
    successRate: calculateSuccessRate(),
    overallROI: calculateOverallROI(),
  };
}
