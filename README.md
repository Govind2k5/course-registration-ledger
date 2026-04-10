
# 📚 Decentralized Course Registration Ledger

## Overview

Traditional course registration systems rely on centralized databases, making them vulnerable to inconsistent updates, unauthorized modifications, and disputes over seat availability.

This project solves these issues by implementing a decentralized, tamper-proof blockchain ledger. It permanently records all add/drop actions, enforces strict capacity validation through smart contracts, and ensures a completely transparent registration workflow.

## 🛠️ Technology Stack

* **Smart Contract:** Solidity (^0.8.19)
* **Local Blockchain / Testing:** Hardhat
* **Frontend:** HTML5, CSS3, Vanilla JavaScript
* **Web3 Integration:** Ethers.js (v6)
* **Wallet Management:** MetaMask

## 📐 Architecture & Consensus Justification

This system is designed around a **Proof of Authority (PoA)** consensus model.

**Why PoA?** A university registration system operates within a permissioned environment. Unlike Proof of Work (PoW) which requires massive energy, or Proof of Stake (PoS) which relies on token economics, PoA relies on the reputation of designated "authorities" (e.g., the university registrar or department servers) to validate blocks. This guarantees:

1. **High Throughput & Low Latency:** Instant transaction finality during peak enrollment periods.
2. **Zero Gas Costs:** Students do not need to purchase cryptocurrency to register for classes.
3. **Security:** Only authorized faculty wallets can deploy contracts or modify core course capacities.

## 🔐 Core Features (Smart Contract Constraints)

* **Immutable Ledger:** Every registration, withdrawal, and course creation emits a permanent blockchain event.
* **Strict Capacity Enforcement:** The `enroll` function inherently blocks transactions if `enrolledCount >= capacity`, eliminating over-enrollment.
* **Role-Based Access Control (RBAC):** `onlyAdmin` modifiers restrict course creation to the deployer (Registrar), while `onlyRegisteredStudent` ensures valid student interactions.
* **Unique Identifiers:** Cryptographic Ethereum wallet addresses (`msg.sender`) act as unique student IDs, preventing duplicate or conflicting ledger entries.

## 🚀 Local Setup & Demo Instructions

### 1. Start the Local Blockchain

Start the Hardhat node to simulate the PoA environment:

```bash
npx hardhat node
```

### 2. Deploy the Contract

In a new terminal, deploy the central ledger:

**Bash**

```
npx hardhat run scripts/deploy.js --network localhost
```

### 3. Run the Frontend

Navigate to the frontend directory and start a local web server:

**Bash**

```
cd frontend
python3 -m http.server 8000
```

### 4. Connect & Interact

1. Open `http://localhost:8000` in your browser.
2. Connect MetaMask to the **Hardhat Localhost** network (RPC: `http://127.0.0.1:8545`, Chain ID: `31337`).
3. Import **Account #0** from the Hardhat terminal to act as the Administrator.
4. Import **Account #1** to act as a Student.
