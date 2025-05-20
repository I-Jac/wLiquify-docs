---
sidebar_position: 1
---

# Jupiter Aggregator Integration

## Overview

wLiquify integrates with the Jupiter Aggregator to provide users with efficient token swaps and access to broad liquidity across the Solana DeFi ecosystem. This integration leverages Jupiter's capabilities for route optimization and price discovery, allowing users interacting with wLiquify to achieve favorable execution for swaps that may involve assets not directly in the wLiquify pool or for optimizing entry/exit into wLQI itself.

The integration ensures that users benefit from Jupiter's price aggregation while seamlessly interacting with wLiquify's unique pool mechanics, such as its dynamic fee structures and direct wLQI minting/burning for supported assets.

## Integration Mechanics

The integration focuses on two main aspects: facilitating swaps via Jupiter and connecting Jupiter-sourced liquidity with the wLiquify pool's native deposit/withdrawal functions.

### 1. Swap Facilitation via Jupiter
-   **Route Optimization**: When a user intends to swap tokens, particularly those not directly paired within the wLiquify pool or for acquiring a token needed for deposit, wLiquify can leverage Jupiter's API to find the most efficient swap routes across the Solana ecosystem.
-   **Price Discovery**: Jupiter provides aggregated pricing from various DEXs and liquidity sources, ensuring users receive competitive rates.
-   **Transaction Execution**: Swaps identified through Jupiter are executed via Jupiter's transaction mechanisms, potentially involving multiple hops across different liquidity venues on Solana.

### 2. wLiquify Pool Interaction
While Jupiter handles the external swap execution, the wLiquify protocol's own smart contracts manage direct interactions with its liquidity pool:
-   **Deposits**: Users deposit supported tokens into the wLiquify pool and receive wLQI tokens in return. The amount of wLQI minted is based on the value of the deposited assets (determined by oracle prices, including Pyth feeds for wrapped tokens) and the pool's dynamic fee/bonus structure, which considers the token's current weight relative to its target dominance.
-   **Withdrawals**: Users burn wLQI tokens to withdraw a proportional share of an underlying asset. Similar to deposits, oracle prices and the dynamic fee/bonus structure influence the amount of underlying asset received.
-   **Fee Calculation**: wLiquify's on-chain program calculates fees (or bonuses) for deposits and withdrawals based on the specific token, its deviation from target dominance, and base fee parameters.

## Technical Aspects of the Integration

### On-Chain (wLiquify Protocol)
-   **Smart Contracts**: The wLiquify pool program handles its core logic: `deposit`, `withdraw`, `update_total_value`, etc. It does not directly call Jupiter's on-chain programs. Instead, the integration is typically at the application/UI layer or via intermediary services.
-   **Price Feeds**: wLiquify relies on its dual oracle system: the custom on-chain oracle for token dominance and Pyth price feed IDs, and directly on Pyth (or other primary oracles) for real-time price data of the underlying assets.

### Off-Chain / Application Layer (Where Jupiter is Leveraged)
-   **Jupiter SDK/API**: The wLiquify user interface or an intermediary layer integrates with Jupiter's SDK or API to:
    -   Fetch available swap routes and quotes.
    -   Construct transactions for execution through Jupiter if a user chooses a Jupiter-facilitated swap.
-   **User Experience**: The goal is to provide a seamless experience where users can either interact directly with the wLiquify pool (deposit/withdraw) or leverage Jupiter for broader swap capabilities, all within the wLiquify dApp context.

## Swap and Interaction Flow (Conceptual)

### Scenario 1: User Swaps via Jupiter (e.g., USDC to SOL, then deposits SOL into wLiquify)
1.  **Route Discovery (Jupiter)**: User wishes to obtain SOL to deposit into wLiquify, starting with USDC. The wLiquify dApp, via Jupiter API, finds the best USDC -> SOL route.
2.  **Execution (Jupiter)**: User approves the swap. The transaction is executed through Jupiter's contracts.
3.  **Deposit (wLiquify)**: User now has SOL and initiates a deposit into the wLiquify pool. The wLiquify `deposit` instruction is called, minting wLQI to the user based on the value of SOL and pool conditions.

### Scenario 2: User Interacts Directly with wLiquify Pool
1.  **Deposit Flow (wLiquify)**:
    -   User selects a supported token (e.g., SOL) to deposit.
    -   wLiquify dApp verifies token and fetches current price from Pyth (via price feed ID from wLiquify's custom oracle).
    -   On-chain program calculates fees/bonuses based on SOL's current vs. target dominance and mints wLQI tokens to the user.
2.  **Withdraw Flow (wLiquify)**:
    -   User selects an underlying asset to withdraw by burning wLQI.
    -   wLiquify dApp verifies token and fetches its current price.
    -   On-chain program calculates fees/bonuses and transfers the proportional amount of the chosen asset to the user, burning their wLQI.

## Resources

For more information on the components involved:

-   **Jupiter Aggregator**:
    -   [Jupiter Documentation](https://docs.jup.ag)
-   **wLiquify Protocol**:
    -   Refer to other sections of this documentation for details on the Pool Program, Oracle Program, and Core Concepts. 