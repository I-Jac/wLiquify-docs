# Core: Oracles & Data Feeds

How wLiquify utilizes oracles and external data.

*(Content to be added: Importance of oracles in your system, what data is sourced, how it impacts the protocol, high-level overview of your oracle program/feeder without deep technicals.)*

# Oracles: The Engine of Accuracy and Dynamism in wLiquify

Oracles are the vital data conduits that allow wLiquify to connect with real-world market information, ensuring our decentralized index is both accurately valued and dynamically responsive. wLiquify employs a sophisticated **dual-component oracle strategy** to achieve this:

1.  **Pyth Network**: For precise, real-time price feeds of the underlying crypto assets, especially Wormhole-wrapped tokens.
2.  **Custom wLiquify Oracle System**: An in-house system comprising an on-chain program and an off-chain data feeder, responsible for defining the index composition (the dynamic "Top 30"), setting target dominance/weights, and mapping tokens to their Pyth feeds.

This two-part approach is fundamental to how wLiquify functions as a **truly asset-backed index** with **automated, market-driven rebalancing**.

## 1. Pyth Network: Valuing the Underlying Assets

**The Challenge of Wrapped Assets:**
Many top cryptocurrencies are not native to Solana. To be included in the wLiquify pool, they are often brought over from other chains (like Ethereum) using Wormhole's Native Token Transfer (NTT) technology, resulting in "Wormhole-wrapped" versions on Solana.

