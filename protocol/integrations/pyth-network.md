---
sidebar_position: 2
---

# Pyth Network Price Feed Integration

## 1. Overview: The Need for Reliable Real-Time Pricing

The wLiquify protocol fundamentally relies on accurate and timely price data for all its core operations, including asset valuation, dynamic fee calculation, wLQI token minting/burning, and maintaining the overall integrity of its liquidity pools. Pyth Network serves as a primary and critical source for this real-time price information, especially for the diverse range of assets, including Wormhole-wrapped tokens, that wLiquify aims to support.

Without a high-fidelity oracle like Pyth, valuing less liquid assets on Solana or those bridged from other chains would be challenging and prone to manipulation. Pyth's architecture, which aggregates price data from multiple first-party publishers, provides the robust pricing necessary for a decentralized index protocol like wLiquify.

## 2. Role in the wLiquify Ecosystem

Pyth Network price feeds are utilized in several key areas:

*   **Asset Valuation in the Liquidity Pool Program**:
    *   When users deposit assets into or withdraw assets from the `w-liquify-pool` program, Pyth prices are used to determine the precise value of these assets. This ensures that users receive a fair amount of wLQI LP tokens upon deposit and a fair amount of underlying assets upon withdrawal.
    *   The pool's `current_total_pool_value_scaled` is continuously updated based on the latest Pyth prices for all constituent assets, a task often triggered by the [Pool Maintainer Service](./../off-chain-services/pool-maintainer.md).
*   **Dynamic Fee Calculation**: The dynamic fee mechanism, which incentivizes pool rebalancing, relies on comparing the current value (derived from Pyth prices) of assets in the pool against their target dominances.
*   **wLQI Token Value**: The intrinsic value of the wLQI token itself is directly tied to the total value of assets held in the pool, which is calculated using Pyth prices.
*   **Data Provision by the Oracle Feeder**: The off-chain [Oracle Feeder Service](./../off-chain-services/oracle-feeder.md) is responsible for identifying the correct Pyth Network `price_feed_id` (the public key of the Pyth price data account) for each token included in the wLiquify index. This `price_feed_id` is then stored within the [Custom On-Chain Oracle Program](./../on-chain-programs/oracle-program.md).

## 3. How Integration Works

1.  **Pyth Feed ID Discovery (Off-Chain)**: The [Oracle Feeder Service](./../off-chain-services/oracle-feeder.md) discovers the appropriate Pyth `price_feed_id` for each token that is a candidate for the wLiquify index.
2.  **Storage in Custom Oracle (On-Chain)**: These Pyth `price_feed_id`s are pushed to and stored within the [Custom On-Chain Oracle Program](./../on-chain-programs/oracle-program.md) as part of each token's `TokenInfo` structure. The `price_feed_id` is typically stored as a byte array that can be converted to a Solana `Pubkey`.
3.  **Consumption by Liquidity Pool Program (On-Chain)**:
    *   When the `w-liquify-pool` program needs to price an asset (e.g., during a `deposit`, `withdraw`, or `update_total_value` operation), it first queries the [Custom On-Chain Oracle Program](./../on-chain-programs/oracle-program.md) to get the relevant token's `TokenInfo`, which includes the `price_feed_id`.
    *   It then uses this `price_feed_id` (converted to a `Pubkey`) to directly query the specified Pyth Network price account on-chain.
    *   This direct query fetches the current price data from Pyth.
4.  **On-Chain Price Validation**: The `w-liquify-pool` program incorporates several on-chain checks when consuming price data from Pyth feeds to enhance security and reliability:
    *   **Price Staleness**: Verifies that the fetched price data is not older than a predefined maximum allowable age (e.g., `MAX_PRICE_STALENESS_SECONDS`).
    *   **Trading Status**: Checks oracle flags indicating if the asset is actively trading and if the price feed is considered reliable by Pyth.
    *   **Price Validity**: Ensures prices are non-negative and within reasonable bounds if applicable (though Pyth's own aggregation usually handles this).
    *   If these validations fail, the transaction is typically halted to prevent operations based on potentially unreliable or stale data (e.g., returning errors like `PythPriceValidationFailed`, `PythPriceNotTrading`, `PriceFeedStale`).

## 4. Importance for Cross-Chain Assets

Pyth Network's role is particularly crucial for assets bridged to Solana via Wormhole (or other bridge solutions). These wrapped assets might not have deep liquidity on Solana-native DEXs immediately. Pyth provides a reliable way to price these assets based on their broader market activity across multiple chains, enabling them to be seamlessly integrated into the wLiquify index.

## 5. Security and Reliability

*   **Trust in Pyth**: The accuracy of wLiquify's operations is heavily dependent on the reliability, liveness, and tamper-resistance of Pyth Network.
*   **On-Chain Safeguards**: The wLiquify Pool Program's direct on-chain validation of Pyth price feeds (staleness, trading status) provides a layer of defense against potential issues with individual feeds.
*   **Decentralized Data Sources**: Pyth's model of aggregating prices from multiple first-party data providers contributes to its overall robustness and resistance to manipulation.

By integrating deeply with Pyth Network, wLiquify ensures that its index is priced accurately and transparently, reflecting true market conditions for a wide variety of crypto assets.

---
*Further Reading:*
-   [Protocol Architecture](../architecture.md)
-   [wLiquify Solana Liquidity Pool Program](../on-chain-programs/pool-program.md)
-   [Custom On-Chain Oracle Program](../on-chain-programs/oracle-program.md)
-   [Off-Chain Oracle Feeder Service](../off-chain-services/oracle-feeder.md) 