# Fees

## Fee Structure

### Base Fees & Dynamic Adjustments

wLiquify employs a transparent fee structure that combines a small base fee with a dynamic adjustment mechanism. This system is designed to maintain balanced token weights in the liquidity pool and incentivize actions that support the health of the index.

-   **Swaps via Jupiter**: wLiquify does not add extra fees for swaps routed through Jupiter Aggregator. Users only pay standard Solana network fees and any fees intrinsic to Jupiter or the DEXs involved in the swap route.
-   **Pool Deposits & Withdrawals**: Both deposits into and withdrawals from the wLiquify liquidity pool are subject to:
    1.  A **Base Fee** (e.g., 0.1% of the transaction value), which contributes to protocol revenue.
    2.  A **Dynamic Adjustment**, which can modify the effective fee or even result in a net bonus. This adjustment is calculated based on the specific token's deviation from its target dominance in the pool.

### Dynamic Fee System Explained

The core of the fee system is designed to automatically incentivize pool balancing:

#### For Deposits:
-   **Base Fee**: A small percentage (e.g., 0.1%) is applied.
-   **Dynamic Adjustment**: Calculated based on the token's current weight versus its target weight (dominance). For example, a common formula might be: `dynamic_adjustment_factor * (target_dominance - actual_dominance) / target_dominance`.
    -   If a token is **underweight**: The dynamic adjustment will be favorable, potentially reducing the effective fee below the base fee, or even resulting in a **net bonus** (i.e., the user receives slightly more wLQI tokens than a pure value-based calculation post-base-fee would yield). This favorable adjustment is the primary mechanism to help offset external costs like bridging assets to Solana.
    -   If a token is **overweight**: The dynamic adjustment will be unfavorable, increasing the effective fee above the base fee.
-   **Maximum Fee/Bonus**: The system has defined caps for maximum possible fees and the maximum favorable adjustment (bonus).

*Example (Illustrative for Deposits):*
- Base Fee: 0.1%
- Dynamic Adjustment Sensitivity: 0.2% per 1% deviation.
- If a token is 1% **over-dominant**: Effective Fee ≈ 0.1% (base) + 0.2% (penalty) = 0.3% total fee.
- If a token is 1% **under-dominant**: Effective Fee ≈ 0.1% (base) - 0.2% (favorable adjustment) = -0.1% (effectively a 0.1% bonus in wLQI value relative to deposit after base fee).

#### Typical Onramp Costs (User Consideration for Bridging)
When bridging tokens to Solana to deposit into wLiquify, users should be aware of external costs. The dynamic fee system's favorable adjustments for underweight assets are designed to help make depositing these assets attractive despite these costs:

1.  **Source Chain Costs**: Gas fees for initial bridge transaction, token purchases.
2.  **Bridging Costs**: Fees from services like Wormhole NTT, network message passing.
3.  **Solana Costs**: Transaction fees for receiving tokens.
*Note: These external costs can vary (e.g., 0.5%-1.5% or more) based on network congestion, token, amount, and market conditions.* The wLiquify protocol itself does not control or impose these external on-ramping costs.

#### For Withdrawals:
-   **Base Fee**: A small percentage (e.g., 0.1%) is applied.
-   **Dynamic Adjustment**: Calculated similarly to deposits, but incentives are reversed.
    -   If a token is **overweight**: The dynamic adjustment is favorable, potentially reducing the effective fee or resulting in the user receiving slightly more of the underlying asset than a strict pro-rata wLQI burn would imply (after the base fee).
    -   If a token is **underweight**: The dynamic adjustment is unfavorable, increasing the effective fee.
-   **Fee Range**: There are defined minimum and maximum effective fees. While withdrawals of overweight tokens are incentivized through a better rate, the system typically does not pay out an *additional* bonus from a separate fund for withdrawals.
-   **Delisted Tokens**: A specific, potentially more favorable withdrawal rate (e.g., a fixed reduced fee or slight bonus on redemption) might apply to tokens being actively delisted from the index to facilitate their removal from the pool.

### Fee Implementation & Sustainability
-   Dynamic adjustments are seamlessly integrated into the wLQI token minting (for deposits) and burning (for withdrawals) process.
-   **Self-Sustaining by Design**: The system is designed to be economically self-sustaining. The additional fees collected from transactions that would further imbalance the pool (e.g., depositing an already overweight token or withdrawing an underweight one) effectively fund the "bonuses" (or favorable fee adjustments) provided for transactions that help restore balance (e.g., depositing an underweight token or withdrawing an overweight one). This is achieved through the careful calibration of wLQI token minting/burning amounts relative to the value transacted.
-   **Market-Driven Balancing**: The fundamental reason for this dynamic fee system is to create powerful economic incentives that naturally guide the pool's asset composition towards its target dominances. By making it more attractive to perform balancing actions and less attractive to perform imbalancing ones, the protocol leverages market dynamics and arbitrage opportunities to maintain its desired index allocations in a decentralized manner.
-   All fee calculations are driven by on-chain data: target dominances from the [Custom On-Chain Oracle](./on-chain-programs/oracle-program.md) and live prices from Pyth Network.

## Oracle Dependencies for Fee Calculation

The protocol's dynamic fee system critically depends on reliable on-chain oracle feeds for:
-   **Token Target Dominances**: Sourced from the [Custom On-Chain Oracle Program](./on-chain-programs/oracle-program.md), these define the ideal weight for each asset.
-   **Live Asset Prices**: Sourced from Pyth Network, these are used for all on-chain value calculations, including determining current asset weights relative to targets.

## Purpose of the Dynamic Fee System

The primary goals of wLiquify's dynamic fee system are to:

1.  **Maintain Index Integrity**: Create economic incentives that encourage user actions (deposits and withdrawals) to organically align the pool's actual asset weights with their target dominances, ensuring the index accurately reflects its intended composition.
2.  **Incentivize Cross-Chain Liquidity**: Offer favorable terms (bonuses or reduced fees) for depositing needed (underweight) assets, helping to offset users' external bridging costs and attract liquidity to Solana.
3.  **Promote Pool Health & Efficiency**: Discourage transactions that would exacerbate pool imbalances, contributing to overall stability and efficient trading conditions.

*(Note: Specific fee percentages, adjustment factors, and formulas are subject to governance and may evolve. Always refer to the latest information from the wLiquify dApp or official announcements.)* 