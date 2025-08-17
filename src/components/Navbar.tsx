import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Button } from './ui/button'
import { Wallet, LogOut, Network } from 'lucide-react'
import { useGeminiWallet } from '../hooks/useGeminiWallet'
import { baseSepolia, chilizSpicy } from '../lib/chains'

const Navbar: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  
  const {
    address,
    isConnected,
    chainId,
    isConnecting,
    isSwitching,
    connectGemini,
    disconnect,
    switchToBaseSepolia,
    switchToChilizSpicy,
    getCurrentNetworkName,
    isOnCorrectNetwork
  } = useGeminiWallet()

  const handleDisconnect = () => {
    disconnect()
  }

  return (
    <nav className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl border-b border-slate-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/" className="flex items-center space-x-3">
              <img 
                src="/LOGOWCP.png" 
                alt="Mundial Buzz" 
                className="h-12 w-auto transition-all duration-300 hover:scale-110"
              />
              <div className="hidden sm:block">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  MUNDIAL BUZZ
                </h1>
                <p className="text-xs text-gray-400 -mt-1">Web3 Sports Platform</p>
              </div>
            </Link>
          </div>

          {/* Wallet Connection - Con Gemini Wallet real */}
          <div className="flex items-center space-x-4">
            {!isConnected ? (
              <Button
                onClick={connectGemini}
                disabled={isConnecting}
                className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-semibold px-4 py-2 rounded-lg transition-all duration-200 flex items-center space-x-2 shadow-lg"
              >
                <Wallet className="w-4 h-4" />
                <span>{isConnecting ? 'Conectando...' : 'Conectar Gemini'}</span>
              </Button>
            ) : (
            
              <div className="flex items-center space-x-2">
                {/* Network Indicator */}
                <div className="flex items-center space-x-2">
                  <Network className="w-4 h-4" />
                  <span className="text-sm text-gray-300">
                    {getCurrentNetworkName()}
                  </span>
                </div>

                {/* Network Switch Buttons */}
                <Button
                  onClick={switchToBaseSepolia}
                  disabled={isSwitching || isOnCorrectNetwork(baseSepolia.id)}
                  className={`px-3 py-2 text-xs rounded-md transition-colors ${
                    isOnCorrectNetwork(baseSepolia.id) 
                      ? 'bg-blue-700 text-white cursor-not-allowed' 
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  Base
                </Button>
                
                <Button
                  onClick={switchToChilizSpicy}
                  disabled={isSwitching || isOnCorrectNetwork(chilizSpicy.id)}
                  className={`px-3 py-2 text-xs rounded-md transition-colors ${
                    isOnCorrectNetwork(chilizSpicy.id) 
                      ? 'bg-green-700 text-white cursor-not-allowed' 
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  Chiliz
                </Button>

                {/* Wallet Info */}
                <div className="bg-slate-800 px-3 py-2 rounded-md border border-slate-600">
                  <span className="text-sm text-gray-300">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </span>
                </div>

                {/* Disconnect Button */}
                <Button
                  onClick={handleDisconnect}
                  className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md transition-colors flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="text-sm">Desconectar</span>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar