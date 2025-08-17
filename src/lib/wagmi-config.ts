import { createConfig, http } from 'wagmi'
import { gemini } from 'wagmi/connectors'
import { baseSepolia, chilizSpicy } from './chains'

// Configuración de metadata para Gemini Wallet según la documentación oficial
const geminiMetadata = {
  name: 'Mundial Buzz',
  url: 'https://mundial-buzz.vercel.app',
  icon: 'https://mundial-buzz.vercel.app/logo.png'
}

export const config = createConfig({
  chains: [baseSepolia, chilizSpicy],
  connectors: [
    // Gemini Wallet como conector principal según la documentación
    gemini({
      appMetadata: geminiMetadata
    })
  ],
  transports: {
    [baseSepolia.id]: http('https://sepolia.base.org'),
    [chilizSpicy.id]: http('https://spicy-rpc.chiliz.com'),
  },
})

// Exportar las cadenas para uso en otros componentes
export { baseSepolia, chilizSpicy }

// Types para mejor soporte de TypeScript
export type ChainId = typeof baseSepolia.id | typeof chilizSpicy.id

// Helper functions
export const getChainName = (chainId: ChainId): string => {
  switch (chainId) {
    case baseSepolia.id:
      return 'Base Sepolia Testnet'
    case chilizSpicy.id:
      return 'Chiliz Spicy Testnet'
    default:
      return 'Unknown Network'
  }
}

export const isTestnet = (chainId: ChainId): boolean => {
  return chainId === baseSepolia.id
}

export const getExplorerUrl = (chainId: ChainId): string => {
  switch (chainId) {
    case baseSepolia.id:
      return 'https://sepolia.basescan.org'
    case chilizSpicy.id:
      return 'https://spicy-explorer.chiliz.com'
    default:
      return ''
  }
}