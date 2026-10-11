# 📱 StockPilot Mobile — Pitch Deck & Presentation Guide

> **Project:** StockPilot Mobile — Autonomous 24/7 AI Stock Robo-Advisor on Solana Seeker  
> **Direct APK Download:** [StockPilot-v1.2.3-Release.apk](https://expo.dev/artifacts/eas/J9vVK7kcNppX0nenEYACYkVJ9xrmWhPtx40DaWnqvQE.apk)  
> **GitHub Repository:** [https://github.com/southenempire/stockpilot-mobile](https://github.com/southenempire/stockpilot-mobile)  
> **Web Platform:** [https://stockpilotsol.xyz](https://stockpilotsol.xyz)  
> **Creator / Solo Founder:** Southen ([@southenempire](https://github.com/southenempire))

---

## 🎯 Pitch Deck Structure (10 Slides)

---

### Slide 1: Title & Hook
* **Headline:** StockPilot Mobile — Autonomous 24/7 AI Robo-Advisor on Solana
* **Sub-headline:** Wall Street Liquidity Meets Solana Seeker Hardware Custody
* **Visuals:** Device frame showing the StockPilot Mobile home screen with the Tokyo anime skyline background and live portfolio card.
* **Key Badges:**
  - Solana Seeker Seed Vault Ready
  - Anchor PDA Non-Custodial Vaults
  - 24/7 Tokenized Equity Markets
* **Speaker Script (Solo Founder):**
  > "Hello everyone, I’m Southen, the creator of StockPilot. Retail wealth management is fundamentally broken. Traditional brokerages lock your money behind archaic 9:30 AM to 4:00 PM market hours, charge high fees for simple indexing, and force you into custodial silos. Today, tokenized real-world assets are moving onto Solana, but retail investors don't have an automated robo-advisor layer to build and balance their wealth. I built StockPilot Mobile to fix this—bringing autonomous, 24/7 AI-driven equity baskets directly into the palm of your hand on Solana Seeker."

---

### Slide 2: The Problem
* **Headline:** Retail Investing is Trapped in the Past
* **Three Pain Points:**
  1. **Archaic Market Hours:** Traditional markets close at 4:00 PM, on weekends, and on holidays. If breaking macro news happens on Sunday, you cannot react until Monday morning.
  2. **Custodial Silos & Hidden Fees:** Traditional brokers custody your cash, lend out your shares, and charge opaque spreads and management fees.
  3. **High Rebalancing Overhead:** Maintaining a balanced basket of 5 to 10 assets requires manual math, mental fatigue, and high slippage across DEX interfaces.
* **Speaker Script:**
  > "Why are we still trading US equities on a 1970s banking schedule? If an earnings report drops or geopolitical news breaks on a Saturday, retail investors are locked out while institutional desks position themselves. Meanwhile, managing a thematic portfolio manually across DEXs is exhausting—tracking drift, calculating weights, and approving dozens of swaps. Everyday investors deserve automated, institutional-grade portfolio management without giving up custody of their keys."

---

### Slide 3: The Solution
* **Headline:** Autonomous, Non-Custodial Wealth Management
* **Three Core Pillars:**
  1. **24/7 Liquidity:** Invest in tokenized US equities anytime, day or night, with sub-second finality.
  2. **Anchor PDA Vaults:** True non-custodial custody. Funds live in dedicated user-owned Program Derived Addresses—I can never touch your capital.
  3. **Conversational Alpha:** AI translates plain English macro theses into risk-balanced, diversified baskets deployed on-chain in 1 tap.
* **Speaker Script:**
  > "StockPilot is the automated wealth management layer Solana has been missing. First: 24/7 liquidity on tokenized stocks. Second: absolute non-custodial security—every user deposits into their own Anchor PDA vault where only their signature can withdraw funds. Third: accessible alpha. You don’t need a finance degree to build thematic portfolios—you simply tell our AI your macro thesis in plain English, and it synthesizes a mathematically balanced basket ready to deploy on Solana in one tap."

---

### Slide 4: Mobile-First Architecture & Seeker Seed Vault
* **Headline:** Native Solana Mobile Stack (SMS) & Biometric Hardware Security
* **Key Architecture Points:**
  * **Mobile Wallet Adapter (MWA 2.0):** Native bottom-sheet authentication with zero seed phrase typing.
  * **Seeker Seed Vault Custody:** Hardware-isolated signing protected by biometric keys on Solana Seeker.
  * **Single-Task Android Engine:** Android `singleTask` activity lifecycle guarantees zero session drops or reloads when signing transactions in external wallets (Phantom, Solflare).
* **Visuals:** Visual mockup of the MWA bottom-sheet sliding up on a Solana Seeker device with biometric fingerprint prompt.
* **Speaker Script:**
  > "Mobile is where crypto onboarding happens. I designed StockPilot from the ground up for the Solana Seeker device using the Solana Mobile Stack. Through Mobile Wallet Adapter 2.0, users connect with one tap and sign transactions inside the hardware-isolated Seeker Seed Vault. Private keys never touch the app memory. We also hardened the Android activity lifecycle so transaction approval returns instantly without dropping state or restarting the app."

---

### Slide 5: The Product Experience — Thematic Baskets & AI Lab
* **Headline:** From Conversational Thesis to On-Chain Execution in Seconds
* **Showcase Elements:**
  * **4 Flagship Strategies:**
    * ⚡ *AI Semiconductor Titans* (NVDA 35%, TSM 25%, AMD 20%, MSFT 20% | +28.4% APY)
    * 🌿 *Clean Energy & Nuclear* (CEG 35%, VST 25%, NEE 20%, CCJ 20% | +19.2% APY)
    * 🏛️ *Magnificent Tech Titans* (AAPL 30%, MSFT 25%, GOOGL 25%, AMZN 20% | +22.1% APY)
    * 💎 *Seeker Quant Alpha ($SKR Exclusive)* (NVDA 30%, TSLA 25%, COIN 25%, $SKR 20% | +34.6% APY)
  * **AI Strategy Architect:** Generates custom baskets from prompts like *"Space economy and quantum computing"*.
  * **1-Tap Drift Rebalance:** Automatically monitors portfolio drift and executes atomic swaps to restore target weights.
* **Speaker Script:**
  > "Here is how simple it is: users can pick from pre-curated thematic baskets like AI Semiconductor Titans or Clean Energy, or open the AI Lab and type any thesis in natural language. Our AI engine instantly synthesizes the asset allocation, fetches devnet liquidity, and initializes an Anchor vault. If market volatility causes allocations to drift by more than 3%, StockPilot triggers a 1-tap rebalance that executes atomic swaps directly back to target weights."

---

### Slide 6: Tokenomics & Monetization ($SKR Utility)
* **Headline:** Sustainable On-Chain Revenue & Seeker Genesis Utility
* **Monetization Engine:**
  * **Protocol Fee:** 15 basis points (0.15%) collected directly on-chain to the protocol treasury on every deposit and rebalance trade.
* **Tiered $SKR Discounts:**
  * **Cadet (0 $SKR):** 15 bps protocol fee.
  * **Radiant Pilot (500 $SKR):** 50% discount (7.5 bps) + Priority rebalance alerts.
  * **Genesis Seeker VIP (2,500 $SKR):** **0% Protocol Fees (Lifetime Free Rebalancing)** + Exclusive access to the *Seeker Quant Alpha* strategy.
* **Speaker Script:**
  > "StockPilot has a clear monetization model: a 15 basis point fee collected directly to the treasury on deposits and rebalances. But for the Solana Seeker community, holding our $SKR governance token unlocks deep utility. At 500 $SKR, users get a 50% fee discount. At 2,500 $SKR, users reach Genesis VIP status with 0% protocol fees forever and exclusive access to high-frequency quant strategies."

---

### Slide 7: Technical Architecture & On-Chain Deployments
* **Headline:** Production-Grade Solana Stack
* **Architecture Diagram:**
  * Mobile Client (React Native 0.86 / Expo SDK 57)
  * SMS MWA 2.0 / Seeker Seed Vault
  * Anchor Program (`CsiP2ZWy1bM6Ghye85r67kiLC2zkBC7FngYCYGAhEPgK` on Devnet)
  * Treasury Wallet (`2KtVKiQCMbHrsdAPyjQVVnccpgvt3Y8ggrjgxXCSPyEo`)
  * Jupiter DEX Routing Engine & Pyth Oracle Feeds
* **Speaker Script:**
  > "Under the hood, StockPilot is built with battle-tested tooling. The on-chain Anchor contract is deployed and verified on Solana Devnet at Program ID `CsiP2ZWy...`. The mobile client is built on React Native and Expo SDK 57, communicating directly with Solana RPC nodes and Jupiter DEX for atomic route execution."

---

### Slide 8: About Me — Founder Background (Southen)
* **Headline:** Solo Architect & Full-Stack Solana Builder
* **Profile Highlights:**
  * **Southen (@southenempire)** — Full-Stack Solana Architect & Autonomous Systems Engineer.
* **Proven Track Record Across Solana & AI:**
  1. **Hydra-DLMM (Meteora Concentrated Liquidity):** Engineered a volatility-adaptive DLMM liquidity agent with cross-venue delta-hedging (Hummingbot Botcamp Hackathon — Agent Builders Cup).
  2. **Signal Protocol Autonomous Agent:** Built end-to-end encrypted autonomous messaging, intelligence, and voice bots leveraging the Signal protocol.
  3. **Sentinel Vaults & Anchor Contracts:** Designed secure non-custodial PDA vault systems and on-chain automated asset management contracts.
  4. **Dust Demons Mobile:** Developed mobile gaming and micro-transaction mechanics natively on the Solana Mobile Stack.
  5. **Jupiter Ecosystem Contributor:** Authored ecosystem proposals and integrated liquidity routing infrastructure.
* **Speaker Script:**
  > "A quick word about my background: I’m Southen, a solo full-stack Solana developer. Over the past few years, I’ve specialized in building autonomous DeFi agents, on-chain vaults, and mobile applications. I previously built Hydra-DLMM, an automated concentrated liquidity agent for Meteora DLMM pools during the Hummingbot Botcamp. I engineered autonomous messaging agents on the Signal encryption protocol, built mobile crypto mechanics for Dust Demons on Solana Mobile, and designed Anchor PDA vault architectures. I don't just design pitch decks—I architect, write the Rust contracts, build the mobile UI, and ship working code end-to-end."

---

### Slide 9: Roadmap & What's Next
* **Headline:** Bringing Autonomous Wealth Management to 150,000+ Seeker Users
* **Three Horizons:**
  * **Phase 1 (Immediate / Q4 2026):** Publish to the Solana dApp Store for Solana Seeker launch day; community Devnet testing and Seeker Genesis token airdrop.
  * **Phase 2 (Q1 2027):** Mainnet deployment integrating licensed tokenized equity feeds (Pyth and xStock real-world asset bridges).
  * **Phase 3 (Q2 2027):** Social Copy-Piloting: allow top community quants to publish custom thematic baskets and earn a fraction of the 15 bps vault fee split.
* **Speaker Script:**
  > "With over 150,000 Solana Seeker pre-orders, the addressable market on day one is massive. Following this hackathon, my priority is publishing StockPilot directly to the Solana dApp Store. Next, we will transition to mainnet by integrating licensed tokenized US equity feeds and Pyth oracles. Eventually, StockPilot will feature Social Copy-Piloting, allowing top macro traders to publish their own AI baskets and earn passive yield from vault fees."

---

### Slide 10: The Ask & Call to Action
* **Headline:** The Future of Mobile Wealth Management Starts Here
* **Call to Action Items:**
  * 📲 **Download the APK:** Scan the QR code or download v1.2.3 directly from GitHub.
  * 🌐 **Try the Web App:** Visit [stockpilotsol.xyz](https://stockpilotsol.xyz)
  * 💬 **Connect & Collaborate:** Follow [@southenempire](https://github.com/southenempire) on GitHub and X.
* **Visuals:** Large, crisp QR code linking directly to the APK download + GitHub repository link.
* **Speaker Script:**
  > "StockPilot is live, tested, and ready. You don’t have to imagine how it works—you can download the v1.2.3 APK right now on your Android or Seeker device and test the wallet connection, AI strategy generation, and Anchor vault rebalancing on Devnet. Thank you for your time, and I look forward to your feedback!"

---

## 🎬 2-Minute Pitch Video Timing Breakdown

| Timecode | Slide | Focus | Key Message |
| :---: | :---: | :--- | :--- |
| **0:00 - 0:20** | Slide 1-2 | Problem & Hook | Broken 9:30-4:00 market hours, high fees, custodial silos. |
| **0:20 - 0:45** | Slide 3-4 | Solution & SMS | 24/7 tokenized stocks, Anchor PDA vaults, Seeker Seed Vault. |
| **0:45 - 1:15** | Live Demo | Product In Action | Connect MWA, deposit into Semiconductor basket, AI Lab generation. |
| **1:15 - 1:35** | Slide 6 & 8 | Tokenomics & Founder | 15 bps fee split, $SKR VIP tier, Southen's track record (Hydra-DLMM, Signal). |
| **1:35 - 2:00** | Slide 9-10 | Roadmap & Conclusion | dApp Store launch, try the live APK today. |
