# 📱 StockPilot Mobile — Autonomous 24/7 AI Stock Robo-Advisor on Solana Seeker

> Built natively for the **Solana Seeker** phone and the **Solana dApp Store** for the **Clock In Hackathon by RadiantsDAO & Solana Mobile**.
> 
> 📲 **Direct APK Download:** [Download StockPilot v1.1.0 Overhaul APK](https://expo.dev/artifacts/eas/kaRHaCxS_FBQZmguQTjlA7f-Vy3ostaZjAIY_OY6MZk.apk)

---

## ⚡ Overview
**StockPilot Mobile** is a mobile-first autonomous stock robo-advisor designed from the ground up for the **Solana Seeker** device. It empowers users to invest in curated, 24/7 thematic US equity baskets on Solana with non-custodial Anchor PDA vaults, natural language AI portfolio generation, and autonomous rebalancing routed through Jupiter DEX.

---

## 🚀 Key Features

### 1. 🔐 Native Solana Mobile Stack (SMS) & Mobile Wallet Adapter (MWA)
* 1-Tap bottom-sheet wallet authentication using **MWA Protocol**.
* Direct integration with **Solana Seeker Seed Vault**, Phantom, and Solflare on Android.
* Secure transaction signing without exposing private keys.

### 2. 📊 1-Tap Thematic Equity Baskets
* **Semiconductor Supremacy** ($NVDA, $TSM, $AVGO, $AMD)
* **Magnificent Titans** ($AAPL, $MSFT, $GOOGL, $AMZN)
* **Clean Energy & Nuclear** ($CEG, $VST, $NEE, $CCJ)
* **Seeker Quant Alpha ($SKR)** ($NVDA, $TSLA, $COIN, $SKR)

### 3. 🤖 AI Natural Language Thesis Generator
* Type any macro thesis in plain English (e.g., *"Space exploration and quantum computing"*).
* The AI engine dynamically synthesizes asset weights and generates a custom non-custodial portfolio.

### 4. ⚡ Autonomous Rebalancing Engine
* Real-time portfolio drift calculation against target allocations.
* Atomic Jupiter DEX swaps restore target weights with sub-second finality and sub-cent Solana gas.

### 5. 💎 $SKR Token Utility & Seeker Genesis VIP Tier
* **Fee Discounts:**
  - Standard Tier: 15 bps protocol fee split
  - Radiant Gold (500 $SKR): 50% discount (7.5 bps)
  - Genesis VIP (2500 $SKR): **0% Protocol Fees**
* **Seeker Exclusive Strategies:** Unlocks the high-frequency *Seeker Quant Alpha* strategy.

---

## 🛠️ Tech Stack & Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                 STOCKPILOT MOBILE ARCHITECTURE              │
├──────────────────────────┬──────────────────────────────────┤
│ Mobile Framework         │ React Native 0.86 / Expo SDK 57  │
│ Wallet Adapter (MWA)     │ @solana-mobile/mobile-wallet-    │
│                          │ adapter-protocol-web3js          │
│ Smart Contracts          │ Anchor / Rust (Solana Devnet)    │
│ Client Generator         │ Codama (@solana/kit)             │
│ Routing & Swaps          │ Jupiter DEX Aggregator           │
│ Haptics & UI             │ Expo Haptics & Custom Cyberpunk  │
└──────────────────────────┴──────────────────────────────────┘
```

---

## 📦 How to Build the Android APK

```bash
# 1. Clone repository
git clone https://github.com/southenempire/stockpilot-mobile.git
cd stockpilot-mobile

# 2. Install dependencies
npm install

# 3. Start development server
npm start

# 4. Build Android APK via EAS
npx eas-cli build --platform android --profile preview
```

---

## 🏆 Hackathon Submission Checklist (Clock In by RadiantsDAO)
* [x] **Functional Android APK** configured with package `com.southenempire.stockpilot`
* [x] **Solana Mobile Stack (SMS) & Mobile Wallet Adapter (MWA)** integrated for Seeker Seed Vault
* [x] **Mobile-first UI/UX** designed with native bottom sheets, haptics, and responsive layout
* [x] **Meaningful On-chain Interactions:** Anchor PDA user vault deposits, fee split logic, and atomic rebalancing
* [x] **$SKR Track Prize Feature:** Tier-based 0% fee discounts and exclusive Seeker Genesis Quant strategy
