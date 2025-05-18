# Fees & Tokenomics

## Fee Structure

### Base Fees
- **Swaps**: Uses Jupiter Aggregator Swap Terminal for optimal routing and pricing
  - No additional wLiquify fees on swaps
  - Standard Jupiter and network fees apply
- **Pool Deposits**: 0.1% base fee
- **Pool Withdrawals**: Dynamic fee based on token dominance

### Dynamic Fee System

The protocol uses a dynamic fee system to maintain balanced token weights that reflect real market dominance:

#### Deposit Fees and Bonuses
- Base fee: 0.1%
- Dynamic fee: 0.2% per 1% deviation from target dominance
- Formula: `fee = base_fee + (deviation_constant * (target_dominance - actual_dominance)/target_dominance)`
- Maximum fee: 99.99%
- Maximum bonus: 5% (4.9% after base fee)
- **Deposit Bonus**: Additional bonus to offset bridging costs

Example:
- If a token is 1% over-dominant in the pool:
  - Fee = 0.1% + 0.2% = 0.3% total fee
- If a token is 1% under-dominant in the pool:
  - Fee = 0.1% - 0.2% = -0.1% (bonus)
- Deposit bonus: Additional bonus to cover bridging costs

#### Typical Onramp Costs
When bridging tokens to Solana, users should be aware of the following typical costs:

1. **Source Chain Costs**
   - Gas fees for initial bridge transaction
   - Gas fees for token purchases (if needed)
   - Network congestion can significantly impact these costs

2. **Bridging Costs**
   - Wormhole NTT bridging fees
   - Network fees for cross-chain message passing
   - These vary based on network conditions

3. **Solana Costs**
   - Transaction fees for receiving bridged tokens
   - Any additional swap fees if needed

Note: The actual costs can vary significantly based on:
- Network congestion
- Token being bridged
- Amount being bridged
- Current market conditions
- Normally 0.5-1.5%

#### Withdrawal Fees
- Dynamic fee based on token dominance
- Formula: Same as deposits but with opposite incentives
- Minimum fee: 0% (no bonuses for withdrawals)
- Maximum fee: 99.99%
- Delisted tokens: 5% bonus on withdrawal

### Fee Implementation
- Dynamic fees are implemented through wLQI token minting/burning
- System maintains balance through inflation/deflation of wLQI tokens
- Fees are automatically adjusted based on oracle-provided market dominance data

## Token Listing Criteria

### Supported Tokens
- Top 30 tokens by market cap
- Native Solana tokens
- Cross-chain tokens through Wormhole NTT (Native Token Transfers)

### Excluded Categories
- Stablecoins
- CEX tokens
- Gold tokens
- Tokenized assets
- Staked tokens
- Wrapped tokens (except through official bridges)

### Cross-Chain Integration
- Primary method: Wormhole NTT
- Manual bridging process required
- Ensures efficient onramping of top tokens to Solana
- Deposit bonus incentivizes cross-chain liquidity

## Oracle Dependencies

The protocol relies on oracle feeds for:
- Market cap data
- Token dominance calculations
- Target weight adjustments
- Fee calculations

This dependency is a critical component of the system, ensuring:
- Accurate market representation
- Fair fee distribution
- Proper pool balancing
- Reliable token weights

## Protocol Goals

1. **Cross-Chain Liquidity**
   - Enable trading of top 30 tokens on Solana
   - Reduce need for multiple chain wallets
   - Provide single-chain access to major assets
   - Incentivize liquidity through deposit bonuses

2. **Decentralized Index**
   - Create organic market-cap weighted index
   - Maintain balanced token weights
   - Reflect real market dominance

3. **Efficient Trading**
   - Integration with Jupiter Aggregator
   - Optimal swap routing
   - Competitive fees

4. **Solana Ecosystem Growth**
   - Increase DeFi capabilities
   - Attract cross-chain liquidity
   - Provide better trading experience
   - Grow Solana TVL

*(Note: This documentation will be updated as the protocol evolves and new features are implemented.)* 