---
sidebar_position: 1
---

# wLiquify Protocol Architecture

This document provides a technical deep dive into the wLiquify protocol's architecture. It details how its various on-chain and off-chain components interact to deliver a decentralized, asset-backed crypto index and liquidity solution on the Solana blockchain. Understanding this architecture is key for anyone seeking a thorough comprehension of the protocol's inner workings, whether for analysis, integration, or advanced usage.

## Guiding Principles

The wLiquify architecture is built upon several core principles:
-   **Decentralization**: Leveraging Solana's decentralized nature for core logic and state.
-   **Accuracy**: Employing reliable oracle systems (Pyth and a custom oracle) for precise asset valuation and index composition.
-   **Automation**: Using off-chain services for continuous data feeding and pool maintenance, and designing on-chain mechanisms (like dynamic fees) to drive automated rebalancing.
-   **Transparency**: Ensuring key data and program logic are accessible and verifiable on-chain.
-   **Modularity**: Designing components with specific responsibilities to enhance maintainability and clarity.

## Core Components & Interaction Flow

The wLiquify ecosystem is a synergistic blend of on-chain programs and off-chain services:

1.  **User-Facing Application (dApp)**:
    *   **Role**: The primary interface for users to interact with the wLiquify protocol. Typically a web application.
    *   **Key Interactions**:
        *   Connects with users' Solana wallets (e.g., Phantom, Solflare) for transaction signing.
        *   Facilitates deposits into and withdrawals from the `Liquidity Pool Program`.
        *   Provides information about the pool's state, token weights, and potential fees/bonuses by querying on-chain data (directly or indirectly).
        *   Guides users through cross-chain asset bridging (currently a manual process with links to tools like Portal, with future automation planned).
    *   *Further Reading*: While not part of this protocol deep dive, user-facing aspects are covered in the "Getting Started" section, particularly the `dApp Guide`.

2.  **Liquidity Pool Program (`w-liquify-pool`)**:
    *   **Role**: The central on-chain Solana smart contract (developed using Rust and the Anchor framework) that governs the multi-asset liquidity pool. This program is the heart of wLiquify's DeFi capabilities.
    *   **Core Functionality**:
        *   **Asset Management**: Securely holds various supported tokens in distinct program-controlled vaults (PDAs).
        *   **LP Token (wLQI) Mechanics**: Mints wLQI tokens to users upon deposit (representing their share of the pool) and burns wLQI tokens upon withdrawal.
        *   **Transaction Logic**: Implements the `deposit` and `withdraw` instructions, which include precise value calculations based on oracle prices.
        *   **Dynamic Fee System**: Calculates and applies fees or bonuses for deposits and withdrawals based on a token's deviation from its target dominance in the pool, thus incentivizing rebalancing.
        *   **Value Accrual**: The value of wLQI tokens is derived from the total value of assets in the pool.
    *   **Key Dependencies**: Critically relies on data from the `Custom wLiquify Oracle Program` for target token dominances and Pyth price feed identifiers. It uses these Pyth feed IDs to fetch live prices directly from Pyth Network for accurate asset valuation.
    *   *Further Reading*: [Liquidity Pool Program Details](./on-chain-programs/pool-program.md)

3.  **Custom wLiquify Oracle Program (`oracle_program`)**:
    *   **Role**: An on-chain Solana smart contract (Rust/Anchor) that serves as a specialized, authoritative data source for the `Liquidity Pool Program`. It stores curated information essential for index composition and dynamic rebalancing.
    *   **Core Functionality**:
        *   **Data Storage**: Securely stores a list of tokens comprising the wLiquify index, their target market dominance (weights), their Solana mint addresses (especially for wrapped tokens), and their corresponding Pyth Network price feed identifiers.
        *   **Data Provision**: Makes this curated data available on-chain for other authorized programs to read.
    *   **Data Flow**: Receives its data exclusively from the authorized off-chain `Oracle Feeder Service`. The update process is permissioned and transparent.
    *   *Further Reading*: [Custom Oracle Program Details](./on-chain-programs/oracle-program.md)

