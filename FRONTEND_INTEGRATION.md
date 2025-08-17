# 🌐 Frontend Integration Guide - Mundial Buzz

## 📋 **Integración de Contratos con Frontend**

### **1. Página de Mercados (/markets) - Crear Mercado**

#### **Validación de Staking:**
```typescript
// Verificar si usuario tiene stake suficiente
const checkUserStake = async (userAddress: string, requiredStake: string) => {
  try {
    const stakingPool = new ethers.Contract(STAKING_POOL_ADDRESS, STAKING_ABI, provider);
    const userStake = await stakingPool.getUserStake(userAddress);
    
    if (userStake < ethers.utils.parseEther(requiredStake)) {
      // Redirigir a página de staking
      router.push('/staking');
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error checking stake:', error);
    return false;
  }
};
```

#### **Crear Mercado:**
```typescript
// Función para crear mercado
const createMarket = async (marketData: MarketFormData) => {
  try {
    // Validar stake mínimo (100 CHZ)
    const hasEnoughStake = await checkUserStake(userAddress, "100");
    if (!hasEnoughStake) return;

    const predictionMarket = new ethers.Contract(
      PREDICTION_MARKET_ADDRESS, 
      PREDICTION_MARKET_ABI, 
      signer
    );

    const tx = await predictionMarket.createMatch(
      marketData.team1,           // string: Nombre equipo 1
      marketData.team2,           // string: Nombre equipo 2
      marketData.title,           // string: Título del mercado
      marketData.predictionOptions, // string[]: Opciones de predicción
      marketData.startTime,       // uint256: Timestamp de inicio
      marketData.duration,        // uint256: Duración en segundos
      ethers.utils.parseEther("100"), // uint256: Stake mínimo (100 CHZ)
      marketData.autoResolve,     // bool: Resolución automática
      marketData.destinationChain // uint256: Chain destino (0 = local)
    );

    await tx.wait();
    // Recargar mercados
    await loadMarkets();
  } catch (error) {
    console.error('Error creating market:', error);
  }
};
```

#### **Formulario de Creación:**
```typescript
interface MarketFormData {
  team1: string;
  team2: string;
  title: string;
  predictionOptions: string[];
  startTime: number;
  duration: number;
  autoResolve: boolean;
  destinationChain: number;
}

// Ejemplo de opciones de predicción
const defaultPredictionOptions = [
  "Barcelona gana",
  "Real Madrid gana", 
  "Empate"
];
```

### **2. Página de Partidos (/partidos) - Hacer Predicción**

#### **Obtener Información del Partido:**
```typescript
// Cargar información del partido
const loadMatchInfo = async (matchId: number) => {
  try {
    const predictionMarket = new ethers.Contract(
      PREDICTION_MARKET_ADDRESS, 
      PREDICTION_MARKET_ABI, 
      provider
    );

    const matchInfo = await predictionMarket.getMatch(matchId);
    const predictionOptions = await predictionMarket.getPredictionOptions(matchId);
    const optionPools = await predictionMarket.getAllOptionPools(matchId);

    return {
      ...matchInfo,
      predictionOptions,
      optionPools
    };
  } catch (error) {
    console.error('Error loading match:', error);
  }
};
```

#### **Hacer Predicción (Apuesta + Voto):**
```typescript
// Función para hacer predicción
const makePrediction = async (matchId: number, option: number, amount: string) => {
  try {
    const predictionMarket = new ethers.Contract(
      PREDICTION_MARKET_ADDRESS, 
      PREDICTION_MARKET_ABI, 
      signer
    );

    // 1. Hacer apuesta en el mercado
    const betTx = await predictionMarket.placeBet(
      matchId,
      option,
      { value: ethers.utils.parseEther(amount) }
    );
    await betTx.wait();

    // 2. Votar en el sistema de votación
    const votingSystem = new ethers.Contract(
      VOTING_SYSTEM_ADDRESS, 
      VOTING_SYSTEM_ABI, 
      signer
    );

    const voteTx = await votingSystem.voteWithAmount(
      matchId, // categoryId (se mapea automáticamente)
      option,
      { value: ethers.utils.parseEther(amount) }
    );
    await voteTx.wait();

    // Recargar información
    await loadMatchInfo(matchId);
  } catch (error) {
    console.error('Error making prediction:', error);
  }
};
```

### **3. Página de Staking (/staking)**

#### **Hacer Stake:**
```typescript
// Función para hacer stake
const makeStake = async (amount: string) => {
  try {
    const stakingPool = new ethers.Contract(
      STAKING_POOL_ADDRESS, 
      STAKING_POOL_ABI, 
      signer
    );

    const tx = await stakingPool.stake({
      value: ethers.utils.parseEther(amount)
    });

    await tx.wait();
    // Recargar información de staking
    await loadStakingInfo();
  } catch (error) {
    console.error('Error making stake:', error);
  }
};

// Obtener información de staking del usuario
const loadStakingInfo = async () => {
  try {
    const stakingPool = new ethers.Contract(
      STAKING_POOL_ADDRESS, 
      STAKING_POOL_ABI, 
      provider
    );

    const stakerInfo = await stakingPool.getStakerInfo(userAddress);
    const userTier = await stakingPool.getUserTier(userAddress);
    const pendingRewards = await stakingPool.calculateRewards(userAddress);

    return {
      ...stakerInfo,
      userTier,
      pendingRewards
    };
  } catch (error) {
    console.error('Error loading staking info:', error);
  }
};
```

