// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./PredictionMarketCCIP.sol";
import "./VotingSystemCCIP.sol";
import "./StakingPool.sol";
import "./HyperlaneChilizBridge.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title HyperlaneHybridDeployment
 * @dev Deployment contract for Mundial Buzz with Hyperlane + CCIP hybrid architecture
 * Deploys on Chiliz Chain with Hyperlane bridge to Ethereum hub
 */
contract HyperlaneHybridDeployment is Ownable {
    // Deployed contracts
    PredictionMarketCCIP public predictionMarket;
    VotingSystemCCIP public votingSystem;
    StakingPool public stakingPool;
    HyperlaneChilizBridge public hyperlanebridge;
    
    // Chiliz Spicy Testnet Chainlink addresses
    address public constant VRF_COORDINATOR = 0x0000000000000000000000000000000000000000; // To be updated
    bytes32 public constant KEY_HASH = 0x0000000000000000000000000000000000000000000000000000000000000000; // To be updated
    address public constant PRICE_FEED_CHZ_USD = 0x0000000000000000000000000000000000000000; // To be updated
    
    // Hyperlane addresses on Chiliz Spicy Testnet
    address public constant HYPERLANE_MAILBOX = 0x0000000000000000000000000000000000000000; // To be updated
    address public constant HYPERLANE_GAS_PAYMASTER = 0x0000000000000000000000000000000000000000; // To be updated
    
    // Base hub contract address (deployed separately)
    address public baseHubContract;
    
    // VRF subscription ID
    uint64 public vrfSubscriptionId;
    
    // Events
    event ContractsDeployed(
        address predictionMarket,
        address votingSystem,
        address stakingPool,
        address hyperlanebridge
    );
    
    event HybridArchitectureConfigured(
        address baseHub,
        uint256[] supportedChains
    );
    
    event SampleDataCreated(
        uint256 marketCount,
        uint256 categoryCount
    );
    
    constructor(
        uint64 _vrfSubscriptionId,
        address _baseHubContract
    ) {
        vrfSubscriptionId = _vrfSubscriptionId;
        baseHubContract = _baseHubContract;
    }
    
    /**
     * @dev Deploy all Mundial Buzz contracts with Hyperlane integration
     */
    function deployAllContracts() external onlyOwner {
        // Deploy Hyperlane bridge first
        hyperlanebridge = new HyperlaneChilizBridge(
            HYPERLANE_MAILBOX,
            HYPERLANE_GAS_PAYMASTER,
            baseHubContract
        );
        
        // Deploy Prediction Market with Hyperlane integration
        predictionMarket = new PredictionMarketCCIP(
            vrfSubscriptionId,
            VRF_COORDINATOR,
            KEY_HASH,
            PRICE_FEED_CHZ_USD,
            address(hyperlanebridge)
        );
        
        // Deploy Voting System with Hyperlane integration
        votingSystem = new VotingSystemCCIP(
            address(hyperlanebridge)
        );
        
        // Deploy Staking Pool
        stakingPool = new StakingPool();
        
        emit ContractsDeployed(
            address(predictionMarket),
            address(votingSystem),
            address(stakingPool),
            address(hyperlanebridge)
        );
    }
    
    /**
     * @dev Configure hybrid architecture with supported chains
     */
    function configureHybridArchitecture() external onlyOwner {
        require(address(predictionMarket) != address(0), "Contracts not deployed");
        
        // Configure supported destination chains for cross-chain operations
        uint256[] memory supportedChains = new uint256[](5);
        supportedChains[0] = 8453; // Base
        supportedChains[1] = 1; // Ethereum
        supportedChains[2] = 137; // Polygon
        supportedChains[3] = 43114; // Avalanche
        supportedChains[4] = 42161; // Arbitrum
        
        // Configure prediction market supported chains
        for (uint256 i = 0; i < supportedChains.length; i++) {
            predictionMarket.setSupportedDestinationChain(supportedChains[i], true);
        }
        
        // Configure voting system allowed chains
        for (uint256 i = 0; i < supportedChains.length; i++) {
            votingSystem.allowlistSourceChain(supportedChains[i], true);
            votingSystem.allowlistDestinationChain(supportedChains[i], true);
        }
        
        emit HybridArchitectureConfigured(baseHubContract, supportedChains);
    }
    
    /**
     * @dev Create sample prediction markets for demo
     */
    function createSampleMarkets() external payable onlyOwner {
        require(address(predictionMarket) != address(0), "Contracts not deployed");
        require(msg.value >= 0.1 ether, "Insufficient ETH for market creation");
        
        // Market 1: FIFA World Cup Winner
        string[] memory options1 = new string[](4);
        options1[0] = "Brazil";
        options1[1] = "Argentina";
        options1[2] = "France";
        options1[3] = "Spain";
        
        predictionMarket.createMarket{value: 0.025 ether}(
            "FIFA World Cup 2026 Winner",
            "Which team will win the FIFA World Cup 2026?",
            options1,
            block.timestamp + 30 days, // 30 days from now
            500, // 5% creator fee
            true, // auto-resolve with VRF
            8453 // Base for cross-chain rewards
        );
        
        // Market 2: Champions League Final
        string[] memory options2 = new string[](3);
        options2[0] = "Real Madrid";
        options2[1] = "Manchester City";
        options2[2] = "Bayern Munich";
        
        predictionMarket.createMarket{value: 0.025 ether}(
            "Champions League 2024 Final",
            "Which team will reach the Champions League final?",
            options2,
            block.timestamp + 15 days, // 15 days from now
            300, // 3% creator fee
            false, // manual resolution
            137 // Polygon for cross-chain rewards
        );
        
        // Market 3: Ballon d'Or Winner
        string[] memory options3 = new string[](5);
        options3[0] = "Lionel Messi";
        options3[1] = "Kylian Mbappe";
        options3[2] = "Erling Haaland";
        options3[3] = "Vinicius Jr";
        options3[4] = "Jude Bellingham";
        
        predictionMarket.createMarket{value: 0.025 ether}(
            "Ballon d'Or 2024 Winner",
            "Who will win the 2024 Ballon d'Or award?",
            options3,
            block.timestamp + 45 days, // 45 days from now
            400, // 4% creator fee
            true, // auto-resolve with VRF
            43114 // Avalanche for cross-chain rewards
        );
        
        // Market 4: Premier League Top Scorer
        string[] memory options4 = new string[](4);
        options4[0] = "Erling Haaland";
        options4[1] = "Harry Kane";
        options4[2] = "Mohamed Salah";
        options4[3] = "Darwin Nunez";
        
        predictionMarket.createMarket{value: 0.025 ether}(
            "Premier League 2024 Top Scorer",
            "Who will be the Premier League top scorer this season?",
            options4,
            block.timestamp + 60 days, // 60 days from now
            250, // 2.5% creator fee
            false, // manual resolution
            42161 // Arbitrum for cross-chain rewards
        );
    }
    
    /**
     * @dev Create sample voting categories for demo
     */
    function createSampleVotingCategories() external onlyOwner {
        require(address(votingSystem) != address(0), "Contracts not deployed");
        
        // Category 1: Best Football Stadium
        string[] memory stadiumOptions = new string[](5);
        stadiumOptions[0] = "Camp Nou (Barcelona)";
        stadiumOptions[1] = "Old Trafford (Manchester United)";
        stadiumOptions[2] = "Santiago Bernabeu (Real Madrid)";
        stadiumOptions[3] = "Allianz Arena (Bayern Munich)";
        stadiumOptions[4] = "Anfield (Liverpool)";
        
        votingSystem.createCategory(
            "Best Football Stadium in the World",
            "Vote for the most iconic football stadium",
            stadiumOptions,
            block.timestamp + 30 days,
            0.001 ether // 0.001 CHZ minimum vote
        );
        
        // Category 2: Greatest Football Player of All Time
        string[] memory playerOptions = new string[](4);
        playerOptions[0] = "Lionel Messi";
        playerOptions[1] = "Cristiano Ronaldo";
        playerOptions[2] = "Pele";
        playerOptions[3] = "Diego Maradona";
        
        votingSystem.createCategory(
            "Greatest Football Player of All Time",
            "Vote for the GOAT of football",
            playerOptions,
            block.timestamp + 45 days,
            0.002 ether // 0.002 CHZ minimum vote
        );
        
        // Category 3: Most Exciting Football League
        string[] memory leagueOptions = new string[](5);
        leagueOptions[0] = "Premier League (England)";
        leagueOptions[1] = "La Liga (Spain)";
        leagueOptions[2] = "Serie A (Italy)";
        leagueOptions[3] = "Bundesliga (Germany)";
        leagueOptions[4] = "Ligue 1 (France)";
        
        votingSystem.createCategory(
            "Most Exciting Football League",
            "Which league provides the best entertainment?",
            leagueOptions,
            block.timestamp + 60 days,
            0.0015 ether // 0.0015 CHZ minimum vote
        );
    }
    
    /**
     * @dev Update Base hub contract address
     */
    function updateBaseHub(address _newHub) external onlyOwner {
        baseHubContract = _newHub;
        if (address(hyperlanebridge) != address(0)) {
            hyperlanebridge.updateEthereumHub(_newHub);
        }
    }
    
    /**
     * @dev Get all deployed contract addresses
     */
    function getDeployedContracts() external view returns (
        address _predictionMarket,
        address _votingSystem,
        address _stakingPool,
        address _hyperlanebridge
    ) {
        return (
            address(predictionMarket),
            address(votingSystem),
            address(stakingPool),
            address(hyperlanebridge)
        );
    }
    
    /**
     * @dev Get hybrid architecture configuration
     */
    function getHybridConfig() external view returns (
        address _baseHub,
        address _hyperlaneMailbox,
        address _gasPaymaster
    ) {
        return (
            baseHubContract,
            HYPERLANE_MAILBOX,
            HYPERLANE_GAS_PAYMASTER
        );
    }
    
    /**
     * @dev Emergency withdrawal function
     */
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    /**
     * @dev Receive function to accept ETH
     */
    receive() external payable {}
}