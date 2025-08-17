import { useState, useEffect } from 'react'
import { useGeminiWallet } from './useGeminiWallet'

// Tipos para staking
export interface StakingInfo {
  stakedAmount: string
  rewards: string
  stakingStartTime: number
  tier: string
  nextRewardTime: number
  canCreateMarket: boolean
  canVote: boolean
}

export interface StakingTier {
  name: string
  minAmount: string
  color: string
  benefits: string[]
  apy: string
}

export const useStaking = () => {
  const { address, isConnected, isOnCorrectNetwork, chilizSpicy } = useGeminiWallet()
  
  // Estado del staking del usuario
  const [stakingInfo, setStakingInfo] = useState<StakingInfo>({
    stakedAmount: '0',
    rewards: '0',
    stakingStartTime: 0,
    tier: 'None',
    nextRewardTime: 0,
    canCreateMarket: false,
    canVote: false
  })

  // Estados de operaciones
  const [isStaking, setIsStaking] = useState(false)
  const [isUnstaking, setIsUnstaking] = useState(false)
  const [isClaiming, setIsClaiming] = useState(false)

  // Tiers de staking
  const stakingTiers: StakingTier[] = [
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

  // Calcular tier actual basado en cantidad staked
  const getCurrentTier = (stakedAmount: string): string => {
    const amount = parseFloat(stakedAmount)
    if (amount >= 2500) return 'Platinum'
    if (amount >= 1000) return 'Gold'
    if (amount >= 500) return 'Silver'
    if (amount >= 100) return 'Bronze'
    return 'None'
  }

  // Calcular progreso hacia el siguiente tier
  const getProgressToNextTier = (): number => {
    const current = parseFloat(stakingInfo.stakedAmount)
    if (current >= 2500) return 100 // Platinum máximo
    
    let nextTier = 100
    if (current < 500) nextTier = (current / 500) * 100
    else if (current < 1000) nextTier = ((current - 500) / 500) * 100
    else if (current < 2500) nextTier = ((current - 1000) / 1500) * 100
    
    return Math.min(100, Math.max(0, nextTier))
  }

  // Calcular tiempo restante para recompensas
  const getTimeUntilRewards = (): string => {
    const now = Math.floor(Date.now() / 1000)
    const timeLeft = stakingInfo.nextRewardTime - now
    if (timeLeft <= 0) return '¡Recompensas disponibles!'
    
    const hours = Math.floor(timeLeft / 3600)
    const minutes = Math.floor((timeLeft % 3600) / 60)
    return `${hours}h ${minutes}m`
  }

  // Función para hacer staking
  const stake = async (amount: string): Promise<boolean> => {
    if (!isConnected || !isOnCorrectNetwork(chilizSpicy.id)) return false
    if (!amount || parseFloat(amount) < 100) return false
    
    setIsStaking(true)
    try {
      // Aquí se conectará con el contrato StakingPool
      console.log('Staking:', amount, 'CHZ')
      
      // Simular staking exitoso
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const newStakedAmount = parseFloat(stakingInfo.stakedAmount) + parseFloat(amount)
      const newTier = getCurrentTier(newStakedAmount.toString())
      
      setStakingInfo(prev => ({
        ...prev,
        stakedAmount: newStakedAmount.toString(),
        tier: newTier,
        canCreateMarket: newStakedAmount >= 100,
        canVote: newStakedAmount >= 100
      }))
      
      return true
    } catch (error) {
      console.error('Error staking:', error)
      return false
    } finally {
      setIsStaking(false)
    }
  }

  // Función para hacer unstaking
  const unstake = async (amount: string): Promise<boolean> => {
    if (!isConnected || !isOnCorrectNetwork(chilizSpicy.id)) return false
    if (!amount || parseFloat(amount) <= 0) return false
    
    setIsUnstaking(true)
    try {
      // Aquí se conectará con el contrato StakingPool
      console.log('Unstaking:', amount, 'CHZ')
      
      // Simular unstaking exitoso
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const newStakedAmount = Math.max(0, parseFloat(stakingInfo.stakedAmount) - parseFloat(amount))
      const newTier = getCurrentTier(newStakedAmount.toString())
      
      setStakingInfo(prev => ({
        ...prev,
        stakedAmount: newStakedAmount.toString(),
        tier: newTier,
        canCreateMarket: newStakedAmount >= 100,
        canVote: newStakedAmount >= 100
      }))
      
      return true
    } catch (error) {
      console.error('Error unstaking:', error)
      return false
    } finally {
      setIsUnstaking(false)
    }
  }

  // Función para reclamar recompensas
  const claimRewards = async (): Promise<boolean> => {
    if (!isConnected || !isOnCorrectNetwork(chilizSpicy.id)) return false
    if (parseFloat(stakingInfo.rewards) <= 0) return false
    
    setIsClaiming(true)
    try {
      // Aquí se conectará con el contrato StakingPool
      console.log('Claiming rewards:', stakingInfo.rewards, 'CHZ')
      
      // Simular claim exitoso
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setStakingInfo(prev => ({
        ...prev,
        rewards: '0'
      }))
      
      return true
    } catch (error) {
      console.error('Error claiming rewards:', error)
      return false
    } finally {
      setIsClaiming(false)
    }
  }

  // Cargar datos de staking del usuario (se conectará con el contrato después)
  useEffect(() => {
    if (isConnected && isOnCorrectNetwork(chilizSpicy.id)) {
      // Simular carga de datos
      setStakingInfo({
        stakedAmount: '0',
        rewards: '0',
        stakingStartTime: Math.floor(Date.now() / 1000),
        tier: 'None',
        nextRewardTime: Math.floor(Date.now() / 1000) + 604800, // 7 días
        canCreateMarket: false,
        canVote: false
      })
    }
  }, [isConnected, isOnCorrectNetwork, chilizSpicy.id])

  return {
    // Estado
    stakingInfo,
    isStaking,
    isUnstaking,
    isClaiming,
    
    // Tiers
    stakingTiers,
    
    // Funciones
    stake,
    unstake,
    claimRewards,
    
    // Utilidades
    getCurrentTier,
    getProgressToNextTier,
    getTimeUntilRewards
  }
}
