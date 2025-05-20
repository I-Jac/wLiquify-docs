# Cross-Chain Integration: Bringing Assets to Solana for wLiquify

## Overview

wLiquify enables participation with top cryptocurrencies on Solana. Many of these assets originate on other blockchains. To use them with wLiquify, they must first be brought to Solana as SPL tokens, primarily using Wormhole's Native Token Transfer (NTT) system. This page describes the general process for users to bridge assets to Solana.

Once assets are on Solana as SPL tokens, they can be deposited into wLiquify. Swaps between SPL tokens on Solana are handled by Jupiter Aggregator, as detailed in the [Swaps](./Swaps.md) page.

## Current Manual On-Ramping Process

Bringing a non-Solana native asset to Solana to use with wLiquify currently involves several manual steps performed by the user:

### Step-by-Step Guide
1.  **Fund Wallet on Source Chain**: Ensure you have the necessary cryptocurrency in your wallet on the asset's original chain (e.g., ETH on Ethereum, BNB on BSC). This might involve purchasing the asset on an exchange and withdrawing it to your self-custody wallet, or bridging a different asset (like a stablecoin) to that source chain to acquire the desired token.
2.  **Acquire the Specific Source Token**: On the source chain, obtain the exact token you intend to bridge to Solana via Wormhole NTT. Ensure this token has a recognized Wormhole-wrapped version on Solana that is supported by wLiquify.
3.  **Bridge Token to Solana via Wormhole NTT**: Use a Wormhole-powered interface (like Portal) to bridge the token from its source chain to Solana. This will result in you receiving the corresponding Wormhole-wrapped SPL token in your Solana wallet.
4.  **Deposit into wLiquify Pool**: Once the Wormhole-wrapped SPL token is in your Solana wallet, you can deposit it into the wLiquify pool.
    *   **Incentives**: Depositing an asset that is currently underweight in the pool may result in more favorable terms (e.g., a net bonus in wLQI received) due to wLiquify's [Dynamic Fee System](./fees-tokenomics.md). This can help offset the external costs associated with bridging.

## Wormhole NTT (Native Token Transfer) Integration

Wormhole NTT is the primary recommended technology for bringing non-Solana native assets to Solana for use with wLiquify.

### Key Features of NTT
1.  **Canonical Bridged Assets**: NTT aims to create canonical SPL representations of native tokens from other chains. This often simplifies the user experience and improves composability compared to older lock-and-mint bridge models that might create multiple, non-standard wrapped versions.
2.  **Security Focus**: Leverages Wormhole's underlying security model, including its guardian network for cross-chain message validation.
3.  **Supported Chains**: Includes major chains like Ethereum, BSC, Polygon, Avalanche, and others supported by Wormhole. The list of chains and tokens compatible with NTT evolves.

### Conceptual Token Flow (User Perspective for Bridging to Solana)
1.  **Initiate Bridge (on Source Chain)**: User initiates a bridge transaction on the source chain using a Wormhole-connected UI (e.g., Portal). The native tokens are typically locked or processed by the Wormhole contracts on the source chain.
2.  **Wormhole Message & Verification**: Wormhole guardians observe the transaction, and after sufficient confirmations, sign a Verifiable Action Approval (VAA) message indicating the event occurred.
3.  **Redeem on Solana**: The user (or a relayer) submits this VAA to the Wormhole contract on Solana. The Wormhole contract verifies the VAA and then mints/releases the corresponding Wormhole-wrapped SPL tokens to the user's Solana wallet.

*(For withdrawals from Solana back to a source chain, the process is conceptually reversed.)*

## Future Automation & dApp Integration

wLiquify aims to significantly simplify this on-ramping process for users.

### Planned Enhancements
1.  **Integrated Bridging Widgets**: Future versions of the wLiquify dApp plan to directly integrate bridging widgets (e.g., from providers like DeBridge, or a more streamlined Portal/Wormhole interface). This will allow users to perform the bridging steps within the wLiquify application, reducing the need to navigate multiple external sites.
2.  **Improved Guidance & Verification**: The dApp will offer better tools for token discovery, source chain identification, and verification of Wormhole-wrapped addresses, making the process less error-prone.
3.  **Clearer Cost Estimation**: Provide better visibility into potential bridging costs and how wLiquify's dynamic fees might offer favorable terms for depositing needed assets.

These improvements align with the broader goal of creating a seamless experience for accessing cross-chain assets within the wLiquify ecosystem, as also noted in the [Swaps](./Swaps.md) overview regarding future dApp capabilities.

## Security Measures for Cross-Chain Operations

When users engage in cross-chain transactions (bridging), security is paramount. wLiquify relies on the security of the chosen bridge provider (e.g., Wormhole).

### Wormhole Security Model
-   **Guardian Network**: A decentralized set of validators (Guardians) that sign VAAs to attest to cross-chain events.
-   **Audits & Monitoring**: Wormhole undergoes security audits, and its operations are monitored by its team and the broader community.
-   Users should always ensure they are interacting with official Wormhole interfaces or reputable integrations.

## User Best Practices for Manual Bridging

While future automation will simplify the process, for current manual bridging:

1.  **Verification is Key**:
    *   Always double-check token contract addresses on both the source and destination chains.
    *   Use tools like the [Portal Token Origin Verifier](https://portalbridge.com/legacy-tools/#/token-origin-verifier) to confirm the authenticity and origin of tokens.
    *   Ensure the Solana-wrapped version of the token is supported by wLiquify.
2.  **Understand Costs**: Be aware of gas fees on the source chain, bridge provider fees (if any), and Solana network fees.
3.  **Transaction Monitoring**: Keep track of your transaction hashes and monitor their status on block explorers for both chains involved.
4.  **Use Official Interfaces**: Whenever possible, use official bridge provider UIs (like Portal for Wormhole) or well-vetted integrations.

## Technical Details (Wormhole NTT Focused)

### Portal Tools for Manual Bridging
-   **Token Origin Verifier**: [portalbridge.com/legacy-tools/#/token-origin-verifier](https://portalbridge.com/legacy-tools/#/token-origin-verifier)
    -   Use to find a token's source chain and original address if you have its Solana (Wormhole-wrapped) address.
-   **Portal Transfer**: [portalbridge.com/legacy-tools/#/transfer](https://portalbridge.com/legacy-tools/#/transfer)
    -   The primary interface for performing manual Wormhole NTT bridging.

*(Note: This documentation will be updated as cross-chain integration evolves and automation features are implemented. Always refer to the latest guides and exercise caution when bridging assets.)* 