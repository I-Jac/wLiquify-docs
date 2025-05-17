---
sidebar_position: 2
slug: /developer-docs/off-chain-services/oracle-feeder
---

# Oracle Feeder Script Details (wLiquify Ecosystem)

## 1. Introduction

### 1.1. Purpose
The oracle feeder scripts are responsible for reliably providing timely and accurate market data to the custom on-chain wLiquify oracle program. This data primarily includes token prices (indirectly via price feed IDs from primary oracles like Pyth) and calculated token dominance metrics. The on-chain oracle program then serves as a data source for other components of the wLiquify ecosystem, such as the automated market maker (AMM) pools, to make informed decisions.

### 1.2. Overview of Technologies Used
-   **Node.js**: The runtime environment for the feeder scripts.
-   **TypeScript**: The programming language used for developing the scripts, providing type safety and better code organization.
-   **External APIs**: Various APIs (e.g., CoinGecko, CoinMarketCap, or exchange APIs) are used to fetch raw market data like prices, market capitalizations, and trading volumes. The `wLiquify-Oracle` specifically mentions scraping Pyth data.
-   **Solana SDKs**:
    -   `@solana/web3.js`: For general interaction with the Solana blockchain (e.g., sending transactions, fetching account info, deriving Program Derived Addresses (PDAs)).
    -   `@coral-xyz/anchor`: Utilized for its utility functions (e.g., `BN` for large numbers, `utils.bytes.utf8.encode` for PDA seed encoding) and potentially for IDL interaction if not building transactions manually.
    -   `borsh`: For serializing data into the compact binary format expected by Solana on-chain programs, ensuring efficient and consistent data representation.
-   **Dotenv**: Library to manage environment variables.

## 2. System Architecture
The oracle feeding process is logically divided into two main components:

1.  **Data Sourcing, Processing, and Logic (`wLiquify-Oracle` repository)**:
    *   **Location**: `wLiquify-Oracle/`
    *   **Primary Entry Point**: `wLiquify-Oracle/src/index.ts`
    *   **Responsibilities**:
        *   Fetching raw market data from external sources (e.g., Pyth).
        *   Filtering and selecting relevant tokens.
        *   Calculating token dominance.
        *   Formatting data for on-chain submission.
        *   Serializing data.
        *   Sending batched data to the Solana on-chain oracle program.
    *   The `wLiquify-Oracle` repository may still be relevant for initial, less frequent data gathering tasks such as:
        *   Discovering and storing Pyth price feed IDs (`scrapeAndWriteData.ts`).
        *   Resolving native token addresses to Solana addresses via Wormhole (`fetchSymbolNativeAddress.ts`, `nativeToSol.ts`).
    *   The outputs of these processes (e.g., lists of Solana mint addresses, Pyth feed IDs) are intended to inform the contents of `mintAddresses.json` and `mockFeedAddresses.json`. These JSON files are critical inputs for `devOracleFeed/src/handles/dataFetchFilterFormat.ts`. The exact mechanism for updating these files (manual update, scripted process based on `wLiquify-Oracle` outputs, or direct generation) should be clearly defined and maintained for the oracle's accuracy. Currently, `devOracleFeed` consumes these files as pre-existing inputs.

2.  **Transaction Sending and Oracle Interaction (`devOracleFeed` repository - primarily for development/testing)**:
    *   **Location**: `devOracleFeed/`
    *   **Primary Entry Point**: `devOracleFeed/src/main.ts`
    *   **Responsibilities (as per `main.ts` which uses manual transaction handlers)**:
        *   Orchestrates the fetching and processing of token data (potentially reusing logic from `wLiquify-Oracle` or its own `dataFetchFilterFormat`).
        *   Constructing and sending transactions to update the on-chain oracle program.
        *   Manages the interaction with specific instructions of the oracle program (e.g., `processTokenDataBatch`, `aggregateSingleOracleData`, `cleanupStaleTokensInstruction`).
    *   **Note**: The user mentioned that in production, `wLiquify-Oracle` would handle the updated transaction flow. `devOracleFeed` seems to represent a more direct or manual way of interacting with the oracle, possibly for development and testing phases, using functions from `solanaTransactionsManual.ts`.

