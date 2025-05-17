---
sidebar_position: 2
slug: /developer-docs/on-chain-programs/oracle-program
---

# Solana Oracle Program for wLiquify Ecosystem

## 1. Overview & Architecture

### 1.1. Purpose
The primary role of this oracle program is to aggregate and provide on-chain data for various tokens, specifically their market dominance, and potentially other related information. It serves as a centralized data source for client programs like the wLiquify pool, enabling them to access up-to-date token metrics. The program supports batching of token data updates and aggregation into a main account. It also includes functionality to clean up stale data.

### 1.2. On-Chain Program ID
The on-chain address (Program ID) of this oracle program is:
`3ZfM451hf9LUizdUL14N1R9fwmsPS8M8ZCGai2nm6SVY`

This is declared in the `declare_id!` macro within the Rust source code.

### 1.3. Nature of the Oracle
Based on the provided source code and IDL:
- This appears to be a **fully custom oracle program** built from scratch using the Anchor framework for Solana.
- It **does not seem to be an adapter or client for standard oracle services** like Pyth, Switchboard, or Chainlink directly within its own logic. Instead, it defines its own data structures (`TokenInfo`) where fields like `price_feed_id` are present. This suggests that the *publishers* of data to this oracle might be responsible for sourcing information (including price feed IDs) from primary oracles or other off-chain/on-chain sources, and then feeding it into this program.
- It **acts as an aggregator**. Data is first processed in batches into `OracleData` accounts and then aggregated into a central `AggregatedOracleData` account. This central account is likely the `oracle_aggregator_account` that the wLiquify pool program interacts with.

## 2. Core Concepts & Data Points

### 2.1. Data Provided
The oracle program makes the following data points available for each token, as defined in the `TokenInfo` struct:
- **`symbol`**: A byte array representing the token's symbol (e.g., "BTC", "ETH"). Max length is 10 bytes.
- **`dominance`**: A `u64` value representing the token's market dominance. The exact unit or scaling factor (e.g., percentage with decimals) needs to be understood by the data publisher and consumer.
- **`address`**: A byte array for the token's address or identifier. Max length is 64 bytes. This could be the token's mint address or another unique identifier.
- **`price_feed_id`**: A byte array intended to store an identifier for an external price feed (e.g., a Pyth price account public key). Max length is 64 bytes. Client programs like wLiquify would use this ID to fetch real-time prices from the respective primary oracle.
- **`timestamp`**: An `i64` Unix timestamp indicating when the data for this token was last updated or recorded. This is crucial for clients to check data staleness.

The wLiquify pool specifically reads `price_feed_id` (as a string), `symbol`, and `token_dominance` from the `oracle_aggregator_account`.

### 2.2. Data Sources
The program itself does not define internal mechanisms for fetching data from off-chain APIs or other on-chain oracles. The `process_token_data` instruction accepts `token_infos_data` (a vector of byte vectors, each representing a serialized `TokenInfo`) as an argument. This implies that an **external, permissioned entity (the `authority`) is responsible for sourcing this raw data off-chain or from other on-chain programs**, serializing it, and then pushing it into this oracle program.

### 2.3. Update Mechanism
Data is updated through a two-step, permissioned push mechanism:
1.  **`process_token_data`**: An authorized `authority` calls this instruction to submit a batch of `TokenInfo` data. This data is stored in a temporary `OracleData` account, specific to the `batch_index`.
2.  **`aggregate_oracle_data`**: The `authority` then calls this instruction, which takes the data from a specified `OracleData` account and merges it into the main `AggregatedOracleData` account. This merge logic involves updating existing tokens or adding new ones if space is available. The `OracleData` account is closed after aggregation.

Additionally, the `cleanup_stale_tokens` instruction allows the `authority` to remove tokens from the `AggregatedOracleData` account whose timestamps do not match a `current_run_timestamp` provided by the authority, ensuring data freshness.

## 3. Key Account Structures

The program defines and uses several key Solana accounts:

### 3.1. `AggregatedOracleData`
-   **Purpose**: This is the central account that stores the aggregated list of token information from all processed batches. It is the primary account that client programs like wLiquify will read from (referred to as `oracle_aggregator_account`). It also stores the `authority` pubkey that is allowed to make changes.
-   **Initialization/Derivation**: It's a Program Derived Address (PDA) initialized once using the `initialize` instruction. The seeds for the PDA are `[b"aggregator_v2"]`.
-   **Key Fields** (from Rust struct `AggregatedOracleData` and IDL):
    -   `authority: Pubkey`: The public key of the account authorized to update this aggregator and other parts of the program.
    -   `total_tokens: u32`: The current number of `TokenInfo` entries stored in the `data` vector.
    -   `data: Vec<TokenInfo>`: A vector containing the `TokenInfo` structs for all aggregated tokens. The maximum number of tokens is constrained by `MAX_TOTAL_TOKENS_IN_AGGREGATOR` (currently 40).
