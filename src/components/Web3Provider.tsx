import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { 
  DynamicContextProvider, 
  DynamicWidget, 
} from "@dynamic-labs/sdk-react-core"; 
import { EthereumWalletConnectors } from "@dynamic-labs/ethereum";
import { ReactNode } from 'react'
import { dynamicSettings } from '../lib/dynamic-config'

const queryClient = new QueryClient();

interface Web3ProviderProps {
  children: ReactNode
}

export const Web3Provider = ({ children }: Web3ProviderProps) => {
  // Use environment variable if available, otherwise fall back to config
  const settings = {
    ...dynamicSettings,
    environmentId: import.meta.env.VITE_DYNAMIC_ENVIRONMENT_ID || dynamicSettings.environmentId,
  };

  return (
    <QueryClientProvider client={queryClient}>
      <DynamicContextProvider settings={settings}>
        {children}
      </DynamicContextProvider>
    </QueryClientProvider>
  )
}

export default Web3Provider