## 3. Setup and Configuration

### 3.1. Prerequisites
-   **Node.js**: Specific version (e.g., v16.x, v18.x or later). Check `package.json` in respective repositories.
-   **npm/yarn**: Package manager for Node.js.
-   **API Keys**: For external data sources if they require authentication (e.g., CoinGecko Pro, CoinMarketCap Pro).
-   **Solana Wallet/Keypair**: A Solana keypair for the account that will publish data to the oracle. This account must have SOL for transaction fees. This keypair corresponds to the `authority` of the on-chain oracle program.
-   **Configuration Files**:
    *   `mintAddresses.json`: A JSON file mapping token symbols to their Solana mint addresses. This file must be located where `devOracleFeed/src/utils/fileReader.ts` expects it (e.g., `devOracleFeed/src/config/mintAddresses.json`).
    *   `mockFeedAddresses.json`: A JSON file mapping token symbols to their (potentially mock or Pyth) price feed account addresses on Solana. This file must be located where `devOracleFeed/src/utils/fileReader.ts` expects it (e.g., `devOracleFeed/src/config/mockFeedAddresses.json`).

### 3.2. Environment Variables
Environment variables are typically managed via a `.env` file in the root of each project (`wLiquify-Oracle` and `devOracleFeed`).

**Common / Essential Variables:**

*   `RPC_URL`: The URL of the Solana RPC node to connect to (e.g., `https://api.mainnet-beta.solana.com` or a custom/private RPC).
*   `PUBLISHER_PRIVATE_KEY` or `PATH_TO_KEYPAIR_FILE`: The private key (as a byte array string) or the file path to the Solana keypair of the oracle data publisher. This account will be the `authority` for the oracle program.
*   `ORACLE_PROGRAM_ID`: The Program ID of the custom wLiquify on-chain oracle program. (From `oracleProgramDetails.md`: `3ZfM451hf9LUizdUL14N1R9fwmsPS8M8ZCGai2nm6SVY`)
*   `ORACLE_AGGREGATOR_ACCOUNT_PDA`: The public key of the oracle's main data account (`AggregatedOracleData`). This is a PDA derived using seeds `[b"aggregator_v2"]` and the `ORACLE_PROGRAM_ID`.
    *   `devOracleFeed/src/main.ts` derives this as:
        ```typescript
        // const aggregatorSeed = "aggregator_v2";
        // const [aggregatorAccountPda] = anchor.web3.PublicKey.findProgramAddressSync(
        //     [anchor.utils.bytes.utf8.encode(aggregatorSeed)],
        //     oracleProgramId
        // );
        ```
*   `ORACLE_UPDATE_INTERVAL_MINUTES`: (Seen in `devOracleFeed/src/main.ts`) Defines how often the oracle update cycle runs. Defaults to 5 minutes if not set.

**`wLiquify-Oracle` Specific Variables (potential):**

*   `PYTH_DATA_URL` or similar for Pyth data scraping.
*   Configuration for token filtering (e.g., min market cap, min volume).
*   CSV file paths if used for intermediate data storage (e.g., `PYTH_DATA_CSV_PATH`, `TOKEN_ADDRESSES_CSV_PATH`).

**`devOracleFeed` Specific Variables (potential):**

*   May reuse some from `wLiquify-Oracle` if `dataFetchFilterFormat` is shared or similar.

### 3.3. Installation
For both `wLiquify-Oracle` and `devOracleFeed` (assuming they are separate Node.js projects):

1.  Clone the respective repository.
2.  Navigate to the project directory: `cd wLiquify-Oracle` or `cd devOracleFeed`.
3.  Install dependencies:
    ```bash
    npm install
    # or
    yarn install
    ```