-   **Data Organization for wLiquify**:
    -   **Token Symbol**: Stored in `TokenInfo.symbol` (fixed-size byte array, needs conversion to string, trimming null bytes).
    -   **Price Feed ID**: Stored in `TokenInfo.price_feed_id` (fixed-size byte array, needs conversion to string, trimming null bytes).
    -   **Dominance**: Stored in `TokenInfo.dominance` (as `u64`).

```rust
#[account]
#[derive(InitSpace, Default)]
pub struct AggregatedOracleData {
    pub authority: Pubkey,
    pub total_tokens: u32,
    #[max_len(MAX_TOTAL_TOKENS_IN_AGGREGATOR)] // MAX_TOTAL_TOKENS_IN_AGGREGATOR = 40
    pub data: Vec<TokenInfo>,
}
```

### 3.2. `OracleData`
-   **Purpose**: This account serves as a temporary storage for a batch of token data before it's aggregated. Each batch is identified by a `batch_index`.
-   **Initialization/Derivation**: It's a PDA initialized (if needed) by the `process_token_data` instruction. The seeds are `[b"oracle", batch_index.to_le_bytes().as_ref()]`. It is closed by the `authority` when its data is consumed by `aggregate_oracle_data`.
-   **Key Fields** (from Rust struct `OracleData` and IDL):
    -   `batch_index: u8`: An identifier for this specific batch of data.
    -   `data: Vec<TokenInfo>`: A vector of `TokenInfo` structs for the tokens in this batch. The maximum number of tokens per batch is constrained by `MAX_TOKENS_PER_BATCH` (currently 5).

```rust
#[account]
#[derive(InitSpace)]
pub struct OracleData {
    pub batch_index: u8,
    #[max_len(MAX_TOKENS_PER_BATCH)] // MAX_TOKENS_PER_BATCH = 5
    pub data: Vec<TokenInfo>,
}
```

### 3.3. `TokenInfo` (Struct, not an Account)
-   **Purpose**: This struct defines the structure for storing information about a single token. It's used within the `data` vectors of both `OracleData` and `AggregatedOracleData`.
-   **Key Fields** (from Rust struct `TokenInfo` and IDL):
    -   `symbol: [u8; 10]`: Token symbol (e.g., "BTC").
    -   `dominance: u64`: Token dominance metric.
    -   `address: [u8; 64]`: Token address or identifier.
    -   `price_feed_id: [u8; 64]`: Identifier for an external price feed.
    -   `timestamp: i64`: Unix timestamp of the data.

```rust
#[derive(InitSpace, AnchorSerialize, AnchorDeserialize, Clone, Debug)]
pub struct TokenInfo {
    pub symbol: [u8; Self::MAX_SYMBOL_LENGTH], // MAX_SYMBOL_LENGTH = 10
    pub dominance: u64,
    pub address: [u8; Self::MAX_ADDRESS_LENGTH], // MAX_ADDRESS_LENGTH = 64
    pub price_feed_id: [u8; Self::MAX_PRICE_FEED_ID_LENGTH], // MAX_PRICE_FEED_ID_LENGTH = 64
    pub timestamp: i64,
}
```
The fixed-size byte arrays (`symbol`, `address`, `price_feed_id`) are typically null-padded. Consumers need to convert them to strings by trimming these null bytes. The program includes a helper `bytes_to_string` for this.

## 4. Core Instructions / Program Functions

### 4.1. `initialize`
-   **Purpose**: Initializes the main `AggregatedOracleData` account and sets its `authority`. This is a one-time setup instruction.
-   **Discriminator**: `[175, 175, 109, 31, 13, 152, 155, 237]`
-   **Key Accounts Involved**:
    -   `aggregator_account` (writable, PDA `seeds = [b"aggregator_v2"]`): The `AggregatedOracleData` account to be initialized.
    -   `authority` (writable, signer): The account that will become the authority for the aggregator. Pays for initialization.
    -   `system_program`: Required by Solana for account creation.
-   **Input Parameters**: None.
-   **Core Logic**: Creates the `aggregator_account` PDA, sets its `authority` field to the signer's public key.
-   **Permissions**: Can be called by any signer who will then become the `authority`.
-   **Events Emitted**: None explicitly defined in IDL, but emits messages via `msg!()`.

