# 🤝 P2P Lending DApp - Complete Setup Guide

A decentralized peer-to-peer lending platform built on Ethereum.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Deploy Smart Contract](#deploy-smart-contract)
3. [Setup Frontend](#setup-frontend)
4. [Run the Application](#run-the-application)
5. [How to Use](#how-to-use)
6. [Android Integration](#android-integration)

---

## ✅ Prerequisites

Before starting, make sure you have:

1. **MetaMask Wallet** installed in your browser
    - Download: https://metamask.io/

2. **Node.js** installed (v16 or higher)
    - Download: https://nodejs.org/
    - Check: `node --version`

3. **Test ETH** for deploying contract
    - We'll get this from faucets (free!)

---

## 🚀 Step 1: Deploy Smart Contract

### A. Get Test Network ETH

1. **Open MetaMask** and switch to **Sepolia Test Network**
    - Click network dropdown → Show test networks (in settings) → Select Sepolia

2. **Get free test ETH** from Sepolia faucet:
    - Visit: https://sepoliafaucet.com/
    - Or: https://www.infura.io/faucet/sepolia
    - Paste your MetaMask address
    - Wait 1-2 minutes for ETH to arrive

### B. Deploy Contract in Remix

1. **Open Remix IDE**
    - Go to: https://remix.ethereum.org/

2. **Create new file**: `P2PLending.sol`
    - Click "contracts" folder → New File
    - Paste your Solidity contract code

3. **Compile the contract**
    - Click "Solidity Compiler" tab (left sidebar)
    - Select compiler version: `0.8.20`
    - Click "Compile P2PLending.sol"

4. **Deploy the contract**
    - Click "Deploy & Run Transactions" tab
    - Environment: Select **"Injected Provider - MetaMask"**
    - MetaMask will popup → Connect your wallet
    - Make sure you're on **Sepolia network**
    - Click **"Deploy"** button
    - Confirm transaction in MetaMask
    - Wait for confirmation (~15 seconds)

5. **Copy Contract Address** 📝
    - After deployment, look at "Deployed Contracts" section
    - Copy the contract address (looks like `0x1234...abcd`)
    - **IMPORTANT: Save this address!** You'll need it next.

---

## 💻 Step 2: Setup Frontend

### A. Install Dependencies

```bash
# Navigate to frontend folder
cd frontend

# Install all dependencies
npm install
```

### B. Configure Contract Address

1. **Open** `frontend/src/config.js`

2. **Replace** `YOUR_CONTRACT_ADDRESS_HERE` with your actual deployed contract address:

```javascript
export const CONTRACT_ADDRESS = "0xYourActualContractAddress"; // ← Paste here!
```

3. **Save the file**

---

## 🎮 Step 3: Run the Application

```bash
# Make sure you're in the frontend folder
cd frontend

# Start development server
npm run dev
```

The app will open at: **http://localhost:3000**

---

## 📱 Step 4: How to Use

### For Borrowers:

1. **Connect Wallet**
    - Click "Connect MetaMask"
    - Approve connection

2. **Create Loan Request**
    - Enter loan amount (e.g., 0.1 ETH)
    - Enter duration in days (e.g., 30)
    - Enter interest rate % (e.g., 10)
    - Click "Create Loan Request"
    - Confirm transaction in MetaMask

3. **Wait for Funding**
    - Lenders will see your loan request
    - They can fund it partially or fully

4. **Repay Loan**
    - Once funded, the "Repay Loan" section appears
    - Enter repayment amount (principal + interest)
    - Click "Repay Loan"
    - Confirm transaction

### For Lenders:

1. **Connect Wallet**
    - Click "Connect MetaMask"

2. **View Active Loan**
    - See borrower's loan details
    - Check interest rate and duration

3. **Fund Loan**
    - Enter amount to contribute (can be partial)
    - Click "Fund Loan"
    - Confirm transaction in MetaMask

4. **Withdraw After Repayment**
    - Once borrower repays, click "Withdraw My Funds"
    - Get your principal + interest share
    - Confirm transaction

---

## 📊 Features

✅ **Create Loan Requests** - Borrowers can request loans with custom terms  
✅ **Fund Loans** - Multiple lenders can contribute to a single loan  
✅ **Interest Calculation** - Automatic interest calculation  
✅ **Repayment** - Borrowers can repay with interest  
✅ **Withdrawal** - Lenders withdraw their share after repayment  
✅ **Cancel Loan** - Borrowers can cancel unfunded loans  
✅ **Real-time Updates** - Live loan status and progress tracking  
✅ **Beautiful UI** - Modern, responsive design

---

## 📱 Android Integration

To integrate with your Android app:

### Option 1: Build for Production

```bash
# Build the frontend
npm run build

# Files will be in 'dist' folder
# Copy 'dist' folder contents to 'app/src/main/assets/' in Android project
```

### Option 2: Host Online

```bash
# Build the app
npm run build

# Deploy to Vercel (free)
npm install -g vercel
vercel deploy

# Use the deployed URL in MainActivity.java:
# webView.loadUrl("https://your-app.vercel.app");
```

---

## 🔧 Troubleshooting

### Problem: "Please install MetaMask"

- **Solution**: Install MetaMask browser extension from https://metamask.io/

### Problem: "Failed to connect wallet"

- **Solution**: Refresh page and try connecting again
- Make sure MetaMask is unlocked

### Problem: Transaction fails

- **Solution**: Make sure you have enough test ETH for gas fees
- Check you're on Sepolia network in MetaMask

### Problem: Contract not responding

- **Solution**: Verify contract address in `config.js` is correct
- Make sure contract is deployed on same network you're connected to

---

## 🌐 Network Information

- **Network**: Sepolia Testnet
- **Chain ID**: 11155111
- **Block Explorer**: https://sepolia.etherscan.io/
- **Faucets**:
    - https://sepoliafaucet.com/
    - https://www.infura.io/faucet/sepolia

---

## 📚 Tech Stack

- **Smart Contract**: Solidity 0.8.20
- **Frontend**: React 18
- **Web3 Library**: ethers.js v6
- **Build Tool**: Vite
- **Styling**: Pure CSS

---

## 🎯 Next Steps

1. ✅ Deploy contract to testnet
2. ✅ Test all features (create, fund, repay, withdraw)
3. 🔄 Add more features (credit scores, multiple loans, etc.)
4. 🚀 Deploy to mainnet (when ready for production)

---

## 📞 Need Help?

- **Remix Documentation**: https://remix-ide.readthedocs.io/
- **ethers.js Docs**: https://docs.ethers.org/
- **MetaMask Guide**: https://metamask.io/faqs/

---

## ⚠️ Important Notes

- This is a testnet application - use test ETH only!
- Never share your private keys or seed phrase
- Test thoroughly before deploying to mainnet
- Consider adding more security features for production

---

## 🎉 You're All Set!

Your P2P Lending DApp is ready to use. Start by deploying the contract, then run the frontend and
connect with MetaMask!

**Happy Lending! 🚀**
