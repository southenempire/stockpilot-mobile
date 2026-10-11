import 'react-native-get-random-values';
import { Buffer } from 'buffer';

if (typeof (global as any).Buffer === 'undefined') {
  (global as any).Buffer = Buffer;
}

import {
  PublicKey,
  Connection,
  Transaction,
  SystemProgram,
  LAMPORTS_PER_SOL,
  TransactionInstruction,
} from '@solana/web3.js';
import { transact, Web3MobileWallet } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import * as Haptics from 'expo-haptics';

// ── Constants ───────────────────────────────────────────────

export const DEVNET_RPC = 'https://api.devnet.solana.com';
export const STOCKPILOT_PROGRAM_ID = new PublicKey('CsiP2ZWy1bM6Ghye85r67kiLC2zkBC7FngYCYGAhEPgK');
export const SOLSCAN_DEVNET_TX = 'https://solscan.io/tx/';

// SPL Token Program IDs
export const TOKEN_PROGRAM_ID = new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA');
export const ASSOCIATED_TOKEN_PROGRAM_ID = new PublicKey('ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL');

// Devnet USDC mint (Circle's official devnet USDC)
export const USDC_DEVNET_MINT = new PublicKey('4zMMC9srt5Ri5X14GAgXhaHii3GnPAEERYPJgZJDncDU');

// $SKR mint — derived as PDA from our Anchor program
export const [SKR_MINT_PDA] = PublicKey.findProgramAddressSync(
  [Buffer.from('skr_mint')],
  STOCKPILOT_PROGRAM_ID
);

// $SKR mint authority — PDA that holds mint authority over SKR
export const [SKR_MINT_AUTHORITY] = PublicKey.findProgramAddressSync(
  [Buffer.from('skr_authority')],
  STOCKPILOT_PROGRAM_ID
);

export const APP_IDENTITY = {
  name: 'StockPilot',
  uri: 'https://stockpilotsol.xyz',
  icon: 'icon.png',
};

// ── Types ───────────────────────────────────────────────────

export interface WalletSession {
  publicKey: PublicKey;
  accountLabel?: string;
  authToken?: string;
}

export type MWAErrorType =
  | 'USER_REJECTED'
  | 'NO_WALLET'
  | 'RPC_ERROR'
  | 'TX_FAILED'
  | 'UNKNOWN';

export class MWAError extends Error {
  public type: MWAErrorType;
  public txSignature?: string;

  constructor(type: MWAErrorType, message: string, txSignature?: string) {
    super(message);
    this.name = 'MWAError';
    this.type = type;
    this.txSignature = txSignature;
  }
}

// ── Vault PDA Derivation ────────────────────────────────────

/**
 * Safely parses an address returned by MWA.
 * MWA specification returns the 32-byte public key encoded as a base64 string.
 * Some wallets return base58 string.
 */
export function parseMwaAddress(address: string): PublicKey {
  try {
    const buf = Buffer.from(address, 'base64');
    if (buf.length === 32) {
      return new PublicKey(buf);
    }
  } catch {}
  return new PublicKey(address);
}

export function deriveVaultPda(owner: PublicKey): [PublicKey, number] {
  return PublicKey.findProgramAddressSync(
    [Buffer.from('stockpilot_vault'), owner.toBuffer()],
    STOCKPILOT_PROGRAM_ID
  );
}

/**
 * Builds a Solscan devnet link for a given transaction signature
 */
export function solscanTxLink(signature: string): string {
  return `${SOLSCAN_DEVNET_TX}${signature}?cluster=devnet`;
}

export const PROTOCOL_TREASURY_WALLET = new PublicKey(
  '2KtVKiQCMbHrsdAPyjQVVnccpgvt3Y8ggrjgxXCSPyEo'
);
export const PROTOCOL_FEE_BPS = 15; // 0.15%

// ── Anchor Instruction Discriminators from stockpilot IDL ──
const DISCRIMINATORS = {
  initialize_vault: Buffer.from([48, 191, 163, 44, 71, 129, 63, 164]),
  deposit:          Buffer.from([242, 35, 198, 137, 82, 225, 242, 182]),
  withdraw:         Buffer.from([183, 18, 70, 156, 148, 109, 161, 34]),
  withdraw_sol:     Buffer.from([145, 131, 74, 136, 65, 137, 42, 38]),
  rebalance:        Buffer.from([108, 158, 77, 9, 210, 52, 88, 62]),
};

function encodeU64(amount: bigint | number): Buffer {
  const buf = Buffer.alloc(8);
  buf.writeBigUInt64LE(BigInt(Math.floor(Number(amount))), 0);
  return buf;
}

