# Wallet Guide

Recommendations and guides for setting up and using Solana wallets with wLiquify.

## Recommended Wallets

The wLiquify dApp supports several popular Solana wallets. Here are our recommended options:

### 1. Phantom Wallet
- **Best for**: Beginners and general users
- **Features**:
  - User-friendly interface
  - Built-in token swaps
  - NFT support
  - Mobile app available
- **Setup**:
  1. Visit [phantom.app](https://phantom.app)
  2. Click "Add to Browser" for your browser
  3. Create a new wallet or import existing
  4. Securely store your seed phrase
  5. Fund your wallet with SOL

### 2. Solflare
- **Best for**: Advanced users and developers
- **Features**:
  - Advanced transaction options
  - Hardware wallet support
  - Custom RPC settings
- **Setup**:
  1. Visit [solflare.com](https://solflare.com)
  2. Install the browser extension
  3. Create or import wallet
  4. Configure network settings

### 3. Ledger (Hardware Wallet)
- **Best for**: Security-focused users
- **Features**:
  - Cold storage security
  - Multi-account support
  - Works with Phantom/Solflare
- **Setup**:
  1. Purchase a Ledger device
  2. Install Ledger Live
  3. Set up device and create Solana account
  4. Connect to Phantom/Solflare

## Common Interactions with wLiquify

### Connecting Your Wallet
1. Click "Select Wallet" in the dApp header
2. Choose your wallet from the list
3. Approve the connection request
4. Verify your wallet address is displayed

### Managing Network Settings
- Ensure your wallet is on the correct network (Mainnet-beta for production)
- Check network settings in your wallet
- Verify RPC endpoint matches dApp settings

### Transaction Approvals
- Review all transaction details before approving
- Check:
  - Token amounts
  - Fees
  - Price impact
  - Slippage tolerance
  - Network (source and destination chains)
  - Bridge contract addresses

### Managing Cross-Chain Tokens
1. **Source Chain Tokens**
   - Ensure sufficient balance for gas fees
   - Verify token contract addresses
   - Check token decimals
   - Monitor minimum bridge amounts

2. **Wormhole Wrapped Tokens**
   - Identify correct wrapped token address
   - Verify token metadata
   - Check bridge status
   - Monitor bridge fees

3. **Solana Native Tokens**
   - Maintain SOL for transaction fees
   - Check token account existence
   - Verify token program
   - Monitor rent-exempt balance

### Security Best Practices
1. **Never share your seed phrase**
2. **Use hardware wallet for large amounts**
3. **Verify transaction details**
4. **Keep software updated**
5. **Use strong passwords**
6. **Enable 2FA if available**

## Troubleshooting

### Common Issues
1. **Wallet Not Detected**
   - Ensure extension is installed
   - Check if extension is enabled
   - Try refreshing the page
   - Verify network compatibility

2. **Transaction Failures**
   - Check SOL balance for fees
   - Verify network connection
   - Ensure sufficient token balance
   - Check bridge status
   - Verify token compatibility

3. **Connection Issues**
   - Clear browser cache
   - Disconnect and reconnect wallet
   - Try different RPC endpoint
   - Check network congestion

4. **Bridge Issues**
   - Verify source chain status
   - Check destination chain status
   - Monitor bridge queue
   - Verify token whitelist status
   - Check minimum bridge amounts

### Getting Help
- Check our [FAQ](../resources/faq.md)
- Join our [Discord community](../resources/community-links.md)
- Contact support through official channels

## Connecting Your Wallet to wLiquify

Before you can use most features of the wLiquify dApp, you'll need to connect a Solana wallet.

**Supported Wallets:**
The dApp supports a range of popular Solana wallets, including:
- Phantom
- Solflare
- Coinbase Wallet
- Trust Wallet
- Ledger

**How to Connect:**
1.  Locate the **"Select Wallet"** button, typically found in the header of the application.
2.  Clicking this button will open a modal displaying a list of supported wallets.
3.  Choose your preferred wallet from the list.
4.  Approve the connection request from within your wallet application.

**Wallet Not Detected?**
If you've selected a wallet but its browser extension is not installed or active, the button might indicate "(Not Detected)". In this case, a small dropdown menu may appear, offering options to:
- **Download the wallet extension**: This will direct you to the wallet's official download page.
- **Change Wallet**: Allows you to select a different wallet.

**Wallet Connected - Profile Panel:**
Once connected, the wallet button will display your truncated wallet address (e.g., `ABCD...WXYZ`) and the icon of your connected wallet. Clicking this button opens the **Wallet Profile Panel**, which provides:
- Your full wallet address and a button to copy it.
- An option to view your address on your preferred blockchain explorer.
- Your total portfolio value (USD estimate).
- A detailed breakdown of your token balances, including your wLQI tokens and other whitelisted tokens held in your wallet.
- Buttons to:
    - **Change Wallet**: Opens the wallet selection modal again.
    - **Disconnect**: Logs you out of the dApp.

Always ensure you are interacting with the official wLiquify dApp website to protect your assets. 