4.  Create a `.env` file in the root of each project directory and populate it with the necessary environment variables as listed above.
5.  Create and populate `mintAddresses.json` and `mockFeedAddresses.json` in the correct directory as expected by `devOracleFeed/src/utils/fileReader.ts` (e.g., verify the path, often a `config` subdirectory like `devOracleFeed/src/config/`). These files are crucial for token selection and processing.

## 4. Data Sourcing and Processing Logic (Primarily `wLiquify-Oracle/src/index.ts`)

The `wLiquify-Oracle/src/index.ts` script orchestrates several steps, some running hourly and others more frequently (e.g., every 10 minutes). It uses a series of handler functions to perform its tasks.

```typescript
// wLiquify-Oracle/src/index.ts structure
import dotenv from 'dotenv';
import { fetchSymbolNativeAddress } from './handles/fetchSymbolNativeAddress';
import { nativeAddressResults } from './types/nativeAddressResults';
import { nativeToSol } from './handles/nativeToSol';
import { scrapeAndWriteData } from './handles/scrapeAndWriteData';
import { dataFetchFilterFormat } from './handles/dataFetchFilterFormat';
import { serializeData } from './handles/serializeData';
// import { deserializeData } from './handles/deserializeData'; // Not directly used in main flow
import { sendBatchesToSolana } from './handles/solanaTransaction';

dotenv.config();

async function main(): Promise<void> {
    // Initial run
    await runSteps1And2(); // Hourly tasks
    await runSteps3To5(); // Frequent tasks (10 min)

    // Intervals
    setInterval(runSteps1And2, 60 * 60 * 1000); // 1 hour
    setInterval(runSteps3To5, 10 * 60 * 1000); // 10 minutes
}

// Function to run steps 1 and 2 (hourly)
async function runSteps1And2(): Promise<void> {
    // Step 1: Scrape Pyth data and write it to CSV
    // const dataUpdated: boolean = await scrapeAndWriteData();
    // Step 2: Fetch symbol addresses, get Solana addresses, and write to CSV
    // const symbolNativeAddress: nativeAddressResults | null = await fetchSymbolNativeAddress();
    // await nativeToSol(symbolNativeAddress);
}

// Function to run steps 3, 4, and 5 (every 10 minutes)
async function runSteps3To5(): Promise<void> {
    // Step 3: Fetch, filter, and format data (including dominance)
    // const coinBatches = await dataFetchFilterFormat();
    // Step 4: Serialize the batched data
    // const serializedBatches = await serializeData(coinBatches);
    // Step 5: Send serialized batches to Solana
    // await sendBatchesToSolana(serializedBatches);
}

main();
```

### 4.1. External Data Sources
-   **Primary Source mentioned**: Pyth Network data. The `scrapeAndWriteData` function in `wLiquify-Oracle` is responsible for this.
-   **Other potential sources**: The system is designed to potentially fetch data from various sources (CoinGecko, Binance, etc.) although Pyth is explicitly handled. `fetchSymbolNativeAddress` suggests looking up token addresses, possibly from a mix of sources or a predefined list.

1.  **`scrapeAndWriteData()` (`wLiquify-Oracle/src/handles/scrapeAndWriteData.ts`)**:
    *   **Purpose**: Fetches crypto price feed IDs from Pyth Network and stores them.
    *   **Process**:
        *   Calls `fetchCryptoPriceFeeds()` (from `../services/pythIdScraping`) to get the latest price feed data.
        *   Calls `storePriceFeeds()` (from `../utils/storePriceFeedsAndSolanaAddress`) to store these fetched price feeds in a global variable/cache within the script's memory for later use by `dataFetchFilterFormat`.
        *   Optionally, writes the fetched price feeds to a CSV file (`symbolPriceFeedID.csv`) via `writePriceFeedID()` (from `../utils/writer`), but primarily relies on the in-memory store.
    *   **Output**: Boolean indicating if the CSV was updated, and populates an in-memory store of Pyth price feeds.

