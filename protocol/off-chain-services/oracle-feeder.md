---
sidebar_position: 2
---

# Off-Chain Oracle Feeder Service: Data Engine for the wLiquify Index

## 1. Introduction and Purpose

The Oracle Feeder Service (internally often referred to as the `wLiquify-Oracle` automated process) is a critical off-chain component responsible for the meticulous sourcing, rigorous processing, and timely delivery of accurate market data to the custom on-chain wLiquify Oracle Program. This data forms the backbone of the wLiquify ecosystem's ability to maintain a dynamically composed and accurately valued crypto index.

The primary data points supplied by this service include:
-   **Target Market Dominance (Weights):** Calculated desired proportions for each token within the wLiquify index, guiding the rebalancing mechanisms.
-   **Solana Mint Addresses:** The official on-chain addresses for these tokens, particularly crucial for their Wormhole-wrapped versions commonly used on Solana.
-   **Pyth Network Price Feed Identifiers (`price_feed_id`):** The specific public keys of Pyth Network price data accounts corresponding to each token. This enables the wLiquify Liquidity Pool program to fetch live, high-fidelity prices directly from Pyth for valuation.

By keeping the on-chain Oracle Program updated with this curated information, the Feeder Service ensures that other wLiquify smart contracts, especially the Liquidity Pool Program, can make informed, data-driven decisions regarding dynamic fee calculations, index rebalancing, and overall asset valuation.

## 2. Conceptual Architecture & Key Responsibilities

The Oracle Feeder Service is an automated off-chain system that manages the entire lifecycle of data provision to the on-chain Oracle Program. Its fundamental responsibilities are:

1.  **Comprehensive Data Sourcing:** Actively fetches raw market data from a variety of reputable external sources. This includes:
    *   Primary oracle networks like Pyth Network (for discovering available price feed accounts and their details).
    *   Market data aggregation APIs (such as CoinGecko, CoinMarketCap, or similar providers) for information like market capitalizations, token metadata, and native chain addresses.
