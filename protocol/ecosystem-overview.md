---
sidebar_position: 1
slug: /developer-docs/overview
---

# Developer Overview: System Architecture

Welcome, developers! This section provides a technical overview of the wLiquify protocol's architecture, detailing how its various on-chain and off-chain components interact to deliver a comprehensive liquidity solution on Solana.

Understanding this architecture is key to integrating with, contributing to, or building upon the wLiquify ecosystem.

## Core Components & Interaction Flow

The wLiquify ecosystem comprises the following key components:

1.  **Frontend dApp (`wLiquify DApp`)**:
    *   **Role**: The user-facing application built using modern web technologies (e.g., React, TypeScript).
    *   **Interaction**: Communicates with users' Solana wallets (e.g., Phantom, Solflare) to sign transactions and interacts directly with the `Liquidity Pool Program` for core DeFi operations (deposits, withdrawals). It may also query the `Oracle Program` (or derived data) for displaying token metrics.
    *   **Current Process**: Supports manual bridging through Wormhole NTT, with plans for automated cross-chain routing in the future.
    *   Relevant Doc: [wLiquify Frontend dApp User Guide](../user-guides/dapp-guide.md)

2.  **Liquidity Pool Program (`w-liquify-pool`)**:
    *   **Role**: The primary on-chain Solana program (written in Rust using Anchor framework) that manages the multi-asset liquidity pool.
    *   **Functionality**: 
        - Handles logic for token deposits, wLQI LP token minting, withdrawals (burning wLQI for underlying assets)
        - Implements dynamic fee calculations and deposit bonus mechanism
        - Manages token vaults and pool rebalancing
        - Calculates deposit bonuses to offset bridging costs
    *   **Dependencies**: Critically relies on the `Oracle Program` for token pricing information (via price feed IDs) and token dominance metrics to calculate dynamic fees and maintain pool health.
    *   **Deposit Bonus**: Implements a bonus mechanism that exceeds typical bridging costs to incentivize cross-chain liquidity.
    *   Relevant Doc: [Liquidity Pool Program Details](./on-chain-programs/pool-program.md)

3.  **Oracle Program (`oracle_program`)**:
    *   **Role**: A custom on-chain Solana program (Rust/Anchor) designed to aggregate and serve specific market data not directly available from primary oracles like Pyth in the exact format needed by the `Liquidity Pool Program`.
    *   **Functionality**: 
        - Stores and provides data such as token symbols, market dominance percentages
        - Provides direct `price_feed_id` (e.g., Pyth price account Pubkey) for each supported token
        - Calculates token weights and dominance for fee/bonus calculations
    *   **Data Flow**: Receives data from the off-chain `Oracle Feeder Script`.
    *   Relevant Doc: [Oracle Program Details](./on-chain-programs/oracle-program.md)

4.  **Oracle Feeder Script (`wLiquify-Oracle`)**:
    *   **Role**: An off-chain Node.js/TypeScript service.
    *   **Functionality**: 
        - Fetches raw market data from primary sources (e.g., Pyth network data, CoinGecko API)
        - Processes data for symbol resolution and native address mapping to Solana via Wormhole
        - Calculates dominance and resolves feed IDs
        - Pushes processed data into the on-chain `Oracle Program`
    *   **Interaction**: Writes to the `Oracle Program` by calling its `process_token_data` and `aggregate_oracle_data` instructions.
    *   Relevant Doc: [Oracle Feeder Script Details](./off-chain-services/oracle-feeder.md)

5.  **Pool Maintainer Script (`poolMaintainer`)**:
    *   **Role**: An off-chain Node.js/TypeScript automated bot.
    *   **Functionality**: 
        - Performs essential maintenance tasks for the `Liquidity Pool Program`
        - Updates pool's TVL based on current oracle prices
        - Manages supported tokens and their weights
        - Handles cleanup of historical data for delisted tokens
    *   **Interaction**: Calls administrative/maintenance instructions on the `Liquidity Pool Program`.
    *   Relevant Doc: [Pool Maintainer Script Details](./off-chain-services/pool-maintainer.md)

## Future Automation Plans

The protocol is designed with future automation in mind:

1. **Cross-Chain Integration**
   - Automated bridging through Wormhole NTT
   - Integrated frontend routing
   - Reduced manual steps
   - Better cost optimization

2. **Enhanced User Experience**
   - One-click bridging
   - Automated token purchases
   - Integrated deposit process
   - Better error handling

3. **Technical Improvements**
   - Direct token bridging
   - Automated route selection
   - Real-time fee comparison
   - Status tracking

## Key Interaction Points for Developers

*   **Frontend -> Pool Program**: Direct invocation of `deposit` and `withdraw` instructions.
*   **Pool Program -> Oracle Program Data**: The `PoolConfig` account in the Pool Program stores the address of the `Oracle Program`'s `AggregatedOracleData` account. The Pool Program's logic reads from this account to get token prices (indirectly, by getting the `price_feed_id` to use with Pyth) and dominance for fee calculations.
*   **Oracle Feeder -> Oracle Program**: The feeder is the authority that writes data into the `Oracle Program`.
*   **Pool Maintainer -> Pool Program**: The maintainer calls specific crank/admin functions on the Pool Program.

This layered architecture is designed for modularity, allowing each component to focus on its specific responsibilities while ensuring data consistency and reliability across the ecosystem.

*(Note: This documentation will be updated as the protocol evolves and automation features are implemented.)*

**(Diagram Placeholder: A more detailed architectural diagram focusing on data flows and transaction interactions between these components would be very useful here for developers.)** 