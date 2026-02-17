# ✅ DEPLOYMENT CHECKLIST - EXACT STEPS

## 🔴 CRITICAL: Do This RIGHT NOW (6-24 hours before demo)

### Get Testnet MON for 3 Wallets

You need 3 separate wallet addresses. Generate them:
```bash
# Option 1: Use MetaMask (create 3 accounts)
# Option 2: Generate via Hardhat
cd Hardhat
npx hardhat run scripts/generateAccount.ts.ts
# Run 3 times, save each private key
```

**Faucets to visit (claim for ALL 3 wallets):**
1. https://faucet.monad.xyz/ (Requires 0.001 ETH on Ethereum mainnet)
2. https://faucet.quicknode.com/monad/testnet (Every 12 hours)
3. https://www.alchemy.com/faucets/monad-testnet (Every 24 hours)

**Target amounts:**
- Deployer: 5 MON
- Keeper: 3 MON  
- Flow Bot: 3 MON

---

## 📝 STEP 1: Configure Hardhat (5 minutes)

### Location: `Hardhat/.env`

```bash
cd /Users/tharunekambaram/coding-projects/monad-hackathon-build/Hardhat
cp .env.example .env
```

**Edit `Hardhat/.env` with these EXACT values:**

```bash
# ===========================================
# 🔑 KEYS YOU MUST FILL IN:
# ===========================================

# 1. Get Alchemy API Key from https://alchemy.com
#    - Sign up/Login → Create App → Select "Monad Testnet"
#    - Copy API key
ALCHEMY_API_KEY="your_alchemy_key_here"

# 2. Your 3 wallet private keys (from step above)
DEPLOYER_PRIVATE_KEY="0x1234..."
KEEPER_PRIVATE_KEY="0x5678..."
FLOW_BOT_PRIVATE_KEY="0x9abc..."

# ===========================================
# ✅ DEFAULTS (Keep these as-is)
# ===========================================

AMM_FEE_BPS="30"
MOCK_USDC_INITIAL_SUPPLY="5000000"
MOCK_MON_INITIAL_SUPPLY="5000000"
AMM_SEED_USDC="250000"
AMM_SEED_MON="250000"

KEEPER_RPC_URL="https://monad-testnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}"
FLOW_BOT_RPC_URL="https://monad-testnet.g.alchemy.com/v2/${ALCHEMY_API_KEY}"

KEEPER_POLL_INTERVAL_MS="7000"
KEEPER_TX_GAS_LIMIT="700000"
MIN_OUT_EXTRA_BPS="20"

FLOW_INTERVAL_MS="15000"
FLOW_MIN_SIZE_USDC="5"
FLOW_MAX_SIZE_USDC="75"

# ===========================================
# 📌 LEAVE EMPTY (Fill after deployment)
# ===========================================

VWAP_ENGINE_ADDRESS=""
SIMPLE_AMM_ADDRESS=""
MOCK_USDC_ADDRESS=""
MOCK_MON_ADDRESS=""
```

---

## 🚀 STEP 2: Deploy Contracts (2 minutes)

```bash
cd /Users/tharunekambaram/coding-projects/monad-hackathon-build/Hardhat
yarn install
yarn deploy --network monad
```

**YOU WILL SEE OUTPUT LIKE THIS:**
```
=== Deployment Summary ===
MockUSDC:   0xAbC123...
MockMON:    0xDeF456...
SimpleAMM:  0x789GhI...
VWAPEngine: 0xJkL012...
=========================
```

**COPY THESE 4 ADDRESSES!**

---

## 📝 STEP 3: Update .env with Deployed Addresses

**Edit `Hardhat/.env` again:**

```bash
# Paste the addresses you just got from deployment
VWAP_ENGINE_ADDRESS="0xJkL012..."
SIMPLE_AMM_ADDRESS="0x789GhI..."
MOCK_USDC_ADDRESS="0xAbC123..."
MOCK_MON_ADDRESS="0xDeF456..."
```