2.  **Token Identification, Filtering, and Selection:** Implements logic to identify tokens relevant for inclusion in the wLiquify index (e.g., based on criteria like "Top X by market capitalization"). This stage also involves applying predefined exclusion filters (e.g., to omit stablecoins, certain exchange-specific tokens, or other asset types not aligned with the index's goals).
3.  **Cross-Chain Address Resolution:** For tokens originating on other blockchains (e.g., Ethereum), this service resolves their native chain addresses to their corresponding Wormhole-wrapped (or Native Token Transfer - NTT) mint addresses on the Solana blockchain. This often involves interacting with Wormhole-related services or SDKs conceptually.
4.  **Target Dominance Calculation:** Determines the target market dominance (i.e., target weight) for each selected token within the wLiquify index. This calculation is typically based on the token's market capitalization relative to the total market capitalization of all other tokens selected for the index. The resulting dominance figures are crucial for the pool's rebalancing incentives.
5.  **Data Formatting and Serialization:** Structures all collected and processed data (including token symbol, calculated dominance, Solana mint address, Pyth price feed ID as a string, and a current timestamp) into the precise `TokenInfo` data format expected by the on-chain Oracle Program. This formatted data is then serialized into a binary format (e.g., using Borsh) suitable for efficient on-chain storage and processing.
6.  **Permissioned On-Chain Data Submission:** Securely sends the batched, serialized `TokenInfo` data to the on-chain Oracle Program by invoking its specific data update instructions (namely `process_token_data` for submitting batches and `aggregate_oracle_data` for merging them into the main store). This submission is performed using a designated `authority` keypair.

This Feeder Service is designed to operate continuously or on a frequent schedule. Different data sourcing and processing tasks may run at varying intervals based on the volatility and update frequency of the source data (e.g., extensive data gathering like discovering new Pyth feed IDs or resolving native-to-Solana addresses might occur less frequently, such as hourly, while market cap updates, dominance recalculations, and on-chain data pushes could happen more often, like every 10-15 minutes).

## 3. Operational & Configuration Requirements (Conceptual)

For the Oracle Feeder Service to operate effectively, several foundational elements and configurations are necessary:

### 3.1. Core Operational Prerequisites:
-   **Automated Runtime Environment:** A system capable of running automated tasks or scripts (e.g., a server environment with Node.js or a similar runtime for background processes).
-   **Software Dependencies & Libraries:** Access to necessary libraries for blockchain interaction (e.g., Solana SDKs like `@solana/web3.js` for transaction building and submission, and potentially Anchor client libraries for streamlined interaction with Anchor-based programs like the on-chain Oracle Program), data fetching (HTTP clients), and data serialization (e.g., a Borsh implementation).
-   **API Keys & Access Credentials:** If sourcing data from restricted or premium tiers of external data APIs, valid API keys or access credentials are required.
-   **Dedicated Solana Wallet/Keypair (`authority`):** A unique Solana keypair must be designated as the `authority` for publishing data to the on-chain Oracle Program. This keypair's account must be funded with sufficient SOL to cover transaction fees for on-chain submissions.
-   **Ancillary Configuration Data:** The service might rely on supplementary configuration files (e.g., JSON files) that provide initial lists of tokens to consider, known Solana mint addresses, or pre-identified Pyth feed addresses. These can serve as starting points or supplementary data for its processing logic, and may be updated manually or semi-automatically as part of operational procedures.

### 3.2. Key Environment Variables (Conceptual Configuration Parameters):
Critical operational parameters for the Feeder Service are typically managed as environment variables for security and flexibility:

*   `RPC_URL`: The URL of a reliable Solana RPC (Remote Procedure Call) node, enabling communication with the Solana blockchain.
*   `PUBLISHER_PRIVATE_KEY` or `PATH_TO_KEYPAIR_FILE`: Securely provides the private key (or a path to the keypair file) for the Solana `authority` account that is authorized to publish data to the on-chain Oracle Program.
*   `ORACLE_PROGRAM_ID`: The Program ID (on-chain address) of the custom wLiquify on-chain Oracle Program that this service feeds.
*   `ORACLE_AGGREGATOR_ACCOUNT_PDA`: The public key of the on-chain Oracle Program's main data storage account (the `AggregatedOracleData` PDA). This is often derived using known seeds and the `ORACLE_PROGRAM_ID`.
*   `ORACLE_UPDATE_INTERVAL_MINUTES` (or similar naming): Defines the primary frequency (e.g., in minutes) at which the main oracle update cycle (data fetching, processing, and on-chain submission) is intended to run.
*   Other potential variables might include URLs for specific data source APIs (e.g., a `PYTH_DATA_URL`), parameters for data filtering criteria, or batch size limits for on-chain submissions.

## 4. Data Pipeline: Sourcing, Processing, and On-Chain Submission Logic

The Oracle Feeder Service executes a sophisticated, multi-stage pipeline to gather external market information, refine it into the protocol-specific format, and submit it securely to the on-chain Oracle Program. This process can be conceptually broken down as follows:

### 4.1. Stage 1: Foundational Data Acquisition (Scheduled, Less Frequent, e.g., Hourly)

This stage involves gathering relatively stable but essential baseline data.

1.  **Pyth Network Price Feed ID Discovery (Conceptual Task: `DiscoverPythFeeds`)**:
    *   **Objective**: To identify and maintain an up-to-date mapping of cryptocurrencies to their corresponding Pyth Network price feed account public keys.
    *   **Process**: Involves querying Pyth Network data sources (e.g., its published lists of active price feeds or on-chain registries). The collected Pyth feed IDs (Pubkeys) are typically cached or stored intermediately by the service for use in later stages, ensuring the feeder knows which Pyth account provides the price for which asset symbol.

2.  **Native Address Discovery & Solana Wrapped Address Mapping (Conceptual Tasks: `FindNativeAddresses`, `ResolveToSolanaWrappedAddresses`)**:
    *   **Objective**: To find the native blockchain addresses (e.g., Ethereum contract addresses) for a broad list of cryptocurrencies and then resolve these to their corresponding Wormhole-wrapped (or NTT) mint addresses on the Solana blockchain.
    *   **Process**:
        *   Gathers token symbols and their native chain information (blockchain and address) from multiple sources (e.g., CoinMarketCap, CoinGecko APIs, potentially curated lists).
        *   Applies various filters based on protocol criteria (e.g., exclude stablecoins, CEX tokens, specific blacklisted symbols or chains not relevant to the wLiquify index).
        *   Utilizes Wormhole SDK functionalities or interacts with Wormhole services for supported chains (e.g., Ethereum, Polygon) to convert these native L1/L2 addresses to their equivalent Solana (wrapped) mint addresses.
        *   The resolved Solana mint addresses are cached or stored intermediately for subsequent use.

### 4.2. Stage 2: Index Composition, Calculation, and On-Chain Update (Scheduled, More Frequent, e.g., Every 10-15 Minutes)

This stage focuses on dynamic data that changes more frequently and involves direct updates to the on-chain oracle.

1.  **Market Data Fetching, Index Selection, Formatting (Conceptual Task: `PrepareIndexData`)**:
    *   **Objective**: To fetch current market data (especially market capitalizations), select the specific tokens that will form the current wLiquify index, calculate their target dominance, and format this information into `TokenInfo` objects for on-chain submission.
    *   **Process**:
        *   Fetches the latest market data, with a strong emphasis on current market capitalizations, from reliable sources (e.g., CoinMarketCap, CoinGecko).
        *   Applies exclusion filters (e.g., based on token tags like "stablecoin", or liquidity criteria).
        *   Cross-references the filtered list of tokens with the previously gathered Pyth price feed IDs and resolved Solana mint addresses. This ensures that only tokens that can be priced via Pyth and are verifiably present on Solana (as wrapped assets) are considered for the index.
        *   Sorts these valid, priceable tokens by a primary criterion, usually market capitalization, to select the top N (e.g., Top 30 or Top 50) tokens for the index.
        *   **Target Dominance Calculation**: For each token in this selected set, calculates its target market dominance. This is conceptually `(Token's Market Capitalization / Total Market Capitalization of All Selected Tokens in the Set)`. This resulting ratio (a value between 0 and 1) is then typically scaled to a large integer format (e.g., by multiplying by 10<sup>10</sup> or a similar factor) and prepared for on-chain storage as a `u64` integer (as per the `TokenInfo.dominance` field).
        *   Constructs `TokenInfo` data objects for each selected token. Each object includes its symbol, the calculated scaled dominance, its resolved Solana mint address, the identified Pyth PriceFeedID (as a string representation of the Pubkey), and a current Unix timestamp to mark the data's freshness.
        *   Divides the complete list of `TokenInfo` objects into smaller batches suitable for efficient on-chain submission (e.g., 5 tokens per batch, to align with the on-chain Oracle Program's `process_token_data` instruction batch limit).

2.  **Data Serialization for On-Chain Format (Conceptual Task: `SerializeTokenInfoBatches`)**:
    *   **Objective**: To convert the batched `TokenInfo` objects (which are in the Feeder Service's internal representation, e.g., JavaScript objects) into the precise binary (Buffer or byte array) format expected by the Solana on-chain Oracle Program. This is typically done using a serialization scheme like Borsh.
    *   **Process**: For each `TokenInfo` object within a batch:
        *   Converts string fields like `Symbol`, `Address` (Solana mint Pubkey as string), and `PriceFeedID` (Pyth price account Pubkey as string) into fixed-size byte arrays, padding with null bytes where necessary to match the on-chain struct definition (e.g., 10 bytes for Symbol, 64 bytes each for Address and PriceFeedID strings before they are stored as Pubkey bytes on-chain).
        *   Ensures that numerical fields like `Dominance` are represented as the correct integer type (e.g., `BigInt` that can be serialized to `u64`) and `Timestamp` as an `i64` integer.
        *   Utilizes a Borsh schema (or equivalent serialization logic) that precisely matches the on-chain `TokenInfo` Rust struct definition to serialize each object into a compact byte buffer.

3.  **Transmitting Batched Data to the Solana Oracle Program (Conceptual Task: `SubmitBatchesToSolana`)**:
    *   **Objective**: To take the serialized batches of token data and transmit them to the on-chain Oracle Program, thereby updating its stored state with the latest curated information.
    *   **Process (Simplified Logical Flow)**:
        *   **Connection & Authorization Setup**: Establishes a connection to the Solana network using the configured `RPC_URL`. Loads the `PUBLISHER_PRIVATE_KEY` to enable signing transactions as the designated `authority` for the on-chain Oracle Program.
        *   **Account Address Derivation**: Programmatically derives the PDA addresses for the main `AggregatedOracleData` account (the central on-chain data store) and the temporary `OracleData` accounts (for each batch being submitted), using the known seeds and the Oracle Program ID.
        *   **Interaction with On-Chain Oracle Program Instructions**:
            1.  Ensures the main `AggregatedOracleData` account is initialized. (This is typically a one-time setup, but the service might check or attempt to call the `initialize` instruction if it detects the account doesn't exist, though this is usually handled out-of-band during initial deployment.)
            2.  For each batch of serialized `TokenInfo` data:
                *   Constructs and sends a transaction that calls the `process_token_data` instruction on the on-chain Oracle Program. This instruction takes the `batch_index` and the vector of serialized `TokenInfo` byte buffers as input. The on-chain program then writes this data to the corresponding temporary `OracleData` PDA for that batch index.
            3.  (Optional Strategy) Before initiating aggregation, the service might call the `reset_aggregator` instruction if the operational strategy is to completely rebuild the aggregated data with each full update cycle. This ensures no stale data from a previous, potentially different set of tokens, persists.
            4.  For each temporary `OracleData` PDA that was populated with a batch in step 2:
                *   Constructs and sends a transaction that calls the `aggregate_oracle_data` instruction. This instruction merges the data from the specified temporary `OracleData` batch account into the main `AggregatedOracleData` account and subsequently closes the temporary account (reclaiming its rent).
            5.  (Optional but Recommended for Freshness) May call the `cleanup_stale_tokens` instruction, providing the current run's timestamp. This removes any entries from `AggregatedOracleData` that were not part of this specific update run, ensuring the on-chain data accurately reflects only the latest, complete dataset from the feeder.
        *   Logs the success or failure of each on-chain transaction, including transaction signatures for auditing and troubleshooting.

This comprehensive, multi-stage, and typically scheduled process ensures that the on-chain Oracle Program is consistently and reliably updated with fresh, processed, and validated market data. This makes the Oracle Feeder Service an indispensable component, forming the informational backbone that enables the wLiquify protocol to maintain its dynamically rebalanced, asset-backed crypto index with accuracy and integrity. 