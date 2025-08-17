import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, AlertCircle, CheckCircle, Loader2, Sparkles, Eye, Trophy, Network } from "lucide-react";
import { useEffect, useState } from 'react'
import { useGeminiWallet } from "@/hooks/useGeminiWallet";
import { chilizSpicy } from "@/lib/chains";
import heroStadium from "@/assets/hero-stadium.jpg";

const Hero = () => {
  const {
    address,
    isConnected,
    chainId,
    isConnecting,
    isSwitching,
    connectGemini,
    switchToChilizSpicy,
    getCurrentNetworkName,
    isOnCorrectNetwork
  } = useGeminiWallet()

  const [autoSwitchAttempted, setAutoSwitchAttempted] = useState(false)

  // Auto-switch to Chiliz when connected
  useEffect(() => {
    if (isConnected && !autoSwitchAttempted && !isOnCorrectNetwork(chilizSpicy.id)) {
      setAutoSwitchAttempted(true)
      switchToChilizSpicy()
    }
  }, [isConnected, autoSwitchAttempted, isOnCorrectNetwork, switchToChilizSpicy])

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance)
    if (num === 0) return '0.00'
    if (num < 0.001) return '< 0.001'
    return num.toFixed(4)
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroStadium})` }}
      >
        <div className="absolute inset-0 bg-black/70" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <div className="animate-bounce-in">
          <img 
            src="/LOGOWCP.png" 
            alt="MundialPredict Logo" 
            className="mx-auto mb-6 w-32 h-32 object-contain drop-shadow-2xl" 
          />
          
          <h1 className="font-display text-5xl md:text-7xl font-bold mb-6 text-white drop-shadow-2xl">
            Mundial<span className="text-sports-orange drop-shadow-lg">Buzz</span>
          </h1>
          
          <p className="font-primary text-xl md:text-2xl mb-8 text-white max-w-2xl mx-auto leading-relaxed drop-shadow-xl font-semibold">
            Empowering football fans worldwide through blockchain innovation and community-driven experiences
          </p>
          
          <p className="text-lg mb-12 text-gray-100 max-w-xl mx-auto leading-relaxed drop-shadow-lg font-medium">
            The ultimate fan-first platform where you predict, connect, earn, and shape the future of football. 
            Join millions of passionate fans building the next generation of sports engagement.
          </p>
        </div>

        {/* Connection Status */}
        {!isConnected ? (
          <Button 
            onClick={connectGemini}
            disabled={isConnecting}
            size="lg"
            className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-black font-semibold px-8 py-4 text-lg rounded-lg transition-all duration-200 flex items-center space-x-3 mx-auto shadow-2xl transform hover:scale-105"
          >
            <Wallet className="w-6 h-6" />
            <span>{isConnecting ? 'Conectando...' : 'Conectar Gemini Wallet'}</span>
          </Button>
        ) : (
          <div className="space-y-4">
            {/* Network Status */}
            <Card className="bg-green-900/30 border border-green-500 backdrop-blur-md shadow-2xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-center gap-2 text-green-300 mb-2">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-medium">Wallet Conectado</span>
                </div>
                <p className="text-green-200 text-sm mb-3">
                  Dirección: {address?.slice(0, 6)}...{address?.slice(-4)}
                </p>
                <div className="flex items-center justify-center gap-2 text-green-200 text-sm">
                  <Network className="h-4 w-4" />
                  <span>Red: {getCurrentNetworkName()}</span>
                </div>
              </CardContent>
            </Card>

            {/* Auto-switch to Chiliz if not already there */}
            {!isOnCorrectNetwork(chilizSpicy.id) && (
              <Card className="bg-blue-900/30 border border-blue-500 backdrop-blur-md shadow-2xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-center gap-2 text-blue-300 mb-2">
                    <AlertCircle className="h-5 w-5" />
                    <span className="font-medium">Cambiando a Chiliz Spicy</span>
                  </div>
                  <p className="text-blue-200 text-sm text-center">
                    {isSwitching ? 'Cambiando red...' : 'Cambiando automáticamente a Chiliz Spicy Testnet'}
                  </p>
                  {isSwitching && (
                    <div className="flex justify-center mt-2">
                      <Loader2 className="h-5 w-5 animate-spin text-blue-300" />
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Success when on Chiliz */}
            {isOnCorrectNetwork(chilizSpicy.id) && (
              <Card className="bg-green-900/30 border border-green-500 backdrop-blur-md shadow-2xl">
                <CardContent className="p-4">
                  <div className="flex items-center justify-center gap-2 text-green-300 mb-2">
                    <CheckCircle className="h-5 w-5" />
                    <span className="font-medium">¡Listo para usar!</span>
                  </div>
                  <p className="text-green-200 text-sm text-center">
                    Conectado a Chiliz Spicy Testnet. ¡Ya puedes usar la aplicación!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16">
          <Card className="bg-white/20 backdrop-blur-md border-white/30 hover:bg-white/30 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Trophy className="w-8 h-8 text-black" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2 drop-shadow-lg">Predicciones Deportivas</h3>
              <p className="text-gray-100 drop-shadow-md">Apuesta en resultados de partidos y gana tokens</p>
            </CardContent>
          </Card>

          <Card className="bg-white/20 backdrop-blur-md border-white/30 hover:bg-white/30 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-green-400 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2 drop-shadow-lg">Experiencias Únicas</h3>
              <p className="text-gray-100 drop-shadow-md">Mint NFTs de momentos especiales en vivo</p>
            </CardContent>
          </Card>

          <Card className="bg-white/20 backdrop-blur-md border-white/30 hover:bg-white/30 transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:scale-105">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <Eye className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2 drop-shadow-lg">Comunidad Global</h3>
              <p className="text-gray-100 drop-shadow-md">Conecta con fans de todo el mundo</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Hero;