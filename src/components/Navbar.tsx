import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { RefreshCw, Sparkles, Menu, User, Wallet } from 'lucide-react'
import { useState } from 'react'
import { useChilizWallet } from '@/hooks/useChilizWallet'
import { Link } from 'react-router-dom'

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { isConnected, address, connectWallet, disconnectWallet, isConnecting, isOnChilizNetwork, switchToChiliz, networkName } = useChilizWallet()

  return (
    <nav className="bg-card-gradient backdrop-blur-md border-b-2 border-sports-orange/20 sticky top-0 z-50 shadow-premium">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center hover:opacity-80 transition-all duration-300 group">
              <img 
                src="/LOGOWCP.png" 
                alt="Mundial Buzz" 
                className="h-12 w-auto transition-all duration-300 group-hover:scale-110"
              />
            </Link>
          </div>

          {/* Wallet Connection */}
          <div className="flex items-center space-x-4">
            {!isConnected ? (
              <Button 
                onClick={() => connectWallet()}
                disabled={isConnecting}
                size="sm"
                className="bg-action-gradient hover:shadow-premium font-sports font-bold text-white px-6 py-2 transition-all duration-300 transform hover:scale-105 border border-sports-orange/30"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                {isConnecting ? 'Connecting...' : 'Connect'}
              </Button>
            ) : (
              <div className="flex items-center space-x-3">
                {/* Network Info */}
                <div className="flex items-center space-x-2">
                  <Badge 
                    variant={isOnChilizNetwork ? "default" : "destructive"}
                    className={`font-sports text-xs font-semibold ${isOnChilizNetwork ? 'bg-sports-green border-sports-green/50' : 'bg-sports-red border-sports-red/50'} border`}
                  >
                    {isOnChilizNetwork ? 'Chiliz Spicy' : `${networkName} Network`}
                  </Badge>
                  
                  {!isOnChilizNetwork && (
                    <Button
                      onClick={() => switchToChiliz()}
                      size="sm"
                      variant="outline"
                      className="font-sports text-xs font-semibold border-sports-orange text-sports-orange hover:bg-sports-orange hover:text-white transition-all duration-300"
                    >
                      <RefreshCw className="h-3 w-3 mr-1" />
                      Switch to Chiliz
                    </Button>
                  )}
                </div>

                {/* Address */}
                {address && (
                  <Button
                    size="sm"
                    variant="outline"
                    className="font-sports text-xs font-semibold px-4 py-2 border-sports-blue/50 text-sports-blue hover:bg-sports-blue/10 hover:border-sports-blue transition-all duration-300"
                  >
                    <User className="h-3 w-3 mr-2" />
                    {address.slice(0, 6)}...{address.slice(-4)}
                  </Button>
                )}

                {/* Disconnect Button */}
                <Button
                  onClick={() => disconnectWallet()}
                  size="sm"
                  variant="outline"
                  className="font-sports text-xs font-semibold border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300"
                >
                  <Wallet className="h-3 w-3 mr-2" />
                  Disconnect
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar;