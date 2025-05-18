# Protocol Deep Dive

This section delves into the mechanics and architecture of the wLiquify Protocol, a decentralized index protocol built on Solana that enables trading of top cryptocurrencies through cross-chain integration.

## Core Components

### Liquidity Pool
- Multi-asset pool maintaining market-cap weighted index
- Dynamic fee system for pool balance
- Deposit bonus mechanism for cross-chain liquidity
- wLQI token for pool share representation

### Cross-Chain Integration
- Wormhole NTT for secure token transfers
- Manual bridging process (future automation planned)
- Deposit bonus to offset bridging costs
- Support for top 30 tokens by market cap

### Oracle System
- Pyth price feeds for accurate valuation
- Market cap and dominance tracking
- Dynamic fee calculations
- Pool weight management

### Swap Integration
- Jupiter Aggregator for optimal routing
- Direct pool interactions
- Cross-chain swap support
- Efficient price discovery

## Key Features

### Decentralized Index
- Market-cap weighted token selection
- Dynamic weight adjustments
- Oracle-based price feeds
- Community-driven governance

### Cross-Chain Trading
- Access to top tokens on Solana
- Secure bridging through Wormhole
- Deposit bonus incentives
- Future automated routing

### Dynamic Fees
- Base fee: 0.1%
- Dynamic adjustments based on weight
- Deposit bonuses for underweight tokens
- Withdrawal fees for overweight tokens

### Security Measures
- Oracle verification
- Bridge security
- Emergency procedures
- User protection mechanisms

## Documentation Structure

- [Ecosystem Overview](./ecosystem-overview.md): System architecture and component interactions
- [Liquidity Pools](./liquidity-pools.md): Pool mechanics and operations
- [Cross-Chain Integration](./cross-chain.md): Bridging and token transfer details
- [Fees & Tokenomics](./fees-tokenomics.md): Fee structure and token mechanics
- [Supported Assets](./supported-assets.md): Token selection and management
- [Swaps](./Swaps.md): Trading and routing mechanics
- [Oracles](./oracles.md): Data feeds and price discovery
- [wLQI Token](./wlqi-token.md): LP token mechanics and utility
- [Governance](./Governance.md): Protocol governance and decision-making

*(Note: This documentation will be updated as the protocol evolves and new features are implemented.)* 