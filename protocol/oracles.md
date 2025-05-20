# Core: Oracles & Data Feeds

# Oracles: The Engine of Accuracy and Dynamism in wLiquify

Oracles are the vital data conduits that allow wLiquify to connect with real-world market information, ensuring our decentralized index is both accurately valued and dynamically responsive. wLiquify employs a sophisticated **dual-component oracle strategy** to achieve this:

1.  **Pyth Network**: For precise, real-time price feeds of the underlying crypto assets, especially Wormhole-wrapped tokens that form part of the index.
2.  **Custom wLiquify Oracle System**: An in-house system comprising an on-chain program and an off-chain data feeder. This system is responsible for defining the index composition (e.g., the dynamic "Top X" tokens), setting their target dominance (weights) within the index, and mapping these tokens to their respective Pyth Network price feed identifiers.

This two-part approach is fundamental to how wLiquify functions as a **truly asset-backed index** with **automated, market-driven rebalancing**.

## 1. Pyth Network: Valuing the Underlying Assets

**The Challenge of Wrapped Assets:**
Many top cryptocurrencies are not native to Solana. To be included in the wLiquify pool, they are often brought over from other chains (like Ethereum) using Wormhole's Native Token Transfer (NTT) technology, resulting in "Wormhole-wrapped" versions on Solana.

A key challenge with these wrapped assets is that they might not have deep liquidity on Solana-based Automated Market Makers (AMMs) or exchanges immediately after being bridged. Relying solely on Solana AMM prices for these tokens could lead to inaccurate valuations.

**Pyth's Role: Real-World Price Feeds**
This is where the **Pyth Network** comes in. Pyth is a decentralized financial oracle network that provides high-fidelity, real-time price data for a wide range of assets.

*   **Accurate Valuation**: wLiquify integrates Pyth price feeds to determine the fair market value of each Wormhole-wrapped token (and other supported assets) in its liquidity pool. This ensures that the pool's total value and the individual token contributions are based on their true, externally verified market prices.
*   **Asset-Backed Integrity**: By using Pyth, wLiquify ensures that when you invest in the index, the value of your share (represented by wLQI tokens) accurately reflects the collective, real-world price of the underlying assets.

**Integration Snapshot:**
The `price_feed_id` for each token (the public key of its Pyth price account) is curated by the off-chain Oracle Feeder and stored in the Custom On-Chain Oracle Program. The wLiquify Liquidity Pool Program then uses these IDs to query Pyth directly for live prices during deposits, withdrawals, and pool value calculations. For more details, see the [Pyth Network Integration](./integrations/pyth-network.md) page.

## 2. Custom wLiquify Oracle System: Defining the Index and Driving Rebalancing

While Pyth provides the *current price* of individual assets, the logic for *which assets constitute the index* and *what their target representation should be* is managed by wLiquify's custom oracle system. This system has two main parts:

*   **Off-Chain Oracle Feeder Service**: An automated, off-chain script. Its responsibilities include:
    *   Monitoring the broader crypto market (using [Market Data APIs](./integrations/market-data-apis.md) like CoinGecko/CoinMarketCap) to identify the current "Top X" tokens based on defined criteria (e.g., market capitalization).
    *   Determining the **target market dominance (target weight)** for each selected token.
    *   Identifying the correct Solana mint address (e.g., for Wormhole-wrapped versions) and the Pyth Network `price_feed_id` for each selected token.
    *   Securely submitting this curated data (token list, target dominances, mints, Pyth feed IDs) to the On-Chain Oracle Program.
    *   *For full details, see the [Off-Chain Oracle Feeder Service documentation](./off-chain-services/oracle-feeder.md).*

*   **On-Chain Oracle Program**: A custom Solana smart contract. Its key functions are:
    *   To securely store the official list of tokens for the index, their target market dominances, and Pyth `price_feed_id`s, as provided by the authorized off-chain feeder.
    *   To make this data available on-chain for the wLiquify Liquidity Pool Program.
    *   *For full details, see the [Custom On-Chain Oracle Program documentation](./on-chain-programs/oracle-program.md).*

**Driving Dynamic Rebalancing & Fees:**
The **target dominance** figures from the Custom On-Chain Oracle are crucial. The Liquidity Pool Program compares the *actual* weight of each token in the pool (based on its current Pyth-derived price and quantity) against its *target dominance*. This comparison powers wLiquify's **dynamic fee and bonus mechanism**, incentivizing user actions that help align the pool with its target allocations, facilitating automated rebalancing.

## Synergy and Transparency

This dual-oracle architecture provides a robust solution:
*   **Pyth Network** ensures asset prices are accurate and reflect broad market conditions.
*   The **Custom wLiquify Oracle System** defines the dynamic index composition and target allocations based on comprehensive market analysis (performed off-chain) and stores this data transparently on-chain.

Together, they enable wLiquify to operate as a decentralized, asset-backed index that is accurately valued and dynamically rebalanced.

For specific technical details, security considerations, and operational aspects of each component, please refer to their dedicated documentation pages:
-   [Custom On-Chain Oracle Program](./on-chain-programs/oracle-program.md)
-   [Off-Chain Oracle Feeder Service](./off-chain-services/oracle-feeder.md)
-   [Pyth Network Integration](./integrations/pyth-network.md)
-   [Market Data API Integration](./integrations/market-data-apis.md) (how the Feeder uses APIs like CoinGecko/CoinMarketCap)

*(Note: This documentation will be updated as the oracle system evolves and new features are implemented.)* 