---
sidebar_position: 1
slug: /developer-docs/on-chain-programs/pool-program
---

# wLiquify Solana Liquidity Pool Program Details

## Overview

The wLiquify Pool program is a decentralized application on the Solana blockchain designed to manage a multi-asset liquidity pool. It allows users to deposit various supported tokens and, in return, receive wLQI tokens, which represent their proportional share of the pool's total liquidity. The program handles the minting of wLQI tokens upon deposit and their burning upon withdrawal. It aims to provide a robust and transparent mechanism for liquidity provision and token exchange, incorporating features like oracle-based pricing and potentially dynamic fee structures (details to be confirmed from source code if not explicit in IDL).

**Program ID (On-Chain Address):** `EsKuTFP341vcfKidSAxgKZy91ZVmKqFxRw3CbM6bnfA9`

## Core Concepts

### wLQI Token
-   **LP Token Role:** The wLQI token serves as a Liquidity Provider (LP) token. When users contribute assets to the wLiquify pool, they are minted wLQI tokens. The number of wLQI tokens minted is proportional to the value of their deposited assets relative to the total value already in the pool.
-   **Value Derivation:** The value of a single wLQI token is derived from the collective market value of all the underlying assets held within the pool's vaults. This value fluctuates as the prices of the underlying assets change (tracked by oracles) and as fees are potentially accrued to the pool.
-   **Mint/Burn Mechanics:**
    -   **Minting:** wLQI tokens are minted to a user's account when they successfully execute a `deposit` instruction, contributing one or more supported tokens to the pool.
    -   **Burning:** wLQI tokens are burned when a user executes a `withdraw` instruction, redeeming their LP tokens for a proportional share of the underlying assets.

### Supported Tokens
The program maintains a list of specific crypto-assets that are accepted into the liquidity pool. Each supported token has:
-   An associated vault (a Program Derived Address - PDA) managed by the program to securely hold its liquidity.
-   An associated `HistoricalTokenData` account (PDA) to store persistent metadata like its oracle feed ID, decimals, and symbol.
-   An associated `price_feed` account used for valuation.
The list of supported tokens and their configurations are stored within the `PoolConfig` account. Adding new tokens is an administrative action (`add_supported_token`).

### Target Weights/Dominance & Dynamic Fees
The concept of target weights or dominance for each token (and how it influences dynamic fees) is a common feature in such pools. While the provided IDL for `PoolConfig` and `SupportedToken` doesn't explicitly list fields like `target_dominance_bps` or specific fee BPS values per token, the `withdraw` instruction includes a `withdraw_full_delisted_balance` flag, and the general expectation for such a pool includes mechanisms to incentivize balance.
-   **Influence on Fees/Exchange Rates:** If target weights are implemented (likely in the Rust source code logic interacting with `PoolConfig`), deposits of tokens that are below their target weight might receive more favorable terms (e.g., lower fees or a slight bonus in wLQI minted). Conversely, depositing tokens that are already above their target weight might incur slightly higher fees. Withdrawals would have inverse incentives. This mechanism helps maintain the pool's desired asset allocation.
-   Details on specific fee structures (e.g., `deposit_fee_bps`, `withdrawal_fee_bps`, `rebalance_bonus_bps`) are not directly visible in the IDL's account structures provided but are crucial for the program's economics. These are handled via hardcoded constants and live oracle data, as detailed in the "Fee Structure (On-Chain Logic)" section.

## Key Accounts

The program utilizes several key account structures to store its state and manage operations. These are defined in the IDL's `types` section and through PDA derivations shown in the instructions.

### 1. `PoolConfig` (Singleton PDA)
This is the central account holding all global configurations and state for the liquidity pool.
-   **Purpose:** Stores administrative keys, oracle settings, fee parameters (if any are stored directly), the wLQI mint address, and the list of all supported tokens with their individual configurations.
-   **PDA Seeds:** `[b"pool_config"]` (as seen in instruction accounts)
-   **Key Fields (from IDL `types`):**
    ```rust
    pub struct PoolConfig {
        pub admin: Pubkey,                           // The administrative authority for the pool.
        pub fee_recipient: Pubkey,                   // Account that receives collected fees.
        pub wli_mint: Pubkey,                        // The mint address for the wLQI LP token.
        pub pool_authority_bump: u8,                 // Bump seed for the Pool Authority PDA.
        pub oracle_program_id: Pubkey,               // Program ID of the oracle service used (e.g., Pyth).
        pub oracle_aggregator_account: Pubkey,       // Main oracle account (e.g., Pyth's primary price feed aggregator).
        pub address_lookup_table: Pubkey,            // Address Lookup Table (LUT) for efficient transaction processing.
        pub current_total_pool_value_scaled: u128,   // The total value of all assets in the pool, scaled to a common precision.
        pub supported_tokens: Vec<SupportedToken>, // A vector storing details for each token supported by the pool.
    }
    ```