4.  **Oracle Feeder Service (`wLiquify-Oracle`)**:
    *   **Role**: An automated off-chain service (e.g., a Node.js/TypeScript script).
    *   **Core Functionality**:
        *   **Data Sourcing**: Fetches raw market data from external sources (e.g., Pyth Network for price feed discovery, market data APIs like CoinGecko/CoinMarketCap for market capitalizations and token details).
        *   **Data Processing**:
            *   Identifies the "Top X" tokens based on defined criteria (e.g., market cap).
            *   Calculates their target market dominance for the wLiquify index.
            *   Resolves native token addresses (from chains like Ethereum) to their Solana wrapped mint addresses (e.g., via Wormhole).
            *   Maps tokens to their correct Pyth price feed identifiers.
        *   **Data Submission**: Formats the processed data (symbol, dominance, Solana address, Pyth feed ID, timestamp) and pushes it to the on-chain `Custom wLiquify Oracle Program` by calling its data update instructions (e.g., `process_token_data`, `aggregate_oracle_data`).
    *   *Further Reading*: [Oracle Feeder Service Details](./off-chain-services/oracle-feeder.md)

5.  **Pool Maintainer Service (`poolMaintainer`)**:
    *   **Role**: An automated off-chain bot (e.g., a Node.js/TypeScript script).
    *   **Core Functionality**: Performs routine maintenance tasks crucial for the health and accuracy of the `Liquidity Pool Program`.
        *   **Total Value Update**: Periodically calls the `update_total_value` instruction on the pool program, which recalculates and stores the pool's total value based on current vault balances and live Pyth prices.
        *   **Token List Management**: May assist in automating parts of the token listing/delisting process by triggering `add_supported_token` or `cleanup_historical_data` instructions based on oracle data or predefined conditions.
    *   *Further Reading*: [Pool Maintainer Service Details](./off-chain-services/pool-maintainer.md)

**(Architectural Diagram Placeholder: A visual diagram illustrating these components and their primary interactions – data flows, transaction calls – would significantly aid understanding. Key flows to depict include: user dApp to Pool Program; Pool Program to Custom Oracle & Pyth; Oracle Feeder to Custom Oracle; Pool Maintainer to Pool Program.)**

## Key Data Flows & Dependencies

*   **User Actions & Pool Interaction**: User actions in the dApp (deposits/withdrawals) translate into signed transactions sent to the `Liquidity Pool Program`.
*   **Pool Program's Need for Oracle Data**:
    *   For **valuation**: The `Liquidity Pool Program` uses `price_feed_id`s (obtained from the `Custom wLiquify Oracle Program`) to query Pyth Network for live asset prices. This is essential for calculating the value of deposits/withdrawals and the pool's total value.
    *   For **dynamic fees/rebalancing**: The `Liquidity Pool Program` reads `target dominance` values from the `Custom wLiquify Oracle Program`. It compares these with the actual weights of tokens in the pool (derived from current quantities and Pyth prices) to determine dynamic fees or bonuses.
*   **Feeding the Custom Oracle**: The `Oracle Feeder Service` is the sole authorized entity to write data (token list, dominances, feed IDs) into the `Custom wLiquify Oracle Program`. This is a critical control point ensuring data integrity for the index composition.
*   **Maintaining Pool Accuracy**: The `Pool Maintainer Service` ensures the `Liquidity Pool Program`'s cached `current_total_pool_value_scaled` is regularly updated, reflecting the latest market conditions. It also helps keep the list of supported tokens current.

## Cross-Chain Asset Integration

A fundamental aspect of wLiquify is its ability to include top crypto assets not native to Solana.
*   **Wormhole**: Utilized primarily for bridging assets from other chains to Solana as wrapped tokens. The `Oracle Feeder Service` plays a role in identifying the correct Solana-wrapped mint addresses for these assets.
*   **Pyth Network**: Essential for providing reliable price feeds for these wrapped assets, which might otherwise lack deep liquidity on Solana DEXs.

## Future Enhancements & Automation

The protocol is designed with future evolution in mind, particularly towards increased automation and user experience improvements:
*   **Automated Cross-Chain Routing**: Integrating solutions to simplify the process of bridging assets and depositing them into wLiquify in fewer steps.
*   **Gas Abstraction & Optimization**: Exploring ways to reduce transaction costs and complexity for users.

This layered and modular architecture allows wLiquify to function as a robust and adaptable protocol, aiming to provide transparent, decentralized, and efficient access to a diversified crypto index on Solana. 