---

## 🤖 STEP 4: Start Bots (30 seconds)

**Terminal 1 - Keeper Bot:**
```bash
cd /Users/tharunekambaram/coding-projects/monad-hackathon-build/Hardhat
yarn keeper
```

**Expected output:**
```
Keeper started for 0xJkL012...
Keeper wallet: 0x...
Polling every 7000ms
```

**Terminal 2 - Flow Bot:**
```bash
cd /Users/tharunekambaram/coding-projects/monad-hackathon-build/Hardhat
yarn flow-bot
```

**Expected output:**
```
Flow bot started with wallet 0x...
Interval 15000ms
[flow] swap 23.4567 mUSDC tx=0x...
```

---

## 🎨 STEP 5: Configure Frontend (2 minutes)

### Location: `monad-miniapp-template/.env.local`

```bash
cd /Users/tharunekambaram/coding-projects/monad-hackathon-build/monad-miniapp-template
cp .env.example .env.local
```

**Edit `.env.local`:**

```bash
# Copy addresses from Hardhat/.env
NEXT_PUBLIC_VWAP_ENGINE_ADDRESS="0xJkL012..."
NEXT_PUBLIC_SIMPLE_AMM_ADDRESS="0x789GhI..."
NEXT_PUBLIC_TOKEN_IN_ADDRESS="0xAbC123..."   # MockUSDC
NEXT_PUBLIC_TOKEN_OUT_ADDRESS="0xDeF456..."  # MockMON

# Network (keep defaults)
NEXT_PUBLIC_CHAIN_ID="10143"
NEXT_PUBLIC_RPC_URL="https://monad-testnet.drpc.org"
NEXT_PUBLIC_EXPLORER_URL="https://testnet.monadexplorer.com"

# UI defaults (keep as-is)
NEXT_PUBLIC_ORDER_REFRESH_INTERVAL="5000"
NEXT_PUBLIC_DEBUG="false"
NEXT_PUBLIC_DEFAULT_SLIPPAGE_BPS="100"
NEXT_PUBLIC_DEFAULT_IMPACT_BPS="300"
```

---

## 🌐 STEP 6: Run Frontend (1 minute)

**Terminal 3:**
```bash
cd /Users/tharunekambaram/coding-projects/monad-hackathon-build/monad-miniapp-template
pnpm install
pnpm dev
```

**Open browser:**
```
http://localhost:3000
```

---

## 🔧 STEP 7: Configure MetaMask

1. Open MetaMask
2. Networks → Add Network → Add Manually
3. **Enter these EXACT values:**

```
Network Name: Monad Testnet
RPC URL: https://monad-testnet.g.alchemy.com/v2/YOUR_ALCHEMY_KEY
Chain ID: 10143
Currency Symbol: MON
Block Explorer: https://testnet.monadexplorer.com
```

4. Save
5. Switch to "Monad Testnet" network

---

## ✅ STEP 8: Test The System

### Create a Test Order:

1. Go to `localhost:3000`
2. Connect Wallet (MetaMask)
3. Click "Faucet" → Mint 10,000 MockUSDC
4. Create Order:
   ```
   Amount: 1000 USDC
   Slices: 5
   Interval: 60 seconds
   Max Slippage: 1% (100 bps)
   Max Impact: 3% (300 bps)
   Deadline: 1 hour
   ```
5. Click "Create Order" → MetaMask Confirm
6. **Watch:**
   - Keeper bot terminal (slice executions)
   - Flow bot terminal (market movement)
   - Frontend (progress updates)

### Verify Everything Works:

- [ ] Order created (tx hash in UI)
- [ ] Keeper bot detected order
- [ ] First slice executed after 60s
- [ ] Balance changed in UI
- [ ] Flow bot creating trades
- [ ] Can see txs on https://testnet.monadexplorer.com

---

## 🎬 STEP 9: Practice Demo

Follow `DEMO_GUIDE.md` and practice the 3-minute pitch **3 times**!

