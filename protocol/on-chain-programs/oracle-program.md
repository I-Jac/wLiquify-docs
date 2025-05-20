---
sidebar_position: 2
---

# Custom On-Chain Oracle Program for the wLiquify Ecosystem

## 1. Overview & Architecture: The Need for a Specialized Oracle

### 1.1. Purpose and Role in the Ecosystem
The wLiquify protocol requires highly specific, curated data to function correctly, particularly for its dynamic index composition and fee mechanisms. While primary oracles like Pyth Network provide excellent real-time price feeds for individual assets, they don't offer the specialized data points wLiquify needs, such as the target market dominance for tokens within its index or a consolidated list of official Pyth price feed identifiers for these specific tokens.

This Custom On-Chain Oracle Program is designed to bridge that gap. Its primary role is to act as a **centralized, on-chain repository of trusted, specialized data** for the wLiquify ecosystem. It aggregates and provides key information for various tokens, most importantly:
-   Their **target market dominance** (or weight) within the wLiquify index.
-   The unique **Pyth Network price feed identifiers** that the wLiquify Liquidity Pool program must use to fetch live prices for these tokens.

By serving this curated data, the Oracle Program enables other wLiquify smart contracts (primarily the Liquidity Pool Program) to access up-to-date, protocol-specific token metrics. These metrics are indispensable for accurate dynamic fee calculations, maintaining the desired index composition, and ensuring fair valuation of assets.

The program is engineered to support efficient updates via batching of token data by an authorized off-chain feeder service. It includes mechanisms for aggregating this batched data into a primary on-chain account and for cleaning up stale data, ensuring the information consumed by the protocol remains relevant and timely.

### 1.2. On-Chain Program ID (Address)
The unique identifier for this deployed Oracle Program on the Solana blockchain is:
`3ZfM451hf9LUizdUL14N1R9fwmsPS8M8ZCGai2nm6SVY`

### 1.3. Nature of the Oracle: A Curated Data Store
This is a **fully custom oracle program**, developed using Rust and the Anchor framework for Solana. It is crucial to understand that this program **does not independently source data from external markets or act as an adapter for primary oracles like Pyth**. Instead, it functions as a **secure and transparent on-chain data store** for information that is curated, processed, and pushed to it by an authorized, permissioned off-chain process (the `wLiquify-Oracle Feeder Service`).

-   **Role as an Aggregator and Data Store:** The off-chain Feeder Service is responsible for all external data sourcing (e.g., identifying Pyth price account public keys, calculating target market dominance based on market analysis). It then formats this information and submits it to this on-chain Oracle Program.
-   **Two-Step Update Process:** Data is typically submitted in batches. First, a batch of token information is written to a temporary `OracleData` account (a PDA specific to that batch). Subsequently, an instruction is called to merge (aggregate) the data from this temporary account into a central, primary `AggregatedOracleData` account (also a PDA). This `AggregatedOracleData` account is the definitive source from which other wLiquify smart contracts (like the Liquidity Pool Program, which refers to it as its `oracle_aggregator_account`) read the curated token data.
-   **Facilitating Price Discovery:** While it doesn't provide prices itself, it stores the `price_feed_id` (the public key of a Pyth price data account) for each token. This is particularly vital for Wormhole-wrapped tokens, which might lack deep native liquidity on Solana. By providing the correct Pyth feed ID, this Oracle Program enables the Liquidity Pool Program to access reliable, external oracle prices for accurate valuation.

## 2. Core Concepts & Data Points Provided

### 2.1. The `TokenInfo` Structure: Granular Data for Each Asset
The Oracle Program makes the following specific data points available for each token it tracks. These are collectively stored in a data structure referred to as `TokenInfo`:

-   **`symbol`**: A fixed-size byte array (maximum 10 bytes, typically null-padded if the symbol is shorter) representing the token's trading symbol (e.g., "BTC", "ETH"). Consuming programs or interfaces need to convert this byte array to a standard string format (like UTF-8) and trim any trailing null bytes for display or use.
-   **`dominance`**: A `u64` (unsigned 64-bit integer) value representing the token's target market dominance or weight within the wLiquify index. This is a critical input for the dynamic fee mechanism in the Liquidity Pool Program. The exact interpretation of this value (e.g., whether it's a percentage scaled by 10,000, or a different scaling factor) is a convention established by the data publisher (the off-chain Feeder Service) and understood by the consuming programs.
-   **`address`**: A fixed-size byte array (maximum 64 bytes, null-padded) intended to store an identifier for the token, typically its official mint address on the Solana blockchain (especially for SPL tokens, including Wormhole-wrapped versions).
-   **`price_feed_id`**: A fixed-size byte array (maximum 64 bytes, null-padded) storing the public key of an external, primary price feed account (e.g., a Pyth Network price data account). Client programs, like the wLiquify Liquidity Pool, use this public key to directly query the respective primary oracle (Pyth) to obtain real-time price data for the token.
-   **`timestamp`**: An `i64` (signed 64-bit integer) representing a Unix timestamp. This indicates when the data for this specific token was last updated or verified by the off-chain Feeder Service. This timestamp is crucial for consuming programs to check the freshness (staleness) of the data.

