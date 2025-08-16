import { createConfig, http } from 'wagmi'
import { chilizSpicy, chilizMainnet } from './chiliz-config'
import { injected, metaMask, walletConnect, gemini } from 'wagmi/connectors'

// WalletConnect project ID - you should get this from https://cloud.walletconnect.com
const projectId = 'your-project-id' // Replace with actual project ID

// Gemini wallet connector (official)
const geminiWallet = gemini({
  appMetadata: {
    name: 'MundialPredict',
    url: 'https://mundialpredict.com',
    icons: ['https://mundialpredict.com/favicon.ico'],
  },
})

export const wagmiConfig = createConfig({
  chains: [chilizSpicy, chilizMainnet],
  connectors: [
    injected(),
    metaMask(),
    geminiWallet,
    walletConnect({ 
      projectId,
      metadata: {
        name: 'MundialPredict',
        description: 'Mercado de predicciones deportivas del Mundial FIFA 2026',
        url: 'https://mundialpredict.com',
        icons: ['https://mundialpredict.com/icon.png']
      }
    }),
  ],
  transports: {
    [chilizSpicy.id]: http(),
    [chilizMainnet.id]: http(),
  },
})

// Types for better TypeScript support
export type ChainId = typeof chilizSpicy.id | typeof chilizMainnet.id

// Helper functions
export const getChainName = (chainId: ChainId): string => {
  switch (chainId) {
    case chilizSpicy.id:
      return 'Chiliz Spicy Testnet'
    case chilizMainnet.id:
      return 'Chiliz Chain'
    default:
      return 'Unknown Chain'
  }
}

export const isTestnet = (chainId: ChainId): boolean => {
  return chainId === chilizSpicy.id
}

export const getExplorerUrl = (chainId: ChainId): string => {
  switch (chainId) {
    case chilizSpicy.id:
      return 'https://testnet.chiliscan.com'
    case chilizMainnet.id:
      return 'https://chiliscan.com'
    default:
      return ''
  }
}