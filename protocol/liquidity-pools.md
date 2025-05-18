# Liquidity Pools

## Overview

wLiquify's liquidity pool is a multi-asset pool that maintains a market-cap weighted index of top cryptocurrencies on Solana. The pool uses Wormhole-wrapped tokens and Pyth price feeds to ensure accurate asset valuation and efficient trading.

## Pool Mechanics

### Asset Management
1. **Token Integration**
   - Wormhole-wrapped tokens
   - Cross-chain token support
   - Native Solana tokens
   - Price feed integration

2. **Weight Management**
   - Market cap-based weights
   - Oracle-provided dominance
   - Dynamic rebalancing
   - Fee-based incentives

### Price Discovery
1. **Pyth Integration**
   - Real-time price feeds
   - Cross-chain price verification
   - High-frequency updates
   - Reliable price discovery

2. **Token Valuation**
   - Deposit/withdrawal pricing
   - Pool value calculation
   - wLQI token valuation
   - Market impact assessment

## wLQI Token

### Valuation
The wLQI token price is calculated as:
```
wLQI Price = Total Value Locked (TVL) / wLQI Circulation Supply
```

Where:
- TVL = Sum of all token values in the pool
- Token values = Amount × Pyth price feed
- wLQI Circulation Supply = Total minted - Total burned

### Token Mechanics
1. **Minting**
   - Occurs on deposits
   - Amount based on deposit value
   - Adjusted by dynamic fees
   - Oracle-verified pricing

2. **Burning**
   - Occurs on withdrawals
   - Amount based on withdrawal value
   - Adjusted by dynamic fees
   - Oracle-verified pricing

## Pool Operations

### Deposits
1. **Process**
   - Token price verification via Pyth
   - Value calculation
   - Fee determination
   - wLQI minting

2. **Considerations**
   - Token weight in pool
   - Market impact
   - Fee structure
   - Price feed reliability

### Withdrawals
1. **Process**
   - Token price verification via Pyth
   - Value calculation
   - Fee determination
   - wLQI burning

2. **Considerations**
   - Token weight in pool
   - Market impact
   - Fee structure
   - Price feed reliability

## Dynamic Fee System

### Fee Calculation
1. **Base Components**
   - Fixed base fee (0.1%)
   - Dynamic fee based on weight deviation
   - Oracle-based adjustments
   - Market impact consideration

2. **Implementation**
   - Fee affects wLQI mint/burn amount
   - Maintains pool balance
   - Incentivizes optimal weights
   - Protects pool value

## Security Features

### Price Feed Security
1. **Pyth Integration**
   - Reliable price sources
   - Cross-chain verification
   - Update frequency
   - Manipulation resistance

2. **Fallback Mechanisms**
   - Backup price feeds
   - Historical data
   - Emergency procedures
   - Manual overrides

### Pool Protection
1. **Value Protection**
   - Oracle verification
   - Fee adjustments
   - Weight management
   - Emergency pauses

2. **User Protection**
   - Slippage protection
   - Price impact limits
   - Fee transparency
   - Transaction safety

## Best Practices

### For Users
1. **Deposits**
   - Check token prices
   - Understand fees
   - Consider market impact
   - Monitor pool weights

2. **Withdrawals**
   - Verify prices
   - Check fees
   - Consider timing
   - Monitor impact

### For Developers
1. **Integration**
   - Pyth price feed usage
   - Wormhole token handling
   - Fee calculations
   - Value tracking

2. **Testing**
   - Price feed reliability
   - Fee accuracy
   - Value calculations
   - Edge cases

## Future Developments

### Planned Features
1. **Enhanced Price Feeds**
   - Additional sources
   - Better verification
   - Faster updates
   - Improved reliability

2. **Pool Improvements**
   - Better weight management
   - Enhanced fee system
   - More token support
   - Improved efficiency

*(Note: This documentation will be updated as the pool mechanics evolve and new features are implemented.)* 