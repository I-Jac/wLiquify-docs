# Fees & Tokenomics

## Fee Structure

### Base Fees
- **Swaps**: Uses Jupiter Aggregator Swap Terminal for optimal routing and pricing
- **Pool Deposits**: 0.1% base fee
- **Pool Withdrawals**: Dynamic fee based on token dominance

### Dynamic Fee System

The protocol uses a dynamic fee system to maintain balanced token weights that reflect real market dominance:

#### Deposit Fees
- Base fee: 0.1%
- Dynamic fee: 0.2% per 1% deviation from target dominance
- Formula: `fee = base_fee + (deviation_constant * (target_dominance - actual_dominance)/target_dominance)`
- Maximum fee: 99.99%
- Maximum bonus: 5% (4.9% after base fee)

Example:
- If a token is 1% over-dominant in the pool:
  - Fee = 0.1% + 0.2% = 0.3% total fee
- If a token is 1% under-dominant in the pool:
  - Fee = 0.1% - 0.2% = -0.1% (bonus)

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
- BSC tokens through Binance Peg (when direct NTT not available)

### Excluded Categories
- Stablecoins
- CEX tokens
- Gold tokens
- Tokenized assets
- Staked tokens
- Wrapped tokens (except through official bridges)

### Cross-Chain Integration
- Primary method: Wormhole NTT
- Secondary method: Binance Peg on BSC (when NTT not available)
- Ensures efficient onramping of top tokens to Solana

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

*(Note: This documentation will be updated as the protocol evolves and new features are implemented.)*

*(Content to be added: Swap fees, deposit/withdrawal fees (if any), how fees are distributed, overall token supply and distribution if you have a governance token beyond wLQI.)* 