2.  **`fetchSymbolNativeAddress()` (`wLiquify-Oracle/src/handles/fetchSymbolNativeAddress.ts`)**:
    *   **Purpose**: Gathers native (non-Solana) addresses for a wide range of cryptocurrencies from multiple sources, applying various filters.
    *   **Process**:
        *   Loads primary hardcoded symbols and their addresses (from `../utils/reader`).
        *   Fetches data from CoinMarketCap API (`coinmarketcapAPI`).
        *   Applies tag-based filtering (e.g., excludes stablecoins, CEX tokens using `advfilterExcludeTags`).
        *   Excludes symbols already present in the primary hardcoded list.
        *   Fetches CoinGecko market data (`coingeckoAPICoinsByMC`) and matches remaining symbols to CoinGecko IDs.
        *   Applies a hardcoded blacklist for symbols.
        *   Fetches CoinGecko platform data (`coingeckoAPICoinsPlatform`) to get native chain addresses for matched IDs.
        *   Applies a blacklist for specific chain:address combinations and a whitelist for supported chains (e.g., Ethereum, Polygon).
        *   For symbols without a direct native address on a whitelisted chain, it attempts to find wrapped versions (`coingeckoAPICoinsWrapped`) or Binance-Pegged versions (`coingeckoAPICoinsBinancePeg`).
        *   Loads backup hardcoded symbols and addresses.
    *   **Output**: A complex `nativeAddressResults` object containing lists of symbols with their native platform addresses, wrapped addresses, Binance-Peg addresses, and any hardcoded addresses.

3.  **`nativeToSol()` (`wLiquify-Oracle/src/handles/nativeToSol.ts`)**:
    *   **Purpose**: Converts the native (non-Solana) token addresses obtained from `fetchSymbolNativeAddress` into their corresponding Solana addresses, primarily using Wormhole SDK.
    *   **Process**:
        *   Initializes Wormhole SDK for Mainnet with support for various chains (Algorand, Aptos, EVM, Solana, Sui, etc.) using RPCs from `ChainsRPC`.
        *   Processes primary hardcoded symbols first: If the hardcoded chain is Solana, it's a direct mapping. Otherwise, it uses Wormhole to resolve to a Solana address.
        *   Iterates through the native, wrapped, and Binance-Peg platforms from the `nativeAddressResults`.
        *   For each token:
            *   Maps the source chain name (e.g., "ethereum") to the Wormhole chain name (e.g., "Eth") using `readChainMap()`.
            *   If the source chain is Solana, the address is used directly (`nativeSolana`).
            *   Otherwise, it uses `Wormhole.tokenId()` to create a source token ID and `resolver.supportedDestinationTokens()` from the Wormhole SDK to find the corresponding token address on Solana.
            *   Includes a retry mechanism (1 retry with a 3-second delay) if Wormhole resolution fails.
        *   Processes backup hardcoded symbols similarly.
        *   Writes all successfully resolved Solana addresses to `solanaAddress.csv` and tokens that couldn't be resolved to `notRegistered.csv` via `writeSolanaAddress()` and `writeNotRegistered()`.
        *   Stores the resolved Solana addresses (`allSolanaTokens`) in a global variable/cache using `storeSolanaAddress()` (from `../utils/storePriceFeedsAndSolanaAddress`) for later use by `dataFetchFilterFormat`.
    *   **Output**: A `cleanedNativeAddressResults` object containing all resolved Solana addresses and populates an in-memory store of these addresses.

**Detailed Flow of `runSteps3To5()` (Every 10 Minutes):**

