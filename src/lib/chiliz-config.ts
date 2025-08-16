import { defineChain } from 'viem'

// Chiliz Spicy Testnet configuration
export const chilizSpicy = defineChain({
  id: 88882,
  name: 'Chiliz Spicy Testnet',
  network: 'chiliz-spicy',
  nativeCurrency: {
    decimals: 18,
    name: 'CHZ',
    symbol: 'CHZ',
  },
  rpcUrls: {
    default: {
      http: ['https://spicy-rpc.chiliz.com'],
      webSocket: ['wss://spicy-rpc.chiliz.com'],
    },
    public: {
      http: ['https://spicy-rpc.chiliz.com'],
      webSocket: ['wss://spicy-rpc.chiliz.com'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Chiliz Explorer',
      url: 'https://testnet.chiliscan.com',
    },
  },
  testnet: true,
})

// Chiliz Mainnet configuration
export const chilizMainnet = defineChain({
  id: 88888,
  name: 'Chiliz Chain',
  network: 'chiliz',
  nativeCurrency: {
    decimals: 18,
    name: 'CHZ',
    symbol: 'CHZ',
  },
  rpcUrls: {
    default: {
      http: ['https://rpc.ankr.com/chiliz'],
      webSocket: ['wss://rpc.ankr.com/chiliz/ws'],
    },
    public: {
      http: ['https://rpc.ankr.com/chiliz'],
      webSocket: ['wss://rpc.ankr.com/chiliz/ws'],
    },
  },
  blockExplorers: {
    default: {
      name: 'Chiliz Explorer',
      url: 'https://chiliscan.com',
    },
  },
})

// Contract addresses for Spicy Testnet
export const CONTRACTS = {
  PREDICTION_MARKET: '', // Will be deployed
  STAKING_POOL: '', // Will be deployed
  CHZ_TOKEN: '0x0000000000000000000000000000000000000000', // Native CHZ
}

// Faucet configuration
export const FAUCET_CONFIG = {
  url: 'https://spicy-faucet.chiliz.com',
  amount: '25', // CHZ per request
  cooldown: 12 * 60 * 60 * 1000, // 12 hours in milliseconds
}