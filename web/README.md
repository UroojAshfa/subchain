# 🚀 AI Subscription Manager
# Smart, Automated, On-Chain Subscription Management with AI-Powered Billing & Voice Interaction

## 🧩 1. Project Summary

AI Subscription Manager is an intelligent Web3 subscription engine that automates recurring payments using smart contracts, AI-driven notifications, and voice-enabled user interactions.
It offers a seamless way to manage subscription-based products using AI + blockchain reliability.

## 📖 2. Overview / Introduction

Modern subscription billing is centralized, fragile, and prone to errors. This project reimagines subscription management using transparent smart contracts, AI agents, and an intuitive UI.

### 🎯 What Problem Does It Solve?

* Failed renewal payments
* Lack of transparency in billing
* Manual tracking & cancellations
* Reliance on centralized billing tools
* Poor UX around subscription data

### 💡 Why This Exists

To demonstrate how AI + Blockchain + Modern Frontend can fully automate subscription operations while keeping everything trustless and user-friendly.

### 👥 Who Is This For?

* SaaS founders
* Web3 developers
* AI/automation engineers
* Recruiters evaluating full-stack, blockchain, and AI expertise

## ⚙️ 3. Features
### 🧠 AI-Powered Interaction

* Natural-language subscription queries
* Voice-based responses (ElevenLabs or fallback TTS)
* Intelligent agent that executes user requests

### 🔗 Smart Contract Billing (Arc Testnet)

* Subscription creation
* Renewal & cancellation
* Transparent event logs
* User-owned billing records

### 💻 Modern Frontend (Next.js)

* Wallet connection
* Plan dashboard
* Dark/light theming

### 🛠 Backend API (Node.js / Express)

* AI agent endpoints
* Blockchain interaction layer
* Ready for serverless deployment

### 🔐 Web3 Tooling

* Wagmi / Viem for wallet & contract calls
* Foundry contracts locally tested


## 🛠 4. Installation Instructions
### Clone the Repository

```
git clone https://github.com/UroojAshfa/subchain.git
cd subchain
```

### Backend Setup

```
cd backend
npm install
npm run dev

```

or: 
```
node server.js
```

### Frontend Setup

```
cd web
npm install
npm run dev

```

Open the app at:

```
[cd web
npm install
npm run dev
](http://localhost:3000
)
```

## 📁 5. Project Structure

````
subchain/
│
├── backend/                 # Node.js backend API
│   ├── server.js
│   ├── routes/
│   └── package.json
│
├── contracts/               # Foundry smart contract workspace
│   ├── src/
│   ├── test/
│   ├── lib/
│   └── foundry.toml
│
├── web/                     # Next.js frontend
│   ├── components/
│   ├── pages/
│   ├── public/
│   ├── styles/
│   └── package.json
│
└── README.md
````

## 🔧 6. Environment Variables

### Backend .env
```
ELEVENLABS_API_KEY=
ARC_TESTNET_RPC_URL="https://rpc.testnet.arc.network"
PRIVATE_KEY=""
CONTRACT_ADDRESS=""
PORT=5001
ELEVENLABS_VOICE_ID= your-voice-id
AIML_API_KEY=""
```

### Frontend .env.local

```
NEXT_PUBLIC_CONTRACT_ADDRESS=""
NEXT_PUBLIC_RPC_URL="https://rpc.testnet.arc.network"
NEXT_PUBLIC_AIML_API_KEY=""
```

## 🧱 7. Tech Stack
### Frontend

* Next.js 14
* React
* TypeScript
* TailwindCSS

### Backend

* Node.js
* Express
* ElevenLabs (optional)
* Blockchain
* Solidity
* Foundry
* Arc Testnet

  ## 🧪 8. Smart Contract Overview

The project includes a subscription management contract that supports:
- Creating subscription plans
- User subscription mapping
- Auto-renew logic
- Transparent withdrawal & logging
- Event-based state tracking

## 9. AI Agent Architecture
```
Frontend (user query)
   ↓
Backend AI Agent (intent understanding)
   ↓
Smart Contract (execution)
   ↓
Backend → Frontend (response via TTS/text)

```

The agent can:
- Interpret user requests
- Trigger smart contract actions
- Generate voice responses
- Validate plan status

## 🚀 10. Deployment Guide
### Frontend Deployment (Vercel)

1. Go to Vercel
2. Import GitHub repo
3. Select /web directory
4. Add environment variables
5. Deploy

### Backend Deployment (Vercel / Railway)

1. Import repo
2. Set root directory to /backend
3. Set commands:

```
Build: npm install
Start: node server.js

```
4. Add environment variables
5. Deploy

## 🤝 12. Contributions

Pull requests and feature ideas are welcome.
