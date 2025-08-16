/**
 * Mundial Buzz - Base Hub Deployment Script (Hyperlane + CCIP)
 * Deploy on Chiliz Spicy Testnet with Base as CCIP hub
 * 
 * HACKATHON TRACKS:
 * 1. Chainlink CCIP ($6,000) - Native CCIP integration with Base hub
 * 2. Chiliz Sports/Entertainment App ($5,000) - Sports prediction & voting platform
 * 3. Chiliz DeFi App ($5,000) - DeFi features with staking and yield
 * 
 * TOTAL POTENTIAL: $16,000
 */

// ============================================================================
// CONFIGURATION - UPDATE THESE ADDRESSES
// ============================================================================

// Chiliz Spicy Testnet Configuration
const CHILIZ_CONFIG = {
    // Chainlink Services (UPDATE WITH REAL ADDRESSES)
    VRF_COORDINATOR: "0x0000000000000000000000000000000000000000", // TODO: Update
    KEY_HASH: "0x0000000000000000000000000000000000000000000000000000000000000000", // TODO: Update
    PRICE_FEED_CHZ_USD: "0x0000000000000000000000000000000000000000", // TODO: Update
    
    // Hyperlane Services (UPDATE WITH REAL ADDRESSES)
    HYPERLANE_MAILBOX: "0x0000000000000000000000000000000000000000", // TODO: Update
    HYPERLANE_GAS_PAYMASTER: "0x0000000000000000000000000000000000000000", // TODO: Update
    
    // VRF Subscription
    VRF_SUBSCRIPTION_ID: 1, // TODO: Update with your subscription ID
    
    // Network Details
    CHAIN_ID: 88882,
    RPC_URL: "https://spicy-rpc.chiliz.com",
    EXPLORER: "https://spicy-explorer.chiliz.com"
};

// Base Sepolia Hub Configuration (DEPLOY FIRST ON BASE SEPOLIA)
const BASE_HUB_CONFIG = {
    // CCIP Router on Base Sepolia
    CCIP_ROUTER: "0xD3b06cEbF099CE7DA4AcCf578aaebFDBd6e88a93", // Base Sepolia CCIP Router
    
    // Hyperlane on Base Sepolia (UPDATE WITH REAL ADDRESSES)
    HYPERLANE_MAILBOX: "0x0000000000000000000000000000000000000000", // TODO: Update
    HYPERLANE_GAS_PAYMASTER: "0x0000000000000000000000000000000000000000", // TODO: Update
    
    // Hub Contract Address (UPDATE AFTER BASE DEPLOYMENT)
    HUB_CONTRACT: "0x0000000000000000000000000000000000000000", // TODO: Update
    
    // Network Details
    CHAIN_ID: 84532, // Base Sepolia
    RPC_URL: "https://sepolia.base.org",
    EXPLORER: "https://sepolia-explorer.base.org"
};

// Supported Cross-Chain Networks (Base CCIP supported chains)
const SUPPORTED_CHAINS = {
    BASE: 8453,
    ETHEREUM: 1,
    POLYGON: 137,
    AVALANCHE: 43114,
    ARBITRUM: 42161,
    OPTIMISM: 10
};

// Base CCIP Chain Selectors
const CCIP_CHAIN_SELECTORS = {
    BASE_SEPOLIA: "10344971235874465080",
    ETHEREUM_SEPOLIA: "16015286601757825753",
    POLYGON_MUMBAI: "12532609583862916517",
    AVALANCHE_FUJI: "14767482510784806043",
    ARBITRUM_SEPOLIA: "3478487238524512106",
    OPTIMISM_SEPOLIA: "5224473277236331295"
};

// ============================================================================
// DEPLOYMENT FUNCTIONS
// ============================================================================

/**
 * Deploy Base Hub Contract (RUN THIS FIRST ON BASE SEPOLIA)
 */
