// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import "@chainlink/contracts-ccip/src/v0.8/shared/access/OwnerIsCreator.sol";
import "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPReceiver.sol";
import "./HyperlaneChilizBridge.sol";

/**
 * @title PredictionMarketCCIP
 * @dev Mercado de predicción avanzado con Chainlink CCIP para cross-chain transfers
 * Integra VRF para resultados verificables y Price Feeds para conversiones CHZ/USD
 */
contract PredictionMarketCCIP is 
    ReentrancyGuard, 
    Ownable, 
    Pausable, 
    VRFConsumerBaseV2 
{
    // Chainlink VRF
    VRFCoordinatorV2Interface COORDINATOR;
    uint64 s_subscriptionId;
    bytes32 keyHash;
    uint32 callbackGasLimit = 100000;
    uint16 requestConfirmations = 3;
    uint32 numWords = 1;
    
    // Chainlink Price Feed
    AggregatorV3Interface internal priceFeed;
    
    // Hyperlane Bridge for cross-chain communication
    HyperlaneChilizBridge public hyperlanebridge;
    
    struct Market {
        uint256 id;
        string title;
        string description;
        address creator;
        uint256 endTime;
        uint256 totalPool;
        uint256 creatorFee; // Fee en basis points (100 = 1%)
        MarketStatus status;
        uint256 winningOption;
        string[] options;
        mapping(uint256 => uint256) optionPools;
        mapping(address => mapping(uint256 => uint256)) userBets;
        mapping(address => bool) hasClaimed;
        uint256 vrfRequestId; // Para resolución automática
        bool autoResolve; // Si usa VRF para resolución
        uint256 destinationChainSelector; // Para cross-chain rewards
    }

    enum MarketStatus {
        Active,
        Closed,
        Resolved,
        Cancelled
    }

    mapping(uint256 => Market) public markets;
    mapping(address => uint256[]) public userMarkets;
    mapping(uint256 => uint256) public vrfRequestToMarket; // VRF request ID to market ID
    mapping(uint256 => bool) public supportedDestinationChains;
    
    uint256 public nextMarketId = 1;
    uint256 public platformFee = 250; // 2.5% in basis points
    uint256 public constant MAX_OPTIONS = 10;
    uint256 public constant MIN_MARKET_DURATION = 1 hours;
    uint256 public constant MAX_CREATOR_FEE = 500; // 5% max
    
    // CCIP Events
    event MessageSent(
        bytes32 indexed messageId,
        uint64 indexed destinationChainSelector,
        address receiver,
        uint256 amount,
        uint256 feeToken
    );
    
    event MessageReceived(
        bytes32 indexed messageId,
        uint64 indexed sourceChainSelector,
        address sender,
        uint256 amount
    );

    event MarketCreated(
        uint256 indexed marketId,
        address indexed creator,
        string title,
        uint256 endTime,
        bool autoResolve
    );

    event BetPlaced(
        uint256 indexed marketId,
        address indexed user,
        uint256 indexed option,
        uint256 amount
    );

    event MarketResolved(
        uint256 indexed marketId,
        uint256 winningOption,
        uint256 totalPool,
        bool autoResolved
    );

    event RewardClaimed(
        uint256 indexed marketId,
        address indexed user,
        uint256 amount
    );
    
    event CrossChainRewardSent(
        uint256 indexed marketId,
        address indexed user,
        uint256 amount,
        uint256 destinationChain
    );

    constructor(
        address _vrfCoordinator,
        uint64 _subscriptionId,
        bytes32 _keyHash,
        address _priceFeed,
        address payable _hyperlanebridge
    ) VRFConsumerBaseV2(_vrfCoordinator) Ownable(msg.sender) {
        COORDINATOR = VRFCoordinatorV2Interface(_vrfCoordinator);
        s_subscriptionId = _subscriptionId;
        keyHash = _keyHash;
        priceFeed = AggregatorV3Interface(_priceFeed);
        hyperlanebridge = HyperlaneChilizBridge(_hyperlanebridge);
        
        // Configure supported destination chains
        supportedDestinationChains[1] = true; // Ethereum
        supportedDestinationChains[137] = true; // Polygon
        supportedDestinationChains[43114] = true; // Avalanche
        supportedDestinationChains[42161] = true; // Arbitrum
    }

    modifier onlySupportedDestinationChain(uint256 _destinationChainId) {
        require(
            supportedDestinationChains[_destinationChainId],
            "Destination chain not supported"
        );
        _;
    }

    /**
     * @dev Crear mercado con opción de auto-resolución via VRF
     */
    function createMarket(
        string memory _title,
        string memory _description,
        string[] memory _options,
        uint256 _duration,
        uint256 _creatorFee,
        bool _autoResolve,
        uint256 _destinationChainId
    ) external payable whenNotPaused {
        require(_options.length >= 2 && _options.length <= MAX_OPTIONS, "Invalid options count");
        require(_duration >= MIN_MARKET_DURATION, "Duration too short");
        require(_creatorFee <= MAX_CREATOR_FEE, "Creator fee too high");
        require(msg.value >= 0.01 ether, "Minimum creation fee required");
        
        if (_destinationChainId != 0) {
            require(
                supportedDestinationChains[_destinationChainId],
                "Destination chain not supported"
            );
        }

        uint256 marketId = nextMarketId++;
        Market storage market = markets[marketId];
        
        market.id = marketId;
        market.title = _title;
        market.description = _description;
        market.creator = msg.sender;
        market.endTime = block.timestamp + _duration;
        market.creatorFee = _creatorFee;
        market.status = MarketStatus.Active;
        market.options = _options;
        market.totalPool = msg.value;
        market.autoResolve = _autoResolve;
        market.destinationChainSelector = _destinationChainId;

        userMarkets[msg.sender].push(marketId);

        emit MarketCreated(marketId, msg.sender, _title, market.endTime, _autoResolve);
    }

    /**
     * @dev Apostar en un mercado
     */
    function placeBet(uint256 _marketId, uint256 _option) 
        external 
        payable 
        nonReentrant 
        whenNotPaused 
    {
        Market storage market = markets[_marketId];
        require(market.status == MarketStatus.Active, "Market not active");
        require(block.timestamp < market.endTime, "Market ended");
        require(_option < market.options.length, "Invalid option");
        require(msg.value > 0, "Bet amount must be greater than 0");

        market.userBets[msg.sender][_option] += msg.value;
        market.optionPools[_option] += msg.value;
        market.totalPool += msg.value;

        emit BetPlaced(_marketId, msg.sender, _option, msg.value);
    }

    /**
     * @dev Resolver mercado automáticamente usando VRF
     */
    function requestAutoResolve(uint256 _marketId) external {
        Market storage market = markets[_marketId];
        require(market.autoResolve, "Market not set for auto-resolve");
        require(market.status == MarketStatus.Active, "Market not active");
        require(block.timestamp >= market.endTime, "Market not ended");
        require(market.vrfRequestId == 0, "Already requested");

        uint256 requestId = COORDINATOR.requestRandomWords(
            keyHash,
            s_subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            numWords
        );
        
        market.vrfRequestId = requestId;
        vrfRequestToMarket[requestId] = _marketId;
    }

    /**
     * @dev Callback de VRF para resolver mercado
     */
    function fulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) internal override {
        uint256 marketId = vrfRequestToMarket[requestId];
        Market storage market = markets[marketId];
        
        require(market.id != 0, "Market not found");
        require(market.status == MarketStatus.Active, "Market not active");
        
        uint256 winningOption = randomWords[0] % market.options.length;
        market.status = MarketStatus.Resolved;
        market.winningOption = winningOption;

        emit MarketResolved(marketId, winningOption, market.totalPool, true);
    }

    /**
     * @dev Resolver mercado manualmente (solo creador)
     */
    function resolveMarket(uint256 _marketId, uint256 _winningOption) 
        external 
        nonReentrant 
    {
        Market storage market = markets[_marketId];
        require(msg.sender == market.creator, "Only creator can resolve");
        require(market.status == MarketStatus.Active, "Market not active");
        require(block.timestamp >= market.endTime, "Market not ended");
        require(_winningOption < market.options.length, "Invalid winning option");
        require(!market.autoResolve, "Market set for auto-resolve");

        market.status = MarketStatus.Resolved;
        market.winningOption = _winningOption;

        emit MarketResolved(_marketId, _winningOption, market.totalPool, false);
    }

    /**
     * @dev Reclamar recompensas (local o cross-chain)
     */
    function claimReward(
        uint256 _marketId, 
        bool _crossChain,
        uint256 _destinationChainId,
        address _destinationReceiver
    ) external payable nonReentrant {
        Market storage market = markets[_marketId];
        require(market.status == MarketStatus.Resolved, "Market not resolved");
        require(!market.hasClaimed[msg.sender], "Already claimed");
        
        uint256 userBet = market.userBets[msg.sender][market.winningOption];
        require(userBet > 0, "No winning bet");

        uint256 winningPool = market.optionPools[market.winningOption];
        require(winningPool > 0, "No winning pool");

        // Calcular recompensa proporcional
        uint256 totalFees = (market.totalPool * (platformFee + market.creatorFee)) / 10000;
        uint256 rewardPool = market.totalPool - totalFees;
        uint256 reward = (userBet * rewardPool) / winningPool;

        market.hasClaimed[msg.sender] = true;

        if (_crossChain && _destinationChainId != 0 && _destinationReceiver != address(0)) {
            require(
                supportedDestinationChains[_destinationChainId],
                "Destination chain not supported"
            );
            
            _sendCrossChainReward(_destinationReceiver, reward, _destinationChainId, _marketId);
            
            emit CrossChainRewardSent(_marketId, msg.sender, reward, _destinationChainId);
        } else {
            (bool success, ) = payable(msg.sender).call{value: reward}("");
            require(success, "Transfer failed");
            emit RewardClaimed(_marketId, msg.sender, reward);
        }
    }

    /**
     * @dev Enviar recompensa cross-chain usando Hyperlane
     */
    function _sendCrossChainReward(
        address _receiver,
        uint256 _amount,
        uint256 /* _destinationChainId */,
        uint256 _marketId
    ) internal {
        bytes memory data = abi.encode(
            _receiver,
            _amount,
            _marketId
        );
        
        // Send message via Hyperlane bridge
        hyperlanebridge.sendToBase{value: msg.value}(
            HyperlaneChilizBridge.MessageType.REWARD_CLAIM,
            data
        );
    }



    /**
     * @dev Obtener precio CHZ/USD desde Chainlink Price Feed
     */
    function getLatestPrice() public view returns (int) {
        (, int price, , , ) = priceFeed.latestRoundData();
        return price;
    }

    /**
     * @dev Configurar chains soportadas para Hyperlane
     */
    function setSupportedDestinationChain(
        uint256 _destinationChainId,
        bool _supported
    ) external onlyOwner {
        supportedDestinationChains[_destinationChainId] = _supported;
    }

    /**
     * @dev Obtener información del mercado
     */
    function getMarket(uint256 _marketId) 
        external 
        view 
        returns (
            uint256 id,
            string memory title,
            string memory description,
            address creator,
            uint256 endTime,
            uint256 totalPool,
            MarketStatus status,
            string[] memory options,
            bool autoResolve
        ) 
    {
        Market storage market = markets[_marketId];
        return (
            market.id,
            market.title,
            market.description,
            market.creator,
            market.endTime,
            market.totalPool,
            market.status,
            market.options,
            market.autoResolve
        );
    }

    /**
     * @dev Obtener pools de opciones
     */
    function getOptionPools(uint256 _marketId) 
        external 
        view 
        returns (uint256[] memory pools) 
    {
        Market storage market = markets[_marketId];
        pools = new uint256[](market.options.length);
        
        for (uint256 i = 0; i < market.options.length; i++) {
            pools[i] = market.optionPools[i];
        }
    }

    /**
     * @dev Retirar fees acumuladas
     */
    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Transfer failed");
    }

    /**
     * @dev Funciones de pausa
     */
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Recibir ETH/CHZ
     */
    receive() external payable {}
}