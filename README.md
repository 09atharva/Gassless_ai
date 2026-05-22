# Gasless AI Membership Wallet

A hackathon-ready Web3 fintech MVP built on **Base Sepolia**. Users can mint NFT memberships gaslessly by paying gas fees with **MockUSD** via the **Universal Gasless Framework (UGF)** integration.

https://gassless-ai.netlify.app

## 🚀 Demo Flow

1. **Connect MetaMask**: Seamless wallet integration with RainbowKit.
2. **MockUSD Faucet**: Get free MockUSD to pay for gasless transactions.
3. **Mint Gasless NFT**: Execute a transaction through UGF without needing ETH.
4. **AI Assistant**: Interact with an AI powered by Gemini to understand your wallet and savings.
5. **Dashboard**: View your MockUSD balance, Membership status, and real-time gas savings.

## 🛠 Tech Stack

- **Frontend**: Next.js 14, TypeScript, TailwindCSS, Shadcn/UI, Framer Motion
- **Web3**: Wagmi, Viem, RainbowKit
- **Blockchain**: Solidity, OpenZeppelin, Hardhat (Base Sepolia)
- **AI**: OpenRouter (Gemini 1.5 Flash)
- **Gasless**: UGF (Universal Gasless Framework) Integration Layer

## 📂 Project Structure

```text
├── contracts/          # Smart contracts (Hardhat)
│   ├── contracts/      # MembershipNFT.sol, MockUSD.sol
│   └── hardhat.config.js
└── frontend/           # Next.js Application
    ├── src/app/        # App Router Pages
    ├── src/components/ # UI Components & Providers
    ├── src/lib/        # UGF SDK & Utils
    └── src/hooks/      # Custom React Hooks
```

## ⚙️ Setup Instructions

### 1. Smart Contracts
```bash
cd contracts
npm install
# Add PRIVATE_KEY to .env
npx hardhat compile
# npx hardhat run scripts/deploy.js --network base-sepolia
```

### 2. Frontend
```bash
cd frontend
npm install --legacy-peer-deps
```

Create a `.env.local` file in `frontend/`:
```env
NEXT_PUBLIC_WC_PROJECT_ID=your_walletconnect_id
OPENROUTER_API_KEY=your_openrouter_api_key
NEXT_PUBLIC_MEMBERSHIP_NFT_ADDRESS=0x...
NEXT_PUBLIC_MOCK_USD_ADDRESS=0x...
```

### 3. Run Application
```bash
npm run dev
```

## 🌐 Deployment Guide

### Smart Contracts
1. Deploy `MockUSD.sol` to Base Sepolia.
2. Deploy `MembershipNFT.sol` providing a base metadata URI.
3. Verify contracts on Basescan.

### Frontend
1. Push to GitHub.
2. Connect to Vercel.
3. Add Environment Variables.
4. Deploy!

## 📄 License
MIT
# Gassless_ai
