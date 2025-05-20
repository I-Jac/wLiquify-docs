# Off-Chain Services: Supporting the Decentralized Core

While the core logic of the wLiquify protocol resides in its on-chain programs, a set of critical off-chain services operate behind the scenes to ensure the health, accuracy, and smooth functioning of the overall ecosystem. These automated processes are indispensable support components.

This section provides a technical deep dive into these services, explaining their responsibilities, conceptual architecture, and interaction with the on-chain programs:

-   **The Oracle Feeder Service**: Responsible for sourcing external market data, calculating token dominances, identifying price feed IDs, and reliably pushing this curated information to the Custom On-Chain Oracle Program.
-   **The Pool Maintainer Service**: An automated keeper that performs crucial maintenance tasks on the Liquidity Pool Program, such as triggering updates to the pool's total value, managing the addition of new tokens, and facilitating the cleanup of delisted assets.

Understanding these off-chain services is vital for a complete picture of how the wLiquify protocol operates, how data flows into the system, and how its on-chain components are maintained. 