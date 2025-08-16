import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Wallet, AlertCircle, CheckCircle, Loader2, Sparkles, Eye, Trophy } from "lucide-react";
import { useEffect, useState } from 'react'
import { useChilizWallet } from '@/hooks/useChilizWallet';
import heroStadium from "@/assets/hero-stadium.jpg";

const Hero = () => {
  const { isConnected, address, connectWallet, disconnectWallet, isConnecting, isOnChilizNetwork, switchToChiliz, networkName } = useChilizWallet();
  const [networkConnecting, setNetworkConnecting] = useState(false)

  const handleSwitchToChiliz = async () => {
    setNetworkConnecting(true)
    try {
      await switchToChiliz()
    } finally {
      setNetworkConnecting(false)
    }
  }

  const formatBalance = (balance: string) => {
    const num = parseFloat(balance)
    if (num === 0) return '0.00'
    if (num < 0.001) return '< 0.001'
    return num.toFixed(4)
  }

  const showNetworkWarning = isConnected && !isOnChilizNetwork

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroStadium})` }}
      >
        <div className="absolute inset-0 bg-black/60" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <div className="animate-bounce-in">
          <img 
            src="/LOGOWCP.png" 
            alt="MundialPredict Logo" 
            className="mx-auto mb-6 w-32 h-32 object-contain" 
          />
          
          <h1 className="font-display text-5xl md:text-7xl font-bold mb-6 text-white">
            Mundial<span className="text-sports-orange">Buzz</span>
          </h1>
          
          <p className="font-primary text-xl md:text-2xl mb-8 text-gray-200 max-w-2xl mx-auto leading-relaxed">
            Empowering football fans worldwide through blockchain innovation and community-driven experiences
          </p>
          
          <p className="text-lg mb-12 text-gray-300 max-w-xl mx-auto">
            The ultimate fan-first platform where you predict, connect, earn, and shape the future of football. 
            Join millions of passionate fans building the next generation of sports engagement.
          </p>
        </div>

        {/* Network Warning */}
        {showNetworkWarning && (
          <Card className="bg-yellow-900/20 border border-yellow-600 backdrop-blur-sm mb-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-yellow-400 mb-2">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">Wrong Network</span>
              </div>
              <p className="text-yellow-300 text-sm mb-3">
                You are connected to {networkName} network. Please switch to Chiliz Spicy Testnet to use the app.
              </p>
              <Button 
                onClick={handleSwitchToChiliz}
                disabled={networkConnecting}
                size="sm"
                className="bg-yellow-600 hover:bg-yellow-700 text-white"
              >
                {networkConnecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Switching network...
                  </>
                ) : (
                  'Switch to Chiliz'
                )}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Connection Success */}
        {isConnected && isOnChilizNetwork && (
          <Card className="bg-green-900/20 border border-green-600 backdrop-blur-sm mb-6">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-green-400 mb-2">
                <CheckCircle className="h-4 w-4" />
                <span className="font-medium">Successfully Connected</span>
              </div>
              <p className="text-green-300 text-sm">
                You are connected to Chiliz Spicy Testnet and ready to start predicting!
              </p>
              {/* Wallet Info */}
              <div className="bg-slate-700/50 rounded-lg p-3 mt-3 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Address:</span>
                  <Badge variant="secondary" className="font-mono text-xs">
                    {address?.slice(0, 6)}...{address?.slice(-4)}
                  </Badge>
                </div>

              </div>
            </CardContent>
          </Card>
        )}
        
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-float">
          {!isConnected ? (
             <>
               <Button 
                 onClick={() => connectWallet()} 
                 disabled={isConnecting}
                 className="bg-action-gradient hover:shadow-premium font-sports px-10 py-6 text-lg font-bold tracking-wide transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
               >
                 <Wallet className="mr-3 h-6 w-6" />
                 {isConnecting ? 'Connecting...' : 'Connect Wallet'}
               </Button>
              
              <Button variant="outline" className="font-sports px-10 py-6 text-lg font-semibold border-2 border-white/40 text-white hover:bg-white/10 hover:border-white/60 transition-all duration-300" asChild>
                <a href="/partidos">
                  <Eye className="mr-3 h-6 w-6" />
                  Explore as Guest
                </a>
              </Button>
            </>
          ) : (
            <>
              <Button className="bg-action-gradient hover:shadow-premium font-sports px-10 py-6 text-lg font-bold tracking-wide transform hover:scale-105 transition-all duration-300" asChild>
                <a href="/mercados">
                  <Sparkles className="mr-3 h-6 w-6" />
                  Start Predicting
                </a>
              </Button>
              
              <Button variant="outline" className="font-sports px-10 py-6 text-lg font-semibold border-2 border-white/40 text-white hover:bg-white/10 hover:border-white/60 transition-all duration-300" asChild>
                <a href="/perfil">
                  <Eye className="mr-3 h-6 w-6" />
                  View My Profile
                </a>
              </Button>

              <Button 
                onClick={() => disconnectWallet()} 
                variant="outline"
                className="font-sports px-10 py-6 text-lg font-semibold border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-all duration-300"
              >
                <Wallet className="mr-3 h-6 w-6" />
                Disconnect
              </Button>
            </>
          )}
        </div>
        
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          <div className="animate-bounce-in bg-card-gradient p-6 rounded-2xl border border-white/10 hover:border-sports-orange/50 transition-all duration-300 group" style={{ animationDelay: '0.2s' }}>
            <div className="font-display text-4xl font-bold text-sports-orange mb-3 group-hover:text-sports-yellow transition-colors">10M+</div>
            <div className="font-sports text-gray-300 font-medium tracking-wide">Target active fans by 2026</div>
          </div>
          
          <div className="animate-bounce-in bg-card-gradient p-6 rounded-2xl border border-white/10 hover:border-sports-yellow/50 transition-all duration-300 group" style={{ animationDelay: '0.4s' }}>
            <div className="font-display text-4xl font-bold text-sports-yellow mb-3 group-hover:text-sports-orange transition-colors">$100M+</div>
            <div className="font-sports text-gray-300 font-medium tracking-wide">Daily token volume goal</div>
          </div>
          
          <div className="animate-bounce-in bg-card-gradient p-6 rounded-2xl border border-white/10 hover:border-sports-green/50 transition-all duration-300 group" style={{ animationDelay: '0.6s' }}>
            <div className="font-display text-4xl font-bold text-sports-green mb-3 group-hover:text-sports-blue transition-colors">50+</div>
            <div className="font-sports text-gray-300 font-medium tracking-wide">Team partnerships planned</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Hero;