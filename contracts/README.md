# MUNDIAL BUZZ - Web3 Sports Platform

Plataforma Web3 para predicciones deportivas y experiencias comunitarias en Chiliz Chain. Proyecto desarrollado para ETHGlobal New York Hackathon 2024.

## 🏆 **Tracks del Hackathon Cubiertos**

- **Chiliz Sports/DeFi Track** - Plataforma nativa de Chiliz
- **Chainlink VRF Track** - Aleatoriedad para resultados
- **Chainlink Price Feeds Track** - Datos de precios CHZ/USD

## 🏗️ **Arquitectura del Proyecto**

### **Frontend (React + Vite + Tailwind CSS)**
- **Framework**: React 18 con TypeScript
- **Build Tool**: Vite para desarrollo rápido
- **Styling**: Tailwind CSS con componentes personalizados
- **Wallet Integration**: Gemini Wallet nativo con wagmi
- **State Management**: React Hooks personalizados

### **Blockchain (Chiliz Spicy Testnet)**
- **Red Principal**: Chiliz Spicy Testnet (Chain ID: 88882)
- **Tokens**: CHZ (Chiliz)
- **Cross-chain**: Simplificado para hackathon (Chiliz-native)

## 📱 **Componentes del Frontend**

### **1. Navbar.tsx**
- Logo MUNDIAL BUZZ con nombre del proyecto
- Integración nativa con Gemini Wallet
- Selector de redes (Base Sepolia, Chiliz Spicy)
- Indicadores de estado de conexión

### **2. Hero.tsx**
- Landing page principal con efectos visuales
- Background animado con partículas y gradientes
- Sistema de conexión automática a Chiliz
- Grid de características principales

### **3. MobileNavigation.tsx**
- Navegación móvil optimizada y compacta
- 4 secciones principales: Matches, Community, Markets, Profile
- Diseño responsive con transiciones suaves

### **4. Páginas Principales**
- **Index.tsx**: Landing page principal
- **Mercados.tsx**: Creación y gestión de mercados de predicción
- **Staking.tsx**: Sistema completo de staking con UI
- **Partidos.tsx**: Gestión de partidos y resultados
- **Comunidad.tsx**: Experiencias comunitarias y NFTs
- **Perfil.tsx**: Perfil de usuario y estadísticas

## 🔐 **Smart Contracts (Solidity 0.8.19)**

### **1. StakingPool.sol** ⭐ **CONTRATO PRINCIPAL**
Sistema de staking con múltiples beneficios:

```solidity
// Funcionalidades principales
- stake(uint256 amount): Hacer staking de CHZ
- unstake(): Retirar stake después del período de lock
- claimRewards(): Reclamar recompensas acumuladas
- getUserTier(address user): Obtener tier del usuario
- canCreateMarket(address user): Verificar si puede crear mercados
```

**Tiers de Staking:**
- **Bronze**: 100+ CHZ (Acceso básico)
- **Silver**: 500+ CHZ (Acceso a mercados)
- **Gold**: 1000+ CHZ (Acceso completo)
- **Platinum**: 2500+ CHZ (Acceso premium)

**Seguridad implementada:**
- ✅ SafeMath para todas las operaciones aritméticas
- ✅ ReentrancyGuard contra ataques de reentrancy
- ✅ Validación de inputs y parámetros
- ✅ Lógica de unstaking corregida
- ✅ Cálculo de recompensas optimizado

### **2. PredictionMarket.sol**
Mercados de predicción deportiva:

```solidity
// Funcionalidades principales
- createMarket(string memory title, string[] memory options): Crear mercado
- placeBet(uint256 marketId, uint256 optionId, uint256 amount): Hacer apuesta
- resolveMarket(uint256 marketId, uint256 winningOption): Resolver mercado
- claimWinnings(uint256 marketId): Reclamar ganancias
```

**Características:**
- Solo usuarios con staking pueden crear mercados
- Fee del 1% para creadores, 3% para plataforma
- Distribución equitativa del pool restante
- Integración con Chainlink VRF para aleatoriedad

### **3. VotingSystem.sol**
Sistema de votación comunitaria:

```solidity
// Funcionalidades principales
- vote(uint256 categoryId, uint256 optionId): Votar en categoría
- createCategory(string memory name): Crear nueva categoría
- resolveCategory(uint256 categoryId, uint256 winningOption): Resolver
- claimRewards(uint256 categoryId): Reclamar recompensas
```

### **4. CommunityNFT.sol**
NFTs de experiencias en vivo:

```solidity
// Funcionalidades principales
- mintLiveExperience(string memory title, string memory imageURI): Mint NFT
- likeExperience(uint256 tokenId): Dar like a experiencia
- shareExperience(uint256 tokenId): Compartir experiencia
- verifyExperience(uint256 tokenId): Verificar experiencia
```

## 🚀 **Despliegue en Chiliz Spicy Testnet**

### **Paso 1: Configurar Wallet**
1. **MetaMask o Gemini Wallet**
2. **Agregar Chiliz Spicy Testnet:**
   - **RPC URL**: `https://spicy-rpc.chiliz.com/`
   - **Chain ID**: `88882`
   - **Currency**: `CHZ`
   - **Explorer**: `https://spicy-explorer.chiliz.com/`

