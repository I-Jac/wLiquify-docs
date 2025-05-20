# Supported Assets

## Overview

wLiquify supports a curated list of top tokens (e.g., aiming for approximately the Top 30, subject to dynamic criteria, exclusions, and technical limitations) by market capitalization, focusing on providing a decentralized index of major non-stablecoin, non-CEX cryptocurrencies on Solana. The protocol enables index participation with these assets, which include native Solana tokens and cross-chain tokens primarily brought to Solana via Wormhole Native Token Transfer (NTT).

## Token Categories

### Native Solana Tokens
- SOL (Solana)
- Other native Solana ecosystem tokens that meet index criteria.

### Cross-Chain Tokens (on Solana)
- **Wormhole-Wrapped Tokens**: The primary method involves assets bridged from other chains (like Ethereum, BSC, etc.) to Solana using Wormhole NTT, resulting in a Solana SPL token version.

## Token Selection Criteria

The [Off-Chain Oracle Feeder Service](./off-chain-services/oracle-feeder.md) is responsible for identifying tokens that meet the index criteria. This is a dynamic off-chain process.

### Inclusion Criteria (Off-Chain Oracle Feeder Logic)
1. **Market Cap Ranking**: Tokens are ranked by market capitalization (e.g., aiming for approximately the Top 30, after applying exclusions). This data is sourced from market data APIs like CoinMarketCap/CoinGecko.
2. **Chain & Asset Eligibility**: The Feeder identifies the source chain for each high-ranking token. The goal is to find a pathway to get this asset onto Solana as an SPL token, preferably via Wormhole NTT.
3. **Availability of Price Feeds**: A reliable Pyth Network price feed must be available for the asset's Solana SPL version.

### Exclusion Criteria (Off-Chain Oracle Feeder Logic)
The Oracle Feeder applies filters to exclude categories such as:
- Stablecoins
- Centralized Exchange (CEX) tokens
- Gold-backed or other commodity-backed tokens
- Certain types of tokenized real-world assets
- Staked or liquid staking derivatives (unless specifically part of the index strategy)
- Unofficial or low-liquidity wrapped tokens.

## Cross-Chain Integration Strategy (Oracle Feeder Perspective)

The [Off-Chain Oracle Feeder Service](./off-chain-services/oracle-feeder.md) employs the following strategy to identify the appropriate Solana SPL representation for an index-candidate token:

1.  **Preference for Direct Wormhole NTT**: If a token on its native chain (e.g., ETH on Ethereum) can be directly bridged to Solana using Wormhole NTT to create a canonical wrapped SPL token, this is the preferred path.
2.  **Utilizing BSC as a Source via Wormhole NTT**: For some assets, their native chain might not yet be directly supported by Wormhole NTT to Solana. However, a well-established wrapped version of that asset (e.g., a Binance-Pegged version) might exist on Binance Smart Chain (BSC). In such cases:
    *   The Oracle Feeder may identify this BSC-based wrapped token as the `source token`.
    *   Wormhole NTT is then used to bridge *this specific BSC-based token* from BSC to Solana, creating the Wormhole-wrapped SPL token that will be used in the wLiquify index.
    This approach ensures broader token coverage for the index, leveraging BSC as an intermediary hop when necessary, with Wormhole NTT still being the final bridge to Solana.

## Token Management: Dynamic Index Sync

The wLiquify protocol is designed for the token list within the Liquidity Pool Program to dynamically synchronize with the Top X tokens (where X aims to be ~30, considering exclusions and a small buffer for dynamic changes) identified by the Oracle Feeder.

### Listing New Tokens (Automated by Pool Maintainer)
1.  **Oracle Update**: The [Off-Chain Oracle Feeder Service](./off-chain-services/oracle-feeder.md) updates the [Custom On-Chain Oracle Program](./on-chain-programs/oracle-program.md) with the latest list of Top X tokens (aiming for ~30, post-exclusions), their target dominances, Solana mint addresses, and Pyth feed IDs.
2.  **Detection by Pool Maintainer**: The [Pool Maintainer Service](./off-chain-services/pool-maintainer.md) monitors both the On-Chain Oracle Program and the Liquidity Pool Program's current list of supported tokens.
3.  **Adding to Pool**: If the Pool Maintainer detects a token listed in the On-Chain Oracle that is not yet in the Liquidity Pool Program, it triggers the `add_supported_token` instruction on the Pool Program.
    *   **On-chain account setup**: This instruction prompts the Pool Program to create the necessary new accounts for the token (its dedicated token vault PDA and `HistoricalTokenData` PDA) and add it to the pool's list of manageable assets.

### Delisting Tokens (Automated by Pool Maintainer)
1.  **Oracle Update**: The Oracle Feeder removes a token from the On-Chain Oracle Program (or sets its dominance to zero), indicating it no longer meets index criteria (e.g., dropped out of the target Top X, post-exclusions).
    *   **Operational Consideration**: The entity managing the Oracle Feeder may apply an operational "grace period" for monitoring before formally removing a token from the oracle feed, allowing for potential market cap recovery.
2.  **Detection by Pool Maintainer**: The Pool Maintainer identifies that a token supported in the Liquidity Pool Program is no longer active in the On-Chain Oracle.
3.  **Verification & Cleanup**: The Pool Maintainer verifies that the token's vault within the Liquidity Pool Program is empty (balance is zero). If so, it triggers the `cleanup_historical_data` instruction on the Pool Program.
    *   This closes the token's vault and `HistoricalTokenData` account, reclaiming rent and formally removing it from active management.

## Oracle Data & Asset Management

The [Custom On-Chain Oracle Program](./on-chain-programs/oracle-program.md) stores key data pushed by the Feeder, which the Liquidity Pool Program uses:

*   **Market Cap Data & Dominance**: The Feeder uses external APIs (e.g., CoinGecko, CoinMarketCap) for market cap data to determine the Top X tokens (aiming for ~30, post-exclusions) and calculate their target dominances. This *dominance* is what's stored on-chain and used by the pool.
*   **Price Feeds**: Pyth Network `price_feed_id`s are stored for real-time valuation by the pool.
*   **Volume Data (Off-Chain Consideration)**: While not directly used in on-chain pool mechanics, the Oracle Feeder may consider trading volume from market data APIs as an *off-chain filtering criterion* during its initial token selection process to ensure assets have reasonable real-world liquidity.

### Weight Management
- Target weight (dominance) calculations are performed off-chain by the Oracle Feeder.
- Actual weights in the pool are monitored on-chain based on current holdings and Pyth prices.
- Deviations trigger dynamic fee adjustments, incentivizing rebalancing.

## Security Considerations

### Bridge Security
- Reliance on Wormhole's security model for NTT.
- Regular audits and monitoring of Wormhole by its own team and the broader community are key.

### Oracle Reliability
- Accuracy of Pyth price feeds.
- Integrity of the off-chain Oracle Feeder process and the secure management of its authority key for the on-chain Oracle Program.
- Use of multiple data sources by the Feeder for market cap determination can enhance robustness.

*(Note: The list of supported assets and integration methods may change as the protocol evolves and new solutions become available.)* 