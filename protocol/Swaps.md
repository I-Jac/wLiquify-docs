# Swaps

## Overview

wLiquify uses Jupiter Aggregator for executing swaps, providing users with the best possible prices and liquidity across the Solana ecosystem. The protocol integrates both direct swaps and pool interactions through Jupiter's routing system.

## Jupiter Integration

### Swap Terminal
- Uses Jupiter Aggregator Swap Terminal for optimal routing
- Access to multiple DEXs and liquidity sources
- Best price discovery across Solana
- Efficient execution with minimal slippage

### Routing System
1. **Price Discovery**
   - Aggregates prices from multiple sources
   - Calculates optimal routes
   - Considers pool liquidity and fees
   - Minimizes price impact

2. **Execution**
   - Single transaction execution
   - Atomic swaps
   - Slippage protection
   - Transaction confirmation

## Pool Integration

### Direct Pool Swaps
- Users can swap directly with the wLiquify pool
- Dynamic fee structure applies
- Price impact based on pool composition
- Oracle-based price feeds

### Cross-Chain Swaps
1. **Wormhole NTT Integration**
   - Native token transfers
   - Direct chain-to-chain swaps
   - Reduced wrapping needs
   - Lower fees

2. **Binance Peg Support**
   - Secondary routing option
   - BSC token support
   - Additional liquidity sources
   - Fallback mechanism

## Fee Structure

### Swap Fees
- Uses Jupiter's fee structure for external swaps
- Pool-specific fees for direct pool interactions
- Dynamic fees based on token dominance
- Oracle-based fee adjustments

### Price Impact
- Calculated based on pool composition
- Larger trades have higher impact
- Oracle-based price feeds
- Slippage protection

## Security Features

### Transaction Safety
- Atomic execution
- Slippage protection
- Price impact limits
- Oracle verification

### Bridge Security
- Wormhole NTT verification
- Binance Peg validation
- Cross-chain security checks
- Emergency procedures

## User Experience

### Swap Interface
1. **Token Selection**
   - Choose input token
   - Select output token
   - View available routes
   - Check price impact

2. **Transaction Details**
   - Fee breakdown
   - Price impact
   - Slippage settings
   - Route information

3. **Execution**
   - Transaction confirmation
   - Progress tracking
   - Success/failure notification
   - Transaction history

## Best Practices

### For Users
1. **Price Impact**
   - Check impact before swapping
   - Consider splitting large trades
   - Monitor pool composition
   - Use optimal routes

2. **Fee Optimization**
   - Compare different routes
   - Consider pool fees
   - Check cross-chain costs
   - Monitor gas fees

3. **Security**
   - Verify token addresses
   - Check slippage settings
   - Review transaction details
   - Use trusted routes

### For Developers
1. **Integration**
   - Use Jupiter SDK
   - Implement proper error handling
   - Monitor transaction status
   - Handle cross-chain scenarios

2. **Testing**
   - Test with small amounts
   - Verify price calculations
   - Check fee structures
   - Validate cross-chain flows

## Future Developments

### Planned Features
1. **Enhanced Routing**
   - More DEX integrations
   - Advanced price discovery
   - Better cross-chain support
   - Improved fee optimization

2. **Developer Tools**
   - SDK improvements
   - Better documentation
   - Testing frameworks
   - Integration guides

*(Note: This documentation will be updated as new features are implemented and the protocol evolves.)* 