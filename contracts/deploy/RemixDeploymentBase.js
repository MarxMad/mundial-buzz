/**
 * MUNDIAL BUZZ - REMIX DEPLOYMENT GUIDE (OPTIMIZADO)
 * Deployment en Chiliz Spicy Testnet - Arquitectura Simplificada
 * 
 * DEPLOYMENT ORDER FOR REMIX IDE:
 * 
 * PHASE 1: Chiliz Spicy Testnet (App Principal)
 * 1. StakingPool.sol - Sistema de staking
 * 2. PredictionMarket.sol - Mercado de predicciones
 * 3. VotingSystem.sol - Sistema de votación
 * 4. CommunityNFT.sol - NFTs de experiencias
 */

// ============================================================================
// CHILIZ SPICY TESTNET DEPLOYMENT (OPTIMIZADO)
// ============================================================================

/**
 * STEP 1: Configure tu wallet para Chiliz Spicy Testnet
 * 
 * Network Details:
 * - Network Name: Chiliz Spicy Testnet
 * - RPC URL: https://spicy-rpc.chiliz.com
 * - Chain ID: 88882
 * - Currency Symbol: CHZ
 * - Block Explorer: https://spicy-explorer.chiliz.com
 * 
 * Get CHZ testnet tokens from: https://spicy-faucet.chiliz.com
 */

// Chiliz Spicy Testnet Configuration (Simplificada)
const CHILIZ_CONFIG = {
    // Chainlink Services on Chiliz Spicy
    vrfCoordinator: "0x5C210eF41CD1a72de73bF76eC39637bB0d3d7BEE",
    priceFeed: "0x0715A7794a1dc8e42615F059dD6e406A6594651A", // CHZ/USD
    
    // VRF Configuration
    vrf: {
        subscriptionId: 1, // Create subscription at vrf.chain.link
        keyHash: "0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae",
        callbackGasLimit: 2500000,
        requestConfirmations: 3,
        numWords: 1
    },
    
    // Staking Configuration
    staking: {
        minStakeAmount: "100000000000000000000", // 100 CHZ
        stakingPeriod: 604800, // 7 days
        rewardRate: 500 // 5% APY
    }
};

/**
 * DEPLOY ORDER ON CHILIZ SPICY TESTNET (OPTIMIZADO):
 */

// Step 1: Deploy StakingPool
function deployStakingPool() {
    console.log("\n=== DEPLOYING StakingPool (OPTIMIZADO) ===");
    console.log("Constructor args:");
    console.log("- _minStakeAmount:", CHILIZ_CONFIG.staking.minStakeAmount);
    console.log("- _stakingPeriod:", CHILIZ_CONFIG.staking.stakingPeriod);
    console.log("- _rewardRate:", CHILIZ_CONFIG.staking.rewardRate);
    console.log("\n⚠️  IMPORTANT: Save the deployed StakingPool address!");
    console.log("This will be used by PredictionMarket and VotingSystem");
}

// Step 2: Deploy PredictionMarket
function deployPredictionMarket(stakingPoolAddress) {
    console.log("\n=== DEPLOYING PredictionMarket (OPTIMIZADO) ===");
    console.log("Constructor args:");
    console.log("- _vrfCoordinator:", CHILIZ_CONFIG.vrfCoordinator);
    console.log("- _subscriptionId:", CHILIZ_CONFIG.vrf.subscriptionId);
    console.log("- _keyHash:", CHILIZ_CONFIG.vrf.keyHash);
    console.log("- _priceFeed:", CHILIZ_CONFIG.priceFeed);
    console.log("- _stakingPool:", stakingPoolAddress);
    console.log("\n⚠️  IMPORTANT: Save the deployed PredictionMarket address!");
    console.log("This will be used by VotingSystem");
}

// Step 3: Deploy VotingSystem
function deployVotingSystem(stakingPoolAddress, predictionMarketAddress) {
    console.log("\n=== DEPLOYING VotingSystem (OPTIMIZADO) ===");
    console.log("Constructor args:");
    console.log("- _stakingPool:", stakingPoolAddress);
    console.log("- _predictionMarket:", predictionMarketAddress);
    console.log("\n⚠️  IMPORTANT: Save the deployed VotingSystem address!");
}

// Step 4: Deploy CommunityNFT
function deployCommunityNFT() {
    console.log("\n=== DEPLOYING CommunityNFT (OPTIMIZADO) ===");
    console.log("Constructor args:");
    console.log("- No parameters needed");
    console.log("\n⚠️  IMPORTANT: Save the deployed CommunityNFT address!");
}

// ============================================================================
// DEPLOYMENT EXECUTION GUIDE (OPTIMIZADO)
// ============================================================================

function executeDeployment() {
    console.log("\n🚀 MUNDIAL BUZZ DEPLOYMENT GUIDE (OPTIMIZADO)");
    console.log("==============================================\n");
    
    console.log("📋 DEPLOYMENT CHECKLIST:");
    console.log("□ Wallet configurado para Chiliz Spicy Testnet");
    console.log("□ CHZ testnet tokens obtenidos del faucet");
    console.log("□ Chainlink VRF subscription creado en vrf.chain.link");
    console.log("□ Remix IDE abierto y conectado a Chiliz Spicy\n");
    
    console.log("🔄 DEPLOYMENT ORDER EN CHILIZ SPICY (OPTIMIZADO):");
    console.log("\n--- PHASE 1: CHILIZ SPICY TESTNET ---");
    console.log("1. Deploy StakingPool.sol");
    console.log("   ⚠️  Guarda la dirección del contrato!");
    
    console.log("2. Deploy PredictionMarket.sol");
    console.log("   ⚠️  Necesitas la dirección de StakingPool!");
    
    console.log("3. Deploy VotingSystem.sol");
    console.log("   ⚠️  Necesitas StakingPool + PredictionMarket!");
    
    console.log("4. Deploy CommunityNFT.sol");
    console.log("   ⚠️  No tiene dependencias!");
    
    console.log("\n✅ POST-DEPLOYMENT:");
    console.log("□ Agregar consumer a VRF subscription");
    console.log("□ Verificar contratos en spicy-explorer.chiliz.com");
    console.log("□ Probar funcionalidades básicas");
    console.log("□ Integrar direcciones en el frontend\n");
    
    console.log("🏆 HACKATHON TRACKS COVERED (OPTIMIZADO):");
    console.log("• Chiliz Sports App ($5,000) - 100% seguro");
    console.log("• Chiliz DeFi App ($5,000) - 100% seguro");
    console.log("• Chainlink VRF/Price Feeds - Muy probable");
    console.log("Total Potential: $10,000+ (Realista)\n");
    
    console.log("🎯 VENTAJAS DE LA ARQUITECTURA OPTIMIZADA:");
    console.log("✅ Más simple y confiable");
    console.log("✅ Menos puntos de fallo");
    console.log("✅ Más fácil de debuggear");
    console.log("✅ Mejor experiencia de usuario");
    console.log("✅ Demo más estable\n");
    
    console.log("🚀 NEXT STEPS:");
    console.log("1. Deploy todos los contratos en Chiliz Spicy");
    console.log("2. Guardar todas las direcciones y ABIs");
    console.log("3. Integrar con el frontend usando wagmi");
    console.log("4. Probar funcionalidades completas");
    console.log("5. Preparar demo estable para los jueces\n");
}

// Execute the deployment guide
executeDeployment();

// Export configurations for easy access
module.exports = {
    CHILIZ_CONFIG,
    deployStakingPool,
    deployPredictionMarket,
    deployVotingSystem,
    deployCommunityNFT
};