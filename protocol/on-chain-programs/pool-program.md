---
sidebar_position: 1
---

# wLiquify Solana Liquidity Pool Program: Technical Deep Dive

## Overview

The wLiquify Pool Program is a sophisticated smart contract on the Solana blockchain engineered to manage a diverse multi-asset liquidity pool. It enables users to deposit various supported crypto tokens and, in return, receive wLQI tokens. These wLQI tokens represent a proportional claim on the pool's total assets. The program meticulously handles the minting of wLQI tokens upon asset deposit and their subsequent burning when assets are withdrawn. Its design prioritizes a robust, transparent, and efficient mechanism for liquidity provision, incorporating advanced features such as oracle-based asset pricing and a dynamic fee structure to maintain pool health and desired asset allocations.

**Program ID (On-Chain Address):** `EsKuTFP341vcfKidSAxgKZy91ZVmKqFxRw3CbM6bnfA9` (This is the unique identifier of the deployed program on the Solana blockchain).

## Core Concepts

### wLQI Token: Representing Pool Ownership
-   **Liquidity Provider (LP) Token Role:** The wLQI token functions as an LP token. When users contribute assets to the wLiquify pool, the program mints wLQI tokens for them. The quantity of wLQI tokens received is proportional to the value of their deposited assets relative to the total value already present in the pool.
-   **Value Derivation:** The intrinsic value of a single wLQI token is derived from the aggregated market value of all underlying crypto assets held within the pool's secure vaults. This value is dynamic, fluctuating with changes in the market prices of these assets (as reported by integrated oracle systems) and as protocol fees are potentially accrued to the pool, enhancing the value backing each wLQI token.
-   **Mint/Burn Mechanics:**
    -   **Minting (Creation):** wLQI tokens are newly created and allocated to a user's account when they successfully execute a `deposit` instruction, thereby adding one or more supported tokens to the pool.
    -   **Burning (Destruction):** wLQI tokens are destroyed when a user executes a `withdraw` instruction, redeeming their LP tokens for a corresponding share of the underlying assets.

### Supported Tokens & Pool Composition
The program maintains a strictly defined list of crypto-assets eligible for deposit into the liquidity pool. Each token officially supported by the pool has several associated on-chain entities:
-   A dedicated **Token Vault**: This is a secure, program-controlled account (specifically, a Program Derived Address or PDA, ensuring the program itself manages it) designed to hold the liquidity of that specific token.
-   A **`HistoricalTokenData` Account**: Another PDA that stores persistent, less frequently changed metadata about the token, such as its unique identifier for the external price oracle (e.g., its Pyth feed ID), its decimal precision, and its trading symbol.
-   An **Oracle `price_feed` Account**: The specific on-chain account (e.g., a Pyth Price account) from which the program reads real-time price information for valuation purposes.
The definitive list of supported tokens and their configurations is stored within the central `PoolConfig` account. Adding new tokens to this list is an administrative action performed via the `add_supported_token` instruction.

### Target Weights (Dominance) & Dynamic Fee Mechanism
A cornerstone of the wLiquify pool's design is the concept of **target weights** or **target dominance** for each token. This refers to the desired proportional representation of each asset within the pool, reflecting, for example, its market capitalization relative to other assets in the index. This data is supplied by the custom wLiquify oracle system.

This target dominance is fundamental to the pool's **dynamic fee mechanism**, which intelligently incentivizes user actions that help maintain the pool's alignment with these target allocations:
-   **Influence on Transaction Terms:**
    -   Depositing a token that is **underweight** (its current proportion in the pool is below its target dominance) may result in more favorable terms for the depositor, such as lower fees or a slight bonus in the amount of wLQI tokens minted. This encourages users to supply tokens that the pool needs more of.
    -   Conversely, depositing a token that is already **overweight** might incur slightly higher fees, discouraging further imbalance.
    -   Withdrawals are incentivized inversely: withdrawing an overweight token might be cheaper or offer a bonus, while withdrawing an underweight token could be slightly more expensive.
-   The specifics of fee structures, including base transaction fees and these dynamic adjustments, are detailed in the "Fee Structure (On-Chain Logic)" section. They are determined by pre-defined constants within the program code and live data fetched from the oracle system.

## Key On-Chain Accounts (Data Structures)

The program utilizes several custom on-chain account structures to store its state and manage operations. These accounts are critical for the protocol's functionality and transparency. "PDA" refers to Program Derived Address, a type of Solana account whose address is not a public key but is deterministically derived from seeds and the program's ID, allowing the program itself to control these accounts without needing to store private keys.

### 1. `PoolConfig` (Singleton Central Configuration PDA)
This is the most critical account, acting as the central repository for all global configurations and real-time state for the entire liquidity pool. It is a unique PDA derived using a constant seed `[b"pool_config"]`.
-   **Purpose:** Stores administrative keys (like the admin and fee recipient addresses), settings related to the oracle integration, the mint address of the wLQI token, the address of the Address Lookup Table (LUT) used for efficient transaction processing, the current total value of all assets in the pool, and the comprehensive list of all supported tokens along with their individual configurations.
-   **Key Fields (Conceptual Description):**
    -   `admin: Pubkey`: The public key of the account authorized to perform administrative actions on the pool.
    -   `fee_recipient: Pubkey`: The designated account that receives protocol-generated fees.
    -   `wli_mint: Pubkey`: The unique mint address of the wLQI LP token.
    -   `pool_authority_bump: u8`: A special value (bump seed) used in the derivation of the `PoolAuthority` PDA, essential for the program to be ableto sign on behalf of the `PoolAuthority`.
    -   `oracle_program_id: Pubkey`: The Program ID of the custom wLiquify on-chain oracle service.
    -   `oracle_aggregator_account: Pubkey`: The main data account of the custom wLiquify oracle program. From this account, the pool program sources crucial data like token target dominances and the specific Pyth price feed IDs for each token.
    -   `address_lookup_table: Pubkey`: The public key of an Address Lookup Table (LUT). LUTs are a Solana feature that allows transactions to reference many accounts more efficiently by pre-loading them into a table. This is vital for complex instructions like `update_total_value`.
    -   `current_total_pool_value_scaled: u128`: The total value of all assets currently held in the pool, represented as a large integer scaled to a common precision to avoid floating-point arithmetic issues.
    -   `supported_tokens: Vec<SupportedToken>`: A list (vector) where each element is a `SupportedToken` structure, detailing the configuration for each token the pool accepts.

