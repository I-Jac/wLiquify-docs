# Protocol Integrations

This section describes how the wLiquify protocol interacts with other key protocols and services within the Solana ecosystem. Understanding these integrations is important for a comprehensive view of wLiquify's functionality and its place in the broader DeFi landscape.

Key integrations detailed in this section include:

-   **[Jupiter Aggregator](./jupiter.md)**: Leveraged for enabling efficient token swaps on Solana, using wLiquify's pool as a liquidity source.
-   **[Pyth Network](./pyth-network.md)**: Provides the real-time, high-fidelity price feeds essential for valuing assets within the liquidity pool and for calculating dynamic fees.
-   **[Market Data APIs (CoinMarketCap, CoinGecko, etc.)](./market-data-apis.md)**: Utilized by the off-chain Oracle Feeder service to gather market capitalization data and other token information necessary for determining the index composition and target dominances. 