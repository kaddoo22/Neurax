import { useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export function useAI() {
  const { toast } = useToast();

  // Generate AI text content
  const generateTextMutation = useMutation({
    mutationFn: async ({
      topic,
      contentType,
      tone,
      maxLength,
    }: {
      topic: string;
      contentType: "tweet" | "thread" | "reply" | "meme";
      tone?: string;
      maxLength?: number;
    }) => {
      const response = await apiRequest("POST", "/api/ai/generate-text", {
        topic,
        contentType,
        tone,
        maxLength,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "AI content generated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to generate AI content: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Generate AI image
  const generateImageMutation = useMutation({
    mutationFn: async ({ prompt }: { prompt: string }) => {
      const response = await apiRequest("POST", "/api/ai/generate-image", {
        prompt,
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "AI image generated successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to generate AI image: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Save content idea
  const saveIdeaMutation = useMutation({
    mutationFn: async ({
      content,
      type,
    }: {
      content: string;
      type: string;
    }) => {
      const response = await apiRequest("POST", "/api/ai/save-idea", {
        content,
        type,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai/ideas"] });
      toast({
        title: "Success",
        description: "Content idea saved successfully",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: `Failed to save content idea: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Generate demo persona response
  const generatePersonaResponse = (prompt: string) => {
    // Map of common prompts and responses
    const responses: Record<string, string> = {
      "How should I respond to market FUD?": "While others panic sell, I'm accumulating. FUD is just weak hands creating discounts for me. Been through 3 bear markets - each time my portfolio 10x in the recovery. Stay liquid, stay rational.",
      "What's your prediction for BTC?": "My technical analysis points to $87K by EOY. Institutions are quietly loading their bags while retail panics. If you don't have at least 25% of your net worth in crypto, you're going to regret it when mass adoption hits.",
      "Should I buy altcoins?": "90% of altcoins will eventually go to zero. I focus on fundamentals and tokenomics. Find projects with real revenue, user growth, and sustainable tokenomics. Then DCA and hold through volatility - that's how generational wealth is built.",
      "How do you handle trading losses?": "Losses are tuition in the trading school of life. I record each mistake, analyze why my thesis was wrong, then adjust my strategy. Growth mindset separates winners from losers. Every loss brings me closer to my next 10x gain.",
      "default": "I don't just predict the market, I move it. While everyone is debating whether to buy, I've already accumulated a position that would make whales jealous. This isn't financial advice - it's financial inevitability."
    };
    
    return responses[prompt] || responses["default"];
  };

  return {
    generateText: generateTextMutation.mutate,
    isGeneratingText: generateTextMutation.isPending,
    generatedText: generateTextMutation.data?.content,
    
    generateImage: generateImageMutation.mutate,
    isGeneratingImage: generateImageMutation.isPending,
    generatedImage: generateImageMutation.data?.imageUrl,
    
    saveIdea: saveIdeaMutation.mutate,
    isSavingIdea: saveIdeaMutation.isPending,
    
    // Helper for demo
    generatePersonaResponse
  };
}