### 2. `PoolAuthority` (Singleton Program Signer PDA)
This PDA serves as the official "identity" or authority for program-controlled accounts and actions, such as managing the individual token vaults and the wLQI mint.
-   **Purpose:** Enables the pool program to programmatically sign for critical operations like transferring tokens from its vaults during user withdrawals or minting new wLQI LP tokens during user deposits. It acts as the owner of these resources.
-   **PDA Seeds:** Derived using a constant seed `[b"pool_authority"]`. The bump seed required for its derivation and for signing is stored in `PoolConfig.pool_authority_bump`.

### 3. Token Vaults (PDAs, one for each supported token)
For each type of token supported by the pool (e.g., SOL, wrapped ETH), a dedicated token account, known as a vault, is created and managed by the program. These are standard SPL (Solana Program Library) Token accounts, specifically Associated Token Accounts (ATAs), owned by the `PoolAuthority` PDA.
-   **Purpose:** To securely segregate and hold the liquidity of each specific token deposited by users.
-   **PDA Derivation (Conceptual):** ATAs are derived using the owner's key (here, `PoolAuthority`), the SPL Token Program ID, and the specific token's mint address. This standard derivation makes their addresses predictable.

### 4. `wLQI Mint` (Singleton LP Token Mint PDA)
This is the SPL Token mint account for the pool's unique Liquidity Provider (LP) tokens, named wLQI.
-   **Purpose:** This account governs the fundamental properties of the wLQI token, including its total supply, and controls the authority for creating (minting) new wLQI tokens and destroying (burning) them.
-   **PDA Seeds:** Derived using a constant seed `[b"wli_mint"]`.
-   **Authority:** The `PoolAuthority` PDA is designated as both the mint authority (allowing it to create new wLQI tokens) and the freeze authority (if freezing capabilities were to be used) for the `wLQI` mint.

### 5. `SupportedToken` (Data Structure within `PoolConfig`)
This is not a standalone account but a data structure defined within the `PoolConfig.supported_tokens` list. It holds the specific configuration for each individual token that the pool supports.
-   **Purpose:** To store essential references and metadata for each token, ensuring the program can correctly interact with it and its associated accounts.
-   **Key Fields (Conceptual Description):**
    -   `mint: Pubkey`: The mint address of the supported token (e.g., the mint for USDC or wrapped SOL).
    -   `vault: Pubkey`: The address of the dedicated token vault (PDA) where the pool stores this specific token.
    -   `token_history: Pubkey`: The address of the `HistoricalTokenData` PDA for this token.
    -   `price_feed: Pubkey`: The direct on-chain account address (e.g., a Pyth Price account) from which to fetch the current price for this token.

### 6. `HistoricalTokenData` (PDA, one for each supported token)
This account stores persistent, less frequently modified metadata about a token that is, or has been, supported by the pool.
-   **Purpose:** To maintain a reliable record of crucial information necessary for consistent processing, valuation, and potentially for user interface display. This separation prevents cluttering the main `PoolConfig` with data that doesn't change often.
-   **PDA Seeds:** Derived using the seeds `[b"token_history", token_mint.key().as_ref()]`, making it unique for each token mint.
-   **Key Fields (Conceptual Description):**
    -   `feed_id: [u8; 32]`: The unique identifier for the token's primary oracle price feed (e.g., for Pyth, this is their specific feed identifier as a byte array, which is distinct from the price account's Pubkey).
    -   `decimals: u8`: The number of decimal places the token uses (e.g., USDC typically has 6, SOL has 9). This is vital for correct value calculations.
    -   `symbol: [u8; 10]`: The token's trading symbol (e.g., "BTC", "SOL"), stored as a fixed-size byte array. For display, this needs conversion to a standard string format (UTF-8) and trimming of any null padding.

## Core Instructions (Program Functions & Their Logic)

This section details the primary functions (exposed as "instructions" in Solana terminology) that users and administrators can call to interact with the wLiquify Pool program.

### 1. `initialize` (Pool Setup Instruction)
-   **Purpose:** A one-time instruction executed by the designated payer (typically the project team) to deploy and initialize a new instance of the wLiquify pool. It sets up the foundational accounts and parameters.
-   **Key Accounts Involved (and their roles):**
    -   `payer` (Signer, Writable): The account that funds the lamports (SOL) required for the rent of the new accounts being created. Must sign the transaction.
    -   `pool_config` (Writable, PDA): The `PoolConfig` account to be newly created and populated. Its address is derived using `[b"pool_config"]`.
    -   `pool_authority` (PDA): The `PoolAuthority` PDA. Its address is derived using `[b"pool_authority"]`; the program doesn't create it here but needs its address for setup.
    -   `wli_mint` (Writable, PDA): The mint account for wLQI LP tokens, to be newly created. Its address is derived using `[b"wli_mint"]`.
    -   Standard Solana System Accounts: `token_program` (for SPL token operations), `system_program` (for account creation), `rent` sysvar (to check rent exemption).
