---
sidebar_position: 1
slug: /developer-docs/off-chain-services/pool-maintainer
---

# Pool Maintainer Script (maintainerDetails.md)

## Introduction

The Pool Maintainer is a Node.js script designed for automated on-chain maintenance of the wLiquify Solana liquidity pool program. Its primary responsibilities include ensuring pool health, maintaining the accuracy of the total pool value, managing the list of supported tokens, and cleaning up historical data. It runs as a continuous background service or bot.

The script utilizes the following core technologies:
*   **Node.js**: As the runtime environment for the script.
*   **TypeScript**: The script is written in TypeScript.
*   **Solana SDKs**: Primarily `@solana/web3.js` for interacting with the Solana blockchain (e.g., sending transactions, fetching account data).
*   **Anchor Client**: Potentially, if the script is designed to interact with an Anchor-based Solana program, it might use `@coral-xyz/anchor` for easier instruction building and account handling.

## Setup and Configuration

### Prerequisites

*   **Node.js**: A recent LTS version (e.g., v18.x or v20.x).
*   **NPM or Yarn**: For package management.
*   **TypeScript Compiler**: (`tsc`) if running from source or modifying.
*   **Solana CLI**: Optional, but useful for keypair management and cluster interaction.
*   **Environment Setup**: Access to a Solana RPC node.

### Environment Variables

The script relies on the following environment variables for its operation (typically defined in a `.env` file):

*   `RPC_URL`: The URL of the Solana RPC node to connect to (e.g., `https://api.mainnet-beta.solana.com` or a private RPC).
*   `KEEPER_PRIVATE_KEY`: The private key (e.g. byte array string) of the keeper/admin account that will pay for transactions and has authority to call the maintenance instructions. Alternatively, `KEEPER_KEYPAIR_PATH` could specify a path to a JSON keypair file.
*   `POOL_PROGRAM_ID`: The public key of the deployed wLiquify Solana program.
*   `POOL_CONFIG_PDA_ADDRESS`: The public key of the PoolConfig PDA account, which stores the main configuration for the liquidity pool.
*   `ADDRESS_LOOKUP_TABLE_ADDRESS`: The public key of the Address Lookup Table (LUT) used by the pool, particularly for instructions like `update_total_value` that require many accounts.
*   `CHECK_INTERVAL_SECONDS`: Controls the frequency (in seconds) of the main maintenance cycle that checks for tokens to add or clean up. Defaults to 10 seconds if not set. Example: `CHECK_INTERVAL_SECONDS=60` for a 1-minute interval.

### Installation

1.  **Clone the repository** (if applicable) or ensure you have the script files.
2.  **Install dependencies**:
    ```bash
    npm install
    # or
    yarn install
    ```
3.  **Compile TypeScript** (if running from source):
    ```bash
    npm run build
    # or
    yarn build 
    ```
    This will install `@solana/web3.js`, potentially `@coral-xyz/anchor`, and any other necessary packages listed in `package.json`, and compile the TypeScript code (e.g., to a `dist` directory).

## Core Maintenance Tasks (Script Functionality)

The Pool Maintainer script performs several critical on-chain operations through automated, recurring cycles.

### Task 1: Updating Total Pool Value (via `update_total_value` on-chain instruction)

*   **Objective**: This task calls the on-chain `update_total_value` instruction. The primary goal is to refresh the `PoolConfig.current_total_pool_value_scaled` field, ensuring it accurately reflects the current market value of all assets held in the pool's vaults.
*   **Trigger/Frequency**:
    *   The script initiates a separate, recurring schedule for this task via an internal `scheduleTotalValueUpdates()` function. 
    *   The exact interval for this is likely configured within its handler (`./handlers/updateTotalValue.ts`) or uses a default optimized for value updates (e.g., every 5-15 minutes).
    *   This operates independently of the main `CHECK_INTERVAL_SECONDS` used for adding/cleaning tokens.
