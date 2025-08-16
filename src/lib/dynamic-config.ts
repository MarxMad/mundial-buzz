import { DynamicContextProviderSettings } from '@dynamic-labs/sdk-react-core';
import { EthereumWalletConnectors } from '@dynamic-labs/ethereum';
import { chilizSpicy, chilizMainnet } from './chiliz-config'

// Dynamic configuration settings
export const dynamicSettings: DynamicContextProviderSettings = {
  // Environment ID from Dynamic dashboard
  environmentId: '4a48bc2c-ef1a-4e8a-bc45-fb6693d64bb3',
  
  // Wallet connectors for Ethereum-compatible chains
  walletConnectors: [EthereumWalletConnectors],
  
  // App metadata
  appName: 'MundialPredict',
  appLogoUrl: '/LOGOWCP.png',
  
  // Custom CSS for theming
  cssOverrides: `
    .dynamic-widget-card {
      background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
      border: 1px solid #3b82f6;
      border-radius: 12px;
    }
    
    .dynamic-widget-button {
      background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
      border: none;
      border-radius: 8px;
      font-weight: 600;
      transition: all 0.3s ease;
    }
    
    .dynamic-widget-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(59, 130, 246, 0.3);
    }
  `,
  
  // Network configurations for Chiliz chains
  evmNetworks: [
    {
      blockExplorerUrls: [chilizSpicy.blockExplorers.default.url],
      chainId: chilizSpicy.id,
      chainName: chilizSpicy.name,
      iconUrls: ['https://chain.chiliz.com/favicon.ico'],
      name: chilizSpicy.name,
      nativeCurrency: chilizSpicy.nativeCurrency,
      networkId: chilizSpicy.id,
      rpcUrls: [chilizSpicy.rpcUrls.default.http[0]],
      vanityName: 'Chiliz Spicy Testnet',
    },
    {
      blockExplorerUrls: [chilizMainnet.blockExplorers.default.url],
      chainId: chilizMainnet.id,
      chainName: chilizMainnet.name,
      iconUrls: ['https://chain.chiliz.com/favicon.ico'],
      name: chilizMainnet.name,
      nativeCurrency: chilizMainnet.nativeCurrency,
      networkId: chilizMainnet.id,
      rpcUrls: [chilizMainnet.rpcUrls.default.http[0]],
      vanityName: 'Chiliz Chain',
    },
  ],
  
  // Initial authentication mode
  initialAuthenticationMode: 'connect-only' as const,
  
  // Privacy policy and terms of service
  privacyPolicyUrl: 'https://mundialpredict.com/privacy',
  termsOfServiceUrl: 'https://mundialpredict.com/terms',
}

// Helper functions for chain management
export type ChainId = typeof chilizSpicy.id | typeof chilizMainnet.id

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
      return chilizSpicy.blockExplorers.default.url
    case chilizMainnet.id:
      return chilizMainnet.blockExplorers.default.url
    default:
      return ''
  }
}

// Export chains for easy access
export { chilizSpicy, chilizMainnet }