-   **Input Parameters (Data provided by the caller):**
    -   `admin: Pubkey`: The public key of the account that will be granted administrative control over the pool.
    -   `fee_recipient: Pubkey`: The public key of the account that will receive protocol-generated fees.
    -   `oracle_program_id: Pubkey`: The Program ID of the custom wLiquify on-chain oracle service that this pool instance will use.
-   **Core Logic (Sequence of operations):**
    1.  Creates and initializes the `PoolConfig` account on-chain.
    2.  Stores the provided `admin`, `fee_recipient`, and `oracle_program_id` within the new `PoolConfig`.
    3.  Derives and stores the bump seed for the `PoolAuthority` PDA in `PoolConfig.pool_authority_bump`. This bump seed is crucial for the program to be ableto sign transactions as the `PoolAuthority`.
    4.  Initializes the `wli_mint` as a new SPL token mint. The `PoolAuthority` PDA is set as both its mint authority (allowing the program to create new wLQI) and its freeze authority.
    5.  Sets the initial `PoolConfig.current_total_pool_value_scaled` to zero.
    6.  Initializes `PoolConfig.supported_tokens` as an empty list.
    7.  Determines and stores the address of the `PoolConfig.oracle_aggregator_account`. This address is derived using the `oracle_program_id` (provided as input) and an internally defined, constant seed (e.g., `b"aggregator_v2"`), ensuring the pool knows where to read oracle data from.
    8.  The `PoolConfig.address_lookup_table` is initially not set; it is expected to be configured later via the `set_lookup_table` admin instruction.

### 2. `add_supported_token` (Administrative Token Listing)
-   **Purpose:** Allows the pool administrator to add a new token to the `PoolConfig.supported_tokens` list. This makes the token eligible for deposits and withdrawals. The instruction also creates the necessary associated accounts for the new token (its dedicated `pool_vault` and `token_history_account`).
-   **Key Accounts Involved:**
    -   `admin` (Signer, Writable): The pool administrator, whose public key must match `PoolConfig.admin`. Must sign the transaction.
    -   `pool_config` (Writable, PDA): The global pool configuration account, which will be updated with the new token's details.
    -   `pool_authority` (PDA): The pool's authority PDA, used for creating the token vault.
    -   `token_mint`: The mint address of the new token to be added to the pool.
    -   `pool_vault` (Writable, PDA - an ATA): The token account (vault) to be created for holding this `token_mint`. It's an ATA owned by `pool_authority`.
    -   `token_history_account` (Writable, PDA): The account to be created for storing historical/metadata for this `token_mint`. Derived from `[b"token_history", token_mint]`.
    -   `oracle_aggregator_account` (Read-only): The main data account of the custom oracle program (its address is stored in `PoolConfig`). This is read to fetch metadata about the new token.
    -   Standard Solana System Accounts: `system_program`, `token_program`, `associated_token_program`, `rent` sysvar.