1.  **`dataFetchFilterFormat()` (`wLiquify-Oracle/src/handles/dataFetchFilterFormat.ts`)**:
    *   **Purpose**: Fetches current market data, filters and selects tokens based on multiple criteria, calculates token dominance, and formats the data into batches ready for serialization.
    *   **Process**:
        *   Fetches market data from CoinMarketCap API (`coinmarketcapAPI`).
        *   Filters out tokens based on tags (stablecoins, CEX tokens, etc.) using `filterExcludeTags`.
        *   Retrieves the in-memory stored Pyth price feed IDs (from `scrapeAndWriteData` via `storedPriceFeeds`) and Solana addresses (from `nativeToSol` via `storedCleanedResults.allSolanaTokens`).
        *   Loads a symbol alias mapping (`readSymbolPythAliasMapping`) to handle cases where a symbol might have a different representation in Pyth (e.g., "BTC" vs "Crypto.BTC/USD").
        *   **Token Selection**: Keeps only those tokens that:
            *   Are present in the filtered CoinMarketCap data.
            *   Have a corresponding Pyth price feed ID (either direct symbol match or via alias).
            *   Have a corresponding Solana address.
        *   Extracts symbol, market cap, Solana address, and Pyth PriceFeedID for these valid tokens.
        *   Sorts the valid tokens by market cap in descending order and takes the top 50.
        *   **Dominance Calculation**:
            *   Calculates the total market cap of these top 50 tokens.
            *   For each token, dominance = `(Token Market Cap / Total Market Cap of Top 50)`.
            *   The dominance value is scaled by 10<sup>10</sup>, floored, and converted to a `BigInt` to be stored as `u64` on-chain.
        *   Formats the output into `TokenInfo` objects: `{ Symbol, Dominance (BigInt), Address (string), PriceFeedID (string) }`. A timestamp is implicitly added later, likely within `solanaTransaction.ts` or when the transaction is built, to reflect the update time.
        *   **Batching**: Splits the list of `TokenInfo` objects into batches (default size 5, matching `MAX_TOKENS_PER_BATCH` from the on-chain program).
    *   **Output**: An array of batches, where each batch is an array of `TokenInfo` objects.

2.  **`serializeData()` (`wLiquify-Oracle/src/handles/serializeData.ts`)**:
    *   **Purpose**: Converts the JavaScript `TokenInfo` objects (batched) into a format (Buffers) suitable for sending to the Solana on-chain program, using Borsh serialization.
    *   **Process**:
        *   Defines a `TokenInfoBorsh_Serialize` class with a schema matching the on-chain Rust struct for `TokenInfo` (Symbol: `[u8; 10]`, Dominance: `u64`, Address: `[u8; 64]`, PriceFeedID: `[u8; 64]`). Note: The on-chain `TokenInfo` struct also includes a `timestamp: i64`, which seems to be added by the transaction construction logic in `solanaTransaction.ts` or during the actual instruction call, not here. *Self-correction: The `TokenInfo` type used in `serializeData` does not include `timestamp`. This is consistent with `oracleProgramDetails.md` where the `process_token_data` instruction takes `TokenInfo` without a timestamp, and the timestamp is likely applied uniformly by the authority/feeder logic at the time of update, often being part of the aggregator's state update rather than per-token info during `process_token_data` itself. Reviewing `oracleProgramDetails.md` again, the `TokenInfo` struct *does* include `timestamp: i64`. The `serializeData.ts` must handle this, or the `TokenInfo` type it uses is incomplete, or the timestamp is added *after* this serialization step if the instruction expects it. Re-checking `devOracleFeed/src/main.ts` shows timestamp is part of the data *before* serialization there. The `TokenInfo` type in `wLiquify-Oracle/src/types/serializeType.ts` should be checked. For now, proceeding with observed behavior in `serializeData.ts`.*
        *   For each `TokenInfo` object in each batch:
            *   Converts `Symbol`, `Address`, and `PriceFeedID` strings into fixed-size Buffers (10 bytes for Symbol, 64 for Address and PriceFeedID), padding with null bytes if necessary.
            *   Ensures `Dominance` is a `BigInt`.
            *   Creates an instance of `TokenInfoBorsh_Serialize`.
        *   Uses `borsh.serialize()` with the schema to convert each `TokenInfoBorsh_Serialize` instance into a `Buffer`.
    *   **Output**: An array of batches, where each batch is an array of `Buffer` objects (each buffer being a serialized `TokenInfo`).