### 4.2. `process_token_data`
-   **Purpose**: Submits a batch of token data (serialized `TokenInfo` structs) to be stored in a temporary `OracleData` account, identified by a `batch_index`.
-   **Discriminator**: `[31, 160, 52, 158, 168, 59, 201, 21]`
-   **Key Accounts Involved**:
    -   `oracle_data` (writable, PDA `seeds = [b"oracle", batch_index.to_le_bytes().as_ref()]`): The `OracleData` account to store the batch. Initialized if it doesn't exist.
    -   `aggregator_account` (PDA `seeds = [b"aggregator_v2"]`): The main `AggregatedOracleData` account. Read to verify `authority`.
    -   `authority` (writable, signer): Must match the `authority` stored in `aggregator_account`. Pays for initialization if `oracle_data` is new.
    -   `system_program`: Required by Solana for account creation if `oracle_data` is new.
-   **Input Parameters**:
    -   `batch_index: u8`: Identifier for this data batch.
    -   `token_infos_data: Vec<Vec<u8>>`: A vector where each inner vector contains the borsh-serialized bytes of a `TokenInfo` struct.
-   **Core Logic**:
    1.  Verifies that the `authority` signer matches the `authority` in `aggregator_account` (via `has_one` constraint).
    2.  Deserializes each byte vector in `token_infos_data` into a `TokenInfo` struct.
    3.  Initializes (if needed) and populates the `oracle_data` account with the `batch_index` and the deserialized `TokenInfo` structs.
-   **Permissions**: Only the `authority` set in the `AggregatedOracleData` account.
-   **Events Emitted**: None explicitly defined in IDL, but emits messages via `msg!()`.

### 4.3. `aggregate_oracle_data`
-   **Purpose**: Merges token data from a specific `OracleData` batch account into the main `AggregatedOracleData` account. It updates existing tokens or adds new ones. The `OracleData` account is closed after processing.
-   **Discriminator**: `[102, 155, 33, 189, 98, 211, 104, 3]`
-   **Key Accounts Involved**:
    -   `aggregator_account` (writable, PDA `seeds = [b"aggregator_v2"]`): The main `AggregatedOracleData` account to be updated.
    -   `authority` (writable, signer): Must match the `authority` in `aggregator_account`. Receives lamports from the closed `oracle_data` account.
    -   `oracle_data` (writable, PDA `seeds = [b"oracle", oracle_data.batch_index.to_le_bytes().as_ref()]`): The `OracleData` batch account to read from. This account will be closed.
    -   `system_program`: Required.
-   **Input Parameters**: None (relies on `oracle_data.batch_index` from the account).
-   **Core Logic**:
    1.  Verifies the `authority` signer.
    2.  Iterates through `TokenInfo` items in the `oracle_data.data` vector.
    3.  For each incoming token:
        -   If a token with the same `symbol` already exists in `aggregator_account.data`, it updates the existing entry with the new `TokenInfo` (all fields are replaced).
        -   If the token does not exist and `aggregator_account.data` has space (less than `MAX_TOTAL_TOKENS_IN_AGGREGATOR`), it adds the new `TokenInfo`.
        -   If the token does not exist and the aggregator is full, it skips the token.
    4.  Updates `aggregator_account.total_tokens`.
    5.  Closes the `oracle_data` account, transferring its lamports to the `authority`.
-   **Permissions**: Only the `authority` set in the `AggregatedOracleData` account.
-   **Events Emitted**: None explicitly defined in IDL, but emits messages via `msg!()`.

### 4.4. `reset_aggregator`
-   **Purpose**: Clears all token data from the `AggregatedOracleData` account.
-   **Discriminator**: `[60, 69, 7, 100, 33, 112, 238, 55]`
-   **Key Accounts Involved**:
    -   `aggregator_account` (writable, PDA `seeds = [b"aggregator_v2"]`): The `AggregatedOracleData` account to be reset.
    -   `authority` (signer): Must match the `authority` in `aggregator_account`.
-   **Input Parameters**: None.
-   **Core Logic**:
    1.  Verifies the `authority` signer.
    2.  Clears the `data` vector in `aggregator_account`.
    3.  Resets `aggregator_account.total_tokens` to 0.
-   **Permissions**: Only the `authority` set in the `AggregatedOracleData` account.
-   **Events Emitted**: None explicitly defined in IDL, but emits messages via `msg!()`.

