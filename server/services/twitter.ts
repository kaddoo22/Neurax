import crypto from 'crypto';
import { z } from 'zod';

// Twitter API v2 client for handling communication with Twitter/X API
export class TwitterService {
  private apiKey: string;
  private apiSecret: string;
  private bearerToken: string;
  private accessToken: string | null;
  private accessTokenSecret: string | null;
  private callbackUrl: string;

  constructor() {
    this.apiKey = process.env.TWITTER_API_KEY || '';
    this.apiSecret = process.env.TWITTER_API_SECRET || '';
    this.bearerToken = process.env.TWITTER_BEARER_TOKEN || '';
    this.accessToken = process.env.TWITTER_ACCESS_TOKEN || '';
    this.accessTokenSecret = process.env.TWITTER_ACCESS_TOKEN_SECRET || '';
    this.callbackUrl = process.env.TWITTER_CALLBACK_URL || 'http://localhost:3000/api/auth/twitter/callback';

    // Log a warning instead of throwing an error - this allows the app to start
    // even without Twitter credentials, but Twitter features will be disabled
    if (!this.apiKey || !this.apiSecret || !this.bearerToken) {
      console.warn('Twitter API credentials not configured. Twitter features will be disabled.');
    }
  }
  
  // Check if Twitter API is properly configured
  private checkCredentials(): boolean {
    if (!this.apiKey || !this.apiSecret || !this.bearerToken) {
      console.warn('Twitter API credentials not configured. Cannot perform Twitter operations.');
      return false;
    }
    return true;
  }

  // Generate OAuth authorization URL for Twitter authentication
  generateAuthUrl(state: string): string {
    if (!this.checkCredentials()) {
      throw new Error('Twitter API credentials not configured');
    }
    
    // Twitter OAuth2 flow
    const authUrl = new URL('https://twitter.com/i/oauth2/authorize');
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('client_id', this.apiKey);
    authUrl.searchParams.append('redirect_uri', this.callbackUrl);
    authUrl.searchParams.append('scope', 'tweet.read tweet.write users.read offline.access');
    authUrl.searchParams.append('state', state);
    authUrl.searchParams.append('code_challenge', 'challenge');
    authUrl.searchParams.append('code_challenge_method', 'plain');
    
    return authUrl.toString();
  }

  // Exchange OAuth code for access token
  async getAccessToken(code: string | null | undefined): Promise<{
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  }> {
    if (!this.checkCredentials()) {
      throw new Error('Twitter API credentials not configured');
    }
    
    if (!code) {
      throw new Error('Authorization code is required');
    }
    
    const tokenUrl = 'https://api.twitter.com/2/oauth2/token';
    
    const params = new URLSearchParams();
    params.append('code', code);
    params.append('grant_type', 'authorization_code');
    params.append('client_id', this.apiKey);
    params.append('redirect_uri', this.callbackUrl);
    params.append('code_verifier', 'challenge');

    const response = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Twitter OAuth error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    };
  }

  // Get current user profile
  async getUserProfile(accessToken: string): Promise<{
    id: string;
    username: string;
    name: string;
  }> {
    const response = await fetch('https://api.twitter.com/2/users/me?user.fields=profile_image_url', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Twitter API error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return {
      id: data.data.id,
      username: data.data.username,
      name: data.data.name,
    };
  }

  // Post a tweet
  async postTweet(accessToken: string, text: string, imageUrl?: string): Promise<{
    id: string;
  }> {
    const payload: any = { text };
    
    // If we have an image URL, we need to upload it first
    if (imageUrl) {
      const mediaId = await this.uploadMedia(accessToken, imageUrl);
      payload.media = { media_ids: [mediaId] };
    }
    
    const response = await fetch('https://api.twitter.com/2/tweets', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Twitter API error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return {
      id: data.data.id,
    };
  }

  // Upload media for a tweet
  private async uploadMedia(accessToken: string, imageUrl: string): Promise<string> {
    // This is a simplified version - in a real implementation,
    // you'd need to download the image and upload it to Twitter's media endpoint
    // For now, we'll mock this
    return 'mock_media_id';
  }

  // Get tweet metrics
  async getTweetMetrics(accessToken: string, tweetId: string): Promise<{
    retweetCount: number;
    replyCount: number;
    likeCount: number;
    quoteCount: number;
    impressionCount: number;
  }> {
    const response = await fetch(
      `https://api.twitter.com/2/tweets/${tweetId}?tweet.fields=public_metrics,non_public_metrics`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Twitter API error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const metrics = data.data.public_metrics;
    
    return {
      retweetCount: metrics.retweet_count,
      replyCount: metrics.reply_count,
      likeCount: metrics.like_count,
      quoteCount: metrics.quote_count,
      impressionCount: metrics.impression_count || 0,
    };
  }

  // Get user metrics
  async getUserMetrics(accessToken: string, userId: string): Promise<{
    followersCount: number;
    followingCount: number;
    tweetCount: number;
  }> {
    const response = await fetch(
      `https://api.twitter.com/2/users/${userId}?user.fields=public_metrics`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Twitter API error: ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    const metrics = data.data.public_metrics;
    
    return {
      followersCount: metrics.followers_count,
      followingCount: metrics.following_count,
      tweetCount: metrics.tweet_count,
    };
  }
}

export const twitterService = new TwitterService();