### 2. `PoolAuthority` (Singleton PDA)
This Program Derived Address acts as the authority for program-controlled accounts, such as the individual token vaults and the wLQI mint.
-   **Purpose:** Enables the program to sign for actions like transferring tokens from its vaults during withdrawals or minting wLQI LP tokens during deposits.
-   **PDA Seeds:** `[b"pool_authority"]` (as seen in instruction accounts). The bump seed for this PDA is stored in `PoolConfig.pool_authority_bump`.

### 3. Token Vaults (PDAs for each supported token)
For each token type supported by the pool, a dedicated token account (vault) is created and managed by the program.
-   **Purpose:** To securely hold the liquidity of that specific token deposited by users.
-   **PDA Seeds:** Derived from the `pool_authority`, the SPL Token Program ID (as a constant byte array), and the specific `token_mint` for that vault. This means these vaults are standard Associated Token Accounts (ATAs) owned by the `PoolAuthority`. Example from `add_supported_token` instruction for `pool_vault`:
    ```json
    "seeds": [
        { "kind": "account", "path": "pool_authority" },
        { "kind": "const", "value": [6, 221, 246, ...] }, // This is the SPL Token Program ID bytes
        { "kind": "account", "path": "token_mint" }
    ]
    ```

### 4. `wLQI Mint` (Singleton PDA)
This is the mint account for the pool's Liquidity Provider (LP) tokens, named wLQI.
-   **Purpose:** Governs the creation (minting) and destruction (burning) of wLQI tokens.
-   **PDA Seeds:** `[b"wli_mint"]` (as seen in the `initialize` instruction for the `wli_mint` account).
-   **Authority:** The `PoolAuthority` PDA is typically set as the mint and freeze authority for the `wli_mint`.

### 5. `SupportedToken` (Struct within `PoolConfig`)
This struct, contained within the `PoolConfig.supported_tokens` vector, defines the configuration for each individual token that the pool supports.
-   **Purpose:** To store references to essential accounts and metadata for each token, such as its mint address, its dedicated vault, its historical data account, and its oracle price feed account.
-   **Key Fields (from IDL `types`):
    ```rust
    pub struct SupportedToken {
        pub mint: Pubkey,          // Mint address of the supported token (e.g., USDC, SOL).
        pub vault: Pubkey,         // PDA address of the token vault for this specific token.
        pub token_history: Pubkey, // PDA for the HistoricalTokenData account for this token.
        pub price_feed: Pubkey,    // Oracle price feed account (e.g., Pyth Price account) for this token.
    }
    ```
    *(Note: Fields like target dominance or specific fee rates per token are not in this IDL struct; they might be handled by program logic or in conjunction with other data.)*

### 6. `HistoricalTokenData` (PDA for each supported token)
This account stores persistent, less frequently changed metadata about a token that is or has been supported by the pool.
-   **Purpose:** To keep a record of crucial information like the token's oracle feed ID (which might be different from its price account key, e.g. Pyth feed IDs are byte arrays), its decimal precision, and its symbol. This data is useful for consistent processing and UI display.
-   **PDA Seeds:** `[b"token_history", token_mint.key().as_ref()]` (as seen in the `add_supported_token` instruction for `token_history_account` and its definition in IDL `types`).
-   **Key Fields (from IDL `types`):
    ```rust
    pub struct HistoricalTokenData {
        pub feed_id: [u8; 32], // The oracle feed ID (e.g., for Pyth, this is the unique feed identifier).
        pub decimals: u8,      // The number of decimal places for the token.
        pub symbol: [u8; 10],  // The token's trading symbol (stored as a fixed-size byte array, needs UTF-8 conversion).
    }
    ```

## Core Instructions (Program Functions)

This section details the primary functions (instructions) exposed by the wLiquify Pool program, based on the provided IDL.

### 1. `initialize`
-   **Purpose:** Initializes the primary `PoolConfig` account, the `PoolAuthority` PDA, and the `wLQI` LP token mint. This is the foundational instruction called once to set up a new pool.
-   **Key Accounts Involved (from IDL):**
    -   `payer`: (Signer, Writable) The account funding the initialization (e.g., paying rent for accounts).
    -   `pool_config`: (Writable, PDA) The `PoolConfig` account to be created and initialized. Seeds: `[b"pool_config"]`.
    -   `pool_authority`: (PDA) The `PoolAuthority` PDA, derived for program signing. Seeds: `[b"pool_authority"]`.
    -   `wli_mint`: (Writable, PDA) The mint account for the wLQI LP tokens. Seeds: `[b"wli_mint"]`.
    -   `token_program`: Solana SPL Token Program.
    -   `system_program`: Solana System Program.
    -   `rent`: Rent Sysvar.