3.  **`sendBatchesToSolana()` (`wLiquify-Oracle/src/handles/solanaTransaction.ts`)**:
    *   **Purpose**: Takes the serialized batches of token data and sends them to the on-chain oracle program.
    *   **Process**:
        *   **Setup**:
            *   Loads RPC URL and publisher's private key from environment variables.
            *   Creates a `Connection` to the Solana network and an Anchor `Provider` using the publisher's keypair.
            *   Sets the `ORACLE_PROGRAM_ID` (hardcoded as `ECQscJgjuLRXbPaYivPLjTJvqaF1LGWPNJp8LPGP5bKH` in this file, which might differ from the one in `oracleProgramDetails.md` - `3ZfM451hf9LUizdUL14N1R9fwmsPS8M8ZCGai2nm6SVY`. This needs to be consistent. Assuming `oracleProgramDetails.md` is the source of truth for the production program ID).
        *   **Account Derivation**:
            *   Derives the `aggregatorAccount` PDA using the seed `b"aggregator_v2"` and the program ID.
        *   **On-Chain Interaction (using helper functions from `../utils/anchorProgramInstructions`)**:
            1.  **`ensureAggregatorInitialized()`**: Checks if the `aggregatorAccount` PDA is initialized. If not, it likely calls the `initialize` instruction on the oracle program.
            2.  **Loop through Batches (`processTokenBatch()`)**:
                *   For each batch of serialized token data:
                    *   Derives the `oracleData` PDA for that batch using seeds `[b"oracle", batchIndex.to_le_bytes().as_ref()]`.
                    *   Calls `processTokenBatch()`, which constructs and sends a transaction for the `process_token_data` instruction of the oracle program. This instruction writes the batch of token data to the corresponding `oracleData` PDA.
                    *   *Timestamp Handling*: The `TokenInfo` struct on-chain includes a `timestamp`. The `serializeData` function did not explicitly add it. The `process_token_data` instruction expects `Vec<Vec<u8>>` which are serialized `TokenInfo`s. If the timestamp is part of the on-chain `TokenInfo` struct for *this* instruction, it must be included in the serialization. However, `devOracleFeed/src/main.ts` shows a `currentRunTimestampBN` used for `cleanupStaleTokensInstruction`, suggesting timestamps might be managed more centrally for staleness rather than in each `TokenInfo` during `process_token_data`. `oracleProgramDetails.md` states `TokenInfo` struct (used in `OracleData` and `AggregatedOracleData`) contains `timestamp: i64`. This implies the feeder *should* be providing it. The `TokenInfo` type in `wLiquify-Oracle/src/types/serializeType.ts` must be the definitive source for what `serializeData.ts` is actually serializing. If `timestamp` is missing there, it's a discrepancy. For now, documenting based on the provided code.
            3.  **`resetAggregatorIfNeeded()`**: This function is called *after* processing all batches but *before* aggregation. This seems counterintuitive if the goal is to add new data. It might be intended to clear the aggregator *before* a new full update cycle, ensuring no stale data from a previous, different run persists if the current run replaces everything. Or, it's part of a specific strategy where aggregation rebuilds the entire state. `oracleProgramDetails.md` describes `reset_aggregator` as clearing all token data.
            4.  **Loop through `oracleDataAddresses` (`aggregateOracleData()`)**:
                *   For each `oracleData` PDA that was populated:
                    *   Calls `aggregateOracleData()`, which constructs and sends a transaction for the `aggregate_oracle_data` instruction. This instruction merges the data from the specified `oracleData` account into the main `aggregatorAccount` and then closes the `oracleData` account.
            5.  **Fetch Final State (Attempt)**: Tries to fetch and log the raw data of the `aggregatorAccount` after all operations. Mentions a "TODO" for Borsh deserialization to verify contents.
    *   **Output**: Logs success/failure of on-chain transactions. The on-chain oracle state is updated.

This more detailed breakdown should be very helpful in `oracleFeedDetails.md`. 