*   **Script Logic & Interaction with On-Chain Program**:
    1.  **Connect to Solana Cluster**: Establishes a connection to the Solana network using the `RPC_URL`.
    2.  **Load Keeper Keypair**: Loads the keeper/admin keypair from `KEEPER_PRIVATE_KEY` or `KEEPER_KEYPAIR_PATH`.
    3.  **Fetch Necessary On-Chain Data**:
        *   **Address Lookup Table (LUT)**: Retrieves the `ADDRESS_LOOKUP_TABLE_ADDRESS` from environment variables. The script will then fetch the LUT content from the chain to resolve the full list of accounts.
        *   **Account Preparation for `update_total_value`**: The `update_total_value` instruction requires a comprehensive list of accounts, including:
            *   `pool_config`: The main configuration PDA.
            *   `keeper`: The authorized account calling the instruction.
            *   `address_lookup_table`: The LUT itself.
            *   For *every* supported token:
                *   `pool_vault`: The PDA holding the pool's supply of that token.
                *   `token_history_account`: The PDA storing historical data for that token.
                *   `price_feed`: The oracle price feed account for that token.
            *   The script dynamically builds this list by first fetching `PoolConfig` to identify all `supported_tokens`, then deriving their respective `pool_vault` and `token_history_account` PDAs, and including their `price_feed` accounts (which are typically stored within `PoolConfig` alongside each supported token's details).
            *   `[Refer to poolDetails.md for the precise list and order of accounts expected by the on-chain update_total_value instruction.]`
    4.  **Construct Transaction**: Builds the `update_total_value` instruction using the Solana SDK (and Anchor client, if applicable), providing all required accounts.
        *   The instruction itself likely takes no arguments, as it reads all necessary data from the provided accounts.
    5.  **Sign Transaction**: Signs the transaction using the keeper's keypair.
    6.  **Send, Confirm, and Log**:
        *   Sends the transaction to the Solana network.
        *   Waits for confirmation, using a specified commitment level (e.g., `confirmed` or `finalized`).
        *   Logs the outcome: success with transaction signature, or failure with error details.
*   **Specific Error Handling**:
    *   **RPC Connection Issues**: Retry mechanisms, logging connection failures.
    *   **LUT Resolution Failures**: Ensure `ADDRESS_LOOKUP_TABLE_ADDRESS` is correct and the LUT is up-to-date. If accounts are missing from the LUT, this transaction will fail.
    *   **Transaction Simulation Failure**: Log detailed error messages if the transaction simulation fails (e.g., incorrect accounts, insufficient funds for keeper, on-chain program logic errors).
    *   **Keeper Authorization**: Errors if the `KEEPER_PRIVATE_KEY` does not correspond to an authorized keeper in `PoolConfig`.
    *   **Oracle Price Feed Issues**: Handle cases where price feeds might be unavailable or stale, if the on-chain program flags such issues.

### Task 2: Adding Supported Tokens (via `add_supported_token` on-chain instruction)

*   **Objective**: This task calls the on-chain `add_supported_token` instruction to register a new token with the liquidity pool, allowing it to be included in value calculations and potentially other operations.
*   **Trigger/Input for the Script**:
    *   This task is automatically triggered by the `checkForTokensToAdd()` function within the main maintenance cycle, which runs every `CHECK_INTERVAL_SECONDS` (default 10 seconds).
    *   It can also be triggered by detected changes to an on-chain oracle aggregator account (if configured and monitored by `handleOracleUpdate()`).
    *   **How the script determines which new token mint to add**: The script's `checkForTokensToAdd()` function (located in `./handlers/addToken.ts`) contains the logic to identify new tokens eligible for addition. This might involve reading a predefined list from a configuration file, another environment variable, or by reacting to specific on-chain states or events (e.g., new markets appearing on an integrated DEX, or specific oracle feed statuses). *[Developer: The exact mechanism within `checkForTokensToAdd` should be documented here if known, e.g., monitoring a specific config map, an API endpoint, or on-chain program state that signals new available tokens.]*
*   **Script Logic & Interaction with On-Chain Program**:
    1.  **Connect and Load Keypair**: As in Task 1.
    2.  **Input Validation (within `checkForTokensToAdd`)**:
        *   Validates any identified token mint addresses and necessary oracle addresses before processing.
    3.  **Pre-checks (Script-side, within `checkForTokensToAdd`)**:
        *   Fetch and parse `PoolConfig` data.
        *   Check if an identified token mint is already present in `PoolConfig.supported_tokens` to prevent duplicate additions.
    4.  **Derive PDAs**:
        *   `pool_vault`: Derive the PDA for the new token's pool vault. `[Refer to poolDetails.md for the PDA seed structure, likely involving 'pool_vault' prefix and token mint.]`
        *   `token_history_account`: Derive the PDA for the new token's history account. `[Refer to poolDetails.md for the PDA seed structure, likely involving 'token_history' prefix and token mint.]`
    5.  **Prepare Transaction**:
        *   Construct the `add_supported_token` instruction. Required accounts typically include:
            *   `admin`: The admin/keeper account with authority to add tokens.
            *   `pool_config`: The main configuration PDA to be updated.
            *   `new_token_mint`: The mint address of the token being added.
            *   `new_pool_vault`: The (uninitialized) PDA for the new token's pool vault.
            *   `new_token_history_account`: The (uninitialized) PDA for the new token's history data.
            *   `oracle_aggregator_account`: The oracle price feed for the new token.
            *   `system_program`: For account creation.
            *   `token_program`: For initializing the token vault.
            *   `rent`: Sysvar rent account.
            *   `[Refer to poolDetails.md for the precise list of accounts and any instruction arguments, such as the oracle address if not passed as an account.]`
    6.  **Sign, Send, Confirm, and Log**: As in Task 1.
    7.  **Operational Note (LUT Update Reminder)**:
        *   Upon successful execution, the script **must remind the operator** (e.g., via logs) to update the off-chain Address Lookup Table (LUT) if the script itself doesn't handle LUT extension automatically (which it might, given the `checkForTokensToAdd(false)` call in `index.ts` suggests execution beyond just identification).
        *   The following new accounts need to be added to the LUT:
            *   The newly created `pool_vault` PDA address.
            *   The newly created `token_history_account` PDA address.
            *   The `oracle_aggregator_account` (price feed) for the new token.
        *   Failure to update the LUT will cause subsequent `update_total_value` calls to fail if they rely on finding these new accounts through the LUT.
*   **Specific Error Handling**:
    *   **Token Already Exists**: Gracefully handle if pre-check shows token is already supported.
    *   **Invalid Mint or Oracle Address**: Error reporting for malformed inputs.
    *   **PDA Collisions**: Though unlikely with correct PDA derivations.
    *   **On-chain Program Errors**: E.g., maximum number of supported tokens reached, invalid oracle account.

### Task 3: Cleaning Up Historical Token Data (via `cleanup_historical_data` on-chain instruction)

*   **Objective**: This task calls the on-chain `cleanup_historical_data` instruction. This is typically used for tokens that are no longer actively part of the pool (e.g., deprecated, zero liquidity, zero market relevance) to free up rent and simplify pool state. The on-chain instruction likely closes the associated `pool_vault` and `token_history_account`.
*   **Trigger/Input for the Script**:
    *   This task is automatically managed by the `checkForTokensToCleanup()` function.
    *   **Identification**: The script periodically (every `CHECK_INTERVAL_SECONDS` via `runMaintenanceCycle`, or when triggered by `handleOracleUpdate`) runs an identification phase (`checkForTokensToCleanup(true, ...)`) to find potential `cleanupCandidateMints`. This identification logic (in `./handlers/cleanupToken.ts`) likely consults oracle data (e.g., for zero dominance) or other on-chain signals.
    *   **Execution**: The script then periodically attempts the actual cleanup for these `cleanupCandidateMints` (`checkForTokensToCleanup(false, candidates)`). This involves pre-checks like ensuring the token's pool vault balance is zero.
*   **Script Logic & Interaction with On-Chain Program**:
    1.  **Connect and Load Keypair**: As in Task 1.
    2.  **Pre-checks (Script-side and On-chain, within `checkForTokensToCleanup`)**:
        *   **Fetch `PoolConfig`**: To verify the token exists and get its associated account details.
        *   **Verify Eligibility for Cleanup**:
            *   **Oracle Status/Dominance**: The identification phase likely checks oracle data. `[Confirm if poolDetails.md specifies such a pre-requisite for cleanup.]`
            *   **Pool Vault Balance**: Fetch the balance of the token's `pool_vault`. The script must verify this balance is zero before attempting to close it.
            *   The on-chain program itself should enforce these checks, but client-side validation is good practice.
    3.  **Construct Transaction**:
        *   Build the `cleanup_historical_data` instruction. Required accounts typically include:
            *   `admin`: The admin/keeper account.
            *   `pool_config`: The main configuration PDA (to remove the token from the supported list).
            *   `token_mint_to_cleanup`: The mint of the token being removed.
            *   `pool_vault_to_close`: The PDA of the pool vault for this token.
            *   `token_history_account_to_close`: The PDA of the history account for this token.
            *   `destination_account_for_rent`: An account to receive the lamports from the closed accounts (usually the admin/keeper).
            *   `token_program`: If the vault is a token account.
            *   `system_program`: For account closure.
            *   `[Refer to poolDetails.md for the precise list of accounts and instruction arguments.]`
    4.  **Sign, Send, Confirm, and Log**: As in Task 1.
    5.  **Operational Note (LUT Update Reminder)**:
        *   Upon successful execution, the script **must remind the operator** (e.g., via logs) to update (deactivate/remove addresses from) the off-chain Address Lookup Table (LUT) if the script itself does not handle LUT updates automatically.
        *   The following addresses should be removed from the LUT:
            *   The closed `pool_vault` PDA address.
            *   The closed `token_history_account` PDA address.
            *   The `price_feed` associated with the removed token.
        *   Keeping these addresses in the LUT might not cause immediate failure but is unhygienic and could lead to issues if the LUT reaches its maximum capacity.
*   **Specific Error Handling**:
    *   **Token Not Found**: If the specified token mint is not in `PoolConfig`.
    *   **Vault Not Empty**: If script-side or on-chain checks find the `pool_vault` balance is non-zero.
    *   **Oracle Still Active (If applicable)**: If on-chain checks prevent cleanup due to oracle status or other eligibility criteria.

## Execution Guide

### Running the Script

The script is designed to run as a continuous service/bot. After installation and compilation (if running from source):

```bash
npm start 
# or directly using node if 'start' script is configured in package.json to run dist/index.js
# node dist/index.js 
```
Ensure all required Environment Variables are set in your execution environment (e.g., via a `.env` file loaded by `dotenv` package, or system environment variables).

### Scheduling and Process Management

The script manages its own internal scheduling for tasks using timers (`setInterval` for the main add/cleanup cycle and a separate mechanism within `scheduleTotalValueUpdates` for value updates). 

It is intended to be run as a long-running process. For production environments, use a process manager like PM2, systemd, or run it within a Docker container to ensure it stays alive and restarts on crashes:

*   **PM2 Example**:
    ```bash
    pm2 start dist/index.js --name pool-maintainer -- --your-node-options
    pm2 logs pool-maintainer
    ```
*   A cron job is generally **not** used to trigger individual tasks, but can be used as a watchdog to ensure the main bot process is running and to restart it if it has exited.

## Monitoring and Logging

*   **Logging Approach**:
    *   The script logs extensively to the console (stdout/stderr) using `console.log` and `console.error`.
    *   Logs include timestamps, task being performed, key parameters (e.g., token mints for add/cleanup), transaction signatures upon success, and detailed error messages upon failure.
    *   When using a process manager like PM2, logs are typically captured and managed by the process manager.
*   **Key Indicators to Monitor**:
    *   **Successful `update_total_value` runs**: Indicated by logged transaction signatures and no errors. Check `PoolConfig.current_total_pool_value_scaled` on-chain periodically to ensure it's updating.
    *   **Successful `add_token` / `cleanup_token` operations**: Confirmed by logs (including any LUT update reminders/actions) and subsequent verification of `PoolConfig` on-chain.
    *   **Error Rates**: Any persistent errors in the logs require investigation.
    *   **Keeper Account Balance**: Ensure the keeper account has sufficient SOL to pay for transaction fees.
    *   **RPC Node Health**: Monitor if the script frequently fails due to RPC connection issues.
    *   **`cleanupCandidateMints` list size and processing**: If this list grows indefinitely without candidates being processed, it might indicate an issue with cleanup eligibility or execution.

## Troubleshooting

*   **RPC Connection Problems**:
    *   **Symptom**: Script fails with "connection timed out," "RPC node unavailable," or similar errors.
    *   **Remedy**:
        *   Verify `RPC_URL` is correct.
        *   Check the status of your RPC provider.
        *   Consider using a more reliable or private RPC endpoint.
        *   The script may have internal retry logic, but persistent issues point to the RPC endpoint.
*   **Keypair/Funding Issues**:
    *   **Symptom**: Transaction failures related to signature verification, or "insufficient funds for transaction fee."
    *   **Remedy**:
        *   Ensure `KEEPER_PRIVATE_KEY` (or path in `KEEPER_KEYPAIR_PATH`) is correct and corresponds to an authorized keeper/admin.
        *   Verify the keeper account has enough SOL to cover transaction fees.
*   **`update_total_value` Fails due to LUT Issues**:
    *   **Symptom**: `update_total_value` transaction fails, potentially with errors related to "Account X not found in LUT" or instruction processing errors due to missing accounts.
    *   **Remedy**:
        *   Ensure `ADDRESS_LOOKUP_TABLE_ADDRESS` is correct.
        *   **Crucially**: After tokens are added or removed (and their associated accounts like vaults, history, price feeds), the Address Lookup Table **must** be updated. The script might attempt this automatically for additions/removals it performs. If not, or if manual changes were made to the pool, the LUT must be updated off-chain (e.g. using Solana CLI). Log messages should indicate if an operator action is needed.
        *   Verify that all required accounts (pool vaults, token history accounts, price feeds for ALL supported tokens) are present and correctly configured in the LUT.
*   **Program Logic Errors (On-Chain)**:
    *   **Symptom**: Transaction simulates successfully but fails on-chain, or simulation itself fails with a program-specific error code or log.
    *   **Remedy**:
        *   Check on-chain program logs using Solana Explorer or CLI for the failed transaction signature.
        *   Consult `poolDetails.md` (or program source) for error code meanings.
        *   This might indicate an issue with the state of on-chain accounts (e.g., trying to add a token when max capacity is reached, trying to clean up a token with non-zero balance, incorrect oracle data).
*   **Dependency Issues / Compilation Errors**:
    *   **Symptom**: Script fails to start with errors like "Cannot find module 'x'" or TypeScript compilation errors.
    *   **Remedy**: Ensure all dependencies are correctly installed with `npm install` or `yarn install`. Verify `tsconfig.json` and run `npm run build` (or `yarn build`).
*   **Incorrect PDA Derivations**:
    *   **Symptom**: Instructions fail with account mismatches or constraint violations, often related to PDAs.
    *   **Remedy**: Double-check the PDA derivation logic in the script (likely in `initializeSolanaUtils()` or specific handlers) against the specifications in `poolDetails.md`. Ensure correct seeds and program ID are used.
*   **Incorrect `CHECK_INTERVAL_SECONDS` Configuration**:
    *   **Symptom**: Maintenance tasks (add/cleanup) run too frequently, causing high RPC usage, or too infrequently, leading to delays.
    *   **Remedy**: Adjust the `CHECK_INTERVAL_SECONDS` environment variable to a suitable value.

---
