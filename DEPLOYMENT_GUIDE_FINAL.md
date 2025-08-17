# 🚀 Guía de Despliegue Final - Mundial Buzz

## 📋 **Contratos a Desplegar:**

### **FASE 1: Base Sepolia (Hub Central)**
1. **BaseCCIPHub.sol** - Contrato central para cross-chain

### **FASE 2: Chiliz Spicy Testnet (App Principal)**
2. **HyperlaneChilizBridge.sol** - Bridge para comunicación
3. **StakingPool.sol** - Sistema de staking
4. **VotingSystemCCIP.sol** - Sistema de votación
5. **PredictionMarketCCIP.sol** - Mercado de predicciones
6. **CommunityNFT.sol** - NFTs de experiencias en vivo ⭐ **NUEVO**
7. **HyperlaneHybridDeployment.sol** - Contrato principal

## 🔧 **Configuración de Redes:**

### **Base Sepolia:**
```
Network Name: Base Sepolia
RPC URL: https://sepolia.base.org
Chain ID: 84532
Currency Symbol: ETH
Block Explorer: https://sepolia.basescan.org
```

### **Chiliz Spicy Testnet:**
```
Network Name: Chiliz Spicy Testnet
RPC URL: https://spicy-rpc.chiliz.com
Chain ID: 88882
Currency Symbol: CHZ
Block Explorer: https://spicy-explorer.chiliz.com
```

## 💰 **Obtener Tokens de Testnet:**

### **Base Sepolia ETH:**
- **Faucet:** https://www.alchemy.com/faucets/base-sepolia

### **Chiliz Spicy CHZ:**
- **Faucet:** https://spicy-faucet.chiliz.com

## 🚀 **Orden de Despliegue:**

### **PASO 1: Desplegar BaseCCIPHub en Base Sepolia**

```javascript
// Constructor Parameters:
_router: "0xD3b06cEbF099CE7DA4AcCf578aaebFDBd6e88a93"
_hyperlaneMailbox: "0xfFAEF09B3cd11D9b20d1a19bECca54EEC2884766"

// Desplegar y guardar la dirección
```

### **PASO 2: Desplegar en Chiliz Spicy Testnet**

#### **2.1 StakingPool.sol**
```javascript
// Constructor: No parameters needed
// Desplegar y guardar la dirección
```

#### **2.2 HyperlaneChilizBridge.sol**
```javascript
// Constructor Parameters:
_mailbox: "0x2971b9Aec44507e2262f4aa9b9E7C8C8e5d1c4C6"
_baseHubContract: [DIRECCIÓN_DE_BASECCIHUB_DESPLIEGADA]
_baseDomain: 8453

// Desplegar y guardar la dirección
```

#### **2.3 VotingSystemCCIP.sol**
```javascript
// Constructor Parameters:
_hyperlanebridge: [DIRECCIÓN_DE_HYPERLANE_CHILIZ_BRIDGE]

// Desplegar y guardar la dirección
```

#### **2.4 PredictionMarketCCIP.sol**
```javascript
// Constructor Parameters:
_vrfCoordinator: "0x5C210eF41CD1a72de73bF76eC39637bB0d3d7BEE"
_subscriptionId: 1
_keyHash: "0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae"
_priceFeed: "0x0715A7794a1dc8e42615F059dD6e406A6594651A"
_hyperlanebridge: [DIRECCIÓN_DE_HYPERLANE_CHILIZ_BRIDGE]

// Desplegar y guardar la dirección
```

#### **2.5 CommunityNFT.sol** ⭐
```javascript
// Constructor: No parameters needed
// Desplegar y guardar la dirección
```

#### **2.6 HyperlaneHybridDeployment.sol**
```javascript
// Constructor Parameters:
_router: "0x9C32fCB86BF0f4a1A8921a9Fe46de3198bb884B2"
_vrfCoordinator: "0x5C210eF41CD1a72de73bF76eC39637bB0d3d7BEE"
_priceFeed: "0x0715A7794a1dc8e42615F059dD6e406A6594651A"
_hyperlaneChilizBridge: [DIRECCIÓN_DE_HYPERLANE_CHILIZ_BRIDGE]
_stakingPool: [DIRECCIÓN_DE_STAKING_POOL]
_predictionMarket: [DIRECCIÓN_DE_PREDICTION_MARKET]
_votingSystem: [DIRECCIÓN_DE_VOTING_SYSTEM]
_communityNFT: [DIRECCIÓN_DE_COMMUNITY_NFT]
_subscriptionId: 1
_keyHash: "0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae"

// Desplegar y guardar la dirección
```

## 🔗 **Configuración Post-Despliegue:**

### **PASO 3: Conectar Contratos**

#### **3.1 Configurar StakingPool en PredictionMarketCCIP**
```javascript
// En PredictionMarketCCIP
await predictionMarket.setStakingPool(STAKING_POOL_ADDRESS);
```

#### **3.2 Configurar PredictionMarketCCIP en VotingSystemCCIP**
```javascript
// En VotingSystemCCIP
await votingSystem.setPredictionMarket(PREDICTION_MARKET_ADDRESS);
```

#### **3.3 Configurar HyperlaneChilizBridge en todos los contratos**
```javascript
// En PredictionMarketCCIP
await predictionMarket.setHyperlaneBridge(HYPERLANE_BRIDGE_ADDRESS);

// En VotingSystemCCIP
await votingSystem.setHyperlaneBridge(HYPERLANE_BRIDGE_ADDRESS);
```