-   **Input Parameters:** None from the caller directly in the instruction data; all necessary info comes from the accounts provided.
-   **Core Logic:**
    1.  Verifies that the `admin` account signing the transaction is indeed the authorized administrator stored in `PoolConfig`.
    2.  Performs checks: Is the `token_mint` already supported? Does the pool have capacity for more tokens (e.g., if there's a maximum limit)?
    3.  Initializes the `pool_vault` (an ATA for `PoolAuthority` to hold `token_mint`) if it doesn't already exist.
    4.  Initializes the `token_history_account` PDA.
    5.  **Metadata Population for the New Token:** This is a critical step.
        *   Reads the `decimals` directly from the on-chain `token_mint` account of the new token.
        *   Fetches data from the `oracle_aggregator_account` (the custom wLiquify oracle).
        *   Within the oracle's data, it looks up the entry corresponding to the `token_mint` being added. This entry (typically a `TokenInfo` structure in the oracle) contains the token's `symbol` and its `price_feed_id` (which is often stored as a string representation of the Pyth price account's Pubkey).
        *   Parses this `price_feed_id` string from the oracle data into an actual Solana `Pubkey`. This Pubkey (`price_feed_pda_address`) is the direct address of the Pyth (or other primary oracle) price account for this specific token.
        *   Validates that this parsed `price_feed_pda_address` is a valid, non-default Pubkey, ensuring a real price feed is associated.
    6.  Initializes the newly created `token_history_account` with:
        *   `feed_id`: The raw bytes of the `price_feed_pda_address` (Pubkey) obtained from the oracle.
        *   `decimals`: The `decimals` read from the `token_mint`.
        *   `symbol`: The `symbol` obtained from the oracle data.
    7.  Creates a new `SupportedToken` data structure entry, populating it with the `token_mint`'s address, the `pool_vault`'s address, the `token_history_account`'s address, and the derived `price_feed_pda_address`.
    8.  Appends this new `SupportedToken` entry to the `pool_config.supported_tokens` list.
    9.  The program typically logs an administrative message reminding the operator to update the off-chain Address Lookup Table (LUT) to include the addresses of the newly created `pool_vault`, `token_history_account`, and the `price_feed_pda_address` for the added token. This is crucial for the `update_total_value` instruction.

### 3. `cleanup_historical_data` (Administrative Token Delisting and Account Closure)
-   **Purpose:** Enables an administrator to formally remove a token from the pool's active management and close its associated on-chain accounts (`historical_token_data` and `pool_vault`). This is done for tokens that are delisted (e.g., no longer meet criteria, zero dominance in oracle) and whose pool vaults have been completely emptied by users. This action reclaims the SOL locked for rent on these accounts.
-   **Key Accounts Involved:**
    -   `admin` (Signer, Writable): The pool administrator.
    -   `pool_config` (Writable, PDA): Global pool configuration. Account constraints verify it `has_one = admin`, `has_one = fee_recipient`, and `has_one = oracle_aggregator_account`.
    -   `pool_authority` (PDA): Pool's authority PDA, needed for signing the instruction to close the token vault.
    -   `fee_recipient` (Writable, from `pool_config`): The account that will receive the reclaimed SOL rent from the closed accounts.
    -   `oracle_aggregator_account` (Read-only, from `pool_config`): Read to verify the token is indeed considered delisted by the oracle system.
    -   `historical_token_data` (Writable, PDA, marked `close = fee_recipient`): The specific `HistoricalTokenData` account for the token to be closed. Its address is derived using `[b"token_history", token_mint_arg.as_ref()]`. The `close = fee_recipient` attribute means Anchor will automatically transfer its lamports to `fee_recipient` upon instruction success.
    -   `token_mint` (Read-only): The mint address of the token being cleaned up. This is passed as `token_mint_arg` to help derive `historical_token_data`.
    -   `pool_vault` (Writable, PDA - an ATA): The pool vault for the `token_mint` to be closed.
    -   Standard Solana System Accounts: `token_program`, `system_program`.
-   **Input Parameters:**
    -   `token_mint_arg: Pubkey`: The mint address of the token to be cleaned up.
-   **Core Logic:**
    1.  Verifies the `admin`'s signature and authority against `PoolConfig`.
    2.  Confirms the token is effectively "delisted" by querying the `oracle_aggregator_account`. A token is typically considered delisted if its `dominance` in the oracle's data is zero, or if the token is no longer present in the oracle's active feed.
    3.  Crucially, ensures the `pool_vault` for the token is empty (its token balance is 0). The program will not allow closing a vault that still holds tokens.
    4.  Removes the `SupportedToken` entry for `token_mint_arg` from the `pool_config.supported_tokens` list.
    5.  Closes the `pool_vault` by making a Cross-Program Invocation (CPI) to the SPL Token Program's `close_account` instruction. This CPI is signed by the `pool_authority` PDA. The SOL rent from the closed vault is transferred to the `fee_recipient`.
    6.  The `historical_token_data` account is closed automatically by the Anchor runtime (due to the `close = fee_recipient` attribute), and its SOL rent is also sent to the `fee_recipient`.
    7.  Similar to `add_supported_token`, the program logs administrative reminders to update the off-chain Address Lookup Table (LUT) by deactivating or removing the addresses of the closed accounts (`pool_vault`, `historical_token_data`) and the associated price feed PDA.

### 4. `deposit` (User Action: Adding Liquidity)
-   **Purpose:** Allows any user to deposit a quantity of a supported token into the pool. In return, the user receives wLQI LP tokens representing their share of the now larger pool.
-   **Key Accounts Involved:**
    -   `user` (Signer, Writable): The user performing the deposit. Must sign the transaction.
    -   `user_source_ata` (Writable): The user's own token account from which the asset being deposited will be transferred.
    -   `fee_recipient` (Read-only, from `pool_config`): The account that receives protocol fees (though fees in `deposit` are often handled by minting directly to this account's wLQI ATA).
    -   `pool_config` (Writable, PDA): Global pool configuration, which will be updated (e.g., `current_total_pool_value_scaled`).
    -   `pool_authority` (PDA): Pool's authority PDA, needed for minting wLQI and as authority over vaults.
    -   `wli_mint` (Writable, from `pool_config`): The wLQI LP token mint, from which new LP tokens will be minted.
    -   `user_wli_ata` (Writable, ATA): The user's Associated Token Account for wLQI tokens. If it doesn't exist, it's typically created in the same transaction. New wLQI are minted here.
    -   `owner_fee_account` (Writable, ATA): The `fee_recipient`'s ATA for receiving fees denominated in wLQI tokens.
    -   `deposit_mint` (Read-only): The mint address of the specific token being deposited by the user.
    -   `target_token_vault_ata` (Writable, ATA): The pool's dedicated vault for the `deposit_mint`, where the deposited tokens will be stored.
    -   `oracle_aggregator_account` (Read-only, from `pool_config`): Read to get the token's target dominance for dynamic fee calculation.
    -   `deposit_price_feed` (Read-only): The specific oracle price feed account (e.g., Pyth Price account) for the `deposit_mint`. Its address is verified against the one stored in `PoolConfig` for this token.
    -   Standard Solana System Accounts: `token_program`, `system_program`, `associated_token_program`, `rent` sysvar.
-   **Input Parameters:**
    -   `amount: u64`: The quantity of the `deposit_mint` token the user wishes to deposit.
-   **Core Logic:**
    1.  Validates the deposit `amount` (e.g., it must be greater than zero).
    2.  Verifies that the provided `deposit_price_feed` account matches the one registered in `pool_config.supported_tokens` for the `deposit_mint`, ensuring the correct price source is used.
    3.  Fetches the current price of the `deposit_mint` from the `deposit_price_feed` (e.g., Pyth), performing necessary validations like checking for price staleness and ensuring the asset is actively trading.
    4.  Calculates the value of the deposited tokens (e.g., in USD, scaled) using the validated oracle price and the `amount`.
    5.  Calculates the amount of wLQI tokens to mint. This is a critical calculation, typically based on the ratio of the deposit's value to the pool's total value before the deposit, scaled by the current wLQI supply. (Formula conceptually: `wLQI_to_mint = (deposit_value / total_pool_value_before_deposit) * current_wLQI_supply`). Special logic handles the first deposit into an empty pool (often a 1:1 value minting).
    6.  Applies dynamic fees or bonuses as detailed in the "Fee Structure (On-Chain Logic)" section. This involves fetching the token's current target dominance from the `oracle_aggregator_account` and adjusting the wLQI to be minted. The base fee component (denominated in wLQI) is typically minted directly to the `owner_fee_account`.
    7.  Transfers the `amount` of the `deposit_token` from the `user_source_ata` to the pool's `target_token_vault_ata`.
    8.  Mints the net calculated amount of wLQI tokens (after fee/bonus adjustments) to the `user_wli_ata`.
    9.  Updates `pool_config.current_total_pool_value_scaled` by adding the value of the newly deposited assets.

### 5. `set_lookup_table` (Administrative LUT Configuration)
-   **Purpose:** Allows the pool administrator to set or update the Address Lookup Table (LUT) associated with the pool. LUTs are essential for instructions that need to reference many accounts, like `update_total_value`, by allowing these accounts to be loaded more efficiently.
-   **Key Accounts Involved:**
    -   `admin` (Signer, Writable): The pool administrator.
    -   `pool_config` (Writable, PDA): Global pool configuration, where the LUT address will be stored.
    -   `lookup_table_account` (Read-only): The actual LUT account (which must already be created and initialized on-chain) to be associated with the pool.
-   **Input Parameters:** None directly in instruction data; the LUT address is passed as an account.
-   **Core Logic:**
    1.  Verifies the `admin`'s signature and authority.
    2.  Performs validations on `lookup_table_account` to ensure it is a valid and initialized LUT (e.g., checks its owner program, initialization status). This is crucial for security and operational integrity.
    3.  Updates the `pool_config.address_lookup_table` field with the public key of the provided `lookup_table_account`.

### 6. `update_total_value` (Automated Pool Value Refresh)
-   **Purpose:** A "crank" instruction, meaning it's intended to be called periodically by an automated off-chain keeper (like the Pool Maintainer service) to refresh the `pool_config.current_total_pool_value_scaled`. This ensures the pool's cached total value is up-to-date with current market prices and vault balances.
-   **Key Accounts Involved:**
    -   `pool_config` (Writable, PDA): The global pool configuration where `current_total_pool_value_scaled` is updated.
    -   `address_lookup_table` (Read-only): The pool's configured LUT. This LUT must contain all the accounts required for the calculation.
    -   *Remaining Accounts (Resolved via LUT):* For each token currently supported by the pool, this instruction expects a triplet of accounts to be passed (their addresses are loaded from the LUT):
        *   Its `pool_vault` (to read the current balance).
        *   Its `token_history_account` (to read `decimals` and the oracle `feed_id`).
        *   Its `price_feed` account (the actual oracle price account, e.g., Pyth Price account, whose address was stored in `SupportedToken.price_feed`).
-   **Input Parameters:** None.
-   **Core Logic:**
    1.  Iterates through all tokens listed in `pool_config.supported_tokens`, using the accounts provided and resolved via the `address_lookup_table`.
    2.  For each supported token:
        *   Reads its current balance from its `pool_vault`.
        *   Reads its `decimals` and the raw `feed_id` (bytes of the price feed Pubkey) from its `token_history_account`.
        *   Reads the current price from its `price_feed` account (e.g., Pyth), performing validations for staleness and trading status.
        *   Calculates the current value (e.g., in scaled USD) of the tokens held in that vault, using the balance, decimals, and validated oracle price.
    3.  Sums the calculated values of all individual token vaults to arrive at a new `total_value_usd_scaled`.
    4.  Updates `pool_config.current_total_pool_value_scaled` with this newly calculated sum.

### 7. `withdraw` (User Action: Redeeming Liquidity)
-   **Purpose:** Allows a user to burn their wLQI LP tokens in exchange for a proportional share of a specific underlying asset from the pool.
-   **Key Accounts Involved:**
    -   `user` (Signer, Writable): The user performing the withdrawal. Must sign.
    -   `user_wli_ata` (Writable): The user's token account holding the wLQI tokens to be burned.
    -   `user_destination_ata` (Writable, ATA): The user's token account where they will receive the withdrawn underlying asset.
    -   `fee_recipient` (Read-only, from `pool_config`).
    -   `pool_config` (Writable, PDA): Global pool configuration.
    -   `pool_authority` (PDA): Pool's authority PDA, for signing token transfers from vaults and burning wLQI.
    -   `wli_mint` (Writable, from `pool_config`): The wLQI LP token mint, from which tokens will be burned.
    -   `owner_fee_account` (Writable, ATA): The `fee_recipient`'s ATA for wLQI, where wLQI-denominated fees are sent.
    -   `withdraw_mint` (Read-only): The mint address of the specific underlying token the user wishes to withdraw from the pool.
    -   `source_token_vault_ata` (Writable, ATA): The pool's dedicated vault for the `withdraw_mint`, from which tokens will be transferred to the user.
    -   `oracle_aggregator_account` (Read-only, from `pool_config`): Read for token dominance for dynamic fees.
    -   `withdraw_price_feed` (Read-only): The oracle price feed account for the `withdraw_mint`. Verified against `PoolConfig`.
    -   Standard Solana System Accounts.
-   **Input Parameters:**
    -   `amount: u64`: The quantity of wLQI tokens the user wishes to burn.
    -   `withdraw_full_delisted_balance: bool`: A flag indicating special handling if the user is withdrawing their full share of a token that is considered delisted by the oracle.
-   **Core Logic:**
    1.  Validates the `amount` of wLQI to burn (e.g., user has sufficient balance, amount is not zero).
    2.  Verifies the `withdraw_price_feed` account against `PoolConfig`.
    3.  Calculates the total value represented by the wLQI tokens being burned. This is based on the proportion of `amount` to `wli_mint.supply` multiplied by `pool_config.current_total_pool_value_scaled`.
    4.  Fetches the current price of the `withdraw_mint` token from its oracle (`withdraw_price_feed`), validating the price.
    5.  Determines the gross amount of `withdraw_mint` tokens to be dispensed to the user, based on the value of wLQI burned and the token's current price.
    6.  **Dynamic Fees/Bonuses & Delisted Token Logic:**
        *   If `withdraw_full_delisted_balance` is `true` AND the `withdraw_mint` is identified as "delisted" (e.g., its dominance in the `oracle_aggregator_account` is zero), a special fixed `DELISTED_WITHDRAW_BONUS_BPS` is applied. This usually results in a bonus on the amount of the underlying token withdrawn, incentivizing users to remove their liquidity from the delisted asset.
        *   Otherwise (for standard withdrawals of active tokens), the dynamic fee/bonus logic (detailed in "Fee Structure") applies. This involves fetching the token's current dominance, calculating fee adjustments, and transferring any base fee component (in wLQI) from the user to the `owner_fee_account`.
    7.  Burns the `amount` of wLQI tokens from the `user_wli_ata`.
    8.  Transfers the net calculated amount of `withdraw_mint` tokens (after any fee/bonus adjustments on the output amount) from the pool's `source_token_vault_ata` to the `user_destination_ata`.
    9.  Updates `pool_config.current_total_pool_value_scaled` by subtracting the value of the withdrawn assets.

## Fee Structure (On-Chain Logic)

Fees within the wLiquify Pool are not set as simple configurable percentages in `PoolConfig`. Instead, they are determined by a combination of hardcoded constants within the program's logic and dynamic calculations performed at the moment of a deposit or withdrawal, heavily influenced by live oracle data.

-   **Components of Fees & Bonuses:**
    -   **Base Fee:** A fundamental `BASE_FEE_BPS` (Basis Points, where 100 BPS = 1%) is defined as a constant in the program (e.g., 10 BPS could represent a 0.1% fee). This fee is calculated on the value of the wLQI tokens involved in the operation.
        -   For `deposit` operations, this base fee (calculated in terms of wLQI) is typically minted directly to the `owner_fee_account` (the `PoolConfig.fee_recipient`'s wLQI token account).
        -   For `withdraw` operations, this base fee (in wLQI) is transferred from the user's wLQI account to the `owner_fee_account` before the remaining wLQI is burned.
    -   **Dynamic Rebalancing Adjustment:** This is the core mechanism that drives the pool towards its target asset allocations. It adjusts the transaction terms based on how the deposit or withdrawal affects the token's current weight in the pool relative to its oracle-reported target dominance.
        -   A constant `FEE_K_FACTOR` (e.g., k=0.2) is used in the calculation, which typically involves assessing the token's deviation from its target dominance both before and notionally after the transaction.
        -   **Incentivizing Balance:**
            *   **Depositing an underweight token / Withdrawing an overweight token:** Actions that help balance the pool (i.e., move a token closer to its target dominance if underweight, or reduce its overweight status) can result in a *premium* for the user. This means the dynamic adjustment component of the fee becomes negative, effectively reducing the base fee or even providing a net bonus.
            *   **Depositing an overweight token / Withdrawing an underweight token:** Actions that exacerbate imbalance incur a *penalty*, meaning the dynamic adjustment component is positive, adding to the base fee.
        -   The final `total_fee_bps` applied to the transaction value is a combination of the `BASE_FEE_BPS` and this calculated dynamic adjustment.
    -   **Fee Boundaries (Hardcoded Constants):** To prevent extreme outcomes from the dynamic adjustments:
        -   `DEPOSIT_PREMIUM_CAP_BPS`: Defines the maximum premium (negative fee) a user can receive on a deposit (e.g., -500 BPS, meaning up to a 5% effective bonus on deposit value, before considering the base fee).
        -   `WITHDRAW_FEE_FLOOR_BPS`: Defines the minimum fee for withdrawals (e.g., 0 BPS, meaning withdrawals won't result in a net bonus to the user beyond counteracting the base fee, but can be free).
        -   The total effective fee is also typically capped (e.g., at 99.99%) to ensure a user always receives some assets back.
    -   **Delisted Token Withdrawal Bonus:** For withdrawals of delisted tokens using the `withdraw_full_delisted_balance: true` flag, a separate, fixed `DELISTED_WITHDRAW_BONUS_BPS` (e.g., 500 BPS = 5% bonus on the withdrawn asset amount) applies, bypassing the standard dynamic fee calculations.
-   **Fee Recipient & Collection:**
    -   The `BASE_FEE_BPS` portion of fees, always denominated in wLQI, is directed to the `owner_fee_account`.
    -   The `PoolConfig.fee_recipient` (who owns the `owner_fee_account`) can then withdraw these accumulated wLQI tokens using standard SPL token wallet operations, as they control the private key to that account. No special program instruction is needed for the fee recipient to claim these wLQI fees.

## Oracle Integration: The Data Backbone

The wLiquify Pool Program's accuracy and dynamism are heavily reliant on its integration with two oracle components: the custom wLiquify on-chain oracle program and primary price oracles like Pyth Network.

-   **Oracle System Configuration (Stored in `PoolConfig`):**
    -   `oracle_program_id`: The on-chain address of the custom wLiquify oracle program. This tells the pool program where to find the specialized oracle service.
    -   `oracle_aggregator_account`: The address of the main data account within the custom wLiquify oracle program. It is from this account that the pool program reads curated data such as each token's symbol, its target dominance percentage, and the string representation of its Pyth price feed ID. This address is typically derived deterministically during the pool's `initialize` instruction based on the `oracle_program_id` and a known seed.
-   **Per-Token Oracle Data Linkage (Managed via `SupportedToken` and `HistoricalTokenData`):**
    -   When a token is added via `add_supported_token`, the pool program reads the `oracle_aggregator_account`. For the new token, it extracts:
        *   Its `symbol`.
        *   Its Pyth price feed ID (as a string). This string is then parsed into a `Pubkey` and stored as `SupportedToken.price_feed`. This `Pubkey` is the direct address of the Pyth `Price` account for that token.
        *   The raw bytes of this Pyth `Price` account Pubkey are also stored in `HistoricalTokenData.feed_id`.
-   **Key Instructions Relying on Oracle Data:**
    -   `add_supported_token`: Crucially uses the `oracle_aggregator_account` to fetch the symbol and Pyth price feed ID string for a new token, then stores the parsed Pyth price account Pubkey.
    -   `deposit` & `withdraw`:
        *   Fetch the token's current target `dominance` from the `oracle_aggregator_account` for dynamic fee/bonus calculations.
        *   Fetch the token's live price from its specific `price_feed` account (the Pyth `Price` account address stored in `SupportedToken.price_feed`) for asset valuation, calculating wLQI to mint/burn, and determining output token amounts.
    -   `update_total_value`: For every supported token, uses its `price_feed` (Pyth `Price` account address) to get current prices to recalculate the total value of all assets in the pool.
    -   `cleanup_historical_data`: Checks a token's `dominance` in the `oracle_aggregator_account` to verify it is indeed delisted (dominance is zero or token not found) before allowing account closure.
-   **Price Data Usage and On-Chain Validation:**
    -   Oracle prices are fundamental for converting token quantities into a common value unit (e.g., USD, scaled to a high precision) for all internal calculations, ensuring fairness and accuracy.
    -   The program incorporates several on-chain checks when consuming price data from Pyth feeds:
        -   **Price Staleness:** Verifies that the fetched price data is not older than a predefined maximum allowable age (e.g., `MAX_PRICE_STALENESS_SECONDS`).
        -   **Trading Status:** Checks oracle flags indicating if the asset is actively trading or if there are issues with its price feed.
        -   **Price Validity:** Ensures prices are non-negative and within reasonable bounds if applicable.
    -   The program defines specific error types (e.g., `PythPriceValidationFailed`, `PythPriceNotTrading`, `PriceFeedStale`, `InvalidPrice`) that are returned if these oracle data validations fail, halting the transaction to prevent operations based on unreliable data.

## Admin Capabilities & Responsibilities

The account designated as `PoolConfig.admin` holds significant authority and responsibilities for the secure and proper functioning of the pool. These are exercised through specific administrative instructions:

-   **Pool Setup & Core Configuration:**
    -   `initialize`: The initial administrator (often the project team) executes this to deploy the pool, setting the first admin, fee recipient, and linking to the oracle program.
    -   `set_lookup_table`: Manages the pool's Address Lookup Table (LUT), crucial for the performance of instructions that involve many accounts.
-   **Token Lifecycle Management:**
    -   `add_supported_token`: Adds new tokens to the pool, a process that involves creating their on-chain vaults and historical data accounts, and crucially, linking them to their respective price feeds and dominance data via the custom oracle.
    -   `cleanup_historical_data`: Removes tokens that are fully delisted (as per oracle data) and whose vaults have been emptied, allowing for the reclamation of SOL from their closed accounts.
-   **Indirect Influence via Oracle System:**
    -   While the pool admin doesn't directly set parameters like target token dominances or oracle price feed IDs within the pool program itself (as these are read from the external custom oracle), the admin is responsible for ensuring the `oracle_aggregator_account` (which the pool reads from) is correctly configured and that the off-chain oracle feeder service feeding that account is operating reliably. The overall system integrity depends on this coordination.

-   **Admin-Only Instructions (requiring the `admin`'s signature):**
    -   `initialize` (Note: the `payer` also signs this, but the `admin` parameter defines future administrative rights).
    -   `add_supported_token`.
    -   `set_lookup_table`.
    -   `cleanup_historical_data`.

## Delisting Tokens: Process and Implications

The process of delisting a token from the wLiquify pool is primarily driven by changes in the data provided by the custom wLiquify oracle system, coupled with specific logic within the pool program's instructions.

-   **Mechanism of Delisting:**
    1.  **Oracle Data Change (External Trigger):** A token is effectively marked as "delisted" from the pool's perspective when its representation in the `oracle_aggregator_account` (the data source from the custom oracle) indicates this status. This typically means:
        *   Its reported `dominance` becomes zero.
        *   Or, the token is entirely removed from the custom oracle's active data feed.
    2.  **Pool Program's Recognition of Delisted Status:**
        *   The `deposit` instruction would likely prevent new deposits of a token if its oracle-reported dominance is zero, as this would lead to extreme (likely unfavorable) fee calculations or signal that it's no longer a strategic part of the index.
        *   The `withdraw` instruction explicitly checks the oracle dominance. If it's zero, the token is considered `is_delisted` for the purpose of applying special withdrawal logic.
        *   The `cleanup_historical_data` instruction requires that a token shows zero dominance (or is absent) in the oracle data as a precondition for allowing its accounts to be closed.
-   **Withdrawal of Delisted Tokens:**
    -   Users can withdraw their share of a token that the pool considers delisted by calling the standard `withdraw` instruction and setting the `withdraw_full_delisted_balance: bool` parameter to `true`.
    -   When this flag is true and the token is confirmed as delisted (e.g., zero dominance according to the oracle):
        -   A special, fixed `DELISTED_WITHDRAW_BONUS_BPS` (a constant defined in the program) is applied. This usually results in a bonus on the amount of the underlying token withdrawn, incentivizing users to remove their liquidity from the delisted asset.
        -   The calculation aims to give the user their precise pro-rata share of any remaining tokens in that specific `pool_vault`, potentially bypassing the usual dynamic fee logic that applies to active, balancing assets.
-   **Final Cleanup by Administrator:**
    -   After a token has been effectively delisted via the oracle system and its dedicated `pool_vault` has been completely emptied by users withdrawing their funds, the pool administrator can execute the `cleanup_historical_data` instruction.
    -   This removes the token's entry from `PoolConfig.supported_tokens` and formally closes its `pool_vault` and `historical_token_data` accounts, reclaiming the SOL that was allocated for their rent.

## Error Handling Philosophy

The wLiquify Pool program incorporates a comprehensive set of custom error types. These are designed to provide specific feedback when an instruction cannot be executed as intended due to invalid inputs, failed on-chain validation checks (e.g., oracle price too stale), arithmetic issues (e.g., overflow), or unmet conditions (e.g., trying to withdraw more wLQI than owned).

For individuals or systems interacting with the program, understanding these custom errors is crucial for:
-   Building robust client-side applications that can gracefully handle and interpret these errors.
-   Effectively diagnosing the cause of failed transactions.

A complete enumeration of custom error codes, their names, and descriptive messages is typically found within the program's Interface Definition Language (IDL) file (e.g., `w_liquify_pool.json` if an IDL is published) or directly in the Rust source code's error definitions. This is the most accurate reference for detailed error information.

## Security Considerations (Program-Level)

The security and integrity of the wLiquify Pool Program depend on several factors, ranging from administrative key management to the reliability of external data feeds and the robustness of the smart contract code itself.

-   **Administrative Privileges (`PoolConfig.admin`):** The security of the `admin` key is paramount. If compromised, an attacker could potentially:
    -   Add unauthorized or malicious tokens (if the oracle system could also be influenced to list them).
    -   Misconfigure the Address Lookup Table (LUT) via `set_lookup_table`, potentially disrupting operations or causing transaction failures.
    -   Prematurely attempt `cleanup_historical_data` if other conditions (like oracle delisting and zero vault balance) could also be manipulated or met.
    *Mitigation: Strict, secure management of the admin key (e.g., using a hardware wallet, multi-signature control if the admin is a multi-sig address).*

-   **Oracle System Security & Integrity:** The pool's financial correctness is inextricably linked to the accuracy, liveness, and tamper-resistance of both the custom wLiquify oracle and the primary price oracles (e.g., Pyth) it relies upon.
    -   **Price & Dominance Manipulation Risk:** If the data fed into `oracle_aggregator_account` (for dominance) or the prices from Pyth feeds can be manipulated, it could lead to users receiving unfair exchange rates, incorrect fee calculations, or opportunities for value extraction from the pool.
    -   **Staleness & Liveness of Oracle Data:** The program implements checks (e.g., `MAX_PRICE_STALENESS_SECONDS`, trading status) for price data. Failure or prolonged unavailability of the oracle systems could impair or halt critical pool operations (deposits, withdrawals, value updates).
    *Mitigation: Robust oracle design, use of reputable primary oracles like Pyth, diligent monitoring by the off-chain services, and on-chain validation checks.*

-   **Smart Contract Code Risks (General DeFi Risks):**
    -   **Implementation Bugs:** Unforeseen flaws in the Rust code could lead to vulnerabilities, incorrect calculations, or unintended state changes.
    *Mitigation: Thorough code audits by reputable security firms, comprehensive testing, and adherence to secure development practices.*
    -   **Arithmetic Precision & Overflow/Underflow:** Financial calculations, especially those involving scaled integers (like `current_total_pool_value_scaled` or fee calculations), must be carefully designed to prevent overflows or underflows that could lead to incorrect results or exploits. The use of `u128` for values and `checked_` arithmetic operations in Rust helps, but the overall logic flow must be sound.
    *Mitigation: Careful choice of data types, use of safe arithmetic libraries/operations, and rigorous testing of edge cases.*
    -   **Input Validation:** All inputs to instructions must be rigorously validated to prevent unexpected behavior or exploitation. This includes amounts, account addresses (where not strictly constrained by PDAs or `has_one` Anchor constraints), and flags.
    *Mitigation: Comprehensive validation logic within each instruction handler.*

-   **Program Derived Address (PDA) Integrity:** The correct derivation, initialization, and usage of PDAs for `PoolAuthority`, token vaults, `wli_mint`, and `HistoricalTokenData` are essential for program security and state integrity.
    *Mitigation: Adherence to standard PDA derivation patterns, correct seed usage, and Anchor framework features that help manage PDAs.*

-   **Address Lookup Table (LUT) Management:** The `set_lookup_table` instruction grants the admin the power to change the LUT. A compromised or incorrectly configured LUT could cause transactions (especially `update_total_value`) to fail by being fed incorrect account addresses or by missing necessary accounts. There's also an operational security aspect: the LUT must be kept up-to-date by the admin/operators after tokens are added or removed.
    *Mitigation: Secure admin key management, careful LUT construction and updates, and operational diligence.*

-   **Fee Recipient Account Security:** The `fee_recipient` account (set at `initialize`) will accumulate wLQI fees. The security of this account's private key is important to protect collected protocol revenue.
    *Mitigation: Standard private key security practices for the fee recipient account.*

-   **Hardcoded Parameters vs. Configurability:** Critical financial parameters like `BASE_FEE_BPS` and the `FEE_K_FACTOR` are hardcoded constants in the program. This makes them unchangeable without a full program upgrade.
    *Security Implication: This is a trade-off. It's less flexible but reduces the risk of these core parameters being maliciously altered by a compromised admin if they were configurable on-chain via an admin instruction.*

-   **Dependency on SPL Token Program:** The program assumes correct and secure interaction with the standard Solana SPL Token Program for all token transfers, minting, and burning operations.
    *Mitigation: This is a standard Solana dependency; risks are generally low if using the official SPL Token Program correctly.*

---

</rewritten_file> 