### **4. Funciones de Vista (Read)**

#### **Cargar Mercados:**
```typescript
// Cargar todos los mercados
const loadMarkets = async () => {
  try {
    const predictionMarket = new ethers.Contract(
      PREDICTION_MARKET_ADDRESS, 
      PREDICTION_MARKET_ABI, 
      provider
    );

    const markets = [];
    const totalMarkets = await predictionMarket.nextMatchId();

    for (let i = 1; i < totalMarkets; i++) {
      try {
        const matchInfo = await predictionMarket.getMatch(i);
        const predictionOptions = await predictionMarket.getPredictionOptions(i);
        const optionPools = await predictionMarket.getAllOptionPools(i);

        markets.push({
          ...matchInfo,
          predictionOptions,
          optionPools
        });
      } catch (error) {
        // Mercado no existe o error
        continue;
      }
    }

    return markets;
  } catch (error) {
    console.error('Error loading markets:', error);
    return [];
  }
};
```

#### **Cargar Estadísticas de Votación:**
```typescript
// Cargar estadísticas de votación para un partido
const loadVotingStats = async (matchId: number) => {
  try {
    const votingSystem = new ethers.Contract(
      VOTING_SYSTEM_ADDRESS, 
      VOTING_SYSTEM_ABI, 
      provider
    );

    const votingInfo = await votingSystem.getVotingInfoForMatch(matchId);
    const votingStats = await votingSystem.getVotingStatsForMatch(matchId);

    return {
      ...votingInfo,
      ...votingStats
    };
  } catch (error) {
    console.error('Error loading voting stats:', error);
    return null;
  }
};
```

### **5. Configuración de Contratos**

#### **Direcciones de Contratos:**
```typescript
export const CONTRACT_ADDRESSES = {
  STAKING_POOL: "0x...",           // StakingPool.sol
  PREDICTION_MARKET: "0x...",      // PredictionMarketCCIP.sol
  VOTING_SYSTEM: "0x...",          // VotingSystemCCIP.sol
  HYPERLANE_BRIDGE: "0x..."        // HyperlaneChilizBridge.sol
};
```

#### **Configuración Post-Despliegue:**
```typescript
// Configurar conexiones entre contratos
const configureContracts = async () => {
  try {
    const predictionMarket = new ethers.Contract(
      PREDICTION_MARKET_ADDRESS, 
      PREDICTION_MARKET_ABI, 
      signer
    );

    const votingSystem = new ethers.Contract(
      VOTING_SYSTEM_ADDRESS, 
      VOTING_SYSTEM_ABI, 
      signer
    );

    // 1. Configurar StakingPool en PredictionMarketCCIP
    await predictionMarket.setStakingPool(STAKING_POOL_ADDRESS);

    // 2. Configurar PredictionMarketCCIP en VotingSystemCCIP
    await votingSystem.setPredictionMarket(PREDICTION_MARKET_ADDRESS);

    console.log('Contracts configured successfully');
  } catch (error) {
    console.error('Error configuring contracts:', error);
  }
};
```

### **6. Flujo de Usuario Completo**

#### **Usuario Nuevo:**
1. **Va a /staking**
2. **Hace stake de 100+ CHZ**
3. **Obtiene tier y puede participar**

#### **Usuario con Stake:**
1. **Va a /markets**
2. **Crea mercado** (equipos + opciones)
3. **Otros usuarios apuestan y votan**

#### **Usuario que Apuesta:**
1. **Va a /partidos**
2. **Selecciona partido**
3. **Elige opción y monto**
4. **Firma transacción** (apuesta + voto)

### **7. Manejo de Errores**

#### **Validaciones Frontend:**
```typescript
// Validar formularios antes de enviar
const validateMarketForm = (data: MarketFormData) => {
  const errors = [];

  if (!data.team1 || !data.team2) {
    errors.push("Ambos equipos son requeridos");
  }

  if (data.predictionOptions.length < 2) {
    errors.push("Mínimo 2 opciones de predicción");
  }

  if (data.duration < 3600) { // 1 hora
    errors.push("Duración mínima: 1 hora");
  }

  return errors;
};
```

#### **Manejo de Transacciones:**
```typescript
// Función helper para transacciones
const executeTransaction = async (
  contract: ethers.Contract, 
  method: string, 
  args: any[], 
  value?: string
) => {
  try {
    const tx = value 
      ? await contract[method](...args, { value })
      : await contract[method](...args);
    
    const receipt = await tx.wait();
    return { success: true, receipt };
  } catch (error) {
    console.error(`Error in ${method}:`, error);
    return { success: false, error };
  }
};
```

## 🚀 **Próximos Pasos**

1. **Implementar** las funciones de integración
2. **Crear** componentes de UI para cada funcionalidad
3. **Probar** flujo completo de usuario
4. **Optimizar** para mejor UX

¿Necesitas ayuda con alguna implementación específica? 🎯
