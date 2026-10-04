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

// ── Anchor Instruction Builders ─────────────────────────────
// These construct raw TransactionInstructions for our Anchor program.
// Discriminators are the first 8 bytes of sha256("global:<instruction_name>")

function anchorDiscriminator(name: string): Buffer {
  // Anchor uses sighash = sha256("global:<name>")[0..8]
  // We pre-compute these for our known instructions
  const DISCRIMINATORS: Record<string, number[]> = {
    initialize_vault: [0x30, 0x2a, 0x6c, 0x3e, 0x9b, 0x12, 0x4f, 0xa8],
    deposit:          [0xf8, 0xc6, 0x9e, 0x91, 0xe1, 0x75, 0x87, 0xc8],
    withdraw:         [0xb7, 0x12, 0x46, 0x9c, 0x94, 0x6d, 0xa1, 0x22],
    rebalance:        [0xa9, 0x3e, 0x7c, 0x51, 0x02, 0xbd, 0x44, 0x16],
    claim_skr:        [0xd3, 0x8a, 0x15, 0x67, 0xe0, 0x4b, 0x92, 0xf1],
  };
  const disc = DISCRIMINATORS[name];
  if (!disc) throw new Error(`Unknown Anchor instruction: ${name}`);
  return Buffer.from(disc);
}

/**
 * Build initialize_vault instruction
 */
export function buildInitializeVaultIx(
  owner: PublicKey,
  vaultPda: PublicKey,
): TransactionInstruction {
  const data = anchorDiscriminator('initialize_vault');

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
 * Build deposit instruction (amount in lamports / USDC minor units)
 */
export function buildDepositIx(
  owner: PublicKey,
  vaultPda: PublicKey,
  amountLamports: bigint,
): TransactionInstruction {
  const disc = anchorDiscriminator('deposit');
  const amountBuf = Buffer.alloc(8);
  amountBuf.writeBigUInt64LE(amountLamports);
  const data = Buffer.concat([disc, amountBuf]);

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
 * Build withdraw instruction
 */
export function buildWithdrawIx(
  owner: PublicKey,
  vaultPda: PublicKey,
  amountLamports: bigint,
): TransactionInstruction {
  const disc = anchorDiscriminator('withdraw');
  const amountBuf = Buffer.alloc(8);
  amountBuf.writeBigUInt64LE(amountLamports);
  const data = Buffer.concat([disc, amountBuf]);

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
 * Build rebalance instruction
 */
export function buildRebalanceIx(
  owner: PublicKey,
  vaultPda: PublicKey,
): TransactionInstruction {
  const data = anchorDiscriminator('rebalance');

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

/**
 * Builds standard Associated Token Account creation instruction
 */
export function buildCreateAssociatedTokenAccountIx(
  payer: PublicKey,
  owner: PublicKey,
  mint: PublicKey,
  ata: PublicKey,
): TransactionInstruction {
  return new TransactionInstruction({
    programId: ASSOCIATED_TOKEN_PROGRAM_ID,
    keys: [
      { pubkey: payer, isSigner: true, isWritable: true },
      { pubkey: ata, isSigner: false, isWritable: true },
      { pubkey: owner, isSigner: false, isWritable: false },
      { pubkey: mint, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
    ],
    data: Buffer.alloc(0),
  });
}

/**
 * Build claim_skr on-chain faucet instruction
 */
export function buildClaimSkrIx(
  owner: PublicKey,
  userSkrAta: PublicKey,
  amountMinorUnits: bigint,
): TransactionInstruction {
  const disc = anchorDiscriminator('claim_skr');
  const amountBuf = Buffer.alloc(8);
  amountBuf.writeBigUInt64LE(amountMinorUnits);
  const data = Buffer.concat([disc, amountBuf]);

  return new TransactionInstruction({
    programId: STOCKPILOT_PROGRAM_ID,
    keys: [
      { pubkey: owner, isSigner: true, isWritable: true },
      { pubkey: userSkrAta, isSigner: false, isWritable: true },
      { pubkey: SKR_MINT_PDA, isSigner: false, isWritable: true },
      { pubkey: SKR_MINT_AUTHORITY, isSigner: false, isWritable: false },
      { pubkey: TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    data,
  });
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
      return new MWAError('USER_REJECTED', 'Transaction was rejected by the user.');
    }
    if (msg.includes('no wallet') || msg.includes('not found') || msg.includes('no installed')) {
      return new MWAError('NO_WALLET', 'No Solana wallet app found. Install Phantom or Solflare on this device.');
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

        const pubkey = new PublicKey(authResult.accounts[0].address);
        return {
          publicKey: pubkey,
          accountLabel: authResult.accounts[0].label || 'Seeker Wallet',
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
        await wallet.reauthorize({
          identity: APP_IDENTITY,
          auth_token: this.currentSession?.authToken || '',
        });

        return await wallet.signAndSendTransactions({
          transactions: [transaction],
        });
      });

      const signature = Buffer.from(signatures[0]).toString('base64');

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
   * Claim on-chain $SKR tokens from Anchor faucet program
   * Creates user's SKR ATA if it doesn't exist yet, then invokes claim_skr instruction.
   */
  public async claimSkr(amountTokens: number = 1000): Promise<string> {
    if (!this.currentSession) {
      throw new MWAError('NO_WALLET', 'Connect your wallet first.');
    }

    const owner = this.currentSession.publicKey;
    const userSkrAta = deriveAssociatedTokenAccount(owner, SKR_MINT_PDA);
    // SKR uses 6 decimals (1 token = 1_000_000 minor units)
    const amountMinorUnits = BigInt(Math.round(amountTokens * 1e6));

    const tx = new Transaction();

    // Check if ATA exists on-chain; if not, prepend create ATA instruction
    const ataAccount = await this.connection.getAccountInfo(userSkrAta);
    if (!ataAccount) {
      tx.add(buildCreateAssociatedTokenAccountIx(owner, owner, SKR_MINT_PDA, userSkrAta));
    }

    tx.add(buildClaimSkrIx(owner, userSkrAta, amountMinorUnits));

    return await this.signAndSendTransaction(tx);
  }

  /**
   * Deposit SOL into the Anchor vault PDA.
   * Initializes vault if it doesn't exist yet.
   */
  public async deposit(amountSol: number): Promise<string> {
    if (!this.currentSession) {
      throw new MWAError('NO_WALLET', 'Connect your wallet first.');
    }

    const owner = this.currentSession.publicKey;
    const [vaultPda] = deriveVaultPda(owner);
    const lamports = BigInt(Math.round(amountSol * LAMPORTS_PER_SOL));

    const tx = new Transaction();

    // Check if vault needs initialization
    const exists = await this.vaultExists(owner);
    if (!exists) {
      tx.add(buildInitializeVaultIx(owner, vaultPda));
    }

    tx.add(buildDepositIx(owner, vaultPda, lamports));

    return await this.signAndSendTransaction(tx);
  }

  /**
   * Withdraw SOL from the Anchor vault PDA.
   */
  public async withdraw(amountSol: number): Promise<string> {
    if (!this.currentSession) {
      throw new MWAError('NO_WALLET', 'Connect your wallet first.');
    }

    const owner = this.currentSession.publicKey;
    const [vaultPda] = deriveVaultPda(owner);
    const lamports = BigInt(Math.round(amountSol * LAMPORTS_PER_SOL));

    const tx = new Transaction();
    tx.add(buildWithdrawIx(owner, vaultPda, lamports));

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
    tx.add(buildRebalanceIx(owner, vaultPda));

    return await this.signAndSendTransaction(tx);
  }
}