-   **Input Parameters (from IDL):**
    -   `admin: Pubkey`: The public key of the account that will have administrative control over the pool.
    -   `fee_recipient: Pubkey`: The public key of the account designated to receive protocol fees.
    -   `oracle_program_id: Pubkey`: The program ID of the oracle service (e.g., Pyth) the pool will use for price feeds.
-   **Core Logic (High-Level):**
    -   Creates and initializes the `PoolConfig` account on-chain.
    -   Sets the provided `admin`, `fee_recipient`, and `oracle_program_id` in `PoolConfig`.
    -   The bump seed for the `PoolAuthority` PDA is derived and stored in `PoolConfig.pool_authority_bump`.
    -   Initializes the `wli_mint` as a new SPL token mint. The `PoolAuthority` PDA is set as both the mint authority and freeze authority for `wli_mint`.
    -   Sets `PoolConfig.current_total_pool_value_scaled` to 0.
    -   Initializes `PoolConfig.supported_tokens` as an empty vector.
    -   The `PoolConfig.oracle_aggregator_account` is populated by deriving its address using the `oracle_program_id` (from args) and an internal program-defined seed.
    -   The `PoolConfig.address_lookup_table` is expected to be set via the dedicated `set_lookup_table` instruction.
-   **Events Emitted:** (The IDL does not specify events. An `PoolInitializedEvent` would be typical.)

### 2. `add_supported_token`
-   **Purpose:** Adds a new token to the `PoolConfig.supported_tokens` list, enabling it to be part of the liquidity pool. It creates the token's dedicated `pool_vault` and `token_history_account`.
-   **Key Accounts Involved (from IDL):**
    -   `admin`: (Signer, Writable) The pool administrator (must match `PoolConfig.admin`).
    -   `pool_config`: (Writable, PDA) The global pool configuration account.
    -   `pool_authority`: (PDA) The pool's authority PDA.
    -   `token_mint`: The mint address of the token to be added.
    -   `pool_vault`: (Writable, PDA) The token account (vault) to be created for holding liquidity of this `token_mint`. Seeds: `[pool_authority, CONST_SEED, token_mint]`.
    -   `token_history_account`: (Writable, PDA) Account to store historical/metadata for this `token_mint`. Seeds: `[b"token_history", token_mint]`.
    -   `oracle_aggregator_account`: (Read-only) The oracle aggregator account from `PoolConfig`. (Used for validation or context).
    -   `system_program`: Solana System Program.
    -   `token_program`: Solana SPL Token Program.
    -   `associated_token_program`: Solana Associated Token Program.
    -   `rent`: Rent Sysvar.
-   **Input Parameters (from IDL):**
    -   None (`args: []`).
-   **Core Logic (High-Level):**
    -   Verifies the `admin` signature.
    -   Checks for pool capacity (against `MAX_TOKENS_IN_POOL`) and if the `token_mint` is already supported to prevent duplicates.
    -   The `pool_vault` (ATA for `pool_authority` for `token_mint`) is initialized if needed.
    -   The `token_history_account` PDA is initialized.
    -   **Metadata Population (derived from Rust source):**
        -   Reads `token_mint.decimals`.
        -   Deserializes data from `oracle_aggregator_account` (defined in `PoolConfig`).
        -   Looks up the `token_mint` within the oracle data to find its `TokenInfo` (which includes `symbol` and `price_feed_id` as a string representation of a Pubkey).
        -   Parses the `price_feed_id` string from oracle data into an actual `Pubkey` (this will be the `price_feed_pda_address`).
        -   Validates the parsed `price_feed_pda_address` is not a default/zero Pubkey.
    -   Initializes the `token_history_account` fields:
        -   `feed_id`: Set to the bytes of the `price_feed_pda_address` (Pubkey) obtained from the oracle data.
        -   `decimals`: Set from `token_mint.decimals`.
        -   `symbol`: Set from the `symbol` field in the `TokenInfo` obtained from the oracle data.
    -   Constructs a `SupportedToken` struct entry with:
        -   `mint`: The `token_mint.key()`.
        -   `vault`: The `pool_vault.key()`.
        -   `token_history`: The `token_history_account.key()`.
        -   `price_feed`: The `price_feed_pda_address` (Pubkey) derived from oracle data.
    -   Pushes the new `SupportedToken` entry into the `pool_config.supported_tokens` vector.
    -   Logs a message reminding the admin to update the off-chain Address Lookup Table (LUT) with the new `pool_vault`, `token_history_account`, and `price_feed_pda_address` for the added token.
-   **Events Emitted:** (None specified in IDL. A `TokenAddedEvent` would be typical.)

