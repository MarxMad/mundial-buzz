/**
 * MUNDIAL BUZZ - REMIX DEPLOYMENT GUIDE
 * Hybrid Architecture: Chiliz ↔ Hyperlane ↔ Base ↔ CCIP ↔ Other Networks
 * 
 * DEPLOYMENT ORDER FOR REMIX IDE:
 * 
 * PHASE 1: Deploy on Base Sepolia (Hub Central)
 * 1. BaseCCIPHub.sol
 * 
 * PHASE 2: Deploy on Chiliz Spicy Testnet (Main App)
 * 2. HyperlaneChilizBridge.sol
 * 3. StakingPool.sol
 * 4. PredictionMarketCCIP.sol
 * 5. VotingSystemCCIP.sol
 * 6. HyperlaneHybridDeployment.sol (Main Contract)
 */

// ============================================================================
// PHASE 1: BASE SEPOLIA DEPLOYMENT
// ============================================================================

/**
 * STEP 1: Configure MetaMask for Base Sepolia
 * 
 * Network Details:
 * - Network Name: Base Sepolia
 * - RPC URL: https://sepolia.base.org
 * - Chain ID: 84532
 * - Currency Symbol: ETH
 * - Block Explorer: https://sepolia.basescan.org
 * 
 * Get Base Sepolia ETH from: https://www.alchemy.com/faucets/base-sepolia
 */

// Base Sepolia Configuration
const BASE_SEPOLIA_CONFIG = {
    // Chainlink CCIP Router on Base Sepolia
    ccipRouter: "0xD3b06cEbF099CE7DA4AcCf578aaebFDBd6e88a93",
    
    // Supported CCIP Chain Selectors
    chainSelectors: {
        ethereumSepolia: "16015286601757825753",
        polygonMumbai: "12532609583862916517", 
        avalancheFuji: "14767482510784806043",
        arbitrumSepolia: "3478487238524512106",
        optimismSepolia: "5224473277236331295"
    },
    
    // Hyperlane Configuration
    hyperlane: {
        chilizDomain: 88882, // Chiliz Spicy Testnet
        baseDomain: 8453     // Base Mainnet (use for testnet too)
    }
};

/**
 * DEPLOY BaseCCIPHub.sol on Base Sepolia
 * 
 * Constructor Parameters:
 * - _router: "0xD3b06cEbF099CE7DA4AcCf578aaebFDBd6e88a93"
 * - _hyperlaneMailbox: "0xfFAEF09B3cd11D9b20d1a19bECca54EEC2884766" (Base Sepolia)
 */
function deployBaseCCIPHub() {
    console.log("=== DEPLOYING BaseCCIPHub on Base Sepolia ===");
    console.log("Constructor args:");
    console.log("- router:", BASE_SEPOLIA_CONFIG.ccipRouter);
    console.log("- hyperlaneMailbox: 0xfFAEF09B3cd11D9b20d1a19bECca54EEC2884766");
    
    // After deployment, save the contract address for Phase 2
    console.log("\n⚠️  IMPORTANT: Save the deployed BaseCCIPHub address!");
    console.log("You'll need it for Chiliz deployment.");
}

// ============================================================================
// PHASE 2: CHILIZ SPICY TESTNET DEPLOYMENT  
// ============================================================================

/**
 * STEP 2: Configure MetaMask for Chiliz Spicy Testnet
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

// Chiliz Spicy Testnet Configuration
const CHILIZ_CONFIG = {
    // Chainlink Services on Chiliz Spicy
    vrfCoordinator: "0x5C210eF41CD1a72de73bF76eC39637bB0d3d7BEE",
    ccipRouter: "0x9C32fCB86BF0f4a1A8921a9Fe46de3198bb884B2",
    priceFeed: "0x0715A7794a1dc8e42615F059dD6e406A6594651A", // CHZ/USD
    
    // VRF Configuration
    vrf: {
        subscriptionId: 1, // Create subscription at vrf.chain.link
        keyHash: "0x787d74caea10b2b357790d5b5247c2f63d1d91572a9846f780606e4d953677ae",
        callbackGasLimit: 2500000,
        requestConfirmations: 3,
        numWords: 1
    },
    
    // CCIP Chain Selectors (from Base perspective)
    chainSelectors: {
        baseSepolia: "10344971235874465080",
        ethereumSepolia: "16015286601757825753",
        polygonMumbai: "12532609583862916517",
        avalancheFuji: "14767482510784806043",
        arbitrumSepolia: "3478487238524512106"
    },
    
    // Hyperlane Configuration
    hyperlane: {
        mailbox: "0x2971b9Aec44507e2262f4aa9b9E7C8C8e5d1c4C6", // Chiliz Spicy
        baseDomain: 8453,
        baseHubAddress: "" // Set this after Phase 1 deployment
    },
    
    // Staking Configuration
    staking: {
        minStakeAmount: "100000000000000000000", // 100 CHZ
        stakingPeriod: 604800, // 7 days
        rewardRate: 500 // 5% APY
    }
};

/**
 * DEPLOY ORDER ON CHILIZ SPICY TESTNET:
 */

// Step 1: Deploy HyperlaneChilizBridge
function deployHyperlaneChilizBridge(baseHubAddress) {
    console.log("=== DEPLOYING HyperlaneChilizBridge ===");
    console.log("Constructor args:");
    console.log("- _mailbox:", CHILIZ_CONFIG.hyperlane.mailbox);
    console.log("- _baseHubContract:", baseHubAddress);
    console.log("- _baseDomain:", CHILIZ_CONFIG.hyperlane.baseDomain);
}