### **PASO 4: Configurar CCIP Routes**

#### **4.1 En BaseCCIPHub (Base Sepolia)**
```javascript
// Configurar rutas CCIP para Chiliz
await baseCCIPHub.setCCIPRoute(
    CHILIZ_CHAIN_SELECTOR, // 10344971235874465080
    CHILIZ_ROUTER_ADDRESS,
    true
);
```

#### **4.2 En Chiliz Spicy**
```javascript
// Configurar rutas CCIP para Base
await predictionMarket.setSupportedDestinationChain(
    BASE_CHAIN_SELECTOR, // 10344971235874465080
    true
);
```

## 🧪 **Testing del Sistema:**

### **Test 1: Staking**
```javascript
// 1. Hacer stake de 100 CHZ
await stakingPool.stake({ value: ethers.utils.parseEther("100") });

// 2. Verificar tier
const tier = await stakingPool.getUserTier(userAddress);
console.log("User Tier:", tier); // Debería ser "Silver"
```

### **Test 2: Crear Mercado**
```javascript
// 1. Crear mercado (requiere stake mínimo)
await predictionMarket.createMatch(
    "Barcelona",
    "Real Madrid", 
    "Clásico Barça vs Madrid",
    ["Barcelona gana", "Real Madrid gana", "Empate"],
    startTime,
    duration,
    ethers.utils.parseEther("100"), // Stake mínimo
    true, // Auto-resolve
    0 // Chain local
){ value: ethers.utils.parseEther("0.1") };
```

### **Test 3: Hacer Predicción**
```javascript
// 1. Apostar en el mercado
await predictionMarket.placeBet(
    matchId,
    0, // Opción 0: Barcelona gana
    { value: ethers.utils.parseEther("50") }
);

// 2. Votar en el sistema
await votingSystem.voteWithAmount(
    categoryId,
    0, // Opción 0: Barcelona gana
    { value: ethers.utils.parseEther("10") }
);
```

### **Test 4: Mintear NFT**
```javascript
// 1. Mintear NFT de experiencia
await communityNFT.mintExperience(
    matchId,
    "Gol de Messi",
    "Increíble gol de Messi en el minuto 23",
    "ipfs://QmExperience...",
    "Camp Nou, Barcelona",
    "Gol"
){ value: ethers.utils.parseEther("0.01") };

// 2. Dar like al NFT
await communityNFT.toggleLike(tokenId);
```

## 📊 **Verificación de Contratos:**

### **Base Sepolia:**
- **BaseCCIPHub:** Verificar en https://sepolia.basescan.org/

### **Chiliz Spicy:**
- **StakingPool:** Verificar en https://spicy-explorer.chiliz.com/
- **HyperlaneChilizBridge:** Verificar en https://spicy-explorer.chiliz.com/
- **VotingSystemCCIP:** Verificar en https://spicy-explorer.chiliz.com/
- **PredictionMarketCCIP:** Verificar en https://spicy-explorer.chiliz.com/
- **CommunityNFT:** Verificar en https://spicy-explorer.chiliz.com/
- **HyperlaneHybridDeployment:** Verificar en https://spicy-explorer.chiliz.com/

## 🎯 **Tracks Cubiertos:**

- ✅ **Chainlink CCIP ($6,000):** Cross-chain messaging
- ✅ **Chiliz Sports App ($5,000):** App deportiva + NFTs
- ✅ **Chiliz DeFi App ($5,000):** Staking + Prediction markets

## 🚨 **Puntos Importantes:**

1. **Siempre verificar** las direcciones antes de configurar
2. **Probar en testnet** antes de mainnet
3. **Guardar todas las direcciones** de contratos desplegados
4. **Configurar CCIP routes** correctamente
5. **Testear flujo completo** antes de la demo

## 📝 **Checklist de Despliegue:**

- [ ] **Base Sepolia configurado** en MetaMask
- [ ] **Chiliz Spicy configurado** en MetaMask
- [ ] **ETH obtenido** de Base Sepolia faucet
- [ ] **CHZ obtenido** de Chiliz Spicy faucet
- [ ] **BaseCCIPHub desplegado** en Base Sepolia
- [ ] **StakingPool desplegado** en Chiliz Spicy
- [ ] **HyperlaneChilizBridge desplegado** en Chiliz Spicy
- [ ] **VotingSystemCCIP desplegado** en Chiliz Spicy
- [ ] **PredictionMarketCCIP desplegado** en Chiliz Spicy
- [ ] **CommunityNFT desplegado** en Chiliz Spicy
- [ ] **HyperlaneHybridDeployment desplegado** en Chiliz Spicy
- [ ] **Contratos conectados** correctamente
- [ ] **CCIP routes configurados**
- [ ] **Sistema probado** completamente

## 🎉 **¡Listo para la Demo!**

Una vez completado el despliegue, tendrás un sistema completo que incluye:
- **Staking** con tiers y recompensas
- **Predicciones deportivas** con apuestas
- **Sistema de votación** comunitario
- **NFTs de experiencias** en vivo
- **Cross-chain messaging** con CCIP
- **Integración completa** entre todos los sistemas

¿Necesitas ayuda con algún paso específico del despliegue? 🚀
