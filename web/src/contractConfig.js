import { ethers } from "ethers";

// Paste your deployed contract address here:
export const CONTRACT_ADDRESS = "0xf0E5876DDBb52DF8DA18841bAaffB9663C50D033";

// Paste your contract ABI 
export const CONTRACT_ABI = [
  {
    type: "function",
    name: "cancelSubscription",
    inputs: [{ name: "subId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "createSubscription",
    inputs: [
      { name: "creator", type: "address" },
      { name: "token", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "period", type: "uint256" },
    ],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "subscriptions",
    inputs: [{ name: "", type: "uint256" }],
    outputs: [
      { name: "subscriber", type: "address" },
      { name: "creator", type: "address" },
      { name: "token", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "period", type: "uint256" },
      { name: "nextDue", type: "uint256" },
      { name: "active", type: "bool" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "nextSubId",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
];

export const TOKEN_ADDRESS = "0x1eccf89268C90C5Ac954ed020Ca498D96F9f9733";

export const TOKEN_ABI = [
  "function approve(address spender, uint256 amount) external returns (bool)",
  "function allowance(address owner, address spender) external view returns (uint256)",
  "function balanceOf(address account) external view returns (uint256)",
    "function decimals() external view returns (uint8)", 
];

