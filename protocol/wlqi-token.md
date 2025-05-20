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
   - Overweight tokens: Reduced wLQI minting (higher effective fee)
   - Underweight tokens: Increased wLQI minting (lower effective fee or bonus)
   - Fee-based adjustments
   - Oracle-verified weights

2. **Effect on Assets Received (Withdrawals)**
   - Withdrawing an **overweight token** (beneficial to pool balance): May result in receiving a *larger amount* of the underlying asset for the wLQI burned, or needing to burn *fewer* wLQI tokens for a target asset amount, effectively reducing the withdrawal fee or providing a net positive adjustment.
   - Withdrawing an **underweight token** (detrimental to pool balance): May result in receiving a *smaller amount* of the underlying asset for the wLQI burned, or needing to burn *more* wLQI tokens, effectively increasing the withdrawal fee.
   - Oracle-verified weights

### Fee Structure
1. **Base Fee**
   - 0.1% fixed fee (example value)
   - Applied to all operations
   - Protocol revenue
   - Pool maintenance

2. **Dynamic Fee**
   - Based on weight deviation
   - Example: 0.2% adjustment per 1% deviation from target dominance (This is an illustrative example; the actual adjustment is governed by a `FEE_K_FACTOR` constant in the program code and the specific mathematical formula implemented.)
   - Incentivizes balance
   - Oracle-based calculation

## Token Utility

### Current Functions
1. **Liquidity Provision**
   - Pool share representation
   - Value tracking
   - Potential for value accrual (see below)
   - Withdrawal rights

2. **Value Accrual**
   The value of wLQI tokens can benefit LPs in several ways:
   - **TVL-Based Valuation**: Primarily, the wLQI token's value is derived from its proportional share of the pool's Total Value Locked (TVL). As the value of the underlying assets in the pool appreciates, so does the value of each wLQI token.
   - **Potential Deflationary Effect of Dynamic Fees**: The dynamic fee system, which adjusts the amount of wLQI minted on deposit or burned on withdrawal, does not directly add collected fees to the pool to be shared by LPs. Instead, these adjustments (inflationary or deflationary to the wLQI supply for a given transaction) aim to incentivize pool balance.
     Given that deposit bonuses have a cap (e.g., 2%) and withdrawals of over-dominant tokens receive a more favorable rate but not typically an additional bonus payout from a separate fund, there is a potential for the overall wLQI supply to experience a net deflationary effect over time. If more wLQI is effectively "penalized" (less minted or more burned) than is "bonused" (more minted or less burned), this can slowly reduce the total wLQI supply relative to the TVL. This deflationary pressure can subtly increase the value backing each remaining wLQI token, acting as a potential form of APY for long-term LPs.
     This nuanced deflation also helps to sustainably fund the bonuses provided for withdrawing delisted tokens, which aids in maintaining the pool's focus on the target index composition.
   - **Market Impact Protection**: Holding wLQI provides exposure to a diversified basket of assets, which can offer some protection against the price volatility of a single asset.

   *(Note: Future protocol enhancements may introduce staking mechanisms where a portion of the base protocol fees could be distributed to wLQI stakers, providing a more direct fee-sharing revenue stream. This is distinct from the current dynamic fee mechanics.)*

### Future Potential
1. **Governance**
   - Protocol decisions
   - Parameter adjustments
   - Feature proposals
   - Community voting

2. **Additional Features**
   - Staking mechanisms
   - Enhanced fee sharing models
   - Protocol incentives
   - Broader ecosystem integration
   - Oracle fallbacks (Planned for future resilience)
   - Community intervention mechanisms (Planned for future resilience)

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