---
sidebar_position: 3
---

# Market Data API Integration (CoinMarketCap, CoinGecko, etc.)

## 1. Overview: Sourcing Broad Market Intelligence

While Pyth Network provides critical real-time price feeds for assets already selected for the wLiquify index, the initial discovery, selection, and relative weighting of these assets require broader market intelligence. This is where market data aggregation APIs, such as those provided by CoinMarketCap, CoinGecko, and similar services, play a vital role.

These APIs offer comprehensive data across thousands of cryptocurrencies, including:
-   Market Capitalizations
-   Trading Volumes
-   Token Metadata (symbols, names, native chain addresses)
-   Categorization (e.g., tags like "stablecoin", "DeFi")

This information is essential for the [Off-Chain Oracle Feeder Service](./../off-chain-services/oracle-feeder.md) to make informed decisions about the composition of the wLiquify index, specifically for identifying top tokens and calculating their target market dominance.

## 2. Role in the Off-Chain Oracle Feeder Service

The Oracle Feeder Service integrates with these market data APIs to perform several key functions *off-chain* before any data is submitted to the [Custom On-Chain Oracle Program](./../on-chain-programs/oracle-program.md):

1.  **Token Discovery & Universe Definition**: APIs provide a vast list of tokens, forming the initial universe from which the wLiquify index candidates are drawn.
2.  **Market Capitalization Fetching**: The primary use case is to obtain up-to-date market capitalization data for a wide range of tokens. This is the main metric used for ranking and weighting.
3.  **Native Address Identification**: For tokens not native to Solana, these APIs help identify their original contract addresses on their native chains (e.g., Ethereum, Polygon). This information is a prerequisite for the Feeder Service to then resolve them to their Solana-wrapped mint addresses (e.g., via Wormhole).
4.  **Data Filtering & Categorization**: APIs often provide tags or categories for tokens. The Feeder Service uses this metadata to apply exclusion filters (e.g., omitting stablecoins, specific types of utility tokens, or low-liquidity assets) to refine the list of potential index constituents according to wLiquify's strategy.
5.  **Selection of Top Tokens**: After filtering, tokens are typically ranked by market capitalization. The Feeder Service then selects the top N tokens (e.g., Top 30, Top 50) that meet all criteria for inclusion in the index.
6.  **Target Dominance Calculation**: Once the top tokens are selected, their relative market capitalizations are used to calculate the target dominance (weight) for each token within the index. Conceptually, for a token `i`:
    \[ \text{Target Dominance}_i = \frac{\text{Market Cap}_i}{\sum \text{Market Cap of all selected tokens}} \]
    This ratio is then scaled and formatted for on-chain storage.

## 3. Data Flow and Processing

The integration follows this general off-chain data flow:

1.  **API Query**: The Oracle Feeder Service periodically queries the selected market data APIs (e.g., CoinMarketCap, CoinGecko) for the latest market information.
2.  **Data Aggregation & Normalization**: Data from potentially multiple API sources might be aggregated and normalized by the Feeder Service.
3.  **Processing Logic**: The Feeder applies its filtering, ranking, selection, and dominance calculation logic as described above.
4.  **Formatting for On-Chain Oracle**: The processed data (including symbol, calculated target dominance, resolved Solana mint address, identified Pyth `price_feed_id`, and a timestamp) is formatted into `TokenInfo` structures.
5.  **Submission to Custom On-Chain Oracle**: This curated and formatted data is then submitted to the [Custom On-Chain Oracle Program](./../on-chain-programs/oracle-program.md) by the Oracle Feeder Service, which is the sole authorized entity to do so.

## 4. Key Data Points Utilized

From these external APIs, the Oracle Feeder Service primarily utilizes:

*   **Market Capitalization (USD)**: The most critical data point for ranking and weighting.
*   **Token Symbol/Name**: For identification.
*   **Platform/Contract Address Information**: To identify native chain addresses.
*   **Tags/Categories**: For applying filters.
*   **Trading Volume/Liquidity Metrics (Potentially)**: As secondary filters to ensure index constituents are sufficiently liquid.

## 5. Reliability, Limitations, and Trust Considerations

*   **Dependency on Third-Party APIs**: The accuracy and timeliness of the index composition data sourced by the Oracle Feeder Service are dependent on the reliability and uptime of the external market data APIs it consumes.
*   **API Rate Limits & Keys**: The Feeder Service must manage API rate limits and securely handle any necessary API keys for these services.
*   **Off-Chain Processing**: All data collection, filtering, and calculation using these APIs occur off-chain within the Oracle Feeder Service. The integrity of this process relies on the secure and correct operation of the Feeder Service itself.
*   **Data Latency**: There can be inherent latency in the data provided by these APIs compared to real-time on-chain prices. This is generally acceptable for determining index composition and target weights, which change less frequently than live prices used for immediate transactions.
*   **Trust in Data Providers**: The wLiquify protocol, through its Oracle Feeder Service, places trust in the data reported by these established market data aggregators for the purpose of index composition.

## 6. Distinction from Pyth Network Integration

It is crucial to distinguish the role of these market data APIs from that of Pyth Network:

*   **Market Data APIs (CoinMarketCap, CoinGecko, etc.)**: Used *off-chain* by the Oracle Feeder for *broad market intelligence*, *token discovery*, *market cap data*, and *calculating target index weights*.
*   **Pyth Network**: Used *on-chain* by the `w-liquify-pool` program for *real-time, high-fidelity pricing* of assets *already selected* for the index, enabling fair valuation for deposits, withdrawals, and fee calculations.

In essence, market data APIs help decide *what* should be in the index and at *what target proportion*, while Pyth helps determine the *current live price* of those selected assets for on-chain transactions.

---
*Further Reading:*
-   [Off-Chain Oracle Feeder Service](../off-chain-services/oracle-feeder.md)
-   [Custom On-Chain Oracle Program](../on-chain-programs/oracle-program.md)
-   [Protocol Architecture](../architecture.md) 