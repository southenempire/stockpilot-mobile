export interface StockAsset {
  symbol: string;
  name: string;
  weight: number; // in percentage (e.g. 35)
  price: number;
  change24h: number;
  mint: string;
  icon?: string;
}

export interface StockBasket {
  id: string;
  name: string;
  tagline: string;
  category: string;
  apy: string;
  risk: 'Low' | 'Medium' | 'High' | 'Degen';
  color: string;
  isSkrExclusive?: boolean;
  assets: StockAsset[];
  description: string;
}

export interface PortfolioPosition {
  basketId: string;
  basketName: string;
  investedUsdc: number;
  currentNav: number;
  pnlUsdc: number;
  pnlPercent: number;
  targetWeights: { [symbol: string]: number };
  currentWeights: { [symbol: string]: number };
  drift: number; // max drift percentage
}

export interface SkrTier {
  name: string;
  minSkr: number;
  feeDiscount: string; // e.g. "0% Protocol Fee"
  rebalanceFrequency: string; // e.g. "Real-Time (5m)"
  badgeColor: string;
}
