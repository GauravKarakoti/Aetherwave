# Aetherwave ⚡

**Live Esports Prediction Micro-Markets.** Built on the Linera blockchain.

Aetherwave demonstrates the power of Linera's microchain architecture by enabling prediction markets that resolve in real-time, perfect for live esports events.

## 🎯 What it does

Aetherwave allows you to create and trade in micro-prediction markets for live esports. Predict micro-events like "Next Kill," "Round Winner," or "Baron Nashor Secure" with instant resolution and finality.

## 🏗️ Architecture

The app is built using multiple Linera microchains:

*   **User Microchains:** Each user has their own chain holding their wallet and asset balances.
*   **Market Microchains:** Each active prediction market is its own microchain, managing its order book and state.
*   **Oracle Microchain:** A single chain that receives and broadcasts signed resolution data from an off-chain oracle service.

Cross-chain messages are used to place bets (from a User chain to a Market chain) and to resolve markets (from the Oracle chain to a Market chain, which then pays out to User chains).

## 🚀 Quick Start

### Prerequisites

*   Rust and Cargo
*   The Linera toolchain (`cargo install linera-service`)

### Running the Local Network & Application

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/GauravKarakoti/aetherwave.git
    cd aetherwave
    ```

2.  **Start a local Linera network:**
    ```bash
    linera net up
    ```

3.  **Build and deploy the Aetherwave service:**
    ```bash
    ./deploy_service.sh
    ```
    This script builds the Rust project and publishes the bytecode to the local network.

4.  **Create the application:**
    ```bash
    ./create_application.sh
    ```
    This script initializes the application and sets up the necessary microchains.

5.  **Start the Oracle Service:**
    ```bash
    cd oracle-service
    npm install
    node index.js
    ```
    (This service uses mock data for demonstration).

6.  **Start the Frontend:**
    ```bash
    cd frontend
    npm install
    npm run dev
    ```
    Open your browser to `http://localhost:5173` (or the provided URL) to interact with Aetherwave.

## 📖 How to Use

1.  **Fund Your Wallet:** The testnet faucet will provide you with test tokens.
2.  **Select a Live Match:** The dashboard will show active esports matches (mock data for the demo).
3.  **Choose a Micro-Market:** Click on a match to see the available real-time markets (e.g., "Blue Team gets first blood?").
4.  **Place a Bet:** Choose "YES" or "NO" and the amount you wish to wager. Confirm the transaction.
5.  **Watch & Resolve:** As the oracle service receives live data, the market will resolve automatically. If you were correct, your winnings are sent instantly to your wallet!

## 👨‍💻 Team

*   [Gaurav Karakoti]
    *   X (Twitter): [[GauravKara_Koti](https://x.com/GauravKara_koti)]
    *   Telegram: [[GauravKarakoti](https://t.me/GauravKarakoti)]

## 📄 License

This project is licensed under the MIT License.