async function deployBaseHub() {
    console.log("🚀 Deploying Base CCIP Hub...");
    console.log("⚠️  Make sure you're connected to Base Sepolia!");
    
    try {
        // Get contract factory
        const BaseCCIPHub = await ethers.getContractFactory("BaseCCIPHub");
        
        // Deploy with constructor parameters
        const hub = await BaseCCIPHub.deploy(
            BASE_HUB_CONFIG.CCIP_ROUTER,
            BASE_HUB_CONFIG.HYPERLANE_MAILBOX,
            BASE_HUB_CONFIG.HYPERLANE_GAS_PAYMASTER,
            "0x0000000000000000000000000000000000000000" // Chiliz bridge (will be updated)
        );
        
        await hub.deployed();
        
        console.log("✅ BaseCCIPHub deployed to:", hub.address);
        console.log("📋 Update BASE_HUB_CONFIG.HUB_CONTRACT with this address!");
        console.log("🔗 Verify on Base Explorer:", `${BASE_HUB_CONFIG.EXPLORER}/address/${hub.address}`);
        
        return {
            hubAddress: hub.address,
            txHash: hub.deployTransaction.hash
        };
        
    } catch (error) {
        console.error("❌ Error deploying Base hub:", error);
        throw error;
    }
}

/**
 * Deploy Hybrid Architecture on Chiliz (RUN AFTER BASE HUB DEPLOYMENT)
 */
async function deployHybridArchitecture() {
    console.log("🚀 Deploying Mundial Buzz Hybrid Architecture on Chiliz...");
    console.log("⚠️  Make sure you're connected to Chiliz Spicy Testnet!");
    
    // Validate configuration
    if (BASE_HUB_CONFIG.HUB_CONTRACT === "0x0000000000000000000000000000000000000000") {
        throw new Error("❌ Please deploy Base hub first and update HUB_CONTRACT address!");
    }
    
    try {
        // Deploy main deployment contract
        console.log("📦 Deploying HyperlaneHybridDeployment...");
        const HyperlaneHybridDeployment = await ethers.getContractFactory("HyperlaneHybridDeployment");
        
        const deployment = await HyperlaneHybridDeployment.deploy(
            CHILIZ_CONFIG.VRF_SUBSCRIPTION_ID,
            BASE_HUB_CONFIG.HUB_CONTRACT
        );
        
        await deployment.deployed();
        console.log("✅ HyperlaneHybridDeployment:", deployment.address);
        
        // Deploy all contracts
        console.log("📦 Deploying all Mundial Buzz contracts...");
        const deployTx = await deployment.deployAllContracts();
        await deployTx.wait();
        console.log("✅ All contracts deployed!");
        
        // Configure hybrid architecture
        console.log("⚙️  Configuring hybrid architecture...");
        const configTx = await deployment.configureHybridArchitecture();
        await configTx.wait();
        console.log("✅ Hybrid architecture configured!");
        
        // Get deployed contract addresses
        const contracts = await deployment.getDeployedContracts();
        
        console.log("\n🎉 DEPLOYMENT SUCCESSFUL!");
        console.log("===========================================");
        console.log("📋 Contract Addresses:");
        console.log("- HyperlaneHybridDeployment:", deployment.address);
        console.log("- PredictionMarketCCIP:", contracts._predictionMarket);
        console.log("- VotingSystemCCIP:", contracts._votingSystem);
        console.log("- StakingPool:", contracts._stakingPool);
        console.log("- HyperlaneChilizBridge:", contracts._hyperlanebridge);
        console.log("\n🔗 Verify on Chiliz Explorer:");
        console.log(`${CHILIZ_CONFIG.EXPLORER}/address/${deployment.address}`);
        
        return {
            deploymentAddress: deployment.address,
            contracts: contracts,
            txHash: deployTx.hash
        };
        
    } catch (error) {
        console.error("❌ Error deploying hybrid architecture:", error);
        throw error;
    }
}

/**
 * Configure Base Hub Routes (RUN AFTER BOTH DEPLOYMENTS)
 */
async function configureBaseHubRoutes(baseHubAddress, chilizBridgeAddress) {
    console.log("⚙️  Configuring Base hub routes...");
    
    try {
        const hub = await ethers.getContractAt("BaseCCIPHub", baseHubAddress);
        
        // Update Chiliz bridge address
        console.log("🔗 Updating Chiliz bridge address...");
        const updateTx = await hub.updateChilizBridge(chilizBridgeAddress);
        await updateTx.wait();
        console.log("✅ Chiliz bridge updated!");
        
        // Configure routes for different message types
        const messageTypes = [
            ethers.utils.formatBytes32String("REWARD_CLAIM"),
            ethers.utils.formatBytes32String("REWARD_TRANSFER"),
            ethers.utils.formatBytes32String("CROSS_CHAIN_VOTE"),
            ethers.utils.formatBytes32String("VOTING_DATA"),
            ethers.utils.formatBytes32String("STAKING_UPDATE")
        ];
        
        // Configure routes to Ethereum Sepolia as default
        for (const messageType of messageTypes) {
            console.log(`📡 Configuring route for ${ethers.utils.parseBytes32String(messageType)}...`);
            const routeTx = await hub.configureRoute(
                messageType,
                CCIP_CHAIN_SELECTORS.ETHEREUM_SEPOLIA,
                "0x0000000000000000000000000000000000000000" // TODO: Update with destination contracts
            );
            await routeTx.wait();
        }
        
        console.log("✅ Base hub routes configured!");
        
    } catch (error) {
        console.error("❌ Error configuring Base hub routes:", error);
        throw error;
    }
}

