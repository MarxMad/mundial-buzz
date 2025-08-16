# MundialPredict Smart Contracts

Contratos inteligentes para la plataforma de predicciones del Mundial FIFA 2026 en Chiliz Chain.

## Contratos Incluidos

### 1. PredictionMarket.sol
Contrato principal para mercados de predicción deportiva:
- Creación de mercados de predicción
- Sistema de apuestas con CHZ
- Resolución de mercados
- Distribución de rewards
- Gestión de fees

### 2. StakingPool.sol
Sistema de staking para CHZ tokens:
- Staking con diferentes períodos de lock
- Multipliers por duración de lock
- Rewards automáticos
- Retiro de emergencia

### 3. VotingSystem.sol
Sistema de votación on-chain:
- Votaciones para predicciones del Mundial
- Rewards para votos correctos
- Categorías predefinidas (Campeón, Goleador, etc.)
- Gestión de reward pools

## Despliegue en Remix IDE

Sigue estos pasos para desplegar los contratos en Chiliz Chain usando Remix IDE:

### Paso 1: Configurar Remix
1. Ve a [Remix IDE](https://remix.ethereum.org/)
2. Crea una nueva carpeta llamada `MundialPredict`
3. Copia los archivos `.sol` en Remix

### Paso 2: Instalar Dependencias
1. En Remix, ve a la pestaña "File Explorer"
2. Instala OpenZeppelin contracts:
   - Ve a la pestaña "Solidity Compiler"
   - Las dependencias de OpenZeppelin se instalarán automáticamente

### Paso 3: Compilar Contratos
1. Selecciona la versión de Solidity `0.8.19` o superior
2. Compila cada contrato individualmente
3. Verifica que no haya errores de compilación

### Paso 4: Configurar MetaMask para Chiliz

#### Chiliz Spicy Testnet
- **Network Name:** Chiliz Spicy Testnet
- **RPC URL:** https://spicy-rpc.chiliz.com/
- **Chain ID:** 88882
- **Currency Symbol:** CHZ
- **Block Explorer:** https://spicy-explorer.chiliz.com/

#### Chiliz Mainnet
- **Network Name:** Chiliz Chain
- **RPC URL:** https://anchor-rpc.chiliz.com/
- **Chain ID:** 88888
- **Currency Symbol:** CHZ
- **Block Explorer:** https://chiliscan.com/

### Paso 5: Obtener CHZ de Testnet
1. Ve al [Chiliz Faucet](https://spicy-faucet.chiliz.com/)
2. Conecta tu wallet
3. Solicita CHZ tokens para testnet

### Paso 6: Desplegar Contratos

#### Orden de Despliegue Recomendado:

1. **VotingSystem**
   - No requiere parámetros de constructor
   - Se crean categorías iniciales automáticamente

2. **StakingPool**
   - `_rewardPerSecond`: 1000000000000000 (0.001 CHZ por segundo)
   - `_lockDuration`: 604800 (7 días en segundos)
   - `_minStakeAmount`: 100000000000000000 (0.1 CHZ)

3. **PredictionMarket**
   - `_feePercentage`: 500 (5% fee)
   - `_minBetAmount`: 10000000000000000 (0.01 CHZ)

### Paso 7: Verificar Contratos

1. Copia la dirección del contrato desplegado
2. Ve al block explorer correspondiente
3. Busca tu contrato
4. Ve a la pestaña "Contract" > "Verify and Publish"
5. Pega el código fuente y verifica

### Paso 8: Configurar Frontend

Actualiza las direcciones de contratos en `src/lib/chiliz-config.ts`:

```typescript
export const CONTRACT_ADDRESSES = {
  SPICY_TESTNET: {
    PREDICTION_MARKET: "0x...", // Dirección del contrato PredictionMarket
    STAKING_POOL: "0x...",      // Dirección del contrato StakingPool
    VOTING_SYSTEM: "0x...",     // Dirección del contrato VotingSystem
  },
  MAINNET: {
    PREDICTION_MARKET: "0x...",
    STAKING_POOL: "0x...",
    VOTING_SYSTEM: "0x...",
  }
};
```

## Funcionalidades Principales

### PredictionMarket
- `createMarket()`: Crear nuevo mercado de predicción
- `placeBet()`: Realizar apuesta en un mercado
- `resolveMarket()`: Resolver mercado con resultado
- `claimWinnings()`: Reclamar ganancias

### StakingPool
- `stake()`: Hacer staking con período de lock
- `unstake()`: Retirar stake después del lock
- `claimRewards()`: Reclamar solo rewards
- `addRewards()`: Agregar rewards al pool

### VotingSystem
- `vote()`: Votar en una categoría
- `createCategory()`: Crear nueva categoría de votación
- `resolveCategory()`: Resolver con opción correcta
- `claimRewards()`: Reclamar rewards por votos correctos

## Seguridad

Todos los contratos incluyen:
- ✅ ReentrancyGuard
- ✅ Ownable access control
- ✅ Pausable functionality
- ✅ Safe transfer functions
- ✅ Input validation
- ✅ Overflow protection

## Testing

Para probar los contratos:
1. Despliega en Spicy Testnet
2. Interactúa usando Remix o frontend
3. Verifica transacciones en el explorer
4. Prueba todas las funcionalidades principales

## Recursos

- [Chiliz Documentation](https://docs.chiliz.com/)
- [Chiliz Faucet](https://spicy-faucet.chiliz.com/)
- [Spicy Explorer](https://spicy-explorer.chiliz.com/)
- [Chiliz Scan](https://chiliscan.com/)
- [Remix IDE](https://remix.ethereum.org/)

## Soporte

Para el hackathon ETHGlobal NYC - Chiliz Track 🏆