// Step 2: Deploy StakingPool
function deployStakingPool() {
    console.log("\n=== DEPLOYING StakingPool ===");
    console.log("Constructor args:");
    console.log("- _minStakeAmount:", CHILIZ_CONFIG.staking.minStakeAmount);
    console.log("- _stakingPeriod:", CHILIZ_CONFIG.staking.stakingPeriod);
    console.log("- _rewardRate:", CHILIZ_CONFIG.staking.rewardRate);
}

// Step 3: Deploy PredictionMarketCCIP
function deployPredictionMarketCCIP(hyperlaneChilizBridgeAddress, stakingPoolAddress) {
    console.log("\n=== DEPLOYING PredictionMarketCCIP ===");
    console.log("Constructor args:");
    console.log("- _router:", CHILIZ_CONFIG.ccipRouter);
    console.log("- _vrfCoordinator:", CHILIZ_CONFIG.vrfCoordinator);
    console.log("- _priceFeed:", CHILIZ_CONFIG.priceFeed);
    console.log("- _hyperlaneChilizBridge:", hyperlaneChilizBridgeAddress);
    console.log("- _stakingPool:", stakingPoolAddress);
    console.log("- _subscriptionId:", CHILIZ_CONFIG.vrf.subscriptionId);
    console.log("- _keyHash:", CHILIZ_CONFIG.vrf.keyHash);
}

// Step 4: Deploy VotingSystemCCIP
function deployVotingSystemCCIP(hyperlaneChilizBridgeAddress, stakingPoolAddress) {
    console.log("\n=== DEPLOYING VotingSystemCCIP ===");
    console.log("Constructor args:");
    console.log("- _router:", CHILIZ_CONFIG.ccipRouter);
    console.log("- _hyperlaneChilizBridge:", hyperlaneChilizBridgeAddress);
    console.log("- _stakingPool:", stakingPoolAddress);
}

// Step 5: Deploy HyperlaneHybridDeployment (Main Contract)
function deployHyperlaneHybridDeployment(
    hyperlaneChilizBridgeAddress,
    stakingPoolAddress, 
    predictionMarketAddress,
    votingSystemAddress
) {
    console.log("\n=== DEPLOYING HyperlaneHybridDeployment (MAIN CONTRACT) ===");
    console.log("Constructor args:");
    console.log("- _router:", CHILIZ_CONFIG.ccipRouter);
    console.log("- _vrfCoordinator:", CHILIZ_CONFIG.vrfCoordinator);
    console.log("- _priceFeed:", CHILIZ_CONFIG.priceFeed);
    console.log("- _hyperlaneChilizBridge:", hyperlaneChilizBridgeAddress);
    console.log("- _stakingPool:", stakingPoolAddress);
    console.log("- _predictionMarket:", predictionMarketAddress);
    console.log("- _votingSystem:", votingSystemAddress);
    console.log("- _subscriptionId:", CHILIZ_CONFIG.vrf.subscriptionId);
    console.log("- _keyHash:", CHILIZ_CONFIG.vrf.keyHash);
}

// ============================================================================
// DEPLOYMENT EXECUTION GUIDE
// ============================================================================

function executeDeployment() {
    console.log("\n🚀 MUNDIAL BUZZ DEPLOYMENT GUIDE FOR REMIX");
    console.log("==========================================\n");
    
    console.log("📋 DEPLOYMENT CHECKLIST:");
    console.log("□ MetaMask configured for Base Sepolia");
    console.log("□ Base Sepolia ETH obtained from faucet");
    console.log("□ MetaMask configured for Chiliz Spicy Testnet");
    console.log("□ CHZ testnet tokens obtained from faucet");
    console.log("□ Chainlink VRF subscription created\n");
    
    console.log("🔄 DEPLOYMENT ORDER:");
    console.log("\n--- PHASE 1: BASE SEPOLIA ---");
    console.log("1. Deploy BaseCCIPHub.sol");
    console.log("   ⚠️  Save the contract address!");
    
    console.log("\n--- PHASE 2: CHILIZ SPICY ---");
    console.log("2. Deploy HyperlaneChilizBridge.sol");
    console.log("3. Deploy StakingPool.sol");
    console.log("4. Deploy PredictionMarketCCIP.sol");
    console.log("5. Deploy VotingSystemCCIP.sol");
    console.log("6. Deploy HyperlaneHybridDeployment.sol (MAIN)");
    
    console.log("\n✅ POST-DEPLOYMENT:");
    console.log("□ Configure CCIP routes on BaseCCIPHub");
    console.log("□ Add consumer to VRF subscription");
    console.log("□ Test cross-chain functionality");
    console.log("□ Verify contracts on block explorers\n");
    
    console.log("🏆 HACKATHON TRACKS COVERED:");
    console.log("• Chainlink CCIP Best Usage ($6,000)");
    console.log("• Chiliz Sports App ($5,000)");
    console.log("• Chiliz DeFi App ($5,000)");
    console.log("Total Potential: $16,000\n");
}

// Execute the deployment guide
executeDeployment();

// Export configurations for easy access
module.exports = {
    BASE_SEPOLIA_CONFIG,
    CHILIZ_CONFIG,
    deployBaseCCIPHub,
    deployHyperlaneChilizBridge,
    deployStakingPool,
    deployPredictionMarketCCIP,
    deployVotingSystemCCIP,
    deployHyperlaneHybridDeployment
};