import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return 'N/A';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

export function timeAgo(date: Date | string | null | undefined): string {
  if (!date) return 'N/A';
  
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const seconds = Math.floor((now.getTime() - d.getTime()) / 1000);
  
  if (seconds < 60) return `${seconds}s ago`;
  
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  
  return formatDate(d);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
}

export function getRandomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export function generateUuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export function numberWithCommas(x: number): string {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

export function calculatePercentChange(current: number, previous: number): string {
  if (previous === 0) return '0%';
  const percent = ((current - previous) / previous) * 100;
  return `${percent > 0 ? '+' : ''}${percent.toFixed(2)}%`;
}

export function parseTwitterText(text: string): { text: string, hashtags: string[] } {
  const hashtags = (text.match(/#[a-zA-Z0-9]+/g) || []).map(tag => tag.substring(1));
  return { text, hashtags };
}

export function formatCurrency(value: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

export function getAssetIcon(asset: string): string {
  const assetMapping: Record<string, string> = {
    'BTC': 'bitcoin',
    'ETH': 'ethereum',
    'SOL': 'chart-line',
    'ADA': 'dollar-sign',
    'DOT': 'dot-circle',
    'MATIC': 'network-wired',
    'XRP': 'coins',
    'LINK': 'link',
    'UNI': 'unicorn',
    'AVAX': 'snowflake'
  };
  
  return assetMapping[asset] || 'chart-simple';
}

export function getStatusStyles(status: 'ACTIVE' | 'CLOSED'): { bgColor: string, textColor: string } {
  if (status === 'ACTIVE') {
    return { bgColor: 'bg-cyberBlue/20', textColor: 'text-cyberBlue' };
  }
  return { bgColor: 'bg-neonGreen/20', textColor: 'text-neonGreen' };
}

export function getPositionStyles(position: 'LONG' | 'SHORT'): { bgColor: string, textColor: string } {
  if (position === 'LONG') {
    return { bgColor: 'bg-neonGreen/20', textColor: 'text-neonGreen' };
  }
  return { bgColor: 'bg-electricPurple/20', textColor: 'text-electricPurple' };
}

export function getProfitLossStyles(profitLoss?: string): { textColor: string } {
  if (!profitLoss) return { textColor: 'text-matrixGreen' };
  
  const value = parseFloat(profitLoss);
  if (value > 0) {
    return { textColor: 'text-neonGreen' };
  }
  return { textColor: 'text-red-400' };
}
