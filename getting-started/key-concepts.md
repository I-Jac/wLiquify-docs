# Key Concepts

Understand the fundamental concepts behind wLiquify.

## Automated Market Maker (AMM)

An Automated Market Maker (AMM) is a type of decentralized exchange (DEX) protocol that uses mathematical formulas to price assets. Instead of using traditional order books, AMMs use liquidity pools to enable trading.

In wLiquify:
- The protocol maintains a multi-asset liquidity pool
- Prices are determined by the relative weights of assets in the pool
- Trading is automated through smart contracts
- No need for traditional market makers or order books

## Cross-Chain Bridging

wLiquify enables trading of top cryptocurrencies on Solana through cross-chain bridging:

1. **Current Process**
   - Users manually bridge assets to source chain
   - Buy source token on source chain
   - Bridge to Solana using Wormhole NTT
   - Deposit Wormhole-wrapped tokens into wLiquify pool

2. **Wormhole NTT**
   - Public bridging protocol used by wLiquify
   - Enables secure cross-chain token transfers
   - Creates wrapped versions of tokens on Solana
   - Maintains token value across chains

3. **Future Automation**
   - Planned integration for automated bridging
   - Simplified user experience
   - Reduced manual steps
   - Integrated frontend routing

## Deposit Bonus Mechanism

wLiquify incentivizes cross-chain liquidity through a deposit bonus system:

1. **Purpose**
   - Encourage users to bring liquidity to Solana
   - Cover bridging and LP costs
   - Grow Solana's DeFi TVL
   - Improve token availability

2. **How It Works**
   - Users bridge tokens to Solana
   - Deposit into wLiquify pool
   - Receive bonus rewards
   - Bonus offsets bridging costs

3. **Benefits**
   - Higher than bridging + LP costs
   - Encourages ecosystem growth
   - Improves token availability
   - Increases Solana TVL

## Liquidity Provision

Liquidity provision is the process of depositing assets into a liquidity pool to enable trading. In return, providers receive LP (Liquidity Provider) tokens that represent their share of the pool.

In wLiquify:
- Users can deposit various supported tokens into the pool
- Each deposit mints wLQI tokens (the LP token)
- The value of wLQI tokens is derived from the total value of assets in the pool
- Liquidity providers may earn fees from pool activities

## Impermanent Loss

Impermanent loss occurs when the price of assets in a liquidity pool changes compared to when they were deposited. This is a temporary loss that can become permanent if the assets are withdrawn at the new price ratio.

In wLiquify:
- The protocol uses dynamic fees and bonuses to help mitigate impermanent loss
- Fees are adjusted based on token weights in the pool
- Users can withdraw their assets at any time
- The longer assets stay in the pool, the more fees they can earn to offset potential impermanent loss

## wLQI LP Token

The wLQI token is wLiquify's liquidity provider token. It represents a user's share in the multi-asset liquidity pool.

Key aspects of wLQI:
- Minted when users deposit assets into the pool
- Burned when users withdraw assets
- Value is calculated as: `(Total Pool Value) / (Total wLQI Supply)`
- Can be used to withdraw any supported token from the pool
- May have additional utility in governance (if implemented)

## Dynamic Fees and Pool Balance

wLiquify uses a dynamic fee system to maintain balanced token weights in the pool:

- **Deposit Fees/Bonuses**:
  - Bonus for depositing underweight tokens
  - Fee for depositing overweight tokens
- **Withdrawal Fees/Bonuses**:
  - Fee for withdrawing underweight tokens
  - Bonus for withdrawing overweight tokens

This system incentivizes users to help maintain the pool's target token weights, which helps:
- Reduce impermanent loss
- Maintain pool stability
- Ensure efficient trading

## Price Impact

Price impact refers to how much a trade affects the price of an asset in the pool. Larger trades have more price impact than smaller ones.

In wLiquify:
- Price impact is calculated based on the pool's composition
- The protocol aims to minimize price impact through:
  - Maintaining balanced token weights
  - Dynamic fee adjustments
  - Efficient routing of trades

## Oracle Integration

wLiquify uses oracles to:
- Get accurate price feeds for all supported tokens
- Calculate token dominance in the market
- Update pool values and token weights
- Ensure fair pricing and fee calculations

This integration helps maintain the pool's accuracy and reliability while enabling automated operations.

*(Note: This documentation will be updated as new features are added to the protocol, including automated cross-chain routing.)* 