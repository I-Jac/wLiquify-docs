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
    *   Relevant Doc: [wLiquify Frontend dApp User Guide](../user-guides/dapp-guide.md)

2.  **Liquidity Pool Program (`w-liquify-pool`)**:
    *   **Role**: The primary on-chain Solana program (written in Rust using Anchor framework) that manages the multi-asset liquidity pool.
    *   **Functionality**: Handles logic for token deposits, wLQI LP token minting, withdrawals (burning wLQI for underlying assets), dynamic fee calculations, and managing token vaults.
    *   **Dependencies**: Critically relies on the `Oracle Program` for token pricing information (via price feed IDs) and token dominance metrics to calculate dynamic fees and maintain pool health.
    *   Relevant Doc: [Liquidity Pool Program Details](./on-chain-programs/pool-program.md)

3.  **Oracle Program (`oracle_program`)**:
    *   **Role**: A custom on-chain Solana program (Rust/Anchor) designed to aggregate and serve specific market data not directly available from primary oracles like Pyth in the exact format needed by the `Liquidity Pool Program`.
    *   **Functionality**: Stores and provides data such as token symbols, market dominance percentages, and crucially, the direct `price_feed_id` (e.g., Pyth price account Pubkey) for each supported token.
    *   **Data Flow**: Receives data from the off-chain `Oracle Feeder Script`.
    *   Relevant Doc: [Oracle Program Details](./on-chain-programs/oracle-program.md)

4.  **Oracle Feeder Script (`wLiquify-Oracle`)**:
    *   **Role**: An off-chain Node.js/TypeScript service.
    *   **Functionality**: Fetches raw market data from primary sources (e.g., Pyth network data, CoinGecko API for symbol resolution and native address mapping to Solana via Wormhole). It processes this data (calculates dominance, resolves feed IDs) and then pushes it into the on-chain `Oracle Program` through signed transactions.
    *   **Interaction**: Writes to the `Oracle Program` by calling its `process_token_data` and `aggregate_oracle_data` instructions.
    *   Relevant Doc: [Oracle Feeder Script Details](./off-chain-services/oracle-feeder.md)

5.  **Pool Maintainer Script (`poolMaintainer`)**:
    *   **Role**: An off-chain Node.js/TypeScript automated bot.
    *   **Functionality**: Performs essential maintenance tasks for the `Liquidity Pool Program`. This includes calling instructions like `update_total_value` (to refresh the pool's TVL based on current oracle prices), `add_supported_token` (when new tokens are approved and have oracle data), and `cleanup_historical_data` (for delisted tokens).
    *   **Interaction**: Calls administrative/maintenance instructions on the `Liquidity Pool Program`.
    *   Relevant Doc: [Pool Maintainer Script Details](./off-chain-services/pool-maintainer.md)

**(Diagram Placeholder: A more detailed architectural diagram focusing on data flows and transaction interactions between these components would be very useful here for developers.)**

## Key Interaction Points for Developers

*   **Frontend -> Pool Program**: Direct invocation of `deposit` and `withdraw` instructions.
*   **Pool Program -> Oracle Program Data**: The `PoolConfig` account in the Pool Program stores the address of the `Oracle Program`'s `AggregatedOracleData` account. The Pool Program's logic reads from this account to get token prices (indirectly, by getting the `price_feed_id` to use with Pyth) and dominance for fee calculations.
*   **Oracle Feeder -> Oracle Program**: The feeder is the authority that writes data into the `Oracle Program`.
*   **Pool Maintainer -> Pool Program**: The maintainer calls specific crank/admin functions on the Pool Program.

This layered architecture is designed for modularity, allowing each component to focus on its specific responsibilities while ensuring data consistency and reliability across the ecosystem. 