---

## 🚨 Common Issues & Fixes

### "Insufficient funds for gas"
**Fix:** Get more MON from faucets. Need backup wallets!

### "Error: ALCHEMY_API_KEY not set"
**Fix:** Check `Hardhat/.env` exists and has your Alchemy key

### "Contract address not found"
**Fix:** Make sure you deployed contracts and copied addresses to both:
- `Hardhat/.env`
- `monad-miniapp-template/.env.local`

### Keeper not executing slices
**Fix 1:** Check `VWAP_ENGINE_ADDRESS` in `Hardhat/.env` is correct  
**Fix 2:** Check keeper wallet has MON  
**Fix 3:** Restart keeper bot

### Frontend not showing order
**Fix 1:** Hard refresh: Cmd+Shift+R  
**Fix 2:** Check MetaMask is on Monad Testnet  
**Fix 3:** Check contract addresses in `.env.local`

### Transaction reverted
**Fix 1:** Check timing (60s must pass between slices)  
**Fix 2:** Check USDC balance > order amount  
**Fix 3:** Re-approve tokens if needed

---

## 📊 Pre-Demo Checklist

**24 Hours Before:**
- [ ] All 3 wallets have MON (5, 3, 3)
- [ ] Contracts deployed
- [ ] Addresses saved in `.env` files
- [ ] Test order completed successfully
- [ ] Screenshot tx hashes
- [ ] Demo script practiced 3x

**1 Hour Before:**
- [ ] Keeper bot running
- [ ] Flow bot running
- [ ] Frontend running
- [ ] MetaMask connected
- [ ] Backup wallets funded
- [ ] Block explorer tab open
- [ ] Terminal windows visible

**During Demo:**
- [ ] Follow DEMO_GUIDE.md script
- [ ] Point to real tx hashes
- [ ] Show bot terminals
- [ ] Emphasize "parallel execution"
- [ ] Stay under 3 minutes!

---

## 🎯 Critical Files Summary

### You MUST Configure These 2 Files:

| File | Location | What to Configure |
|------|----------|-------------------|
| `Hardhat/.env` | `/monad-hackathon-build/Hardhat/.env` | API keys, private keys, contract addresses |
| `.env.local` | `/monad-hackathon-build/monad-miniapp-template/.env.local` | Contract addresses only |

### Key Configuration Points:

```
1. ALCHEMY_API_KEY → Get from alchemy.com
2. DEPLOYER_PRIVATE_KEY → Your deployer wallet
3. KEEPER_PRIVATE_KEY → Your keeper wallet  
4. FLOW_BOT_PRIVATE_KEY → Your flow bot wallet
5. VWAP_ENGINE_ADDRESS → From deployment output
6. SIMPLE_AMM_ADDRESS → From deployment output
7. MOCK_USDC_ADDRESS → From deployment output
8. MOCK_MON_ADDRESS → From deployment output
```

---

## 🔗 Important Links

**Keep These Open During Demo:**
- Block Explorer: https://testnet.monadexplorer.com
- GitHub: https://github.com/tharune/monad-hackathon-build/tree/VWAP
- Faucet: https://faucet.monad.xyz/
- Monad Docs: https://docs.monad.xyz/

---

## 💡 Quick Troubleshooting Command

If anything breaks:
```bash
# Kill all processes
pkill -f keeper
pkill -f flow-bot
pkill -f next-server

# Restart everything
cd /Users/tharunekambaram/coding-projects/monad-hackathon-build/Hardhat
yarn keeper &  # Terminal 1
yarn flow-bot &  # Terminal 2

cd ../monad-miniapp-template
pnpm dev  # Terminal 3
```

---

## ✨ You're Ready!

Everything is configured and ready to go. The VWAP branch is live at:
**https://github.com/tharune/monad-hackathon-build/tree/VWAP**

Follow this checklist step-by-step, and you'll have a working demo in **~15 minutes** (plus faucet wait time).

Good luck! 🚀
