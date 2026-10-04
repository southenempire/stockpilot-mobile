import { PublicKey, AccountInfo } from '@solana/web3.js';
import { Buffer } from 'buffer';
import { StockBasket, PortfolioPosition, StockAsset } from '../types';

// Re-export from mwa for backward compatibility
export { STOCKPILOT_PROGRAM_ID, deriveVaultPda } from './mwa';

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
 * Parses on-chain vault account data into a PortfolioPosition.
 * The Anchor account layout for StockpilotVault is:
 *   8 bytes  - discriminator
 *   32 bytes - owner pubkey
 *   8 bytes  - deposited_lamports (u64)
 *   8 bytes  - last_rebalance_ts (i64)
 *   1 byte   - is_initialized (bool)
 *   1 byte   - bump (u8)
 */
export function parseVaultAccount(
  data: Buffer,
  basketName: string = 'StockPilot Vault',
): { depositedSol: number; lastRebalanceTs: number; isInitialized: boolean } | null {
  if (!data || data.length < 58) return null;

  try {
    // Skip 8-byte discriminator + 32-byte owner
    const depositedLamports = data.readBigUInt64LE(40);
    const lastRebalanceTs = Number(data.readBigInt64LE(48));
    const isInitialized = data[56] === 1;

    return {
      depositedSol: Number(depositedLamports) / 1e9,
      lastRebalanceTs,
      isInitialized,
    };
  } catch {
    return null;
  }
}

/**
 * Simulates a market price change and calculates drifted weights.
 * This is kept for the "Shock" button demo feature — it does NOT
 * replace real on-chain state; it only produces a visual preview
 * of what drift looks like.
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