### 3. `cleanup_historical_data`
-   **Purpose:** Allows an admin to close the `historical_token_data` account and the associated `pool_vault` for a token that has been effectively delisted and its vault emptied. This reclaims the rent from these accounts.
-   **Key Accounts Involved (from IDL):**
    -   `admin`: (Signer, Writable) The pool administrator.
    -   `pool_config`: (Writable, PDA) The global pool configuration. It `has_one = admin`, `has_one = fee_recipient`, `has_one = oracle_aggregator_account`.
    -   `pool_authority`: (PDA) The pool's authority PDA (for signing to close vault).
    -   `fee_recipient`: (Writable, from `pool_config`) Account to receive reclaimed rent.
    -   `oracle_aggregator_account`: (Read-only, from `pool_config`) Used to verify delisted status.
    -   `historical_token_data`: (Writable, PDA, `close = fee_recipient`) The account to be closed. Seeds: `[b"token_history", token_mint_arg.as_ref()]`.
    -   `token_mint`: (Read-only) The mint of the token being cleaned up (passed as `token_mint_arg`).
    -   `pool_vault`: (Writable, PDA) The pool vault for the `token_mint`. Needs to be closed. This is an Associated Token Account (ATA) with `mint = token_mint` and `authority = pool_authority`.
    -   `token_program`: Solana SPL Token Program.
    -   `system_program`: Solana System Program.
-   **Input Parameters (from IDL):**
    -   `token_mint_arg: Pubkey`: The mint address of the token whose data and vault are to be cleaned up.
