import { useAccount, useConnect, useDisconnect, useBalance, useSwitchChain } from 'wagmi'
import { chilizSpicy, chilizMainnet } from '@/lib/chiliz-config'
import { useToast } from '@/hooks/use-toast'
import { useCallback, useEffect } from 'react'

export const useChilizWallet = () => {
  const { address, isConnected, chain } = useAccount()
  const { connect, connectors, isPending: isConnecting } = useConnect()
  const { disconnect } = useDisconnect()
  const { switchChain } = useSwitchChain()
  const { toast } = useToast()
  
  // Get CHZ balance
  const { data: balance, isLoading: isBalanceLoading } = useBalance({
    address,
    chainId: chain?.id,
  })

  // Check if connected to Chiliz network
  const isOnChilizNetwork = chain?.id === chilizSpicy.id || chain?.id === chilizMainnet.id
  const isOnTestnet = chain?.id === chilizSpicy.id

  // Connect to specific wallet
  const connectWallet = useCallback(async (walletName?: string) => {
    try {
      let connector
      
      if (walletName) {
        // Connect to specific wallet
        connector = connectors.find(c => 
          c.name.toLowerCase().includes(walletName.toLowerCase()) ||
          c.id.toLowerCase().includes(walletName.toLowerCase())
        )
      } else {
        // Default to MetaMask or first available
        connector = connectors.find(c => c.name === 'MetaMask') || connectors[0]
      }
      
      if (connector) {
        connect({ connector })
        toast({
          title: 'Conectando wallet',
          description: `Conectando con ${connector.name}...`,
        })
      } else {
        throw new Error('No se encontró el conector de wallet')
      }
    } catch (error) {
      console.error('Error connecting wallet:', error)
      toast({
        title: 'Error de conexión',
        description: 'No se pudo conectar la wallet. Intenta de nuevo.',
        variant: 'destructive',
      })
    }
  }, [connect, connectors, toast])

  // Connect to Gemini wallet specifically
  const connectGemini = useCallback(async () => {
    await connectWallet('gemini')
  }, [connectWallet])

  // Get available wallets
  const getAvailableWallets = useCallback(() => {
    const walletInfo = connectors.map(connector => ({
      id: connector.id,
      name: connector.name,
      icon: connector.icon,
      ready: connector.ready,
    }))
    
    // Check for specific wallets
    const hasGemini = connectors.some(connector => 
      connector.name.toLowerCase().includes('gemini') || 
      connector.id.toLowerCase().includes('gemini')
    )
    
    return {
      wallets: walletInfo,
      hasMetaMask: !!(window as any)?.ethereum?.isMetaMask,
      hasGemini,
      hasCoinbaseWallet: !!(window as any)?.ethereum?.isCoinbaseWallet,
    }
  }, [connectors])

  // Switch to Chiliz Spicy Testnet
  const switchToChiliz = useCallback(async (useTestnet = true) => {
    try {
      const targetChain = useTestnet ? chilizSpicy : chilizMainnet
      await switchChain({ chainId: targetChain.id })
      toast({
        title: 'Red cambiada',
        description: `Conectado a ${targetChain.name}`,
      })
    } catch (error) {
      console.error('Error switching chain:', error)
      toast({
        title: 'Error al cambiar red',
        description: 'No se pudo cambiar a Chiliz Chain. Verifica tu wallet.',
        variant: 'destructive',
      })
    }
  }, [switchChain, toast])

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    disconnect()
    toast({
      title: 'Wallet desconectada',
      description: 'Tu wallet ha sido desconectada exitosamente.',
    })
  }, [disconnect, toast])

  // Auto-switch to Chiliz if connected but on wrong network
  useEffect(() => {
    if (isConnected && !isOnChilizNetwork) {
      toast({
        title: 'Red incorrecta',
        description: 'Por favor cambia a Chiliz Chain para usar la aplicación.',
        variant: 'destructive',
      })
    }
  }, [isConnected, isOnChilizNetwork, toast])

  // Format balance for display
  const formattedBalance = balance ? {
    value: parseFloat(balance.formatted).toFixed(4),
    symbol: balance.symbol,
    formatted: `${parseFloat(balance.formatted).toFixed(4)} ${balance.symbol}`
  } : null

  return {
    // Connection state
    address,
    isConnected,
    isConnecting,
    chain,
    isOnChilizNetwork,
    isOnTestnet,
    
    // Balance
    balance,
    balanceFormatted: balance?.formatted,
    balanceSymbol: balance?.symbol,
    isBalanceLoading,
    
    // Actions
    connectWallet,
    connectGemini,
    disconnectWallet,
    switchToChiliz,
    
    // Wallet detection
    getAvailableWallets,
    
    // Network info
    networkName: chain?.name || 'Unknown',
    chainId: chain?.id,
    
    // Available connectors
    connectors,
  }
}