### 4.5. `cleanup_stale_tokens`
-   **Purpose**: Removes tokens from the `AggregatedOracleData` account whose `timestamp` field does *not* match a provided `current_run_timestamp`.
-   **Discriminator**: `[162, 241, 128, 203, 15, 82, 35, 178]`
-   **Key Accounts Involved**:
    -   `aggregator_account` (writable, PDA `seeds = [b"aggregator_v2"]`): The `AggregatedOracleData` account to be cleaned.
    -   `authority` (writable, signer): Must match the `authority` in `aggregator_account`. Pays for the transaction.
-   **Input Parameters**:
    -   `current_run_timestamp: i64`: The timestamp to compare against. Tokens with timestamps not equal to this will be removed.
-   **Core Logic**:
    1.  Verifies the `authority` signer.
    2.  Iterates through the `data` vector in `aggregator_account`.
    3.  Removes any `TokenInfo` entry where `token_info.timestamp != current_run_timestamp`.
    4.  Updates `aggregator_account.total_tokens`.
-   **Permissions**: Only the `authority` set in the `AggregatedOracleData` account.
-   **Events Emitted**: None explicitly defined in IDL, but emits messages via `msg!()`.

## 5. Data Publishing and Updating Process

### 5.1. Who can publish/update data?
Publishing and updating data is **permissioned and restricted** to the `authority` key.
- The `authority` is set during the `initialize` instruction.
- Only this `authority` can call `process_token_data` to submit new batches, `aggregate_oracle_data` to merge batches into the main aggregator, `reset_aggregator` to clear data, and `cleanup_stale_tokens` to remove old data.
- The authority relationship is enforced by `has_one = authority` constraints in the Account structs for these instructions.

### 5.2. Frequency of Updates
The program itself does not enforce a specific update frequency. Updates are **event-driven**, meaning they occur whenever the authorized `authority` decides to call the `process_token_data` and `aggregate_oracle_data` instructions.
- The `timestamp` field within each `TokenInfo` struct suggests that data freshness is important.
- The `cleanup_stale_tokens` instruction provides a mechanism for the `authority` to actively remove data that is considered stale based on a `current_run_timestamp` they provide. This implies that the `authority` is expected to manage data lifecycle and freshness.

### 5.3. Data Validation
The program performs minimal explicit data validation on the content of `TokenInfo` itself (e.g., it doesn't check if `dominance` is within a certain range or if `price_feed_id` points to a valid account).
- **Serialization/Deserialization**: It validates that the incoming `token_infos_data` in `process_token_data` can be correctly deserialized into `TokenInfo` structs. A failure here would result in an error (e.g., `FailedToDeserialize` if `try_from_slice` fails).
- **Size Constraints**: Implicit validation occurs through account size and vector capacity limits (`MAX_TOKENS_PER_BATCH`, `MAX_TOTAL_TOKENS_IN_AGGREGATOR`). If an update tries to exceed these, the transaction would likely fail due to account size limits or program logic preventing additions.
- **Authority Checks**: Strong validation is performed to ensure only the designated `authority` can execute modifying instructions.

The core responsibility for the correctness and validity of the actual data points (symbol, dominance, addresses, price feed IDs, timestamps) lies with the `authority` that sources and submits this data.

## 6. Client Integration & Data Consumption

### 6.1. How do other programs read data?
Other programs (like the wLiquify pool) read data by directly fetching and deserializing the `AggregatedOracleData` account.
- The address of this account is a PDA derived from the oracle program ID using the seeds `[b"aggregator_v2"]`.
- Client programs need to know the oracle program ID to derive this PDA.

### 6.2. Which accounts do they need to query?
Clients primarily need to query:
-   **`AggregatedOracleData` account**: This is the main account (the `oracle_aggregator_account`) containing the `Vec<TokenInfo>`. Its address is a PDA (`seeds = [b"aggregator_v2"]`).

### 6.3. Are there specific view functions or instructions for reading data?
No, the program does not provide specific "view functions" or read-only instructions in the traditional sense (like some EVM contracts might). Solana programs typically expose their state through accounts. Clients read the data by:
1.  Determining the PDA of the `AggregatedOracleData` account.
2.  Fetching the account's data using Solana RPC calls (e.g., `getAccountInfo`).
3.  Deserializing the account's raw byte data into the `AggregatedOracleData` struct (and subsequently the `Vec<TokenInfo>`). Anchor client libraries simplify this process significantly.

### 6.4. Data Interpretation
Client programs should interpret the data as follows:
-   **`symbol`, `address`, `price_feed_id`**: These are stored as fixed-length byte arrays (`[u8; N]`). They are likely null-terminated or null-padded. Clients must convert these byte arrays to strings, carefully handling and trimming any trailing null bytes. The program's Rust code includes a `bytes_to_string` helper for this pattern.
-   **`dominance`**: This `u64` value's specific meaning (e.g., if it's a percentage, what are the decimal places) is not defined in the program structure itself. This convention must be established and understood by both the data publisher (the `authority`) and data consumers. For example, a value of `5000` might represent `50.00%`.
-   **`timestamp`**: This `i64` is a Unix timestamp. Clients should use this to assess the age/freshness of the data.

