# On-Chain Programs: The Core Logic of wLiquify

This section offers a technical deep dive into the Solana smart contracts (on-chain programs) that form the core operational logic of the wLiquify protocol. Here, you will find detailed explorations of:

-   **The wLiquify Liquidity Pool Program**: The primary engine managing multi-asset liquidity, wLQI token minting/burning, asset valuation, and dynamic fee application.
-   **The Custom On-Chain Oracle Program**: The specialized data store that provides the Liquidity Pool Program with crucial, curated information, such as target token dominances and Pyth price feed identifiers.

Understanding these programs, their architecture, core functionalities, key data structures, instruction logic, and their interaction is key to comprehending the technical underpinnings and decentralized nature of the wLiquify protocol. 