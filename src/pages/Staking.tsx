import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Lock, 
  Unlock, 
  TrendingUp, 
  Clock, 
  Trophy, 
  Coins, 
  AlertCircle,
  CheckCircle,
  Zap
} from 'lucide-react'
import { useGeminiWallet } from '@/hooks/useGeminiWallet'

const Staking = () => {
  const { address, isConnected, chainId, isOnCorrectNetwork, chilizSpicy } = useGeminiWallet()
  
  // Estado local para staking (se conectará con el contrato después)
  const [stakeAmount, setStakeAmount] = useState('')
  const [unstakeAmount, setUnstakeAmount] = useState('')
  const [isStaking, setIsStaking] = useState(false)
  const [isUnstaking, setIsUnstaking] = useState(false)
  const [isClaiming, setIsClaiming] = useState(false)

  // Datos simulados del usuario (se reemplazarán con datos reales del contrato)
  const [userStaking, setUserStaking] = useState({
    stakedAmount: '0',
    rewards: '0',
    stakingStartTime: 0,
    tier: 'Bronze',
    nextRewardTime: 0
  })

  // Tiers de staking
  const stakingTiers = [
    {
      name: 'Bronze',
      minAmount: '100',
      color: 'bg-amber-600',
      benefits: ['Acceso a predicciones', 'Recompensas básicas'],
      apy: '5%'
    },
    {
      name: 'Silver',
      minAmount: '500',
      color: 'bg-gray-400',
      benefits: ['Acceso a predicciones', 'Recompensas mejoradas', 'Votos con más peso'],
      apy: '7%'
    },
    {
      name: 'Gold',
      minAmount: '1000',
      color: 'bg-yellow-500',
      benefits: ['Acceso a predicciones', 'Recompensas premium', 'Votos con más peso', 'NFTs exclusivos'],
      apy: '10%'
    },
    {
      name: 'Platinum',
      minAmount: '2500',
      color: 'bg-purple-600',
      benefits: ['Acceso a predicciones', 'Recompensas máximas', 'Votos con más peso', 'NFTs exclusivos', 'Governance'],
      apy: '15%'
    }
  ]

  // Función para calcular tier actual
  const getCurrentTier = (stakedAmount: string) => {
    const amount = parseFloat(stakedAmount)
    if (amount >= 2500) return 'Platinum'
    if (amount >= 1000) return 'Gold'
    if (amount >= 500) return 'Silver'
    if (amount >= 100) return 'Bronze'
    return 'None'
  }

  // Función para hacer staking
  const handleStake = async () => {
    if (!isConnected) return
    if (!stakeAmount || parseFloat(stakeAmount) < 100) return
    
    setIsStaking(true)
    try {
      // Aquí se conectará con el contrato StakingPool
      console.log('Staking:', stakeAmount, 'CHZ')
      
      // Simular staking exitoso
      setTimeout(() => {
        setUserStaking(prev => ({
          ...prev,
          stakedAmount: (parseFloat(prev.stakedAmount) + parseFloat(stakeAmount)).toString(),
          tier: getCurrentTier((parseFloat(prev.stakedAmount) + parseFloat(stakeAmount)).toString())
        }))
        setStakeAmount('')
        setIsStaking(false)
      }, 2000)
    } catch (error) {
      console.error('Error staking:', error)
      setIsStaking(false)
    }
  }

  // Función para hacer unstaking
  const handleUnstake = async () => {
    if (!isConnected) return
    if (!unstakeAmount || parseFloat(unstakeAmount) <= 0) return
    
    setIsUnstaking(true)
    try {
      // Aquí se conectará con el contrato StakingPool
      console.log('Unstaking:', unstakeAmount, 'CHZ')
      
      // Simular unstaking exitoso
      setTimeout(() => {
        setUserStaking(prev => ({
          ...prev,
          stakedAmount: Math.max(0, parseFloat(prev.stakedAmount) - parseFloat(unstakeAmount)).toString(),
          tier: getCurrentTier(Math.max(0, parseFloat(prev.stakedAmount) - parseFloat(unstakeAmount)).toString())
        }))
        setUnstakeAmount('')
        setIsUnstaking(false)
      }, 2000)
    } catch (error) {
      console.error('Error unstaking:', error)
      setIsUnstaking(false)
    }
  }

  // Función para reclamar recompensas
  const handleClaimRewards = async () => {
    if (!isConnected) return
    if (parseFloat(userStaking.rewards) <= 0) return
    
    setIsClaiming(true)
    try {
      // Aquí se conectará con el contrato StakingPool
      console.log('Claiming rewards:', userStaking.rewards, 'CHZ')
      
      // Simular claim exitoso
      setTimeout(() => {
        setUserStaking(prev => ({
          ...prev,
          rewards: '0'
        }))
        setIsClaiming(false)
      }, 2000)
    } catch (error) {
      console.error('Error claiming rewards:', error)
      setIsClaiming(false)
    }
  }

  // Calcular progreso hacia el siguiente tier
  const getProgressToNextTier = () => {
    const current = parseFloat(userStaking.stakedAmount)
    if (current >= 2500) return 100 // Platinum máximo
    
    let nextTier = 100
    if (current < 500) nextTier = (current / 500) * 100
    else if (current < 1000) nextTier = ((current - 500) / 500) * 100
    else if (current < 2500) nextTier = ((current - 1000) / 1500) * 100
    
    return Math.min(100, Math.max(0, nextTier))
  }

  // Calcular tiempo restante para recompensas
  const getTimeUntilRewards = () => {
    const now = Math.floor(Date.now() / 1000)
    const timeLeft = userStaking.nextRewardTime - now
    if (timeLeft <= 0) return '¡Recompensas disponibles!'
    
    const hours = Math.floor(timeLeft / 3600)
    const minutes = Math.floor((timeLeft % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  return (
    <div className="min-h-screen bg-background pb-32 md:pb-0">
      <div className="pt-20 pb-10 px-4">
        <div className="container mx-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  <span className="gradient-hero bg-clip-text text-transparent">
                    Staking Pool
                  </span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl">
                  Haz staking de tus CHZ para desbloquear acceso a predicciones, ganar recompensas y subir de tier.
                </p>
              </div>
              
              {/* Wallet Status */}
              {!isConnected ? (
                <div className="bg-red-900/20 border border-red-600 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-red-400">
                    <AlertCircle className="h-5 w-5" />
                    <span>Conecta tu wallet para empezar</span>
                  </div>
                </div>
              ) : !isOnCorrectNetwork(chilizSpicy.id) ? (
                <div className="bg-yellow-900/20 border border-yellow-600 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-yellow-400">
                    <AlertCircle className="h-5 w-5" />
                    <span>Cambia a Chiliz Spicy Testnet</span>
                  </div>
                </div>
              ) : (
                <div className="bg-green-900/20 border border-green-600 rounded-lg p-4">
                  <div className="flex items-center gap-2 text-green-400">
                    <CheckCircle className="h-5 w-5" />
                    <span>Wallet conectado a Chiliz Spicy</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Staking Actions */}
            <div className="lg:col-span-2 space-y-6">
              {/* Staking Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Lock className="h-5 w-5" />
                    Hacer Staking
                  </CardTitle>
                  <CardDescription>
                    Bloquea tus CHZ para desbloquear funcionalidades y ganar recompensas
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="stakeAmount">Cantidad de CHZ</Label>
                    <Input
                      id="stakeAmount"
                      type="number"
                      placeholder="100"
                      value={stakeAmount}
                      onChange={(e) => setStakeAmount(e.target.value)}
                      min="100"
                      step="1"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Mínimo: 100 CHZ
                    </p>
                  </div>
                  <Button 
                    onClick={handleStake}
                    disabled={!isConnected || !stakeAmount || parseFloat(stakeAmount) < 100 || isStaking}
                    className="w-full"
                  >
                    {isStaking ? (
                      <>
                        <Clock className="mr-2 h-4 w-4 animate-spin" />
                        Haciendo Staking...
                      </>
                    ) : (
                      <>
                        <Lock className="mr-2 h-4 w-4" />
                        Hacer Staking
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Unstaking Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Unlock className="h-5 w-5" />
                    Hacer Unstaking
                  </CardTitle>
                  <CardDescription>
                    Desbloquea tus CHZ (pero perderás acceso a funcionalidades)
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="unstakeAmount">Cantidad de CHZ</Label>
                    <Input
                      id="unstakeAmount"
                      type="number"
                      placeholder="50"
                      value={unstakeAmount}
                      onChange={(e) => setUnstakeAmount(e.target.value)}
                      min="1"
                      max={userStaking.stakedAmount}
                      step="1"
                    />
                    <p className="text-sm text-muted-foreground mt-1">
                      Máximo: {userStaking.stakedAmount} CHZ
                    </p>
                  </div>
                  <Button 
                    onClick={handleUnstake}
                    disabled={!isConnected || !unstakeAmount || parseFloat(unstakeAmount) <= 0 || isUnstaking}
                    variant="outline"
                    className="w-full"
                  >
                    {isUnstaking ? (
                      <>
                        <Clock className="mr-2 h-4 w-4 animate-spin" />
                        Haciendo Unstaking...
                      </>
                    ) : (
                      <>
                        <Unlock className="mr-2 h-4 w-4" />
                        Hacer Unstaking
                      </>
                    )}
                  </Button>
                </CardContent>
              </Card>

              {/* Tiers Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Trophy className="h-5 w-4" />
                    Tiers de Staking
                  </CardTitle>
                  <CardDescription>
                    Desbloquea más beneficios mientras más CHZ tengas en staking
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {stakingTiers.map((tier, index) => (
                      <div key={tier.name} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full ${tier.color}`} />
                          <div>
                            <div className="font-semibold">{tier.name}</div>
                            <div className="text-sm text-muted-foreground">
                              Mínimo: {tier.minAmount} CHZ
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-green-500">{tier.apy}</div>
                          <div className="text-sm text-muted-foreground">APY</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - User Stats */}
            <div className="space-y-6">
              {/* User Staking Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Tu Staking
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Current Tier */}
                  <div className="text-center p-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg text-white">
                    <div className="text-2xl font-bold">{userStaking.tier}</div>
                    <div className="text-sm opacity-90">Tier Actual</div>
                  </div>

                  {/* Staked Amount */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>CHZ en Staking:</span>
                      <span className="font-semibold">{userStaking.stakedAmount} CHZ</span>
                    </div>
                    <Progress value={getProgressToNextTier()} className="h-2" />
                    <div className="text-xs text-muted-foreground text-center">
                      Progreso al siguiente tier
                    </div>
                  </div>

                  {/* Rewards */}
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Recompensas:</span>
                      <span className="font-semibold text-green-500">{userStaking.rewards} CHZ</span>
                    </div>
                    <Button 
                      onClick={handleClaimRewards}
                      disabled={parseFloat(userStaking.rewards) <= 0 || isClaiming}
                      className="w-full"
                      size="sm"
                    >
                      {isClaiming ? (
                        <>
                          <Clock className="mr-2 h-4 w-4 animate-spin" />
                          Reclamando...
                        </>
                      ) : (
                        <>
                          <Zap className="mr-2 h-4 w-4" />
                          Reclamar Recompensas
                        </>
                      )}
                    </Button>
                  </div>

                  {/* Next Reward Time */}
                  <div className="text-center p-3 bg-muted rounded-lg">
                    <div className="text-sm text-muted-foreground">Próximas recompensas en:</div>
                    <div className="font-semibold">{getTimeUntilRewards()}</div>
                  </div>
                </CardContent>
              </Card>

              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Acciones Rápidas</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="outline" className="w-full" size="sm">
                    <Coins className="mr-2 h-4 w-4" />
                    Ver Historial
                  </Button>
                  <Button variant="outline" className="w-full" size="sm">
                    <Trophy className="mr-2 h-4 w-4" />
                    Ver Beneficios
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Staking
