import { useAccount, useConnect, useDisconnect, useSwitchChain } from 'wagmi'
import { gemini } from 'wagmi/connectors'
import { baseSepolia, chilizSpicy } from '../lib/chains'

export const useGeminiWallet = () => {
  const { address, isConnected, chainId } = useAccount()
  const { connect, isPending: isConnecting } = useConnect()
  const { disconnect } = useDisconnect()
  const { switchChain, isPending: isSwitching } = useSwitchChain()

  // Conectar con Gemini Wallet
  const connectGemini = () => {
    connect({
      connector: gemini({
        appMetadata: {
          name: 'Mundial Buzz',
          url: 'https://mundial-buzz.vercel.app',
          icon: 'https://mundial-buzz.vercel.app/logo.png'
        }
      })
    })
  }

  // Cambiar a Base Sepolia
  const switchToBaseSepolia = () => {
    switchChain({ chainId: baseSepolia.id })
  }

  // Cambiar a Chiliz Spicy
  const switchToChilizSpicy = () => {
    switchChain({ chainId: chilizSpicy.id })
  }

  // Verificar si está en la red correcta
  const isOnCorrectNetwork = (targetChainId: number) => {
    return chainId === targetChainId
  }

  // Obtener nombre de la red actual
  const getCurrentNetworkName = () => {
    switch (chainId) {
      case baseSepolia.id:
        return 'Base Sepolia'
      case chilizSpicy.id:
        return 'Chiliz Spicy'
      default:
        return 'Unknown Network'
    }
  }

  // Obtener URL del explorador
  const getExplorerUrl = () => {
    switch (chainId) {
      case baseSepolia.id:
        return 'https://sepolia.basescan.org'
      case chilizSpicy.id:
        return 'https://spicy-explorer.chiliz.com'
      default:
        return ''
    }
  }

  return {
    // Estado
    address,
    isConnected,
    chainId,
    isConnecting,
    isSwitching,
    
    // Acciones
    connectGemini,
    disconnect,
    switchToBaseSepolia,
    switchToChilizSpicy,
    
    // Utilidades
    isOnCorrectNetwork,
    getCurrentNetworkName,
    getExplorerUrl
  }
}
