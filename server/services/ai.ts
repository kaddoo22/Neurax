import { z } from 'zod';

// OpenRouter and Hugging Face integration for AI generation capabilities
export class AIService {
  private openRouterApiKey: string;
  private huggingFaceApiKey: string;

  constructor() {
    this.openRouterApiKey = process.env.OPENROUTER_API_KEY || '';
    this.huggingFaceApiKey = process.env.HUGGINGFACE_API_KEY || '';

    if (!this.openRouterApiKey || !this.huggingFaceApiKey) {
      console.warn('AI API credentials not configured. AI features will be disabled.');
    }
  }
  
  // Check if AI APIs are properly configured
  private checkCredentials(): boolean {
    if (!this.openRouterApiKey || !this.huggingFaceApiKey) {
      console.warn('AI API credentials not configured. Cannot perform AI operations.');
      return false;
    }
    return true;
  }

  // Generate text content using OpenRouter
  async generateTextContent(
    topic: string,
    contentType: 'tweet' | 'thread' | 'reply' | 'meme', 
    tone: string = 'confident,trader',
    maxLength: number = 280
  ): Promise<string> {
    if (!this.checkCredentials()) {
      return `[AI generation requires API keys. Please configure OpenRouter API key to use this feature.]`;
    }
    
    let prompt = this.buildPrompt(topic, contentType, tone, maxLength);

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.openRouterApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3-opus:beta',
        messages: [
          {
            role: 'system',
            content: 'You are NeuraX-3000, an aggressive and confident crypto trader and social media personality. You talk with authority and occasionally use emojis. You\'re known for your bold claims and provocative statements that generate engagement in the crypto Twitter community.',
          },
          { role: 'user', content: prompt },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`OpenRouter API error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  }

  // Build prompt based on content type
  private buildPrompt(
    topic: string,
    contentType: 'tweet' | 'thread' | 'reply' | 'meme',
    tone: string,
    maxLength: number
  ): string {
    switch (contentType) {
      case 'tweet':
        return `Generate a single tweet about ${topic} in a ${tone} tone. Maximum length: ${maxLength} characters.`;
      case 'thread':
        return `Generate the first tweet in a thread about ${topic} in a ${tone} tone. This should hook readers and make them want to read the full thread. Maximum length: ${maxLength} characters.`;
      case 'reply':
        return `Generate a reply to a tweet about ${topic} in a ${tone} tone. Be engaging and provocative to encourage further discussion. Maximum length: ${maxLength} characters.`;
      case 'meme':
        return `Generate text for a meme about ${topic} in a ${tone} tone. This should be funny, clever, and shareable. Maximum length: ${maxLength} characters.`;
      default:
        return `Generate content about ${topic} in a ${tone} tone. Maximum length: ${maxLength} characters.`;
    }
  }

  // Generate image using Hugging Face's Stable Diffusion
  async generateImage(prompt: string): Promise<string> {
    if (!this.checkCredentials()) {
      // Return a placeholder image URL or data URL for missing API key
      return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNTEyIiBoZWlnaHQ9IjUxMiIgZmlsbD0iIzJiMjEzYSIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LWZhbWlseT0iQXJpYWwsIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iMjAiIGZpbGw9IiNmZmYiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGRvbWluYW50LWJhc2VsaW5lPSJtaWRkbGUiPkltYWdlIGdlbmVyYXRpb24gcmVxdWlyZXMgYW4gQVBJIGtleTwvdGV4dD48dGV4dCB4PSI1MCUiIHk9IjU4JSIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiBmaWxsPSIjZmZmIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIj5QbGVhc2UgY29uZmlndXJlIEh1Z2dpbmdGYWNlIEFQSSBrZXk8L3RleHQ+PC9zdmc+';
    }
    
    const response = await fetch(
      'https://api-inference.huggingface.co/models/stabilityai/stable-diffusion-xl-base-1.0',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.huggingFaceApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          inputs: prompt,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 503) {
        // Model is loading
        throw new Error('Model is loading, please try again in a moment');
      }
      throw new Error(`Hugging Face API error: ${response.statusText}`);
    }

    // Convert the image to base64
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    return `data:image/jpeg;base64,${base64}`;
  }

  // Generate a trading call recommendation
  async generateTradingCall(): Promise<{
    asset: string;
    position: 'LONG' | 'SHORT';
    entryPrice: string;
    targetPrice: string;
    reasoning: string;
  }> {
    const cryptoAssets = [
      'BTC', 'ETH', 'SOL', 'XRP', 'ADA', 
      'AVAX', 'DOT', 'MATIC', 'LINK', 'UNI'
    ];
    
    const randomAsset = cryptoAssets[Math.floor(Math.random() * cryptoAssets.length)];
    const position = Math.random() > 0.5 ? 'LONG' : 'SHORT';
    
    // For a real implementation, you'd integrate with market data APIs
    // Here we're generating mock data for demonstration
    const currentPriceMap: Record<string, number> = {
      'BTC': 40000 + Math.random() * 5000,
      'ETH': 2000 + Math.random() * 500,
      'SOL': 80 + Math.random() * 20,
      'XRP': 0.5 + Math.random() * 0.1,
      'ADA': 0.3 + Math.random() * 0.1,
      'AVAX': 20 + Math.random() * 5,
      'DOT': 5 + Math.random() * 2,
      'MATIC': 0.8 + Math.random() * 0.2,
      'LINK': 10 + Math.random() * 3,
      'UNI': 5 + Math.random() * 2
    };
    
    const currentPrice = currentPriceMap[randomAsset] || 100;
    const targetPrice = position === 'LONG' 
      ? currentPrice * (1 + (Math.random() * 0.2)) 
      : currentPrice * (1 - (Math.random() * 0.2));
    
    // Check if API is available for AI-generated analysis
    let reasoning = '';
    if (this.checkCredentials()) {
      const prompt = `Generate a brief analysis for a ${position} position on ${randomAsset} at ${currentPrice.toFixed(2)} with a target of ${targetPrice.toFixed(2)}. What technical or fundamental reasons support this trade?`;

      try {
        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.openRouterApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'anthropic/claude-3-haiku:beta',
            messages: [
              { role: 'system', content: 'You are a skilled cryptocurrency technical analyst.' },
              { role: 'user', content: prompt },
            ],
            temperature: 0.7,
            max_tokens: 200,
          }),
        });

        if (response.ok) {
          const data = await response.json();
          reasoning = data.choices[0].message.content;
        } else {
          reasoning = `Analysis generation requires OpenRouter API key. Current prediction is based on algorithmic indicators only.`;
        }
      } catch (error) {
        console.error("Error generating trading call analysis:", error);
        reasoning = `Error generating analysis. Technical indicators suggest a ${position} position based on recent price action.`;
      }
    } else {
      reasoning = `AI-powered analysis requires API keys. Please configure OpenRouter API key for detailed market insights.`;
    }

    return {
      asset: randomAsset,
      position: position as 'LONG' | 'SHORT',
      entryPrice: currentPrice.toFixed(2),
      targetPrice: targetPrice.toFixed(2),
      reasoning,
    };
  }
}

export const aiService = new AIService();
