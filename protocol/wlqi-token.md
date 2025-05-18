# wLQI Token

## Overview

The wLQI token is wLiquify's liquidity provider token, representing a user's share in the multi-asset liquidity pool. It is minted when users deposit assets and burned when they withdraw, with its value directly tied to the total value locked (TVL) in the pool.

## Token Mechanics

### Valuation
The wLQI token price is calculated as:
```
wLQI Price = Total Value Locked (TVL) / wLQI Circulation Supply
```

Where:
- TVL = Sum of all token values in the pool
- Token values = Amount × Pyth price feed
- wLQI Circulation Supply = Total minted - Total burned

### Minting Process
1. **Deposit Trigger**
   - User deposits tokens
   - Pyth price feed verifies value
   - Dynamic fee calculation
   - wLQI tokens minted

2. **Amount Calculation**
   - Based on deposit value
   - Adjusted by fees/bonuses
   - Oracle-verified pricing
   - Pool weight consideration

### Burning Process
1. **Withdrawal Trigger**
   - User withdraws tokens
   - Pyth price feed verifies value
   - Dynamic fee calculation
   - wLQI tokens burned

2. **Amount Calculation**
   - Based on withdrawal value
   - Adjusted by fees/bonuses
   - Oracle-verified pricing
   - Pool weight consideration

## Dynamic Fee Impact

### Fee Implementation
1. **Minting Adjustment**
   - Overweight tokens: Reduced minting
   - Underweight tokens: Increased minting
   - Fee-based adjustments
   - Oracle-verified weights

2. **Burning Adjustment**
   - Overweight tokens: Increased burning
   - Underweight tokens: Reduced burning
   - Fee-based adjustments
   - Oracle-verified weights

### Fee Structure
1. **Base Fee**
   - 0.1% fixed fee
   - Applied to all operations
   - Protocol revenue
   - Pool maintenance

2. **Dynamic Fee**
   - Based on weight deviation
   - 0.2% per 1% deviation
   - Incentivizes balance
   - Oracle-based calculation

## Token Utility

### Current Functions
1. **Liquidity Provision**
   - Pool share representation
   - Value tracking
   - Fee earning
   - Withdrawal rights

2. **Value Accrual**
   - TVL-based valuation
   - Fee distribution
   - Pool growth benefits
   - Market impact protection

### Future Potential
1. **Governance**
   - Protocol decisions
   - Parameter adjustments
   - Feature proposals
   - Community voting

2. **Additional Features**
   - Staking mechanisms
   - Fee sharing
   - Protocol incentives
   - Ecosystem integration

## Security Features

### Value Protection
1. **Oracle Integration**
   - Pyth price feeds
   - Cross-chain verification
   - Real-time updates
   - Manipulation resistance

2. **Fee Mechanisms**
   - Dynamic adjustments
   - Weight management
   - Pool balance
   - Value protection

### Emergency Measures
1. **Protocol Safety**
   - Emergency pauses
   - Manual overrides
   - Oracle fallbacks
   - Community intervention

2. **User Protection**
   - Slippage limits
   - Price impact caps
   - Fee transparency
   - Transaction safety

## Best Practices

### For Users
1. **Understanding Value**
   - TVL tracking
   - Fee impact
   - Market conditions
   - Pool composition

2. **Operations**
   - Deposit timing
   - Withdrawal strategy
   - Fee consideration
   - Market impact

### For Developers
1. **Integration**
   - Price calculation
   - Fee handling
   - Oracle usage
   - Value tracking

2. **Testing**
   - Price accuracy
   - Fee calculations
   - Edge cases
   - Security measures

## Future Developments

### Planned Features
1. **Enhanced Utility**
   - Governance implementation
   - Staking mechanisms
   - Fee sharing
   - Ecosystem integration

2. **Technical Improvements**
   - Better price feeds
   - Enhanced security
   - Improved efficiency
   - Better integration

*(Note: This documentation will be updated as the wLQI token evolves and new features are implemented.)* 