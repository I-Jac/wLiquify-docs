# Cross-Chain Integration

## Overview

wLiquify enables trading of top cryptocurrencies on Solana through cross-chain integration, primarily using Wormhole's Native Token Transfer (NTT) system. This integration allows users to access major tokens from other chains directly on Solana, though currently requires manual bridging steps.

## Current Manual Process

### Step-by-Step Bridging
1. **Bridge to Source Chain**
   - Use a bridge to transfer assets to the source chain
   - Ensure sufficient gas for source chain transactions
   - Verify token compatibility with Wormhole NTT

2. **Buy Source Token**
   - Purchase the desired token on the source chain
   - Verify token has Wormhole NTT wrapped version on Solana
   - Ensure sufficient balance for bridging

3. **Bridge to Solana**
   - Use Wormhole NTT to bridge token to Solana
   - Receive Wormhole-wrapped version on Solana
   - Verify token is whitelisted in wLiquify pool

4. **Deposit to Pool**
   - Deposit Wormhole-wrapped token into wLiquify pool
   - Receive deposit bonus to offset bridging costs
   - Mint wLQI tokens representing pool share

## Wormhole NTT Integration

### Native Token Transfers
1. **Direct Transfers**
   - Native token bridging
   - No wrapping required
   - Lower fees
   - Better security

2. **Supported Chains**
   - Ethereum
   - BSC (when direct NTT available)
   - Other Wormhole-supported chains
   - Future chain additions

### Token Flow
1. **Deposit Process**
   - Source chain token lock
   - Wormhole message creation
   - Solana token minting
   - Pool integration

2. **Withdrawal Process**
   - Solana token burn
   - Wormhole message creation
   - Source chain token unlock
   - User receipt

## Future Automation Plans

### Planned Features
1. **Automated Bridging**
   - Integrated frontend routing
   - Reduced manual steps
   - Simplified user experience
   - Better cost optimization

2. **Enhanced Integration**
   - Direct token bridging
   - Automated route selection
   - Real-time fee comparison
   - Status tracking

3. **User Experience**
   - One-click bridging
   - Automated token purchases
   - Integrated deposit process
   - Better error handling

## Security Measures

### Wormhole Security
1. **Guardian Network**
   - Validator consensus
   - Message verification
   - Cross-chain security
   - Attack prevention

2. **Token Safety**
   - Lock mechanism
   - Mint/burn controls
   - Supply verification
   - Emergency procedures

## Price Discovery

### Cross-Chain Pricing
1. **Pyth Integration**
   - Real-time price feeds
   - Cross-chain verification
   - Source chain prices
   - Solana prices

2. **Value Calculation**
   - Token amount × price
   - Cross-chain verification
   - Oracle validation
   - Market impact

## Best Practices

### For Users
1. **Current Process**
   - Follow manual bridging steps
   - Verify token compatibility
   - Check bridging costs
   - Monitor transaction status

2. **Security**
   - Verify addresses
   - Check confirmations
   - Monitor transactions
   - Use trusted routes

### For Developers
1. **Integration**
   - Wormhole SDK usage
   - Error management
   - Status tracking
   - Future automation prep

2. **Testing**
   - Cross-chain flows
   - Error scenarios
   - Security measures
   - Edge cases

## Technical Details

### Wormhole Integration
1. **Message Format**
   - Token information
   - Amount details
   - Source/destination
   - Security data

2. **Transaction Flow**
   - Message creation
   - Guardian verification
   - Cross-chain transfer
   - Token minting/burning

*(Note: This documentation will be updated as cross-chain integration evolves and automation features are implemented.)* 