---
sidebar_position: 1
slug: /user-guides/dapp-guide
---

# Using the wLiquify dApp: Your Step-by-Step Guide

## 1. Welcome to the wLiquify dApp!

Ready to dive into the wLiquify experience? This guide is your companion for navigating our decentralized application (dApp). We'll walk you through swapping tokens, providing liquidity to our unique pool, and managing your assets on Solana.

**With the wLiquify dApp, you can:**
*   **Swap Cryptocurrencies**: Effortlessly exchange tokens using our integrated Jupiter terminal for great rates.
*   **Become a Liquidity Provider (LP)**: Deposit assets into the wLiquify pool, receive wLQI LP tokens, and potentially earn rewards.
*   **Manage Your Wallet & Settings**: Easily connect your wallet and customize your dApp experience.
*   **Bridge Assets to Solana**: Follow our current manual process to bring tokens from other chains into the Solana ecosystem to use with wLiquify.

## 2. First Things First: Connecting Your Solana Wallet

Before you can explore all the features, you'll need to connect your Solana wallet.

If you haven't set one up yet, or want to know which wallets we recommend, please check out our comprehensive **[Wallet Guide](./wallet-guide.md)**. It covers everything from choosing a wallet to connecting it securely.

## 3. Exploring Core dApp Features

Let's explore what you can do in the dApp:

### 3.1. Swapping Tokens with Jupiter Integration

Need to exchange one token for another? Our Swap page, powered by Jupiter Aggregator, helps you find competitive rates across many Solana liquidity sources.

**Finding the Swap Page:**
*   Look for the "Swap" link or tab, usually prominent in the dApp's main navigation (e.g., in the header).
    *   *(Suggestion: Insert a small screenshot highlighting the Swap tab location here.)*

**How to Make a Swap:**
1.  Once on the Swap page, you'll see the integrated Jupiter Terminal interface.
2.  **Choose Your Tokens**: 
    *   Select the token you want to **sell** (this is your Input token).
    *   Select the token you want to **buy** (this is your Output token).
3.  **Enter the Amount**: 
    *   Type in how much of your input token you want to sell, OR how much of the output token you want to receive. Jupiter will automatically estimate the other amount based on current market prices.
4.  **Review Jupiter's Details**: Before you confirm, carefully look at the information Jupiter provides. This usually includes:
    *   The current **exchange rate**.
    *   **Price Impact**: How much your specific trade might affect the market price (larger trades can have a bigger impact).
    *   **Minimum Received**: The least amount of the output token you'll get, even if the price slips slightly before your transaction confirms.
    *   **Route**: How Jupiter is finding the best path for your trade, possibly through several different liquidity pools on Solana.
5.  **Adjust Slippage (Optional)**: If you're an advanced user, you can adjust your slippage tolerance. This is the maximum price change you're willing to accept. Jupiter usually has a settings icon (often a gear ⚙️) for this.
6.  **Confirm the Swap**: Click the "Swap" button within the Jupiter terminal.
7.  **Approve in Your Wallet**: Your connected Solana wallet will pop up asking you to approve the transaction. Review the details carefully in your wallet, then approve.

**Understanding Swap Fees:**
*   **Solana Network Fees (Priority Fees)**: Every transaction on Solana requires a small network fee (paid in SOL). You can often influence how quickly your transaction is processed by adjusting the priority fee level in the dApp's main Settings (see Section 4 of this guide).
*   **Jupiter Fees**: Jupiter might include a small fee for their aggregation service. This is usually shown transparently in their interface.
*   **wLiquify Platform Fees**: Good news! Currently, wLiquify does **not** add any extra platform fees for swaps made using the integrated Jupiter terminal. (Please note: this is subject to change in the future as the protocol evolves).

**Important Note on Network Configuration for Swaps:**
Pay attention to any "Network Configuration Note" on the Swap page. Here's why it matters:
*   The dApp's RPC endpoint (which you can set in the main Settings) tells Jupiter which network (e.g., Mainnet-beta for live trades, or Devnet for testing) to primarily use for displaying token lists and data.
*   Crucially, **your connected wallet must also be set to the *same* network** (e.g., both dApp and wallet on Mainnet-beta). If they don't match, token lists or balances within Jupiter might look incorrect.
*   **All swaps will be executed on the network your wallet is currently connected to.** So, always double-check that your wallet is on your intended network (e.g., Mainnet-beta) to avoid errors or sending transactions on the wrong network!