### 6.5. Recommended Client-Side Validations
Client programs consuming data from this oracle should perform several checks:
1.  **Timestamp Staleness**: Critically important. Compare the `timestamp` in each `TokenInfo` against the current time. If the data is too old (staleness threshold defined by the client's risk tolerance), it should be treated with caution or rejected.
2.  **Data Sanity**:
    -   Check if `dominance` values are within expected ranges (e.g., not negative, not excessively large if it represents a percentage).
    -   Validate `symbol`, `address`, and `price_feed_id` strings after conversion from byte arrays (e.g., ensure they are not empty, conform to expected formats if any).
3.  **Price Feed ID Validity**: If using the `price_feed_id` to fetch prices from a primary oracle (like Pyth), validate that the ID corresponds to an actual, healthy price feed account on that oracle network. The primary oracle will usually have its own health/confidence metrics.
4.  **Sufficient Data**: Check if the `AggregatedOracleData` account contains data for the tokens the client is interested in.
5.  **Authority Verification (Optional but good practice)**: While the program ensures only the `authority` can write, clients could (if they know the expected authority) verify that the `authority` field in the `AggregatedOracleData` account matches the expected one, as an additional layer of security against interacting with a misconfigured or malicious deployment.

## 7. Security & Reliability Considerations

### 7.1. Data Source Trust
-   The **entire system's trust relies heavily on the `authority` account**. This single account is responsible for sourcing, validating (off-chain), and publishing all data.
-   If the `authority` key is compromised, malicious or incorrect data can be pushed into the oracle.
-   The ultimate sources of data (from which the `authority` gathers information) are not specified in the program. Trust in these external sources is implicitly delegated to the `authority`.

### 7.2. Manipulation Resistance
-   **On-chain, the program is resistant to manipulation by unauthorized parties** due to strict authority checks on all data modification instructions.
-   The primary vector for manipulation is through the **compromise or malicious action of the `authority` key**.
-   There are no explicit on-chain mechanisms like multi-signature approvals for data updates or dispute resolution systems within this program.
-   The `cleanup_stale_tokens` instruction relies on a `current_run_timestamp` provided by the authority. If the authority provides an incorrect timestamp, it could lead to premature or delayed cleanup of tokens.

### 7.3. Liveness & Availability
-   **Liveness depends on the `authority`**: If the `authority` stops publishing updates, the data in `AggregatedOracleData` will become stale.
-   **Availability of the Oracle Program**: As a Solana program, its availability is tied to the Solana network's uptime.
-   **Mitigation for Stale Data**:
    -   Clients **must** check the `timestamp` in each `TokenInfo` to guard against using stale data. This is the primary mitigation.
    -   The `authority` can use `cleanup_stale_tokens` to remove data that is no longer current (based on their definition of current).
    -   wLiquify and other clients should have robust handling for stale oracle data, potentially pausing operations or using fallback mechanisms if data freshness requirements are not met.

### 7.4. Admin Controls
-   The `authority` key has significant administrative control:
    -   Initializing the aggregator (`initialize`).
    -   Publishing all data (`process_token_data`, `aggregate_oracle_data`).
    -   Resetting all data (`reset_aggregator`).
    -   Cleaning up specific tokens (`cleanup_stale_tokens`).
-   **Security Implications of Compromise**: If the `authority` private key is compromised:
    -   An attacker could publish false token data (symbols, dominance, price feed IDs, timestamps).
    -   An attacker could wipe all oracle data using `reset_aggregator`.
    -   An attacker could selectively remove tokens using `cleanup_stale_tokens`.
    -   This could lead to significant financial loss or malfunction for dependent programs like wLiquify (e.g., incorrect pricing, unfair liquidations, broken functionality).
-   **Mitigation**: Secure management of the `authority` key is paramount. Options include using a hardware wallet, a multi-sig wallet (if the program were to be extended to support it for authority changes, or if the authority itself is a multi-sig PDA), or a robust key management solution. Regular audits and monitoring of the `authority`'s actions would also be advisable.

---

This document provides a technical overview based on the provided source code and IDL. For a complete picture, understanding the off-chain processes managed by the `authority` would be beneficial. 