# Key Contract Addresses & Deployments

This page lists the official on-chain program IDs and other important account addresses for the wLiquify protocol, as well as key external protocols it integrates with. This information is vital for developers interacting with the protocol directly, integrating wLiquify components, or verifying on-chain entities.

All addresses are for Solana Mainnet-beta unless otherwise specified.

## wLiquify Protocol Core Addresses

*   **Liquidity Pool Program (`w-liquify-pool`)**:
    *   Program ID: `EsKuTFP341vcfKidSAxgKZy91ZVmKqFxRw3CbM6bnfA9`
    *   *Explorer Link: [Solscan](https://solscan.io/account/EsKuTFP341vcfKidSAxgKZy91ZVmKqFxRw3CbM6bnfA9)*
*   **Custom On-Chain Oracle Program (`oracle_program`)**:
    *   Program ID: `3ZfM451hf9LUizdUL14N1R9fwmsPS8M8ZCGai2nm6SVY`
    *   *Explorer Link: [Solscan](https://solscan.io/account/3ZfM451hf9LUizdUL14N1R9fwmsPS8M8ZCGai2nm6SVY)*
*   **wLQI Token Mint**:
    *   Address: `YOUR_WLQI_TOKEN_MINT_ADDRESS_HERE` (Please replace)
    *   *Explorer Link: (Add link once address is provided)*
*   **PoolConfig PDA (Liquidity Pool Program)**:
    *   Address: `YOUR_POOL_CONFIG_PDA_ADDRESS_HERE` (Please replace - Derived from `[b"pool_config"]` and Pool Program ID)
    *   *Explorer Link: (Add link once address is provided)*
*   **AggregatedOracleData PDA (Custom Oracle Program)**:
    *   Address: `YOUR_AGGREGATED_ORACLE_DATA_PDA_ADDRESS_HERE` (Please replace - Derived from `[b"aggregator_v2"]` and Oracle Program ID)
    *   *Explorer Link: (Add link once address is provided)*

## Key Integrated Protocol Addresses

These are addresses for major external protocols that wLiquify interacts with:

*   **Pyth Network Program**:
    *   Program ID: `FsJ3A3u2vn5cTVofAjvy6y5kwABJAqYWw49P4qgAACEJ`
    *   *Explorer Link: [Solscan](https://solscan.io/account/FsJ3A3u2vn5cTVofAjvy6y5kwABJAqYWw49P4qgAACEJ)*
    *   Note: Individual Pyth price feed accounts for each asset are dynamic and listed within the wLiquify Custom On-Chain Oracle Program.
*   **Jupiter Aggregator V6**:
    *   Program ID: `JUP6LkbZbjS1jKKwapdHch4uxPVDXEGNUTZ25Q9fmig`
    *   *Explorer Link: [Solscan](https://solscan.io/account/JUP6LkbZbjS1jKKwapdHch4uxPVDXEGNUTZ25Q9fmig)*

*(Please verify and replace placeholder addresses. This document should be updated as new key accounts are deployed or finalized.)* 