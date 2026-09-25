import { PublicKey } from '@solana/web3.js';
import { Buffer } from 'buffer';
import { StockBasket, PortfolioPosition, StockAsset } from '../types';

export const STOCKPILOT_PROGRAM_ID = new PublicKey('CsiP2ZWy1bM6Ghye85r67kiLC2zkBC7FngYCYGAhEPgK');

/**
 * Derives the deterministic PDA address for a user's vault
 */
export function deriveVaultPda(owner: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('stockpilot_vault'), owner.toBuffer()],
    STOCKPILOT_PROGRAM_ID
  );
}

/**
 * Calculates protocol fee split based on SKR balance
 * Standard: 15 bps (0.15%)
 * Gold (500 SKR): 7.5 bps (0.075%)
 * VIP (2500 SKR): 0 bps (0.00%)
 */
export function calculateProtocolFee(amountUsdc: number, skrBalance: number = 0): { netAmount: number; fee: number; bps: number } {
  let bps = 15;
  if (skrBalance >= 2500) {
    bps = 0;
  } else if (skrBalance >= 500) {
    bps = 7.5;
  }

  const fee = (amountUsdc * bps) / 10000;
  return {
    netAmount: amountUsdc - fee,
    fee,
    bps
  };
}

/**
 * Calculates portfolio drift across assets compared to target weights
 */
export function calculateDrift(targetWeights: { [symbol: string]: number }, currentWeights: { [symbol: string]: number }): number {
  let maxDrift = 0;
  for (const symbol of Object.keys(targetWeights)) {
    const target = targetWeights[symbol] || 0;
    const current = currentWeights[symbol] || 0;
    const diff = Math.abs(current - target);
    if (diff > maxDrift) {
      maxDrift = diff;
    }
  }
  return maxDrift;
}

/**
 * Simulates a market price change and calculates drifted weights
 */
export function simulateMarketMovement(position: PortfolioPosition): PortfolioPosition {
  const newWeights: { [symbol: string]: number } = {};
  let totalSimulated = 0;

  for (const [symbol, target] of Object.entries(position.targetWeights)) {
    // Introduce random realistic price drift (-4% to +6%)
    const driftFactor = 1 + (Math.random() * 0.10 - 0.04);
    const weightVal = target * driftFactor;
    newWeights[symbol] = weightVal;
    totalSimulated += weightVal;
  }

  // Normalize
  for (const symbol of Object.keys(newWeights)) {
    newWeights[symbol] = Math.round((newWeights[symbol] / totalSimulated) * 100);
  }

  const maxDrift = calculateDrift(position.targetWeights, newWeights);
  const pnlMultiplier = 1 + (Math.random() * 0.08 - 0.02);
  const newNav = +(position.investedUsdc * pnlMultiplier).toFixed(2);

  return {
    ...position,
    currentNav: newNav,
    pnlUsdc: +(newNav - position.investedUsdc).toFixed(2),
    pnlPercent: +(((newNav - position.investedUsdc) / position.investedUsdc) * 100).toFixed(2),
    currentWeights: newWeights,
    drift: maxDrift
  };
}