-   **Core Logic (High-Level, based on IDL and Rust source code):**
    -   Verifies `admin` signature against `pool_config.admin`.
    -   Verifies that the token is considered delisted. This is determined by querying the `oracle_aggregator_account`: if the token is not found in the oracle data, or if its `dominance` (a field in the oracle's `TokenInfo`) is zero, it is considered delisted.
    -   Requires that the `pool_vault` for the token is empty (balance is 0) before allowing closure.
    -   Removes the `SupportedToken` entry corresponding to `token_mint_arg` from the `pool_config.supported_tokens` vector.
    -   Closes the `pool_vault` token account via a CPI to the Token Program, signed by `pool_authority`. The reclaimed rent from the vault is sent to the `fee_recipient`.
    -   The `historical_token_data` account is automatically closed by the runtime (and its rent lamports sent to `fee_recipient`) due to the `close = fee_recipient` constraint in its Anchor account declaration, upon successful completion of the instruction.
    -   Logs messages reminding the admin to update and deactivate the closed account addresses (vault, history) and the associated price feed PDA in the off-chain Address Lookup Table (LUT).
-   **Events Emitted:** (None specified in IDL. A `TokenCleanedUpEvent` or `TokenRemovedEvent` would be typical.)

### 4. `deposit`
-   **Purpose:** Allows a user to deposit a supported token into the pool and receive wLQI LP tokens in return.
-   **Key Accounts Involved (from IDL):**
    -   `user`: (Signer, Writable) The user performing the deposit.
    -   `user_source_ata`: (Writable) User's token account for the asset being deposited.
    -   `fee_recipient`: (Read-only, from `pool_config`) Account that receives protocol fees.
    -   `pool_config`: (Writable, PDA) The global pool configuration account.
    -   `pool_authority`: (PDA) The pool's authority PDA.
    -   `wli_mint`: (Writable, from `pool_config`) The wLQI LP token mint.
    -   `user_wli_ata`: (Writable, PDA/ATA) User's wLQI token account. Seeds: `[user, token_program, wli_mint]` (Standard ATA derivation).
    -   `owner_fee_account`: (Writable, PDA/ATA) The `fee_recipient`'s ATA for receiving fees in wLQI tokens. Seeds: `[fee_recipient, token_program, wli_mint]`.
    -   `deposit_mint`: (Read-only) The mint of the token being deposited.
    -   `target_token_vault_ata`: (Writable, PDA/ATA) The pool's vault for the `deposit_mint`. This is an ATA with `mint = deposit_mint` and `authority = pool_authority`.
    -   `oracle_aggregator_account`: (Read-only, from `pool_config`).
    -   `deposit_price_feed`: (Read-only) The specific oracle price feed account for the `deposit_mint`. Verified against `SupportedToken.price_feed` in `PoolConfig`.
    -   `token_program`: Solana SPL Token Program.
    -   `system_program`: Solana System Program.
    -   `associated_token_program`: Solana Associated Token Program.
    -   `rent`: Rent Sysvar.
-   **Input Parameters (from IDL):**
    -   `amount: u64`: The amount of the `deposit_mint` token the user wishes to deposit.
-   **Core Logic (High-Level):**
    -   Validates the deposit `amount` (e.g., not zero).
    -   Validates `deposit_price_feed` against the one stored in `pool_config.supported_tokens` for the `deposit_mint`.
    -   Fetches the current price of the `deposit_mint` using the `deposit_price_feed` and `oracle_aggregator_account` (validating for staleness, trading status etc. as seen in `utils.rs`).
    -   Calculates the USD value of the deposited tokens.
    -   Calculates the amount of wLQI to mint. This typically involves:
        -   Current total value of the pool (`current_total_pool_value_scaled` from `PoolConfig`).
        -   Current total supply of `wli_mint`.
        -   The value of the new deposit.
        -   The formula is often: `wLQI_to_mint = (deposit_value / total_pool_value_before_deposit) * current_wLQI_supply`. If the pool is empty, it's usually `deposit_value` (or a 1:1 based on initial deposit value).
    -   **Dynamic Fees/Bonuses:** The program applies fees as detailed in the "Fee Structure (On-Chain Logic)" section. This involves a base fee and a dynamic rebalancing adjustment based on the token's oracle-reported dominance. The `owner_fee_account` (for wLQI) receives the base fee component.
    -   Transfers the `amount` of the `deposit_token` from `user_source_ata` to `target_token_vault_ata`.
    -   Mints the calculated net amount of wLQI tokens to `user_wli_ata` (after any wLQI-denominated fees).
    -   Updates `pool_config.current_total_pool_value_scaled` by adding the value of the new deposit.
-   **Events Emitted:** (None specified in IDL. A `DepositPerformedEvent` would be typical.)

### 5. `set_lookup_table`
-   **Purpose:** Allows the admin to set or update the Address Lookup Table (LUT) associated with the pool.
-   **Key Accounts Involved (from IDL):**
    -   `admin`: (Signer, Writable) The pool administrator (must match `PoolConfig.admin`).
    -   `pool_config`: (Writable, PDA) The global pool configuration account.
    -   `lookup_table_account`: (Read-only) The new Address Lookup Table account to be associated with the pool.
-   **Input Parameters (from IDL):**
    -   None (`args: []`). The new LUT address is passed as an account.
-   **Core Logic (High-Level):**
    -   Verifies the `admin` signature.
    -   Validates that the provided `lookup_table_account` is a valid and initialized LUT (e.g., checks owner, initialization state – this would be in Rust code).
    -   Updates the `pool_config.address_lookup_table` field with the `lookup_table_account.key()`.
-   **Events Emitted:** (None specified in IDL. A `LookupTableUpdatedEvent` would be typical.)

### 6. `update_total_value`
-   **Purpose:** A crank instruction to update the `pool_config.current_total_pool_value_scaled`. This is likely called periodically or by a keeper to refresh the cached total value of all assets in the pool based on current oracle prices and vault balances.
-   **Key Accounts Involved (from IDL):**
    -   `pool_config`: (Writable, PDA) The global pool configuration where `current_total_pool_value_scaled` is stored.
    -   `address_lookup_table`: (Read-only) The pool's LUT, used to resolve the accounts needed for calculation (vaults, history accounts, price feeds for all supported tokens).
    -   *Remaining Accounts (passed via LUT):* For each supported token, this instruction expects a triplet of accounts: its `pool_vault`, its `token_history_account`, and its `price_feed` account.
-   **Input Parameters (from IDL):**
    -   None (`args: []`).
-   **Core Logic (High-Level, based on IDL and `utils.rs` search result):**
    -   Iterates through all supported tokens by using the accounts provided via the `address_lookup_table`.
    -   For each token:
        -   Reads its balance from its `pool_vault`.
        -   Reads its `decimals` and `feed_id` (which is the price feed Pubkey bytes) from its `token_history_account`.
        -   Reads the current price from its `price_feed` account (validating for staleness, trading status).
        -   Calculates the current USD (or other common denomination) value of the tokens held in the vault, scaled to a consistent precision.
    -   Sums the individual token values to get a new `total_value_usd_scaled`.
    -   Updates `pool_config.current_total_pool_value_scaled` with this new sum.
-   **Events Emitted:** (None specified in IDL. A `PoolValueUpdatedEvent` would be typical.)

### 7. `withdraw`
-   **Purpose:** Allows a user to burn their wLQI LP tokens in exchange for a proportional share of one of the underlying assets in the pool.
-   **Key Accounts Involved (from IDL):**
    -   `user`: (Signer, Writable) The user performing the withdrawal.
    -   `user_wli_ata`: (Writable) The user's token account holding the wLQI tokens to be burned.
    -   `user_destination_ata`: (Writable, PDA/ATA) The user's token account to receive the withdrawn tokens. Seeds: `[user, token_program, withdraw_mint]` (Standard ATA derivation).
    -   `fee_recipient`: (Read-only, from `pool_config`).
    -   `pool_config`: (Writable, PDA) The global pool configuration account.
    -   `pool_authority`: (PDA) The pool's authority PDA.
    -   `wli_mint`: (Writable, from `pool_config`) The wLQI LP token mint.
    -   `owner_fee_account`: (Writable, PDA/ATA) The `fee_recipient`'s ATA for wLQI tokens. Seeds: `[fee_recipient, token_program, wli_mint]`.
    -   `withdraw_mint`: (Read-only) The mint address of the token the user wishes to withdraw.
    -   `source_token_vault_ata`: (Writable, PDA/ATA) The pool's vault for the `withdraw_mint`. This is an ATA with `mint = withdraw_mint` and `authority = pool_authority`.
    -   `oracle_aggregator_account`: (Read-only, from `pool_config`).
    -   `withdraw_price_feed`: (Read-only) The specific oracle price feed account for the `withdraw_mint`. Verified against `SupportedToken.price_feed`.
    -   `token_program`: Solana SPL Token Program.
    -   `system_program`: Solana System Program.
    -   `associated_token_program`: Solana Associated Token Program.
    -   `rent`: Rent Sysvar.
-   **Input Parameters (from IDL):**
    -   `amount: u64`: The amount of wLQI tokens the user wishes to burn.
    -   `withdraw_full_delisted_balance: bool`: If `true`, attempts to withdraw the user's full proportional share of a token that is considered delisted, potentially bypassing some standard fee/rebalancing logic.
-   **Core Logic (High-Level):**
    -   Validates `amount` (e.g., not zero, user has sufficient wLQI).
    -   Validates `withdraw_price_feed` against `PoolConfig`.
    -   Calculates the value of the wLQI tokens being burned based on `pool_config.current_total_pool_value_scaled` and `wli_mint.supply`.
    -   Fetches the current price of the `withdraw_mint` using its oracle (validating price).
    -   Determines the gross amount of `withdraw_mint` tokens to dispense based on the value of wLQI burned and the token's price.
    -   **Dynamic Fees/Bonuses & Delisted Logic:**
        -   If `withdraw_full_delisted_balance` is `true` and the `withdraw_mint` is considered delisted (e.g., its dominance in oracle is 0 or it's not found), the withdrawal logic applies a fixed `DELISTED_WITHDRAW_BONUS_BPS` (as detailed in "Fee Structure") and calculates a direct pro-rata share of the remaining tokens in `source_token_vault_ata`.
        -   Otherwise (standard withdrawal), the fee logic detailed in the "Fee Structure (On-Chain Logic)" section applies. This includes a base fee and a dynamic rebalancing adjustment based on the token's oracle-reported dominance. Fees in wLQI are transferred to the `owner_fee_account`.
    -   Burns the `amount` of wLQI tokens from `user_wli_ata`.
    -   Transfers the calculated net amount of `withdraw_mint` tokens from `source_token_vault_ata` to `user_destination_ata`.
    -   Updates `pool_config.current_total_pool_value_scaled` by subtracting the value of the withdrawn assets.
-   **Events Emitted:** (None specified in IDL. A `WithdrawalPerformedEvent` would be typical.)

## Fee Structure (On-Chain Logic)

Fees in the wLiquify Pool are primarily managed through hardcoded constants within the program and dynamic calculations at the time of deposit or withdrawal. The `PoolConfig` account itself does not store configurable fee BPS values in this IDL version.

-   **Types of Fees & Calculation (based on Rust constants and `deposit`/`withdraw` logic):**
    -   **Base Fee:** A `BASE_FEE_BPS` (constant, e.g., 10 BPS = 0.1%) is applied to transactions. This fee is calculated on the total wLQI value involved in the operation.
        -   During `deposit`, this base fee (in wLQI) is minted directly to the `owner_fee_account` (ATA of `PoolConfig.fee_recipient` for `wli_mint`).
        -   During `withdraw`, this base fee (in wLQI) is transferred from the user's wLQI ATA to the `owner_fee_account`.
    -   **Dynamic Rebalancing Adjustment:** The core of the fee/bonus system. This adjustment depends on how a transaction affects the pool's balance relative to the token's current dominance (read live from the oracle).
        -   The calculation uses a `FEE_K_FACTOR` (constant, e.g., k=0.2) and compares the token's relative deviation from its oracle-reported dominance before and after the transaction.
        -   **Depositing Underweight / Withdrawing Overweight (relative to oracle dominance):** A transaction that helps balance the pool (moves a token closer to its oracle dominance or further from over-weightedness) may result in a *premium* for the user (negative fee component).
        -   **Depositing Overweight / Withdrawing Underweight:** A transaction that exacerbates imbalance incurs a *penalty* (positive fee component).
        -   The dynamic adjustment is combined with the `BASE_FEE_BPS` to get a `total_fee_bps`.
    -   **Fee Caps/Floors (constants):**
        -   `DEPOSIT_PREMIUM_CAP_BPS`: Deposits can receive a premium up to this cap (e.g., -500 BPS = -5%).
        -   `WITHDRAW_FEE_FLOOR_BPS`: Withdrawal fees have a minimum floor (e.g., 0 BPS, meaning they can be free but not negative beyond the base fee effect).
        -   The total effective fee is capped (e.g., at 99.99%) to prevent extreme scenarios.
    -   **Delisted Token Withdrawal Bonus:** When withdrawing a delisted token using the `withdraw_full_delisted_balance: true` flag, a fixed `DELISTED_WITHDRAW_BONUS_BPS` (e.g., 500 BPS = 5% bonus) is applied instead of the dynamic fee calculation.
-   **Fee Recipient:**
    -   The `BASE_FEE_BPS` portion of fees, denominated in wLQI, is sent to the `owner_fee_account` (an ATA for `wli_mint` owned by the `PoolConfig.fee_recipient`).
    -   The `fee_recipient` can then withdraw these accumulated wLQI tokens using standard SPL token wallet operations, as they own the `owner_fee_account`. No special program instruction is required for this withdrawal by the fee recipient.

## Oracle Integration

The program relies heavily on an external oracle service (e.g., Pyth, though the IDL is generic) to determine token prices and target/current dominance values.

-   **Oracle Configuration (in `PoolConfig`):
    -   `oracle_program_id`: The on-chain address of the main oracle program.
    -   `oracle_aggregator_account`: The primary data account of the oracle service from which token details (like symbol, price feed ID string, and dominance) are read. This PDA is derived during `initialize` based on the `oracle_program_id` and a known seed (e.g., `b"aggregator_v2"`).
-   **Per-Token Oracle Data (in `SupportedToken` and `HistoricalTokenData`):
    -   `HistoricalTokenData.feed_id`: Stores the bytes of the actual price feed account Pubkey for a specific token (e.g., a Pyth `Price` account). This Pubkey is parsed from a string ID fetched from the `oracle_aggregator_account` during `add_supported_token`.
    -   `SupportedToken.price_feed`: Stores the Pubkey of the oracle price feed account for the token.
    -   `HistoricalTokenData.symbol`: Token symbol, fetched from the `oracle_aggregator_account`.
-   **Instructions Relying on Oracles:**
    -   `add_supported_token`: Fetches symbol, price feed ID (string), and dominance from `oracle_aggregator_account` to populate `HistoricalTokenData` and `SupportedToken`.
    -   `deposit` & `withdraw`:
        -   Fetch the token's current dominance from `oracle_aggregator_account` for dynamic fee calculations.
        -   Fetch the token's price from its specific `price_feed` account (e.g., Pyth `Price` account) for valuing assets, calculating wLQI to mint/burn, and determining token amounts.
    -   `update_total_value`: Uses the `price_feed` for each supported token to calculate the total value of the pool.
    -   `cleanup_historical_data`: Checks the token's dominance in the `oracle_aggregator_account` to confirm it's delisted (dominance is 0 or token not found).
-   **Price Data Usage and Validation (evident from Rust code, e.g., `utils.rs` and instruction logic):
    -   Prices are used to convert token amounts into a common value unit (e.g., USD scaled) for calculations.
    -   The program includes checks for:
        -   **Price Staleness:** Ensures the price data from the oracle feed is not too old (e.g., against `MAX_PRICE_STALENESS_SECONDS`).
        -   **Trading Status:** Checks if the oracle reports the asset as actively trading (e.g., against `MOCK_PRICE_FEED_TRADING_STATUS` if using a mock or similar for Pyth).
        -   **Valid Price:** Checks for non-negative prices.
    -   The IDL errors (`PythPriceValidationFailed`, `PythPriceNotTrading`, `PriceFeedStale`, `InvalidPrice`) also indicate these validation measures.

## Admin Capabilities

The pool administrator (`PoolConfig.admin`) has several key responsibilities and powers executed through specific instructions:

-   **Pool Setup & Maintenance:**
    -   `initialize`: Initializes the entire pool, sets the initial admin, fee recipient, and oracle program.
    -   `set_lookup_table`: Sets or updates the pool's Address Lookup Table (LUT).
    -   `cleanup_historical_data`: Removes fully delisted and emptied tokens from the pool's configuration and closes their accounts.
-   **Token Management:**
    -   `add_supported_token`: Adds new tokens to the pool, creating their vaults and historical data accounts by fetching metadata from the oracle.
-   **Configuration (Implicit via Oracle):**
    -   While there are no direct instructions to set target dominance or specific fee BPS values in `PoolConfig` (as these are read from the oracle or are constants), the admin indirectly influences these by managing what tokens are listed and by ensuring the `oracle_aggregator_account` (which the program reads from) is correctly configured and reflects desired states if the oracle itself is configurable by an admin role.

-   **Admin-Only Instructions (require `admin` signature):**
    -   `initialize` (payer also signs)
    -   `add_supported_token`
    -   `set_lookup_table`
    -   `cleanup_historical_data`

## Delisting Tokens

The program handles token delisting primarily through interactions with the external oracle and specific instruction logic:

-   **Process of Delisting:**
    1.  **Oracle Update (External):** The primary mechanism for a token to be considered "delisted" by this program is for its representation in the `oracle_aggregator_account` to change. This typically means its reported `dominance` becomes zero, or the token is entirely removed from the oracle's data feed.
    2.  **Program Recognition:**
        -   The `deposit` instruction would likely prevent new deposits if a token's oracle-reported dominance is zero (as this would lead to extreme fees or indicate it's not an active part of the pool strategy).
        -   The `withdraw` instruction, when processing a token with zero dominance from the oracle, considers it `is_delisted`.
        -   The `cleanup_historical_data` instruction explicitly checks if a token has zero dominance in the oracle (or is absent) before allowing cleanup.
-   **Withdrawal of Delisted Tokens:**
    -   Users can withdraw a token considered delisted using the standard `withdraw` instruction by setting the `withdraw_full_delisted_balance: bool` parameter to `true`.
    -   When this flag is true and the token is confirmed as delisted (zero dominance from oracle):
        -   A special `DELISTED_WITHDRAW_BONUS_BPS` (constant) is applied, usually as a negative fee (bonus) to incentivize withdrawal.
        -   The calculation aims to give the user their full pro-rata share of the remaining tokens in the specific `pool_vault` for that delisted asset, potentially bypassing the usual dynamic fee logic tied to balancing non-delisted assets.
-   **Cleanup by Admin:**
    -   Once a token is effectively delisted (via oracle) and its corresponding `pool_vault` has been emptied by users withdrawing their funds, the admin can call `cleanup_historical_data`.
    -   This instruction removes the token's entry from `PoolConfig.supported_tokens` and closes its `pool_vault` and `historical_token_data` accounts to reclaim rent.

## Error Handling

The program defines a comprehensive set of custom errors to signal various issues that can occur during instruction processing, such as invalid inputs, failed validations, arithmetic overflows, or unmet conditions.

For developers interacting with the program, it is crucial to understand these custom errors to build robust client-side error handling and to diagnose transaction failures.

**A complete list of custom error codes, names, and messages can be found directly in the `errors` section of the program's IDL file (`w_liquify_pool.json`).** Referencing this section in the IDL is the most accurate way to get details on all possible program-specific errors.

## Security Considerations (Program-Level)

Key security aspects for this Solana liquidity pool program include:

-   **Admin Privileges:** The `PoolConfig.admin` key has significant control. Its compromise could lead to adding unwanted tokens (if oracle allows), misconfiguring the LUT via `set_lookup_table`, or prematurely cleaning up token data if other conditions are met. Secure management of this key is critical.
-   **Oracle Security & Integrity:** The program's correct operation is highly dependent on the accuracy, liveness, and integrity of the external oracle (`oracle_program_id` and data from `oracle_aggregator_account`).
    -   **Price & Dominance Manipulation:** If the oracle can be manipulated to provide false prices or dominance figures, it can lead to unfair exchanges, value extraction from the pool, or incorrect fee calculations.
    -   **Staleness & Liveness:** The program relies on oracle data being fresh. The implemented checks against `MAX_PRICE_STALENESS_SECONDS` and for trading status are crucial. Failure or unavailability of the oracle could halt or impair pool operations.
-   **Smart Contract Risks (General):**
    -   **Bugs in Logic:** Unforeseen errors in the Rust implementation could lead to exploits (e.g., calculation errors, incorrect state updates, re-entrancy if not careful, though less common in Solana's model).
    -   **Arithmetic Precision & Overflow/Underflow:** Financial calculations with scaled integers (like `current_total_pool_value_scaled`) must handle potential overflows/underflows. The IDL error `ArithmeticError` and use of `checked_` operations in Rust are good, but the overall arithmetic flow needs to be robust.
    -   **Input Validation:** Ensuring all inputs to instructions (amounts, account keys if not strictly constrained by PDAs/`has_one`) are validated is vital.
-   **PDA Correctness:** Correct derivation and usage of PDAs for `PoolAuthority`, token vaults, `wli_mint`, and `HistoricalTokenData` are essential. The IDL shows seeds, and these must be correctly implemented.
-   **Address Lookup Table (LUT) Management:** The `set_lookup_table` instruction allows the admin to change the LUT. The LUT itself must contain correct and secure addresses. If a compromised LUT is set, transactions (especially `update_total_value`) could be fed incorrect accounts, leading to failures or miscalculations. The program also logs reminders to update the LUT after `add_supported_token` and `cleanup_historical_data`, highlighting the operational security aspect of LUTs.
-   **Fee Recipient Security:** The `fee_recipient` account (set at `initialize`) will accumulate wLQI fees. Secure management of this account's private key is necessary.
-   **No On-Chain Governance for Parameters:** Critical parameters like fee rates (`BASE_FEE_BPS`, etc.) and rebalancing factors (`FEE_K_FACTOR`) are hardcoded constants. Changes require a program upgrade. This is a security trade-off: less flexible but also less prone to malicious parameter changes via admin abuse if such an instruction existed.
-   **Dependency on SPL Token Program:** Correct interaction with the SPL Token Program for transfers, mints, and burns is assumed.