# Swaps

## Overview

wLiquify facilitates token swaps on the Solana blockchain by leveraging the Jupiter Aggregator. This ensures users can access deep liquidity and optimal pricing from a wide range of Solana-based Decentralized Exchanges (DEXs) and liquidity sources. Swaps are performed with SPL tokens already present on Solana; this includes native Solana assets and Wormhole-wrapped tokens that users have bridged from other chains.

The wLiquify dApp aims to provide a seamless swap experience. While the current process for bringing non-Solana native assets to Solana (to make them swappable) is manual (see [Cross-Chain Capabilities](./cross-chain.md) and [Wallet Guide](../getting-started/wallet-guide.md) for bridging guidance), future dApp versions plan to integrate widgets (e.g., for DeBridge and Wormhole) to simplify this on-ramping process.

## Jupiter Integration

wLiquify's core swap functionality is powered by integrating with Jupiter Aggregator:

### Swap Terminal
- Utilizes the Jupiter Aggregator Swap Terminal (or its underlying SDK) for optimal routing.
- Provides access to multiple DEXs and diverse liquidity sources across the Solana ecosystem.
- Aims for best price discovery and efficient execution with minimal slippage.

### Routing System
Jupiter's routing system intelligently finds the best path for a swap:
1. **Price Discovery**:
   - Aggregates price data from numerous on-chain liquidity sources.
   - Calculates optimal routes, potentially involving multiple hops or splits across different DEXs and pools.
   - Considers factors like available liquidity, transaction fees, and potential price impact.
2. **Execution**:
   - Typically executes the swap as a single transaction from the user's perspective.
   - Employs atomic swaps to ensure all legs of a routed trade either complete or fail together.
   - Incorporates slippage protection mechanisms based on user settings.

## Pool Integration as a Liquidity Source

The wLiquify multi-asset liquidity pool can serve as one of the many liquidity sources available to Jupiter Aggregator.

### Swaps Routed Through wLiquify Pool
- If Jupiter determines that routing a portion (or all) of a swap through the wLiquify pool offers the best price for the user, it will do so.
- In such cases, the interaction with the wLiquify pool involves its standard `deposit` and `withdraw` mechanics:
    - To swap Token A for Token B via the pool, Jupiter might execute a deposit of Token A into the pool (minting wLQI to itself or an intermediary) and then an immediate withdrawal of Token B from the pool (burning that wLQI).
- **wLiquify's Dynamic Fees Apply**: For any leg of a swap that interacts directly with the wLiquify pool, the pool's standard fee structure (base fee + dynamic fee based on token dominance) will apply to that specific deposit or withdrawal operation. Jupiter's routing logic would factor these fees into its overall price calculation when deciding if this is the optimal route.
- Price impact within the wLiquify pool is based on its specific composition and the size of the trade leg passing through it, with valuations determined by oracle price feeds.

## Fee Structure

### Swap Fees
- **Jupiter Network Fees**: When executing swaps via Jupiter, standard Solana network transaction fees apply. Jupiter itself may also have a small platform fee integrated into the transaction, which is transparently displayed to the user before confirming a swap.
- **wLiquify Pool Interaction Fees**: If Jupiter routes a swap through the wLiquify liquidity pool (as described in "Pool Integration as a Liquidity Source"), wLiquify's own transaction fees (base fee + dynamic fee) for the specific deposit/withdrawal operations involved in that leg of the swap will be incurred. These are part of the overall cost of the route that Jupiter calculates.

### Price Impact
- Calculated by Jupiter based on the liquidity of the chosen route across all involved DEXs and pools.
- Larger trades generally incur higher price impact.
- Slippage protection, configured by the user, helps mitigate unfavorable price changes during execution.

## Security Features

### Transaction Safety
- **Atomic Execution**: Swaps routed by Jupiter are typically atomic, meaning all parts of the trade succeed or the entire transaction reverts, preventing partial fills that could leave the user in an undesirable state.
- **Slippage Protection**: User-defined slippage tolerance helps protect against excessive price movement between the time of quote and execution.
- **Oracle Verification (for wLiquify Pool Legs)**: If a swap leg interacts with the wLiquify pool, the pool's own oracle price verification for asset valuation and fee calculation will be active for that interaction.

## User Experience

### Swap Interface (Conceptual via wLiquify dApp)
1. **Token Selection**:
   - User chooses the input token (Token A) they wish to swap.
   - User selects the output token (Token B) they wish to receive.
   - The interface, powered by Jupiter, displays available routes and the expected output amount.
2. **Transaction Details**:
   - Clear breakdown of estimated fees (network fees, Jupiter fees, and any implicit wLiquify pool fees if that route is chosen).
   - Estimated price impact.
   - Slippage tolerance settings.
   - Information about the best route found by Jupiter.
3. **Execution**:
   - User confirms the transaction in their wallet.
   - Progress tracking of the swap.
   - Notification of success or failure.
   - Transaction history accessible via wallet and block explorers.

## Best Practices

### For Users
1. **Price Impact & Slippage**:
   - Always check the displayed price impact before confirming a swap, especially for large trades or less liquid tokens.
   - Set an appropriate slippage tolerance. Too low might cause transactions to fail in volatile markets; too high might lead to unfavorable execution prices.
2. **Fee Awareness**:
   - Review the fee breakdown provided by the Jupiter integration.
   - Understand that for complex routes, fees from multiple liquidity sources might be involved.
3. **Security**:
   - Ensure you are interacting with the official wLiquify dApp interface.
   - Verify token contract addresses if manually inputting them (though the dApp should primarily use a curated token list).

### For Developers (Integrating wLiquify Swaps)
1. **Jupiter SDK/API**:
   - Utilize the official Jupiter SDK or API for integrating swap functionalities.
   - Implement robust error handling for API responses and transaction submissions.
   - Ensure clear display of routes, prices, fees, and price impact to users.
2. **Testing**:
   - Test swap integrations thoroughly with small amounts on mainnet or using devnet/testnet environments if available.
   - Verify price calculations and fee structures.

## Future Developments

### Planned Features & Enhancements
1. **Enhanced Routing & Aggregation**:
   - Continued benefits from Jupiter's ongoing improvements in DEX integrations and routing algorithms.
2. **Simplified On-Ramping for Swaps**:
   - **Integrated Bridging Widgets**: Future versions of the wLiquify dApp plan to integrate widgets (e.g., for DeBridge, Wormhole) to streamline the process of bridging assets from other chains to Solana. This will make it easier for users to bring assets like ETH, BTC (wrapped), etc., to Solana so they can then be swapped using the Jupiter integration.
3. **User Interface Improvements**:
   - Continuous refinement of the swap interface in the wLiquify dApp for clarity and ease of use.
   - Better educational tooltips and guides within the dApp.

*(Note: This documentation will be updated as new features are implemented and the protocol evolves.)* 