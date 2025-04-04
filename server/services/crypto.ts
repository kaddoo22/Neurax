// CoinGecko API integration for cryptocurrency data
export class CryptoService {
  private apiKey: string;
  private baseUrl: string;

  constructor() {
    this.apiKey = process.env.COINGECKO_API_KEY || '';
    this.baseUrl = 'https://api.coingecko.com/api/v3';

    if (!this.apiKey) {
      console.warn('CoinGecko API key not configured, using public API with rate limits');
    }
  }

  // Get current price for a cryptocurrency
  async getPrice(coinId: string, currency: string = 'usd'): Promise<number> {
    const url = `${this.baseUrl}/simple/price?ids=${coinId}&vs_currencies=${currency}`;
    const response = await this.fetchWithKey(url);

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.statusText}`);
    }

    const data = await response.json();
    return data[coinId][currency];
  }

  // Get top cryptocurrencies by market cap
  async getTopCoins(limit: number = 10): Promise<Array<{
    id: string;
    symbol: string;
    name: string;
    current_price: number;
    market_cap: number;
    price_change_percentage_24h: number;
  }>> {
    const url = `${this.baseUrl}/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false`;
    const response = await this.fetchWithKey(url);

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.statusText}`);
    }

    return response.json();
  }

  // Get price history for a cryptocurrency
  async getPriceHistory(
    coinId: string, 
    days: number = 7, 
    currency: string = 'usd'
  ): Promise<{
    prices: [number, number][];
    market_caps: [number, number][];
    total_volumes: [number, number][];
  }> {
    const url = `${this.baseUrl}/coins/${coinId}/market_chart?vs_currency=${currency}&days=${days}`;
    const response = await this.fetchWithKey(url);

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.statusText}`);
    }

    return response.json();
  }

  // Get price for multiple cryptocurrencies
  async getMultiplePrices(
    coinIds: string[], 
    currency: string = 'usd'
  ): Promise<Record<string, number>> {
    const idsParam = coinIds.join(',');
    const url = `${this.baseUrl}/simple/price?ids=${idsParam}&vs_currencies=${currency}`;
    const response = await this.fetchWithKey(url);

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.statusText}`);
    }

    const data = await response.json();
    const result: Record<string, number> = {};
    
    for (const coin of coinIds) {
      if (data[coin]) {
        result[coin] = data[coin][currency];
      }
    }
    
    return result;
  }

  // Get coin details
  async getCoinDetails(coinId: string): Promise<any> {
    const url = `${this.baseUrl}/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false&sparkline=false`;
    const response = await this.fetchWithKey(url);

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.statusText}`);
    }

    return response.json();
  }

  // Helper method to add API key to requests
  private async fetchWithKey(url: string): Promise<Response> {
    const headers: HeadersInit = {};
    
    if (this.apiKey) {
      headers['x-cg-api-key'] = this.apiKey;
    }
    
    return fetch(url, { headers });
  }

  // Get symbol to ID mapping
  async getSymbolToIdMapping(): Promise<Record<string, string>> {
    const url = `${this.baseUrl}/coins/list`;
    const response = await this.fetchWithKey(url);

    if (!response.ok) {
      throw new Error(`CoinGecko API error: ${response.statusText}`);
    }

    const coinsList = await response.json();
    const mapping: Record<string, string> = {};
    
    for (const coin of coinsList) {
      mapping[coin.symbol.toUpperCase()] = coin.id;
    }
    
    return mapping;
  }
}

export const cryptoService = new CryptoService();
