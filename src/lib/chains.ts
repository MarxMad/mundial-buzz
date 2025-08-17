import { Chain } from 'wagmi'

// Configuración de cadenas personalizadas
export const baseSepolia = {
  id: 84532,
  name: 'Base Sepolia',
  network: 'base-sepolia',
  nativeCurrency: {
    decimals: 18,
    name: 'Ether',
    symbol: 'ETH',
  },
  rpcUrls: {
    default: { http: ['https://sepolia.base.org'] },
    public: { http: ['https://sepolia.base.org'] },
  },
  blockExplorers: {
    default: { name: 'Base Sepolia', url: 'https://sepolia.basescan.org' },
  },
} as const satisfies Chain

export const chilizSpicy = {
  id: 88882,
  name: 'Chiliz Spicy Testnet',
  network: 'chiliz-spicy',
  nativeCurrency: {
    decimals: 18,
    name: 'CHZ',
    symbol: 'CHZ',
  },
  rpcUrls: {
    default: { http: ['https://spicy-rpc.chiliz.com'] },
    public: { http: ['https://spicy-rpc.chiliz.com'] },
  },
  blockExplorers: {
    default: { name: 'Chiliz Spicy', url: 'https://spicy-explorer.chiliz.com' },
  },
} as const satisfies Chain
