import { StockBasket, SkrTier } from '../types';

export const STOCK_BASKETS: StockBasket[] = [
  {
    id: 'semi-supremacy',
    name: 'Semiconductor Supremacy',
    tagline: 'AI compute chips, GPUs, and silicon foundries',
    category: 'Hardware & AI',
    apy: '32.4%',
    risk: 'High',
    color: '#00F0FF',
    description: 'Concentrated exposure in top global semiconductor leaders powering next-gen AI datacenters and quantum computing.',
    assets: [
      { symbol: 'NVDA', name: 'NVIDIA Corp', weight: 40, price: 128.50, change24h: 3.42, mint: 'NVDA_DEVNET_MINT' },
      { symbol: 'TSM', name: 'Taiwan Semi', weight: 25, price: 174.20, change24h: 1.85, mint: 'TSM_DEVNET_MINT' },
      { symbol: 'AVGO', name: 'Broadcom Inc', weight: 20, price: 165.10, change24h: 2.10, mint: 'AVGO_DEVNET_MINT' },
      { symbol: 'AMD', name: 'Advanced Micro', weight: 15, price: 156.80, change24h: -0.45, mint: 'AMD_DEVNET_MINT' },
    ]
  },
  {
    id: 'big-tech-titans',
    name: 'Magnificent Titans',
    tagline: 'Mega-cap software, cloud, and consumer tech',
    category: 'Core Equities',
    apy: '19.8%',
    risk: 'Medium',
    color: '#3B82F6',
    description: 'The backbone of global tech innovation with deep balance sheets and dominant enterprise cloud moats.',
    assets: [
      { symbol: 'AAPL', name: 'Apple Inc', weight: 30, price: 232.10, change24h: 0.95, mint: 'AAPL_DEVNET_MINT' },
      { symbol: 'MSFT', name: 'Microsoft Corp', weight: 30, price: 448.30, change24h: 1.15, mint: 'MSFT_DEVNET_MINT' },
      { symbol: 'GOOGL', name: 'Alphabet Inc', weight: 20, price: 182.40, change24h: -0.25, mint: 'GOOGL_DEVNET_MINT' },
      { symbol: 'AMZN', name: 'Amazon.com Inc', weight: 20, price: 194.50, change24h: 2.40, mint: 'AMZN_DEVNET_MINT' },
    ]
  },
  {
    id: 'seeker-genesis-vip',
    name: 'Seeker Quant Alpha ($SKR)',
    tagline: 'High-frequency AI rebalance strategy for Seeker holders',
    category: 'Seeker Exclusive',
    apy: '44.2%',
    risk: 'Degen',
    color: '#A855F7',
    isSkrExclusive: true,
    description: 'Exclusive algorithmic basket that combines momentum tech with $SKR token staking for 0% protocol fee swaps and dynamic volatility hedging.',
    assets: [
      { symbol: 'NVDA', name: 'NVIDIA Corp', weight: 35, price: 128.50, change24h: 3.42, mint: 'NVDA_DEVNET_MINT' },
      { symbol: 'TSLA', name: 'Tesla Inc', weight: 25, price: 258.90, change24h: 4.80, mint: 'TSLA_DEVNET_MINT' },
      { symbol: 'COIN', name: 'Coinbase Global', weight: 20, price: 218.40, change24h: 6.20, mint: 'COIN_DEVNET_MINT' },
      { symbol: 'SKR', name: 'Seeker Token', weight: 20, price: 1.45, change24h: 8.50, mint: 'SKR_DEVNET_MINT' },
    ]
  },
  {
    id: 'clean-energy-future',
    name: 'Clean Grid & Nuclear',
    tagline: 'Next-gen energy powering AI datacenters',
    category: 'Infrastructure',
    apy: '24.1%',
    risk: 'Medium',
    color: '#10B981',
    description: 'Clean energy, nuclear micro-reactors, and grid modernization essential to sustain expanding AI computing demands.',
    assets: [
      { symbol: 'CEG', name: 'Constellation Energy', weight: 35, price: 265.40, change24h: 3.10, mint: 'CEG_DEVNET_MINT' },
      { symbol: 'VST', name: 'Vistra Corp', weight: 30, price: 118.90, change24h: 2.45, mint: 'VST_DEVNET_MINT' },
      { symbol: 'NEE', name: 'NextEra Energy', weight: 20, price: 84.30, change24h: -0.15, mint: 'NEE_DEVNET_MINT' },
      { symbol: 'CCJ', name: 'Cameco Corp', weight: 15, price: 54.20, change24h: 1.80, mint: 'CCJ_DEVNET_MINT' },
    ]
  }
];

export const SKR_TIERS: SkrTier[] = [
  {
    name: 'Seeker Standard',
    minSkr: 0,
    feeDiscount: 'Standard 15 bps',
    rebalanceFrequency: 'Hourly (60m)',
    badgeColor: '#64748B'
  },
  {
    name: 'Radiant Gold',
    minSkr: 500,
    feeDiscount: '50% Off (7.5 bps)',
    rebalanceFrequency: '15 Minutes',
    badgeColor: '#F59E0B'
  },
  {
    name: 'Genesis VIP',
    minSkr: 2500,
    feeDiscount: '0% Protocol Fees',
    rebalanceFrequency: 'Instant / Sub-second',
    badgeColor: '#A855F7'
  }
];