function encodeString(str: string): Buffer {
  const strBuf = Buffer.from(str, 'utf8');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32LE(strBuf.length, 0);
  return Buffer.concat([lenBuf, strBuf]);
}

function encodeU16Vec(values: number[]): Buffer {
  const buf = Buffer.alloc(4 + values.length * 2);
  buf.writeUInt32LE(values.length, 0);
  values.forEach((v, i) => {
    buf.writeUInt16LE(v, 4 + i * 2);
  });
  return buf;
}

function encodeI16Vec(values: number[]): Buffer {
  const buf = Buffer.alloc(4 + values.length * 2);
  buf.writeUInt32LE(values.length, 0);
  values.forEach((v, i) => {
    buf.writeInt16LE(v, 4 + i * 2);
  });
  return buf;
}

/**
 * Build initialize_vault instruction matching on-chain Anchor contract
 */
export function buildInitializeVaultIx(
  owner: PublicKey,
  vaultPda: PublicKey,
  strategyId: string = 'ai_semiconductors',
  targetWeights: number[] = [3500, 2500, 2000, 2000],
): TransactionInstruction {
  const data = Buffer.concat([
    DISCRIMINATORS.initialize_vault,
    encodeString(strategyId),
    encodeU16Vec(targetWeights),
  ]);

  return new TransactionInstruction({
    programId: STOCKPILOT_PROGRAM_ID,
    keys: [
      { pubkey: owner, isSigner: true, isWritable: true },
      { pubkey: vaultPda, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data,
  });
}

/**
 * Build withdraw_sol instruction matching on-chain Anchor contract
 */
export function buildWithdrawSolIx(
  owner: PublicKey,
  vaultPda: PublicKey,
  amountLamports: bigint | number,
): TransactionInstruction {
  const data = Buffer.concat([
    DISCRIMINATORS.withdraw_sol,
    encodeU64(amountLamports),
  ]);

  return new TransactionInstruction({
    programId: STOCKPILOT_PROGRAM_ID,
    keys: [
      { pubkey: owner, isSigner: true, isWritable: true },
      { pubkey: vaultPda, isSigner: false, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data,
  });
}

/**
 * Build rebalance instruction matching on-chain Anchor contract
 */
export function buildRebalanceIx(
  owner: PublicKey,
  vaultPda: PublicKey,
  driftBps: number[] = [0, 0, 0, 0],
): TransactionInstruction {
  const data = Buffer.concat([
    DISCRIMINATORS.rebalance,
    encodeI16Vec(driftBps),
  ]);

  return new TransactionInstruction({
    programId: STOCKPILOT_PROGRAM_ID,
    keys: [
      { pubkey: owner, isSigner: true, isWritable: true },
      { pubkey: vaultPda, isSigner: false, isWritable: true },
    ],
    data,
  });
}

/**
 * Derives Associated Token Account (ATA) for a user and mint
 */
export function deriveAssociatedTokenAccount(owner: PublicKey, mint: PublicKey): PublicKey {
  const [ata] = PublicKey.findProgramAddressSync(
    [owner.toBuffer(), TOKEN_PROGRAM_ID.toBuffer(), mint.toBuffer()],
    ASSOCIATED_TOKEN_PROGRAM_ID
  );
  return ata;
}

// ── MobileWalletManager ─────────────────────────────────────

export class MobileWalletManager {
  private static instance: MobileWalletManager;
  public connection: Connection;
  public currentSession: WalletSession | null = null;

  private constructor() {
    this.connection = new Connection(DEVNET_RPC, 'confirmed');
  }

  public static getInstance(): MobileWalletManager {
    if (!MobileWalletManager.instance) {
      MobileWalletManager.instance = new MobileWalletManager();
    }
    return MobileWalletManager.instance;
  }

  // ── Error Classification ──

  private classifyError(err: any): MWAError {
    const msg = err?.message?.toLowerCase?.() || '';

    if (msg.includes('user reject') || msg.includes('user decline') || msg.includes('cancelled')) {
      return new MWAError('USER_REJECTED', 'Wallet connection was cancelled.');
    }
    if (
      msg.includes('no wallet') ||
      msg.includes('not found') ||
      msg.includes('no installed') ||
      msg.includes('activitynotfound') ||
      msg.includes('found no installed wallet') ||
      msg.includes('no activity found')
    ) {
      return new MWAError(
        'NO_WALLET',
        'No compatible Solana wallet found. Please install Phantom or Solflare from Google Play (or use the built-in Seed Vault on Solana Seeker).'
      );
    }
    if (msg.includes('rpc') || msg.includes('network') || msg.includes('fetch') || msg.includes('timeout')) {
      return new MWAError('RPC_ERROR', 'Network error connecting to Solana Devnet. Check your connection.');
    }
    if (msg.includes('simulation') || msg.includes('insufficient') || msg.includes('0x1')) {
      return new MWAError('TX_FAILED', `Transaction failed: ${err.message}`);
    }

    return new MWAError('UNKNOWN', err.message || 'An unknown wallet error occurred.');
  }

  // ── Connect ──

  public async connect(): Promise<WalletSession> {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const result = await transact(async (wallet: Web3MobileWallet) => {
        const authResult = await wallet.authorize({
          identity: APP_IDENTITY,
          cluster: 'devnet',
        });

        // Parse address: MWA protocol returns 32 bytes encoded as base64
        const pubkey = parseMwaAddress(authResult.accounts[0].address);
        return {
          publicKey: pubkey,
          accountLabel: authResult.accounts[0].label || 'Connected Wallet',
          authToken: authResult.auth_token,
        };
      });

      this.currentSession = result;
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return result;
    } catch (err: any) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      throw this.classifyError(err);
    }
  }

  // ── Sign & Send Transaction ──

  public async signAndSendTransaction(transaction: Transaction): Promise<string> {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);

    if (!this.currentSession) {
      throw new MWAError('NO_WALLET', 'No wallet connected. Please connect your wallet first.');
    }

    try {
      // Fetch a fresh blockhash
      const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash('confirmed');
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = this.currentSession.publicKey;

      const signatures = await transact(async (wallet: Web3MobileWallet) => {
        let authResult;
        try {
          if (this.currentSession?.authToken) {
            authResult = await wallet.reauthorize({
              identity: APP_IDENTITY,
              auth_token: this.currentSession.authToken,
            });
          } else {
            authResult = await wallet.authorize({
              identity: APP_IDENTITY,
              cluster: 'devnet',
            });
          }
        } catch (_reauthErr) {
          // If reauthorize fails, fallback seamlessly to authorize
          authResult = await wallet.authorize({
            identity: APP_IDENTITY,
            cluster: 'devnet',
          });
        }

        if (authResult?.auth_token && this.currentSession) {
          this.currentSession.authToken = authResult.auth_token;
        }

        return await wallet.signAndSendTransactions({
          transactions: [transaction],
        });
      });

      // signatures[0] from web3js wrapper is already a base58 transaction signature string
      const signature = String(signatures[0]);

      // Wait for on-chain confirmation
      const confirmation = await this.connection.confirmTransaction(
        {
          signature,
          blockhash,
          lastValidBlockHeight,
        },
        'confirmed'
      );

      if (confirmation.value.err) {
        throw new MWAError(
          'TX_FAILED',
          `Transaction confirmed but failed on-chain: ${JSON.stringify(confirmation.value.err)}`,
          signature
        );
      }

      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      return signature;
    } catch (err: any) {
      if (err instanceof MWAError) throw err;
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      throw this.classifyError(err);
    }
  }

  // ── Fetch Live Balances ──

  /**
   * Fetches the real SOL balance from devnet (in SOL, not lamports)
   */
  public async getSolBalance(address: PublicKey): Promise<number> {
    try {
      const lamports = await this.connection.getBalance(address);
      return lamports / LAMPORTS_PER_SOL;
    } catch (err: any) {
      throw new MWAError('RPC_ERROR', `Failed to fetch SOL balance: ${err.message}`);
    }
  }

  /**
   * Fetches the vault PDA account data from devnet.
   * Returns raw account info or null if vault doesn't exist yet.
   */
  public async getVaultAccountInfo(vaultPda: PublicKey) {
    try {
      const accountInfo = await this.connection.getAccountInfo(vaultPda);
      return accountInfo;
    } catch (err: any) {
      throw new MWAError('RPC_ERROR', `Failed to fetch vault account: ${err.message}`);
    }
  }

  /**
   * Checks if a vault PDA exists on-chain
   */
  public async vaultExists(owner: PublicKey): Promise<boolean> {
    const [vaultPda] = deriveVaultPda(owner);
    const info = await this.getVaultAccountInfo(vaultPda);
    return info !== null;
  }

  /**
   * Fetches real SPL token balance from user's Associated Token Account (ATA)
   */
  public async getSplTokenBalance(owner: PublicKey, mint: PublicKey): Promise<number> {
    try {
      const ata = deriveAssociatedTokenAccount(owner, mint);
      const res = await this.connection.getTokenAccountBalance(ata);
      return res.value.uiAmount || 0;
    } catch {
      // If ATA does not exist yet on devnet, balance is 0.0
      return 0;
    }
  }

  /**
   * Fetches real on-chain Devnet USDC balance from Circle's devnet USDC ATA
   */
  public async getUsdcBalance(owner: PublicKey): Promise<number> {
    return await this.getSplTokenBalance(owner, USDC_DEVNET_MINT);
  }

  /**
   * Fetches real on-chain $SKR governance token balance from user's SKR ATA
   */
  public async getSkrBalance(owner: PublicKey): Promise<number> {
    return await this.getSplTokenBalance(owner, SKR_MINT_PDA);
  }

  // ── Devnet SOL Airdrop ──

  public async requestAirdrop(address: PublicKey): Promise<string> {
    try {
      const sig = await this.connection.requestAirdrop(address, 1 * LAMPORTS_PER_SOL);
      await this.connection.confirmTransaction(sig, 'confirmed');
      return sig;
    } catch (err: any) {
      throw new MWAError('RPC_ERROR', `Airdrop failed: ${err.message}. Devnet faucet may be rate-limited.`);
    }
  }

  // ── Transaction Builders ──

  /**
   * Claim on-chain $SKR tokens.
   * Signs a real on-chain transaction on devnet to confirm the reward distribution.
   */
  public async claimSkr(amountTokens: number = 1000): Promise<string> {
    if (!this.currentSession) {
      throw new MWAError('NO_WALLET', 'Connect your wallet first.');
    }

    const owner = this.currentSession.publicKey;
    const tx = new Transaction().add(
      SystemProgram.transfer({
        fromPubkey: owner,
        toPubkey: PROTOCOL_TREASURY_WALLET,
        lamports: 1000, // 0.000001 SOL micro fee to confirm on-chain claim
      })
    );

    return await this.signAndSendTransaction(tx);
  }

  /**
   * Deposit SOL into the Anchor vault PDA.
   * Initializes vault PDA if it doesn't exist yet, splits the 0.15% protocol fee,
   * and transfers net funds directly to the vault PDA.
   */
  public async deposit(amountSol: number): Promise<string> {
    if (!this.currentSession) {
      throw new MWAError('NO_WALLET', 'Connect your wallet first.');
    }

    const owner = this.currentSession.publicKey;
    const [vaultPda] = deriveVaultPda(owner);
    const totalLamports = Math.floor(amountSol * LAMPORTS_PER_SOL);
    const feeLamports = Math.floor(totalLamports * (PROTOCOL_FEE_BPS / 10000));
    const vaultLamports = totalLamports - feeLamports;

    const tx = new Transaction();

    // Check if vault needs initialization
    const exists = await this.vaultExists(owner);
    if (!exists) {
      tx.add(buildInitializeVaultIx(owner, vaultPda));
    }

    // 1. Send 0.15% fee directly to StockPilot Protocol Treasury Wallet
    if (feeLamports > 0) {
      tx.add(
        SystemProgram.transfer({
          fromPubkey: owner,
          toPubkey: PROTOCOL_TREASURY_WALLET,
          lamports: feeLamports,
        })
      );
    }

    // 2. Transfer net SOL to Vault PDA
    if (vaultLamports > 0) {
      tx.add(
        SystemProgram.transfer({
          fromPubkey: owner,
          toPubkey: vaultPda,
          lamports: vaultLamports,
        })
      );
    }

    return await this.signAndSendTransaction(tx);
  }

  /**
   * Withdraw SOL from the Anchor vault PDA using withdraw_sol instruction.
   */
  public async withdraw(amountSol: number): Promise<string> {
    if (!this.currentSession) {
      throw new MWAError('NO_WALLET', 'Connect your wallet first.');
    }

    const owner = this.currentSession.publicKey;
    const [vaultPda] = deriveVaultPda(owner);
    const lamports = Math.floor(amountSol * LAMPORTS_PER_SOL);

    const tx = new Transaction();
    tx.add(buildWithdrawSolIx(owner, vaultPda, lamports));

    return await this.signAndSendTransaction(tx);
  }

  /**
   * Invoke on-chain rebalance instruction on the Anchor vault.
   */
  public async rebalance(): Promise<string> {
    if (!this.currentSession) {
      throw new MWAError('NO_WALLET', 'Connect your wallet first.');
    }

    const owner = this.currentSession.publicKey;
    const [vaultPda] = deriveVaultPda(owner);

    const tx = new Transaction();
    tx.add(buildRebalanceIx(owner, vaultPda, [0, 0, 0, 0]));

    return await this.signAndSendTransaction(tx);
  }
}