For example, the wLiquify Liquidity Pool Program reads the `price_feed_id` (which it converts from bytes to a Pubkey), `symbol`, and `dominance` for each relevant token from this Oracle Program's main `AggregatedOracleData` account to inform its operations.

### 2.2. Data Sourcing: An Off-Chain Responsibility
It is vital to reiterate that this on-chain Oracle Program **does not fetch or verify external market data itself**. The responsibility for sourcing all raw data (e.g., monitoring market capitalizations, determining appropriate target dominances for the index, discovering the correct Pyth feed IDs for tokens, resolving wrapped asset addresses) lies entirely with an **external, permissioned entity**. This entity is the `authority` that controls and operates the off-chain `wLiquify-Oracle Feeder Service`. This service serializes the curated data into the `TokenInfo` format and then pushes it into this on-chain Oracle Program.

### 2.3. Update Mechanism: Permissioned and Batched Push
Data updates to this Oracle Program are strictly controlled and can only be performed by the designated `authority` (set during the program's initialization). The update process typically involves a two-step, batched push mechanism designed for efficiency and atomicity:

1.  **`process_token_data` Instruction:** The `authority` calls this instruction to submit a batch of `TokenInfo` data (usually for multiple tokens, up to a batch limit). This submitted data is stored in a temporary, on-chain `OracleData` account, which is a PDA uniquely identified by a `batch_index`.
2.  **`aggregate_oracle_data` Instruction:** After one or more batches are processed into temporary `OracleData` accounts, the `authority` calls this instruction. It specifies a particular `OracleData` account (by its `batch_index`), and the program then merges the data from this temporary account into the main `AggregatedOracleData` account. This merge logic updates information for existing tokens (if their symbols match) or adds new tokens if there is available capacity in the `AggregatedOracleData` account. The temporary `OracleData` account is closed after its contents are successfully aggregated, reclaiming its SOL rent.

Additionally, a `cleanup_stale_tokens` instruction provides a mechanism for the `authority` to remove tokens from the `AggregatedOracleData` account whose `timestamp` field does not match a `current_run_timestamp` provided by the authority. This helps ensure the data remains fresh and relevant to the latest operational cycle of the Feeder Service.

## 3. Key On-Chain Account Structures (PDAs)

The program defines and utilizes several key Solana accounts, primarily Program Derived Addresses (PDAs), to store its state and manage data. PDAs are crucial as their addresses are derived deterministically from seeds and the program's ID, allowing the program to have authority over them without needing private keys.

### 3.1. `AggregatedOracleData` (Central Data Repository PDA)
-   **Purpose**: This is the single, central on-chain account that stores the complete, aggregated list of token information (multiple `TokenInfo` structs) from all processed batches. It is the primary account that client programs (like the wLiquify Liquidity Pool) read from to get the official, curated oracle data. This account also stores the `authority` public key, which is the only account authorized to make changes to the data herein.
-   **Derivation**: This is a PDA initialized once using the `initialize` instruction. It is derived using a constant seed, `[b"aggregator_v2"]`, relative to this Oracle Program's ID. This makes its address predictable and unique for this program instance.
-   **Key Fields (Conceptual Description):**
    -   `authority: Pubkey`: The public key of the account authorized to update the data in this aggregator (e.g., by calling `aggregate_oracle_data`, `reset_aggregator`, `cleanup_stale_tokens`).
    -   `total_tokens: u32`: An integer indicating the current number of `TokenInfo` entries actually stored and active in the `data` list.
    -   `data: Vec<TokenInfo>`: A list (vector) of `TokenInfo` structures, one for each token whose data has been aggregated. This list has a maximum capacity (e.g., 40 tokens).

### 3.2. `OracleData` (Temporary Batch Data PDA)
-   **Purpose**: This account structure serves as temporary on-chain storage for a single batch of token data before it is aggregated into the main `AggregatedOracleData` account. Each such batch is uniquely identified by a `batch_index`.
-   **Derivation**: This is also a PDA. It is initialized (if it doesn't already exist for a given `batch_index`) when the `process_token_data` instruction is called. Its seeds are typically `[b"oracle", batch_index.to_le_bytes().as_ref()]`, making its address unique for each batch index. This account is closed (and its rent reclaimed) after its data is successfully consumed by the `aggregate_oracle_data` instruction.
-   **Key Fields (Conceptual Description):**
    -   `batch_index: u8`: A small integer that uniquely identifies this particular batch of data.
    -   `data: Vec<TokenInfo>`: A list (vector) of `TokenInfo` structures for this specific batch. This list also has a maximum capacity per batch (e.g., 5 tokens per batch), which is usually smaller than the total capacity of `AggregatedOracleData`.

### 3.3. `TokenInfo` (Core Data Structure for a Single Token)
-   **Purpose**: As described in section 2.1, this structure defines the format for storing all relevant information about a single token within both the temporary `OracleData` accounts and the main `AggregatedOracleData` account.
-   **Key Fields (Recap):**
    -   `symbol: [u8; 10]` (Fixed-size byte array for symbol)
    -   `dominance: u64` (Target market dominance/weight)
    -   `address: [u8; 64]` (Token identifier, usually mint address, as bytes)
    -   `price_feed_id: [u8; 64]` (Primary oracle price feed account Pubkey, as bytes)
    -   `timestamp: i64` (Unix timestamp of last update)
    *(Note: The fixed-size byte arrays are typically null-padded if the actual data is shorter. Consuming programs must handle conversion to strings and trim nulls as needed.)*

## 4. Core Instructions / Program Functions & Their Logic

This section outlines the primary functions (exposed as instructions) of the Oracle Program.

### 4.1. `initialize` (One-Time Setup)
-   **Purpose**: Initializes the main `AggregatedOracleData` PDA account and sets its `authority`. This is a one-time setup instruction required before the oracle can be used.
-   **Key Accounts Involved**: `aggregator_account` (the `AggregatedOracleData` PDA, writable, to be created), `authority` (the account that will become the oracle's authority, signer, writable), `system_program` (standard Solana program for account creation).
-   **Core Logic**: Creates the `aggregator_account` PDA on-chain and stores the public key of the `authority` (who called this instruction) into the `aggregator_account.authority` field. Initializes `total_tokens` to 0 and the `data` list to empty.
-   **Permissions**: Callable by any account that wishes to become the `authority` for this oracle instance. The signer of this instruction becomes the designated `authority`.

### 4.2. `process_token_data` (Submitting a Batch of Token Data)
-   **Purpose**: Allows the designated `authority` to submit a batch of token data (composed of multiple serialized `TokenInfo` structs) to a temporary `OracleData` PDA account.
-   **Key Accounts**: `oracle_data` (the temporary `OracleData` PDA for this batch, writable, created if doesn't exist), `aggregator_account` (the main `AggregatedOracleData` PDA, read-only, used to verify the caller is the `authority`), `authority` (signer, writable, must match `aggregator_account.authority`), `system_program`.
-   **Input Parameters (Data provided by the caller):**
    -   `batch_index: u8`: An identifier for this specific batch, used to derive the `oracle_data` PDA's address.
    -   `token_infos_data: Vec<Vec<u8>>`: A list where each element is a byte vector representing a single, serialized `TokenInfo` structure. The serialization format (e.g., Borsh) must match what the on-chain program expects for deserialization.
-   **Core Logic**: Verifies that the caller matches the `authority` stored in `AggregatedOracleData`. Deserializes each byte vector in `token_infos_data` back into a `TokenInfo` struct. Initializes (if necessary) and populates the `oracle_data` PDA (corresponding to the `batch_index`) with these deserialized `TokenInfo` structs.
-   **Permissions**: Can only be successfully called by the `authority` account that was set during the `initialize` instruction for the `AggregatedOracleData` account.

### 4.3. `aggregate_oracle_data` (Merging Batch Data into Main Store)
-   **Purpose**: Allows the `authority` to merge the token data from a specified temporary `OracleData` batch (identified by its `batch_index`) into the main `AggregatedOracleData` repository. This instruction updates information for existing tokens or adds new ones if there's capacity. The temporary `OracleData` account is closed after its data is successfully processed.
-   **Key Accounts**: `aggregator_account` (the main `AggregatedOracleData` PDA, writable, to be updated), `authority` (signer, writable, also receives the SOL rent from the closed `oracle_data` account), `oracle_data` (the temporary `OracleData` PDA that is to be processed and then closed), `system_program`.
-   **Core Logic**: Verifies the caller is the `authority`. Iterates through each `TokenInfo` item in the specified `oracle_data` account. For each item, it checks if a token with the same `symbol` already exists in `aggregator_account.data`. If yes, it updates that existing entry. If no, and if `aggregator_account` has not reached its maximum token capacity, it adds the new `TokenInfo` item. It updates `aggregator_account.total_tokens` accordingly. Finally, it closes the `oracle_data` PDA, returning its SOL rent to the `authority`.
-   **Permissions**: Only the `authority`.

### 4.4. `reset_aggregator` (Clearing All Data)
-   **Purpose**: Allows the `authority` to completely clear all token data from the `AggregatedOracleData` account, effectively resetting it to an empty state (though the `authority` field remains).
-   **Key Accounts**: `aggregator_account` (writable PDA), `authority` (signer, must match `aggregator_account.authority`).
-   **Core Logic**: Verifies authority. Clears the `data` vector within the `aggregator_account` and resets its `total_tokens` count to 0.
-   **Permissions**: Only the `authority`.

### 4.5. `cleanup_stale_tokens` (Removing Outdated Entries)
-   **Purpose**: Enables the `authority` to remove tokens from the `AggregatedOracleData` account whose stored `timestamp` does not match a `current_run_timestamp` provided by the authority. This is a mechanism to ensure data freshness by removing entries that were not part of the latest update cycle by the off-chain feeder.
-   **Key Accounts**: `aggregator_account` (writable PDA), `authority` (signer, must match `aggregator_account.authority`).
-   **Input Parameters:**
    -   `current_run_timestamp: i64`: The timestamp representing the current update run by the feeder. Only tokens with this timestamp will be retained.
-   **Core Logic**: Verifies authority. Iterates through the `data` in `aggregator_account` and removes any `TokenInfo` entry where its `token_info.timestamp` is different from the provided `current_run_timestamp`. Updates `total_tokens`.
-   **Permissions**: Only the `authority`.

## 5. Data Publishing and Updating Process: Lifecycle & Control

### 5.1. Authority for Publishing/Updating Data
Strict control is maintained: only the single, designated `authority` public key (which was set during the `initialize` instruction of the `AggregatedOracleData` account) is permitted to modify the oracle's data. This is enforced by checks within each data-mutating instruction (`process_token_data`, `aggregate_oracle_data`, `reset_aggregator`, `cleanup_stale_tokens`).

### 5.2. Frequency and Nature of Updates
Data updates are not automatic or continuous from the perspective of this on-chain program. They are **event-driven**, occurring precisely when the `authority` (through the off-chain Feeder Service) executes the relevant update instructions. The `timestamp` field within each `TokenInfo` structure, along with the `cleanup_stale_tokens` instruction, indicates an operational model where the `authority` actively manages the freshness and relevance of the on-chain data, likely through periodic refresh cycles executed by the Feeder Service.

### 5.3. On-Chain Data Validation Scope
This on-chain Oracle Program primarily validates:
-   **Authorization**: That the caller is the designated `authority`.
-   **Data Format & Serialization**: That the incoming data in `process_token_data` can be correctly deserialized into the expected `TokenInfo` structures.
-   **Size Constraints**: That batch sizes and total token capacity limits are not exceeded.

The **correctness, accuracy, and appropriateness of the actual data values** (e.g., the specific dominance figures, the validity of Pyth price feed IDs, the accuracy of token symbols and addresses) are **the responsibility of the `authority` operating the off-chain Feeder Service**. The on-chain program trusts the data provided by its authorized feeder.

## 6. Client Integration & Data Consumption by Other Programs

### 6.1. How Client Programs (e.g., wLiquify Pool) Read Data
Client smart contracts, such as the wLiquify Liquidity Pool Program, read the curated oracle data by directly fetching and deserializing the contents of the main `AggregatedOracleData` PDA. The address of this PDA is predictable, derived using the seeds `[b"aggregator_v2"]` relative to this Oracle Program's ID (`3ZfM451hf9LUizdUL14N1R9fwmsPS8M8ZCGai2nm6SVY`).

### 6.2. Primary Account to Query
Clients exclusively query the `AggregatedOracleData` account for the finalized, official data.

### 6.3. Method of Reading Data
This Oracle Program does not expose specific "view functions" (read-only instructions that return data). Instead, client programs use standard Solana RPC calls (typically abstracted by client-side SDKs like Anchor's client library) to fetch the raw account data of the `AggregatedOracleData` PDA. Once fetched, the client program deserializes this raw byte data back into the known structure of `AggregatedOracleData` (which includes the list of `TokenInfo` structs).

### 6.4. Interpreting the Consumed Data
When a client program consumes the `TokenInfo` data, it needs to correctly interpret each field:
-   `symbol`, `address`, `price_feed_id`: These are fixed-length, null-padded byte arrays. The client must convert them to standard string formats (e.g., UTF-8) and trim any trailing null bytes. The `price_feed_id` and `address` bytes often represent public keys and would need to be converted to Solana `Pubkey` objects for on-chain use.
-   `dominance`: A `u64` integer. Its specific meaning (e.g., percentage scaled by 10^4, or parts per million) must be understood by consumers based on the convention established by the data publisher (Feeder Service).
-   `timestamp`: An `i64` Unix timestamp, critical for assessing data freshness.

### 6.5. Recommended Validations on the Client-Side
When a client program (like the Liquidity Pool) reads data from this Oracle Program, it is strongly recommended to perform its own set of validations before using the data in critical operations:

1.  **Timestamp Staleness Check (Critical):** Compare the `TokenInfo.timestamp` for each relevant token against the current Solana clock timestamp. If the data is too old (exceeds a predefined acceptable staleness threshold), the client should treat it as unreliable and potentially halt the operation or use a fallback if available.
2.  **Data Sanity Checks:** Perform basic sanity checks on the values. For example, ensure `dominance` figures are within expected ranges. For string fields (after conversion from bytes), check their format if necessary.
3.  **Price Feed ID Validity (Important for Pyth users):** If the client intends to use the `price_feed_id` to query Pyth Network, it should ideally perform checks to ensure this ID points to a valid and healthy Pyth price account before relying on its price data.
4.  **Sufficient Data Availability:** Ensure that data for all tokens required for the client's current operation is present in the `AggregatedOracleData` account.
5.  **Authority Verification (Optional but Recommended for System Integrity):** For enhanced security, a client might optionally verify that the `authority` field within the `AggregatedOracleData` account matches an expected, known authority public key. This helps guard against interacting with a misconfigured or potentially rogue oracle instance if the Oracle Program ID was ever compromised or a new, unverified instance was deployed.

## 7. Security & Reliability Considerations

### 7.1. Trust in the Data Source (The `authority`)
The entire trust model of this custom Oracle Program hinges on the security and integrity of the designated `authority` account. If the private key for this `authority` account is compromised, or if the `authority` acts maliciously, incorrect, manipulated, or stale data can be published to the on-chain program.
*Responsibility for trusting the ultimate sources of market data (e.g., CoinGecko, Pyth for discovery) is delegated to this `authority` and its off-chain Feeder Service.*

### 7.2. Resistance to On-Chain Manipulation
Direct, unauthorized modifications to the oracle's on-chain data are prevented by the authority checks within the program's instructions. Only the designated `authority` can alter the data. The primary on-chain manipulation risk is therefore through the compromise or malicious action of the `authority` itself.

### 7.3. Liveness, Availability, and Data Freshness
The liveness and availability of fresh data depend entirely on the `authority` (via the Feeder Service) continuing to publish updates in a timely manner. Client programs **must** implement robust checks for `TokenInfo.timestamp` staleness to protect themselves against operating on outdated information if the feeder service experiences downtime. The `authority` uses the `cleanup_stale_tokens` instruction as a tool to actively manage and signal the freshness of the dataset from its perspective.

### 7.4. Admin Controls (Authority Powers) & Implications of Compromise
The `authority` possesses full control over the data content of this Oracle Program. A compromise of the `authority` key could lead to severe consequences for any dependent programs (like the wLiquify Liquidity Pool), including:
-   Publication of false or misleading token dominances, price feed IDs, or symbols.
-   Complete erasure of all oracle data using `reset_aggregator`.
-   Selective removal or introduction of tokens using `aggregate_oracle_data` and `cleanup_stale_tokens`.
Any of these actions could cause significant malfunctions, unfair value exchanges, or potential financial loss in dependent systems.
**Primary Mitigation**: The paramount security measure is the extremely secure management of the `authority` key. This typically involves using a hardware wallet, a multi-signature (multi-sig) wallet setup if the `authority` is a multi-sig account, or other institutional-grade key management solutions for the off-chain Feeder Service that holds this key.

---

This document provides a technical deep dive into the on-chain Custom Oracle Program. A complete understanding of its role also requires familiarity with the operational details and data lifecycle managed by its counterpart, the off-chain `wLiquify-Oracle Feeder Service`, which is described in a separate document. 