### 3.2. Becoming a Liquidity Provider (LP) on the Pool Page

The Pool page is your gateway to interacting directly with the wLiquify liquidity pool. By depositing your assets here, you receive **wLQI tokens**, which represent your share of the pool and can potentially earn you rewards.

**Finding the Pool Page:**
*   This is often the main or landing page of the dApp.
    *   *(Suggestion: Insert a screenshot of the main Pool page interface here.)*

**Understanding the Pool & the wLQI Token:**
*   **wLQI Token Explained**: This is wLiquify's special Liquidity Provider (LP) token. When you deposit assets into our pool, you mint (receive) wLQI tokens. When you want to take your assets out, you burn (give back) your wLQI tokens to receive a proportional share of the underlying assets in the pool.
*   **What's a wLQI Token Worth?**: The value of one wLQI token is determined by the total value of all assets held within the liquidity pool, divided by the total number of wLQI tokens circulating. So, as the pool earns fees (if applicable to LPs) or as the value of the assets within it changes, the value of your wLQI tokens may also change.
*   **Why Hold wLQI?**: By holding wLQI, you own a share of the wLiquify pool. This means you could earn a portion of fees generated by the pool's activities (like fees from deposits/withdrawals that are designed to benefit LPs and maintain pool balance).

**Bringing Assets to Solana: The Current Manual Bridging Process**

To deposit tokens that aren't already on Solana (like ETH or many ERC-20s) into the wLiquify pool, you'll currently need to "bridge" them. This involves a few manual steps using Wormhole, a widely-used bridging service. We provide a deposit bonus to help offset these bridging costs!

**Step-by-Step Manual Bridging (Wormhole NTT via Portal Bridge tools):**

1.  **Identify the Token in the wLiquify Pool**:
    *   On the wLiquify dApp's Pool page, find the token you eventually want to deposit (e.g., Wrapped ETH from Wormhole).
    *   Carefully **copy its Solana token address** (mint address) displayed in our pool interface.