/**
 * Create sample markets and voting categories
 */
async function createSampleData(deploymentAddress) {
    console.log("🎮 Creating sample markets and voting categories...");
    
    try {
        const deployment = await ethers.getContractAt("HyperlaneHybridDeployment", deploymentAddress);
        
        // Create sample markets (requires 0.1 ETH)
        console.log("🏈 Creating sample prediction markets...");
        const marketsTx = await deployment.createSampleMarkets({
            value: ethers.utils.parseEther("0.1")
        });
        await marketsTx.wait();
        console.log("✅ Sample markets created!");
        
        // Create sample voting categories
        console.log("🗳️  Creating sample voting categories...");
        const categoriesTx = await deployment.createSampleVotingCategories();
        await categoriesTx.wait();
        console.log("✅ Sample voting categories created!");
        
        console.log("\n🎉 SAMPLE DATA CREATED SUCCESSFULLY!");
        
    } catch (error) {
        console.error("❌ Error creating sample data:", error);
        throw error;
    }
}

/**
 * Complete deployment process
 */
async function deployComplete() {
    console.log("🌟 MUNDIAL BUZZ - BASE HUB DEPLOYMENT");
    console.log("=====================================");
    console.log("🏆 Hackathon Tracks: Chainlink CCIP + Chiliz Sports + Chiliz DeFi");
    console.log("💰 Total Prize Potential: $16,000");
    console.log("\n🔄 Architecture: Chiliz ←→ Hyperlane ←→ Base ←→ CCIP ←→ [Other Chains]");
    console.log("✨ Advantage: Base has native CCIP support - no complex bridging needed!");
    
    try {
        // Step 1: Check if Base hub is deployed
        if (BASE_HUB_CONFIG.HUB_CONTRACT === "0x0000000000000000000000000000000000000000") {
            console.log("\n⚠️  BASE HUB NOT DEPLOYED!");
            console.log("Please run deployBaseHub() first on Base Sepolia");
            return;
        }
        
        // Step 2: Deploy hybrid architecture on Chiliz
        const result = await deployHybridArchitecture();
        
        // Step 3: Configure Base hub routes
        await configureBaseHubRoutes(BASE_HUB_CONFIG.HUB_CONTRACT, result.contracts._hyperlanebridge);
        
        // Step 4: Create sample data
        await createSampleData(result.deploymentAddress);
        
        // Step 5: Display final information
        console.log("\n🎊 DEPLOYMENT COMPLETE!");
        console.log("========================");
        console.log("\n📱 Frontend Integration:");
        console.log("- Update contract addresses in your React app");
        console.log("- Configure Web3 provider for Chiliz Spicy Testnet");
        console.log("- Test cross-chain functionality with Base");
        
        console.log("\n🏆 Hackathon Submission:");
        console.log("- ✅ Chainlink CCIP: Native Base integration");
        console.log("- ✅ Chiliz Sports: Prediction markets & fan voting");
        console.log("- ✅ Chiliz DeFi: Staking pools & yield generation");
        
        console.log("\n🔗 Useful Links:");
        console.log(`- Chiliz Explorer: ${CHILIZ_CONFIG.EXPLORER}`);
        console.log(`- Base Explorer: ${BASE_HUB_CONFIG.EXPLORER}`);
        console.log("- Frontend: http://localhost:5173 (after npm run dev)");
        
        console.log("\n💡 Why Base is Better:");
        console.log("- ✅ Native CCIP support (no complex bridging)");
        console.log("- ✅ Lower gas fees than Ethereum");
        console.log("- ✅ Coinbase ecosystem integration");
        console.log("- ✅ Better user experience");
        
    } catch (error) {
        console.error("❌ Deployment failed:", error);
    }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Verify contract on explorer
 */
async function verifyContract(address, constructorArgs = []) {
    console.log(`🔍 Verifying contract at ${address}...`);
    try {
        await hre.run("verify:verify", {
            address: address,
            constructorArguments: constructorArgs,
        });
        console.log("✅ Contract verified!");
    } catch (error) {
        console.log("⚠️  Verification failed:", error.message);
    }
}

/**
 * Get network information
 */
async function getNetworkInfo() {
    const network = await ethers.provider.getNetwork();
    const balance = await ethers.provider.getBalance(await ethers.getSigner().getAddress());
    
    console.log("🌐 Network Info:");
    console.log("- Chain ID:", network.chainId);
    console.log("- Balance:", ethers.utils.formatEther(balance), "ETH");
    
    if (network.chainId === CHILIZ_CONFIG.CHAIN_ID) {
        console.log("✅ Connected to Chiliz Spicy Testnet");
    } else if (network.chainId === BASE_HUB_CONFIG.CHAIN_ID) {
        console.log("✅ Connected to Base Sepolia");
    } else {
        console.log("⚠️  Unknown network - please check your connection");
    }
}

/**
 * Get Base CCIP supported chains
 */
async function getBaseCCIPChains() {
    console.log("🔗 Base CCIP Supported Chains:");
    console.log("================================");
    console.log("✅ Ethereum Sepolia:", CCIP_CHAIN_SELECTORS.ETHEREUM_SEPOLIA);
    console.log("✅ Polygon Mumbai:", CCIP_CHAIN_SELECTORS.POLYGON_MUMBAI);
    console.log("✅ Avalanche Fuji:", CCIP_CHAIN_SELECTORS.AVALANCHE_FUJI);
    console.log("✅ Arbitrum Sepolia:", CCIP_CHAIN_SELECTORS.ARBITRUM_SEPOLIA);
    console.log("✅ Optimism Sepolia:", CCIP_CHAIN_SELECTORS.OPTIMISM_SEPOLIA);
    console.log("\n💡 Base provides native CCIP connectivity to all these chains!");
}

// ============================================================================
// EXPORT FUNCTIONS FOR REMIX CONSOLE
// ============================================================================

// Make functions available in Remix console
if (typeof window !== 'undefined') {
    window.deployBaseHub = deployBaseHub;
    window.deployHybridArchitecture = deployHybridArchitecture;
    window.configureBaseHubRoutes = configureBaseHubRoutes;
    window.createSampleData = createSampleData;
    window.deployComplete = deployComplete;
    window.verifyContract = verifyContract;
    window.getNetworkInfo = getNetworkInfo;
    window.getBaseCCIPChains = getBaseCCIPChains;
}

// ============================================================================
// INSTRUCTIONS FOR REMIX
// ============================================================================

/*

🚀 REMIX DEPLOYMENT INSTRUCTIONS:

1. PREPARATION:
   - Connect MetaMask to Base Sepolia first
   - Get ETH from Base Sepolia faucet: https://www.coinbase.com/faucets/base-ethereum-sepolia-faucet
   - Update BASE_HUB_CONFIG addresses

2. BASE HUB DEPLOYMENT:
   - Run: deployBaseHub()
   - Copy the hub address
   - Update BASE_HUB_CONFIG.HUB_CONTRACT

3. CHILIZ DEPLOYMENT:
   - Switch MetaMask to Chiliz Spicy Testnet
   - Get CHZ from faucet: https://spicy-faucet.chiliz.com/
   - Update CHILIZ_CONFIG addresses
   - Run: deployComplete()

4. TESTING:
   - Test cross-chain functionality
   - Verify contracts on explorers
   - Submit to hackathon tracks

💡 QUICK START:
   deployComplete().then(console.log).catch(console.error)

🌟 WHY BASE IS PERFECT:
   - Native CCIP support (launched October 2023)
   - Lower fees than Ethereum
   - Coinbase ecosystem
   - Better UX for users

*/

console.log("🌟 Mundial Buzz Base Hub Deployment Script Loaded!");
console.log("📖 Read the instructions above for deployment steps");
console.log("🚀 Quick start: deployComplete()");
console.log("🔗 Check supported chains: getBaseCCIPChains()");