### **Paso 2: Obtener CHZ de Testnet**
- **Faucet**: [https://spicy-faucet.chiliz.com/](https://spicy-faucet.chiliz.com/)
- **Cantidad recomendada**: 1000+ CHZ para testing completo

### **Paso 3: Orden de Despliegue (Remix IDE)**

#### **1. StakingPool.sol**
```solidity
Constructor Parameters:
- _rewardPerSecond: 1000000000000000 (0.001 CHZ/segundo)
- _lockDuration: 604800 (7 días)
- _minStakeAmount: 100000000000000000000 (100 CHZ)
```

#### **2. PredictionMarket.sol**
```solidity
Constructor Parameters:
- _stakingPool: [Dirección del StakingPool desplegado]
- _feePercentage: 500 (5%)
- _minBetAmount: 10000000000000000 (0.01 CHZ)
```

#### **3. VotingSystem.sol**
```solidity
Constructor Parameters:
- _stakingPool: [Dirección del StakingPool desplegado]
- _rewardPool: 1000000000000000000000 (1000 CHZ)
```

#### **4. CommunityNFT.sol**
```solidity
Constructor Parameters:
- _mintPrice: 1000000000000000000 (1 CHZ)
- _maxSupply: 10000
- _maxPerUser: 5
```

## 🔧 **Integración Frontend-Backend**

### **Configuración de Wagmi**
```typescript
// src/lib/wagmi-config.ts
export const config = createConfig({
  chains: [chilizSpicy, baseSepolia],
  connectors: [gemini()],
  transports: {
    [chilizSpicy.id]: http(),
    [baseSepolia.id]: http(),
  },
})
```

### **Hook Personalizado de Staking**
```typescript
// src/hooks/useStaking.ts
export const useStaking = () => {
  // Estado del staking
  // Funciones de stake/unstake/claim
  // Integración con contrato StakingPool
}
```

### **Integración de Gemini Wallet**
```typescript
// src/hooks/useGeminiWallet.ts
export const useGeminiWallet = () => {
  // Conexión/desconexión
  // Cambio de redes
  // Estado de la wallet
}
```

## 🎨 **Características de UI/UX**

### **Diseño Responsive**
- **Mobile-first** con navegación optimizada
- **Breakpoints**: sm (640px), md (768px), lg (1024px)
- **MobileNavigation** compacta y funcional

### **Efectos Visuales**
- **Backgrounds animados** con partículas
- **Gradientes** atractivos (slate-900/800)
- **Transiciones suaves** en todos los elementos
- **Hover effects** en botones y cards

### **Paleta de Colores**
- **Primarios**: slate-900, slate-800
- **Acentos**: yellow-400, orange-500, blue-400
- **Deportivos**: sports-orange, sports-blue
- **Estados**: green-500, red-500, blue-500

## 📊 **Funcionalidades Implementadas**

### **✅ Completado**
- [x] Sistema de staking completo (frontend + backend)
- [x] Integración nativa con Gemini Wallet
- [x] Navegación responsive y optimizada
- [x] Landing page con efectos visuales
- [x] Sistema de autenticación y conexión
- [x] Gestión de redes (Chiliz, Base Sepolia)
- [x] UI para todas las páginas principales
- [x] Smart contracts corregidos y seguros

### **🔄 En Desarrollo**
- [ ] Integración con contratos desplegados
- [ ] Funcionalidades de predicción
- [ ] Sistema de votación
- [ ] Minting de NFTs

### **📋 Próximos Pasos**
1. **Deployar contratos** en Chiliz Spicy Testnet
2. **Integrar direcciones** en frontend
3. **Conectar funciones** de staking
4. **Implementar predicciones** y votación
5. **Testing completo** de funcionalidades

## 🛡️ **Seguridad y Auditoría**

### **Smart Contracts**
- ✅ **ReentrancyGuard** implementado
- ✅ **SafeMath** para operaciones aritméticas
- ✅ **Ownable** para control de acceso
- ✅ **Pausable** para emergencias
- ✅ **Validación de inputs** completa

### **Frontend**
- ✅ **Validación de formularios**
- ✅ **Manejo de errores** de wallet
- ✅ **Protección contra** estados inválidos
- ✅ **Integración segura** con contratos

## 🧪 **Testing y Desarrollo**

### **Comandos de Desarrollo**
```bash
# Instalar dependencias
npm install --legacy-peer-deps

# Ejecutar en desarrollo
npm run dev

# Build de producción
npm run build

# Linting
npm run lint
```

### **Estructura de Archivos**
```
mundial-buzz/
├── src/
│   ├── components/     # Componentes reutilizables
│   ├── pages/         # Páginas principales
│   ├── hooks/         # Hooks personalizados
│   ├── lib/           # Configuraciones y utilidades
│   └── assets/        # Imágenes y recursos
├── contracts/          # Smart contracts Solidity
└── public/            # Archivos estáticos
```

## 🌐 **Redes Soportadas**

### **Chiliz Spicy Testnet** (Principal)
- **Chain ID**: 88882
- **RPC**: https://spicy-rpc.chiliz.com/
- **Explorer**: https://spicy-explorer.chiliz.com/
- **Faucet**: https://spicy-faucet.chiliz.com/

### **Base Sepolia Testnet** (Secundaria)
- **Chain ID**: 84532
- **RPC**: https://sepolia.base.org/
- **Explorer**: https://sepolia.basescan.org/

## 📚 **Recursos y Documentación**

- **Chiliz**: [docs.chiliz.com](https://docs.chiliz.com/)
- **Chainlink**: [docs.chain.link](https://docs.chain.link/)
- **Wagmi**: [wagmi.sh](https://wagmi.sh/)
- **Tailwind CSS**: [tailwindcss.com](https://tailwindcss.com/)
- **Remix IDE**: [remix.ethereum.org](https://remix.ethereum.org/)

## 🏆 **Hackathon ETHGlobal NYC 2024**

**Proyecto**: MUNDIAL BUZZ - Web3 Sports Platform  
**Equipo**: Gerry & Marx  
**Tracks**: Chiliz Sports/DeFi, Chainlink VRF, Chainlink Price Feeds  
**Estado**: Frontend completo, Smart contracts listos para deploy  

---

**¡Construyendo el futuro del deporte con Web3! ⚽🚀**