# Supported Assets

## Overview

wLiquify supports a curated list of top 30 tokens by market cap, focusing on providing a decentralized index of major cryptocurrencies on Solana. The protocol enables trading of these assets through a combination of native Solana tokens and cross-chain tokens via Wormhole NTT.

## Token Categories

### Native Solana Tokens
- SOL (Solana)
- Other native Solana ecosystem tokens in top 30

### Cross-Chain Tokens
- Primary: Through Wormhole NTT (Native Token Transfers)
- Secondary: Through Binance Peg on BSC when direct NTT not available

## Token Selection Criteria

### Inclusion Criteria
1. **Market Cap Ranking**
   - Must be in top 30 by market capitalization
   - Regular updates based on market data

2. **Chain Support**
   - Native Solana tokens
   - Ethereum tokens (via Wormhole NTT)
   - Other supported chains (via Wormhole NTT)
   - BSC tokens (via Binance Peg when needed)

### Exclusion Criteria
The following token categories are excluded:
- Stablecoins
- CEX tokens
- Gold tokens
- Tokenized assets
- Staked tokens
- Wrapped tokens (except through official bridges)

## Cross-Chain Integration

### Wormhole NTT
- Primary method for cross-chain token transfers
- Supports direct token transfers between chains
- Maintains token authenticity and security
- Reduces need for wrapped tokens

### Binance Peg
- Secondary method when direct NTT not available
- Used for tokens on chains not supported by Wormhole
- Provides additional liquidity options
- Ensures broader token coverage

## Token Management

### Listing Process
1. **Market Cap Verification**
   - Regular checks of token rankings
   - Oracle-provided market data
   - Community verification

2. **Technical Integration**
   - Wormhole NTT setup
   - Binance Peg integration if needed
   - Smart contract deployment
   - Security audits

3. **Pool Integration**
   - Initial liquidity provision
   - Weight calculation
   - Fee structure setup
   - Oracle integration

### Delisting Process
1. **Market Cap Drop**
   - Automatic monitoring
   - Grace period for recovery
   - Community notification

2. **Technical Issues**
   - Security concerns
   - Bridge problems
   - Oracle failures

3. **User Protection**
   - Withdrawal period
   - Fee adjustments
   - Liquidity management

## Oracle Integration

### Market Data
- Real-time market cap updates
- Token dominance calculations
- Price feeds
- Volume data

### Weight Management
- Target weight calculations
- Actual weight monitoring
- Dynamic fee adjustments
- Pool rebalancing triggers

## Security Considerations

### Bridge Security
- Wormhole security measures
- Binance Peg verification
- Regular security audits
- Emergency procedures

### Oracle Reliability
- Multiple data sources
- Fallback mechanisms
- Regular verification
- Community monitoring

*(Note: The list of supported assets and integration methods may change as the protocol evolves and new solutions become available.)* 