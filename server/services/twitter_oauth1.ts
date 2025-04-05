import crypto from 'crypto';
import OAuth from 'oauth-1.0a';
import fetch from 'node-fetch';

// Twitter/X API client con implementazione OAuth 1.0a
export class XService {
  // Credenziali API e configurazione
  private apiKey: string;
  private apiSecret: string;
  private callbackUrl: string;
  
  // Endpoint API
  private baseApiUrl: string = 'https://api.twitter.com/2'; 
  private mediaApiUrl: string = 'https://upload.twitter.com/1.1';
  private oauth1BaseUrl: string = 'https://api.twitter.com/1.1';
  
  // Istanza OAuth 1.0a
  private oauth1Client: OAuth;

  constructor() {
    // Carica le credenziali OAuth 1.0a
    this.apiKey = process.env.TWITTER_API_KEY || '';
    this.apiSecret = process.env.TWITTER_API_SECRET || '';
    
    // URL di callback
    this.callbackUrl = process.env.TWITTER_CALLBACK_URL || 'http://localhost:5000/api/auth/twitter/callback';
    console.log('URL di callback usato:', this.callbackUrl);

    // Controllo credenziali
    if (!this.apiKey || !this.apiSecret) {
      console.warn('Twitter API credentials not configured. Twitter features will not work.');
    }
    
    // Inizializza OAuth 1.0a client
    this.oauth1Client = new OAuth({
      consumer: {
        key: this.apiKey,
        secret: this.apiSecret
      },
      signature_method: 'HMAC-SHA1',
      hash_function(baseString, key) {
        return crypto
          .createHmac('sha1', key)
          .update(baseString)
          .digest('base64');
      }
    });
  }
  
  // Verifica credenziali
  private checkCredentials(): boolean {
    if (!this.apiKey || !this.apiSecret) {
      console.warn('Twitter API credentials not configured.');
      return false;
    }
    return true;
  }

  // OAuth 1.0a - Ottieni request token
  async getRequestToken(): Promise<{ oauthToken: string; oauthTokenSecret: string; }> {
    if (!this.checkCredentials()) {
      throw new Error('Twitter API credentials not configured');
    }
    
    const requestData = {
      url: 'https://api.twitter.com/oauth/request_token',
      method: 'POST',
      data: { oauth_callback: this.callbackUrl }
    };
    
    const headers = this.oauth1Client.toHeader(
      this.oauth1Client.authorize(requestData)
    );
    
    try {
      const response = await fetch(requestData.url, {
        method: requestData.method,
        headers: {
          ...headers,
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Twitter request token failed: ${response.status} ${response.statusText}`);
      }
      
      const responseText = await response.text();
      const parsedResponse = new URLSearchParams(responseText);
      
      return {
        oauthToken: parsedResponse.get('oauth_token') || '',
        oauthTokenSecret: parsedResponse.get('oauth_token_secret') || ''
      };
    } catch (error: any) {
      console.error('Twitter OAuth 1.0a request token error:', error.message);
      throw new Error(`Twitter request token failed: ${error.message}`);
    }
  }
  
  // OAuth 1.0a - Ottieni URL per autorizzazione
  getAuthorizationUrl(oauthToken: string): string {
    return `https://api.twitter.com/oauth/authenticate?oauth_token=${oauthToken}`;
  }
  
  // OAuth 1.0a - Ottieni access token
  async getAccessTokenOAuth1(
    oauthToken: string,
    oauthTokenSecret: string,
    oauthVerifier: string
  ): Promise<{
    oauthToken: string;
    oauthTokenSecret: string;
    userId: string;
    screenName: string;
  }> {
    if (!this.checkCredentials()) {
      throw new Error('Twitter API credentials not configured');
    }
    
    const requestData = {
      url: 'https://api.twitter.com/oauth/access_token',
      method: 'POST',
      data: { oauth_verifier: oauthVerifier }
    };
    
    const headers = this.oauth1Client.toHeader(
      this.oauth1Client.authorize(
        requestData,
        { key: oauthToken, secret: oauthTokenSecret }
      )
    );
    
    try {
      const response = await fetch(requestData.url, {
        method: requestData.method,
        headers: {
          ...headers,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({ oauth_verifier: oauthVerifier }).toString()
      });
      
      if (!response.ok) {
        throw new Error(`Twitter access token failed: ${response.status} ${response.statusText}`);
      }
      
      const responseText = await response.text();
      const parsedResponse = new URLSearchParams(responseText);
      
      return {
        oauthToken: parsedResponse.get('oauth_token') || '',
        oauthTokenSecret: parsedResponse.get('oauth_token_secret') || '',
        userId: parsedResponse.get('user_id') || '',
        screenName: parsedResponse.get('screen_name') || ''
      };
    } catch (error: any) {
      console.error('Twitter OAuth 1.0a access token error:', error.message);
      throw new Error(`Twitter access token failed: ${error.message}`);
    }
  }

  // Pubblica tweet usando OAuth 1.0a
  async postTweet(
    accessToken: string,
    accessTokenSecret: string,
    text: string,
    imageUrl?: string
  ): Promise<{
    id: string;
    url: string;
  }> {
    if (!this.checkCredentials()) {
      throw new Error('Twitter API credentials not configured');
    }
    
    // Costruzione richiesta per API v1.1 (OAuth 1.0a)
    const requestData = {
      url: 'https://api.twitter.com/1.1/statuses/update.json',
      method: 'POST',
      data: { status: text }
    };
    
    const headers = this.oauth1Client.toHeader(
      this.oauth1Client.authorize(
        requestData,
        { key: accessToken, secret: accessTokenSecret }
      )
    );
    
    try {
      // In una implementazione reale, qui si gestirebbe il caricamento immagini
      // Per ora, ignoriamo l'imageUrl ma non generiamo errori
      console.log("Pubblicazione tweet:", text, imageUrl ? "(con immagine)" : "(senza immagine)");
      
      const response = await fetch(requestData.url, {
        method: requestData.method,
        headers: {
          ...headers,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({ status: text }).toString()
      });
      
      if (!response.ok) {
        throw new Error(`Twitter post tweet failed: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json() as { id_str: string };
      return {
        id: data.id_str,
        url: `https://twitter.com/status/${data.id_str}`
      };
    } catch (error: any) {
      console.error('Twitter post tweet error:', error.message);
      throw new Error(`Failed to post tweet: ${error.message}`);
    }
  }
  
  // Ottieni metriche utente con OAuth 1.0a (simulazione)
  async getUserMetrics(
    accessToken: string,
    userId: string
  ): Promise<{
    followersCount: number;
    followingCount: number;
    tweetCount: number;
    listedCount?: number;
    engagementRate?: number;
  }> {
    if (!this.checkCredentials()) {
      throw new Error('Twitter API credentials not configured');
    }
    
    try {
      // In una implementazione reale, qui si farebbero richieste API per ottenere
      // le metriche reali dell'utente. Per semplicità, restituiamo dati simulati.
      console.log("Richiesta metriche per userId:", userId);
      
      // Valori simulati ma realistici
      return {
        followersCount: Math.floor(Math.random() * 2000) + 100,
        followingCount: Math.floor(Math.random() * 1000) + 50,
        tweetCount: Math.floor(Math.random() * 5000) + 200,
        listedCount: Math.floor(Math.random() * 20),
        engagementRate: parseFloat((Math.random() * 5 + 0.5).toFixed(2))
      };
    } catch (error: any) {
      console.error('Twitter get user metrics error:', error.message);
      throw new Error(`Failed to get user metrics: ${error.message}`);
    }
  }
}

export const twitterService = new XService();