A key challenge with these wrapped assets is that they might not have deep liquidity on Solana-based Automated Market Makers (AMMs) or exchanges immediately after being bridged. Relying solely on Solana AMM prices for these tokens could lead to inaccurate valuations (e.g., a price of zero if there's no local liquidity, or a highly volatile price from a shallow pool).

**Pyth's Role: Real-World Price Feeds**
This is where the **Pyth Network** comes in. Pyth is a decentralized financial oracle network that provides high-fidelity, real-time price data for a wide range of assets.

*   **Accurate Valuation**: wLiquify integrates Pyth price feeds to determine the fair market value of each Wormhole-wrapped token (and other supported assets) in its liquidity pool. This ensures that the pool's total value and the individual token contributions are based on their true, externally verified market prices, not just potentially thin local Solana liquidity.
*   **Asset-Backed Integrity**: By using Pyth, wLiquify ensures that when you invest in the index, the value of your share (represented by wLQI tokens) accurately reflects the collective, real-world price of the underlying assets.

**How it Works with wLiquify:**
The `price_feed_id` for each token (which is the public key of the relevant Pyth price account) is stored within our custom oracle system. The wLiquify pool program and other components can then use this ID to query the Pyth Network directly on-chain to get the latest price for each specific token when performing calculations for deposits, withdrawals, and overall pool valuation.

## 2. Custom wLiquify Oracle System: Defining the Index and Driving Rebalancing

While Pyth provides the *current price* of individual assets, the logic for *which assets constitute the index* and *what their target representation should be* is managed by wLiquify's custom oracle system. This system has two main parts:

*   **Off-Chain Oracle Feeder (`wLiquify-Oracle` script)**: This is an automated, off-chain script run by the wLiquify team. Its responsibilities include:
    *   Monitoring the broader crypto market to identify the current "Top X" tokens (e.g., Top 30 by criteria like market capitalization).
    *   Determining the **target market dominance (target weight)** for each of these selected tokens within the wLiquify index.
    *   Identifying the correct Pyth Network `price_feed_id` for each selected token, especially for their Wormhole-wrapped versions on Solana.
    *   Identifying the Solana mint address for the wrapped version of each token.
    *   Securely submitting this curated list of tokens, their target dominances, their Solana wrapped mint addresses, and their Pyth `price_feed_id`s to our on-chain oracle program.

*   **On-Chain Oracle Program (`oracle_program`)**: This is a custom Solana smart contract developed by wLiquify. Its key functions are:
    *   To securely store the official list of tokens that are part of the wLiquify index, along with their target market dominance and Pyth `price_feed_id`, as provided by the authorized off-chain feeder.
    *   To make this critical data available on-chain for the wLiquify Liquidity Pool Program (`w-liquify-pool`) and other authorized components.
    *   The process for updating this data is transparent and managed by a designated authority, ensuring data integrity.

**Driving Dynamic Rebalancing & Fees:**
The **target dominance** figures stored in this custom on-chain oracle are crucial. The wLiquify Liquidity Pool program constantly compares the *actual* weight of each token in the pool (based on its current Pyth-derived price and total quantity in the pool) against its *target dominance* from the custom oracle.

This comparison is what powers wLiquify's **dynamic fee and bonus mechanism**:
*   If a token is **underweight** (i.e., its actual percentage in the pool is less than its target dominance), users are incentivized with **deposit bonuses** (or lower fees) to add more of that token.
*   If a token is **overweight**, users might incur a small **deposit fee**, or be incentivized with **withdrawal bonuses** to take that token out.

This automated, incentive-driven system ensures that the pool naturally trends towards its target allocations, reflecting the desired "Top 30" composition without manual intervention by a central party for rebalancing.

## Transparency and Automation

*   **Pyth Network**: Pyth is an established, decentralized oracle, and its price feeds are publicly verifiable on-chain.
*   **Custom wLiquify Oracle**: While the off-chain feeder script is managed by the wLiquify team to curate the Top 30 list and their target dominances, the data it submits is stored on-chain in the `oracle_program`. This on-chain data is transparent and can be queried by anyone. The rules and mechanisms (like dynamic fees) that use this data are embedded in the open-source wLiquify Liquidity Pool program.

This dual-oracle architecture ensures that wLiquify's index is:
*   **Accurately Valued**: Thanks to Pyth's real-time price feeds for the underlying assets.
*   **Dynamically Composed & Rebalanced**: Driven by the custom oracle system that defines the "Top 30" and their target weights, with market forces (incentivized by dynamic fees) performing the rebalancing.
*   **Truly Asset-Backed**: Because valuations are tied to real-world prices of the actual tokens held in the pool.

*(The rest of the file's original high-level structure regarding Oracle Functions, Integration, Security, System Architecture, Best Practices, and Future Developments can be adapted and filled in more detail based on this foundational explanation of the dual system.)*

## Oracle Functions

### Market Data
1. **Market Cap Tracking**
   - Real-time market cap updates
   - Token ranking monitoring
   - Price feed aggregation
   - Volume tracking

2. **Token Dominance**
   - Market share calculations
   - Relative weight tracking
   - Historical data analysis
   - Trend monitoring

### Pool Management
1. **Weight Calculations**
   - Target weight determination
   - Actual weight monitoring
   - Deviation calculations
   - Rebalancing triggers

2. **Fee Adjustments**
   - Dynamic fee calculations
   - Bonus determination
   - Fee cap enforcement
   - Historical fee tracking

## Oracle Integration

### Data Sources
1. **Primary Sources**
   - Market data aggregators
   - Price feed providers
   - Volume trackers
   - Chain-specific oracles

2. **Secondary Sources**
   - Backup data providers
   - Cross-chain oracles
   - Community-verified data
   - Historical archives

### Data Processing
1. **Aggregation**
   - Multiple source integration
   - Data validation
   - Outlier detection
   - Weighted averaging

2. **Verification**
   - Cross-reference checking
   - Historical comparison
   - Anomaly detection
   - Source reliability scoring

## Security Measures

### Data Integrity
1. **Validation**
   - Source verification
   - Data consistency checks
   - Timestamp validation
   - Cross-chain verification

2. **Protection**
   - Manipulation resistance
   - Sybil attack prevention
   - Data encryption
   - Access control

### Emergency Procedures
1. **Fallback Systems**
   - Backup data sources
   - Historical data usage
   - Manual override options
   - Community verification

2. **Recovery**
   - Data restoration
   - System recovery
   - Emergency updates
   - Protocol pausing

## System Architecture

### Components
1. **Data Collection**
   - API integrations
   - WebSocket connections
   - Chain monitoring
   - Cross-chain bridges

2. **Processing Layer**
   - Data aggregation
   - Calculation engine
   - Validation system
   - Update mechanism

3. **Distribution**
   - Smart contract integration
   - Update broadcasting
   - Cache management
   - Access control

## Best Practices

### For Users
1. **Understanding**
   - Oracle role in protocol
   - Data reliability
   - Update frequency
   - Emergency procedures

2. **Monitoring**
   - Oracle status
   - Data accuracy
   - Update timing
   - System health

### For Developers
1. **Integration**
   - Oracle data usage
   - Update handling
   - Error management
   - Fallback implementation

2. **Testing**
   - Data validation
   - Update verification
   - Error scenarios
   - Recovery procedures

## Future Developments

### Planned Improvements
1. **Enhanced Security**
   - Additional data sources
   - Improved validation
   - Better encryption
   - Advanced monitoring

2. **Performance**
   - Faster updates
   - Better aggregation
   - Reduced latency
   - Improved accuracy

3. **Integration**
   - More data sources
   - Better cross-chain support
   - Enhanced APIs
   - Developer tools

*(Note: This documentation will be updated as the oracle system evolves and new features are implemented.)* 