2.  **Discover its Origin with Portal Token Origin Verifier**:
    *   Go to the [Portal Token Origin Verifier](https://portalbridge.com/legacy-tools/#/token-origin-verifier) (Bookmark this official link!).
    *   Select "Solana" as the chain.
    *   Paste the Solana token address you copied from the wLiquify pool.
    *   The verifier will tell you the token's **original chain** (e.g., Ethereum) and its **original token address** on that chain. **Note these down carefully.**

3.  **Acquire the Token on its Original Chain (If You Don't Have It Yet)**:
    *   You'll need the *native* version of the token on its *original* chain. For example, if you want to bridge ETH, you need ETH on the Ethereum network.
    *   If you don't have it, you may need to buy it on a centralized exchange and withdraw it to your self-custody wallet on that origin chain, or swap for it on a DEX on that origin chain.
    *   **Important**: Ensure you have enough of the origin chain's native currency (e.g., ETH for Ethereum, MATIC for Polygon) in your wallet to pay for gas fees for the upcoming bridging steps.

4.  **(Optional but Sometimes Necessary) Bridge from Solana to Source Chain First (e.g. using DeBridge)**:
    *   This step is less common for *new* deposits into wLiquify but might be relevant if you have funds on Solana you want to convert and bring back as a *different* whitelisted asset. The typical flow for *new* deposits (steps 1-3, then 5-6) usually doesn't require this intermediate DeBridge step if you start with assets on their native chain or CEX.
    *   If you *do* need to bridge assets *from* Solana *to* a source chain (like Ethereum to get native ETH to then bridge *back* via Wormhole), a tool like DeBridge can be used. Always ensure you have SOL for gas and follow DeBridge's specific instructions and fee considerations.

5.  **Bridge the Token from its Origin Chain to Solana using Portal Transfer**:
    *   Go to the [Portal Transfer tool](https://portalbridge.com/legacy-tools/#/transfer) (Bookmark this official link!).
    *   **Source**: Select the token's origin chain (e.g., Ethereum).
    *   **Target**: Select "Solana".
    *   **Select Token**: Choose the token you want to bridge (using the origin token address you noted earlier if needed for searching).
    *   **Amount**: Enter the amount you wish to bridge.
    *   Follow all the steps provided by the Portal interface carefully. This will involve approving transactions in your origin chain wallet.
    *   Once complete, you will receive the Wormhole-wrapped version of your token in your connected Solana wallet.

6.  **Deposit into the wLiquify Pool & Claim Your Bonus!**
    *   Head back to the wLiquify dApp's Pool page.
    *   You should now see the Wormhole-wrapped tokens you just bridged in your Solana wallet balance (within the dApp's token list).
    *   You can now deposit these specific Wormhole-wrapped tokens into the wLiquify pool (see "Depositing Liquidity" below).
    *   Upon successful deposit, you'll be eligible for our **deposit bonus** to help offset your bridging costs!

**Important Bridging Notes & Tips:**
*   **Always Double-Check Addresses**: Before any bridging transaction, verify all token addresses and contract interactions. Use official links for bridging tools.
*   **Gas Money is Key**: Keep enough native currency for gas fees on *both* the source chain and Solana.
*   **Patience During Congestion**: Bridging can sometimes take a few minutes, especially if networks are busy. Monitor the bridge's status updates if available.
*   **Save Your Hashes**: Keep a record of your transaction hashes (IDs) from both chains for reference or if you need support.
*   **Typical Costs**: Bridging fees can vary (often 0.5% to 1.5% or more, depending on the bridge and networks). Our deposit bonus aims to help with this.

**Exciting Future: Streamlined Bridging is Coming!**
We know manual bridging has a few steps. That's why we're actively working on:
1.  **Simpler Token Selection & Verification**: Select tokens directly in our dApp, with automatic source chain detection and built-in verification.
2.  **More Integrated Process**: Easier access to bridging tools, step-by-step guidance within our dApp, and clearer cost breakdowns.
3.  **An Even Better Experience**: Improved error handling, real-time status updates, and enhanced security checks.

**Understanding the Pool Page Information:**
Our Pool page provides key metrics about the wLiquify pool:
*   **wLQI Token Value**: The current estimated USD value of a single wLQI token.
*   **wLQI Total Supply**: How many wLQI tokens are currently out there.
*   **Total Pool Value (TVL)**: The total USD value of all assets locked in our liquidity pool.
*   **Token Table**: This is a detailed list of all tokens supported by the wLiquify pool. For each token, you'll typically see:
    *   Token Symbol & Name.
    *   Its current market value (price).
    *   The actual percentage this token currently makes up in our pool.
    *   The target percentage (the ideal weight this token *should* have in the pool).
    *   **Deposit Fee/Bonus**: An estimate of the fee or bonus you might get for depositing *this specific* token right now.
    *   **Withdraw Fee/Bonus**: An estimate of the fee or bonus for withdrawing *this specific* token.
    *   Your current balance of this token in your connected wallet.

**The Magic of Dynamic Fees/Bonuses (for Deposits & Withdrawals):**
The "Deposit Fee/Bonus" and "Withdraw Fee/Bonus" are important! The wLiquify pool works to maintain a target balance (or weight) for each token it supports, aiming to reflect true market dominance.
*   **Depositing an Underweight Token** (a token that's below its target % in our pool): You might get a **BONUS**! This means you could receive slightly more wLQI for your deposit, or pay a lower effective fee.
*   **Depositing an Overweight Token** (a token that's already above its target %): You might incur a small **FEE**, meaning you'd get slightly less wLQI for your deposit.
*   **Withdrawing an Underweight Token**: You might incur a **FEE**.
*   **Withdrawing an Overweight Token**: You might get a **BONUS** (or pay a lower fee).
These dynamic adjustments incentivize everyone to help keep the pool balanced, which is healthy for the index!

**How to Deposit Liquidity (Become an LP):**
1.  On the Pool page, locate the **Token Table**.
2.  Find the token you want to deposit (remember, for bridged assets, this must be the **Wormhole-wrapped version** that's now in your Solana wallet).
3.  In the "Deposit" section or column for that token, enter the **amount** you wish to deposit.
    *   *Tip: Many dApps offer a "Max" button to auto-fill your entire wallet balance of that specific token.*
4.  Click the main **"Deposit"** button (it might be a general button, or one per token depending on the interface).
5.  Your wallet will pop up to confirm the transaction. Review all details carefully.
6.  Approve the transaction in your wallet.
7.  Success! You'll receive wLQI tokens in your Solana wallet, representing your share of the pool.

**Understanding Deposit Costs:**
*   **Dynamic Pool Fee/Bonus**: As explained above, this is calculated by the on-chain program based on the token's current weight vs. its target weight.
*   **Solana Network Fees**: Standard Solana transaction fees (in SOL).
*   **Bridging Costs (for non-Solana assets)**: As detailed in the manual bridging section, you cover these when bringing assets over. Our **deposit bonus is designed to help offset these specific costs**.

**Viewing Your Pool Position:**
*   Your **wLQI balance** will be visible in your Wallet Profile Panel (if the dApp has one) and usually on the Pool page itself if you hold wLQI.
*   You can estimate the total value of your wLQI by multiplying `(Your wLQI Balance) * (Current wLQI Token Value)`.

**How to Withdraw Liquidity:**
1.  On the Pool page, go to the **Token Table** or a dedicated "Withdraw" section.
2.  You'll typically specify how much of your **wLQI tokens you want to burn** (spend/redeem).
3.  Then, you'll choose **which underlying token you want to receive** from the pool.
4.  The interface will estimate how much of that chosen output token you'll get for your wLQI.
5.  Click the main **"Withdraw"** button.
6.  Review and approve the transaction in your wallet.
7.  Once confirmed, your wLQI tokens are burned, and you'll receive the chosen output token in your Solana wallet.

**Special Case: Withdrawing Delisted Tokens:**
If a token is ever removed (delisted) from the pool, there will usually be a specific mechanism (like a "full delisted withdraw" option) to allow you to recover your share of that specific asset by burning your wLQI.

**Understanding Withdrawal Costs:**
*   **Dynamic Pool Fee/Bonus**: Similar to deposits, fees/bonuses can apply based on whether the token you're withdrawing is over or underweight in the pool.
*   **Solana Network Fees**: Standard Solana transaction fees (in SOL).

## 4. Customizing Your Experience: Application Settings

Fine-tune your wLiquify dApp experience via the Settings modal.

**Accessing Settings:**
*   Look for a **gear icon (⚙️)**, usually located in the dApp's header or main menu.

**Common Settings You Can Adjust:**
*   **RPC Endpoint**:
    *   This tells the dApp which Solana network node to talk to for data and transactions.
    *   You can often stick with the default, or input a custom RPC URL from a provider you trust (this can sometimes offer better performance or privacy).
    *   **Crucial**: Make sure your chosen RPC endpoint matches the network you intend to use (e.g., Mainnet-beta for real funds, Devnet for testing).
*   **Transaction Priority (Fee Level)**:
    *   This lets you pay a slightly higher (optional) priority fee to Solana validators to encourage them to process your transaction faster, especially during busy network times.
    *   Options often include predefined levels like **Normal, Fast, Turbo**, which use current market rates for these priority fees, or sometimes a **Custom** option to set your own.
    *   Higher priority = potentially faster confirmation, but slightly higher SOL cost.
*   **Max Priority Fee Cap (SOL)**:
    *   If you set a custom priority fee, this can be a safety cap – the maximum you're willing to pay for that priority portion, preventing unexpectedly high fees.
*   **Slippage Tolerance (BPS - Basis Points)**:
    *   This is mainly for **swaps** (via Jupiter). It defines how much you're willing to let the price change between when you submit your swap and when it actually confirms on the blockchain. It's entered in Basis Points (where 100 BPS = 1%). For example, 50 BPS is 0.5% slippage.
*   **Profile & Display Settings (if available)**:
    *   **Preferred Language**: Change the dApp's display language.
    *   **Preferred Currency**: Choose the fiat currency (e.g., USD, EUR) for displaying monetary values.
    *   **Number Format**: Customize how numbers (decimals, thousands separators) are shown.
    *   **Preferred Explorer**: Select your favorite blockchain explorer (e.g., Solscan, Solana Explorer) so when you click a transaction hash, it opens in your chosen explorer.

## 5. Network Awareness: Critical Information

*   The dApp will usually display the **name of the network** it's currently set to use (based on your RPC Endpoint setting) – often in the header or near the Swap/Pool sections.
*   **SUPER IMPORTANT**: Always, always ensure your **connected wallet is set to the EXACT SAME network** as the dApp shows (e.g., both on Mainnet-beta, or both on Devnet). If they don't match, you can experience:
    *   Incorrect display of your token balances or available token lists.
    *   Transactions failing mysteriously.
    *   Worst case: accidentally sending a transaction on a network you didn't intend to use!

## 6. Staying Safe: Security & Best Practices

DeFi is exciting, but it requires caution. For a full guide on using wLiquify safely, including tips on verifying website URLs, being smart about transaction approvals, managing your RPC endpoints, and keeping your wallet secure, please refer to our dedicated **[Security & Best Practices Guide](./best-practices.md)**.

*(Standard Disclaimer: This documentation is for informational purposes only. All cryptocurrency investments and DeFi activities carry inherent risks. Always do your own thorough research (DYOR) before making any financial decisions.)*

## 7. Troubleshooting Common Hiccups

Even in the best dApps, you might occasionally run into a snag. Here are some common issues and how to solve them:

### Wallet Connection Problems
1.  **Wallet Not Detecting the dApp Network or Vice-Versa?**
    *   As mentioned in Section 5, **ensure your wallet is set to the correct Solana network** (e.g., Mainnet-beta) AND that the dApp's RPC setting also points to the same network.
    *   Try a simple page refresh in your browser.
    *   If issues persist, try clearing your browser's cache and cookies for the wLiquify dApp site, then reconnect.

2.  **Transactions Seem to Fail or Get Stuck?**
    *   **Check Your SOL Balance**: Do you have enough SOL in your wallet to cover the network transaction fees? (These are usually small on Solana but always needed).
    *   **Slippage Too Tight?** For swaps, if the market is volatile, your transaction might fail if the price moves beyond your slippage tolerance before it confirms. You might need to slightly increase slippage (with caution) or try again when the market is calmer.
    *   **Sufficient Token Balance?** Do you actually have the amount of tokens you're trying to send/deposit?
    *   **Network Congestion?** Sometimes Solana (like any blockchain) can get busy. You might try increasing the transaction priority fee in the dApp settings, or simply wait a bit and try again.

### Bridging Specific Issues
1.  **Token Verification Glitches?**
    *   **Triple-check token addresses** you copy and paste, especially between different chains/tools.
    *   Ensure the token you're trying to bridge is indeed supported by Wormhole NTT and is whitelisted for deposit in the wLiquify pool.

2.  **Bridge Transaction Failing on Source or Target Chain?**
    *   **Gas, Gas, Gas!** Ensure you have sufficient gas (native currency like ETH on Ethereum, MATIC on Polygon, BNB on BSC) on the *source chain* to initiate the bridge, AND enough SOL on Solana to handle the receive side.
    *   Again, check for network congestion on both chains involved.
    *   **Always save your transaction hashes (IDs)** from the bridge. If a bridge transaction gets stuck, these are vital for seeking support from the bridge provider (e.g., Wormhole support channels).

### Pool Interaction Problems (Deposits/Withdrawals)
1.  **Deposit Failing?**
    *   Are you trying to deposit the correct **Wormhole-wrapped version** of the token (if it was bridged)? You can't deposit the native Ethereum version of ETH directly into our Solana pool, for example.
    *   Is the token whitelisted and active in our pool?
    *   Sufficient SOL for fees?

2.  **Withdrawal Failing?**
    *   Sufficient wLQI balance to cover the withdrawal?
    *   Is the token you're trying to withdraw still actively supported (not delisted)?
    *   Sufficient SOL for fees?

### When in Doubt, How to Get Help:
*   Our **[Discord community](https://discord.gg/wliquify)** is a great place to ask questions. Many helpful community members and team reps are there.
*   Use a Solana block explorer like **[Solana Explorer](https://explorer.solana.com)** or **Solscan** to check the status of your transactions if you have the transaction hash.
*   For persistent or complex issues, look for official wLiquify support channels (usually detailed in our Discord or on our main website).
*   If you suspect a bug, reporting it via our GitHub repository (if public) or to the team is appreciated! 