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
 * @title IStakingPool
 * @dev Interfaz para interactuar con el StakingPool
 */
interface IStakingPool {
    function getUserStake(address _user) external view returns (uint256);
    function isUserStaked(address _user) external view returns (bool);
}

/**
 * @title PredictionMarketCCIP
 * @dev Mercado de predicción deportiva con Chainlink CCIP para cross-chain transfers
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
    
    // Voting System Contract
    address public votingSystem;
    
    // Staking Pool Contract
    address public stakingPool;
    
    // Configuración de fees
    uint256 public creatorFee = 100; // 1% en basis points
    uint256 public platformFee = 300; // 3% en basis points
    uint256 public constant BASIS_POINTS = 10000;
    
    // Requisito mínimo de stake para participar
    uint256 public minStakeRequired = 50 * 10**18; // 50 CHZ mínimo
    
    struct Match {
        uint256 id;
        string team1;
        string team2;
        string title;           // Título del mercado
        string[] predictionOptions; // Opciones de predicción (más flexibles)
        uint256 startTime;
        uint256 endTime;
        uint256 totalPool;
        mapping(uint256 => uint256) optionPools; // Pool por opción
        MatchStatus status;
        uint256 winningOption;
        address creator;
        bool autoResolve;
        uint256 vrfRequestId;
        uint256 destinationChainSelector;
        uint256 creatorReward;
        uint256 platformReward;
        uint256 userRewardPool;
        uint256 minStakeRequired; // Stake mínimo para este mercado
    }

    enum MatchStatus {
        Active,
        InProgress,
        Finished,
        Resolved,
        Cancelled
    }

    mapping(uint256 => Match) public matches;
    // Mapeo de usuarios a información de apuestas
    mapping(uint256 => mapping(address => mapping(uint256 => uint256))) public userBets; // matchId => user => option => amount
    mapping(address => uint256[]) public userMatches;
    mapping(uint256 => uint256) public vrfRequestToMatch;
    mapping(uint256 => bool) public supportedDestinationChains;
    
    uint256 public nextMatchId = 1;
    
    // Constantes
    uint256 public constant MIN_MATCH_DURATION = 1 hours;
    uint256 public constant MAX_MATCH_DURATION = 30 days;
    uint256 public constant MIN_PREDICTION_OPTIONS = 2;
    uint256 public constant MAX_PREDICTION_OPTIONS = 10;
    
    // Events
    event MatchCreated(
        uint256 indexed matchId,
        string team1,
        string team2,
        uint256 startTime,
        uint256 endTime,
        address creator
    );
    
    event BetPlaced(
        uint256 indexed matchId,
        address indexed user,
        uint256 indexed option,
        uint256 amount
    );
    
    event MatchResolved(
        uint256 indexed matchId,
        uint256 winningOption,
        uint256 totalPool,
        bool autoResolved
    );
    
    event RewardClaimed(
        uint256 indexed matchId,
        address indexed user,
        uint256 amount
    );
    
    event CrossChainRewardSent(
        uint256 indexed matchId,
        address indexed user,
        uint256 amount,
        uint256 destinationChain
    );

    event FeesUpdated(
        uint256 creatorFee,
        uint256 platformFee
    );

    event StakingPoolSet(
        address indexed stakingPool
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

    modifier onlyVotingSystem() {
        require(msg.sender == votingSystem, "Only voting system can call");
        _;
    }

    modifier onlyStakers() {
        require(
            IStakingPool(stakingPool).getUserStake(msg.sender) >= minStakeRequired,
            "Minimum stake of 50 CHZ required to participate"
        );
        _;
    }

    modifier onlySupportedDestinationChain(uint256 _destinationChainSelector) {
        require(
            supportedDestinationChains[_destinationChainSelector],
            "Destination chain not supported"
        );
        _;
    }

    /**
     * @dev Crear nuevo partido para apuestas
     */
    function createMatch(
        string memory _team1,
        string memory _team2,
        string memory _title,
        string[] memory _predictionOptions,
        uint256 _startTime,
        uint256 _duration,
        uint256 _minStakeRequired,
        bool _autoResolve,
        uint256 _destinationChainSelector
    ) external payable onlyStakers whenNotPaused {
        require(bytes(_team1).length > 0, "Team 1 name required");
        require(bytes(_team2).length > 0, "Team 2 name required");
        require(bytes(_title).length > 0, "Title required");
        require(_predictionOptions.length >= MIN_PREDICTION_OPTIONS, "Too few prediction options");
        require(_predictionOptions.length <= MAX_PREDICTION_OPTIONS, "Too many prediction options");
        require(_startTime > block.timestamp, "Start time must be in future");
        require(_duration >= MIN_MATCH_DURATION, "Duration too short");
        require(_duration <= MAX_MATCH_DURATION, "Duration too long");
        require(_minStakeRequired >= 100 * 10**18, "Minimum stake must be at least 100 CHZ");
        require(msg.value >= 0.01 ether, "Minimum creation fee required");
        
        // Validar que el usuario tenga suficiente stake
        uint256 userStake = IStakingPool(stakingPool).getUserStake(msg.sender);
        require(userStake >= _minStakeRequired, "Insufficient stake for this market");
        
        if (_destinationChainSelector != 0) {
            require(
                supportedDestinationChains[_destinationChainSelector],
                "Destination chain not supported"
            );
        }

        uint256 matchId = nextMatchId++;
        Match storage matchData = matches[matchId];
        
        // Calcular fees
        uint256 creatorReward = (msg.value * creatorFee) / BASIS_POINTS;
        uint256 platformReward = (msg.value * platformFee) / BASIS_POINTS;
        uint256 userRewardPool = msg.value - creatorReward - platformReward;
        
        matchData.id = matchId;
        matchData.team1 = _team1;
        matchData.team2 = _team2;
        matchData.title = _title;
        matchData.predictionOptions = _predictionOptions;
        matchData.startTime = _startTime;
        matchData.endTime = _startTime + _duration;
        matchData.creator = msg.sender;
        matchData.status = MatchStatus.Active;
        matchData.autoResolve = _autoResolve;
        matchData.destinationChainSelector = _destinationChainSelector;
        matchData.totalPool = userRewardPool;
        matchData.creatorReward = creatorReward;
        matchData.platformReward = platformReward;
        matchData.userRewardPool = userRewardPool;
        matchData.minStakeRequired = _minStakeRequired;

        userMatches[msg.sender].push(matchId);

        // Transferir recompensa del creador inmediatamente
        (bool success1, ) = payable(msg.sender).call{value: creatorReward}("");
        require(success1, "Creator reward transfer failed");

        emit MatchCreated(matchId, _team1, _team2, _startTime, matchData.endTime, msg.sender);
    }

    /**
     * @dev Apostar en un partido
     */
    function placeBet(uint256 _matchId, uint256 _option) 
        external 
        payable 
        onlyStakers
        nonReentrant 
        whenNotPaused 
    {
        Match storage matchData = matches[_matchId];
        require(matchData.status == MatchStatus.Active, "Match not active");
        require(block.timestamp < matchData.endTime, "Match ended");
        require(_option < matchData.predictionOptions.length, "Invalid option"); // Validar que la opción sea válida
        require(msg.value > 0, "Bet amount must be greater than 0");

        // Validar que el stake mínimo sea suficiente
        require(msg.value >= matchData.minStakeRequired, "Minimum stake required not met");

        userBets[_matchId][msg.sender][_option] += msg.value;
        matchData.totalPool += msg.value;

        // Actualizar pools por opción
        matchData.optionPools[_option] += msg.value;

        emit BetPlaced(_matchId, msg.sender, _option, msg.value);
    }

    /**
     * @dev Resolver partido basado en votos del sistema de votación
     */
    function resolveMatchFromVoting(uint256 _matchId, uint256 _winningOption) 
        external 
        onlyVotingSystem 
        nonReentrant 
    {
        Match storage matchData = matches[_matchId];
        require(matchData.status == MatchStatus.Active, "Match not active");
        require(block.timestamp >= matchData.endTime, "Match not ended");
        require(_winningOption < matchData.predictionOptions.length, "Invalid winning option"); // Validar que la opción ganadora sea válida
        
        matchData.status = MatchStatus.Resolved;
        matchData.winningOption = _winningOption;

        emit MatchResolved(_matchId, _winningOption, matchData.totalPool, false);
    }

    /**
     * @dev Resolver partido automáticamente usando VRF (backup)
     */
    function requestAutoResolve(uint256 _matchId) external {
        Match storage matchData = matches[_matchId];
        require(matchData.autoResolve, "Match not set for auto-resolve");
        require(matchData.status == MatchStatus.Active, "Match not active");
        require(block.timestamp >= matchData.endTime, "Match not ended");
        require(matchData.vrfRequestId == 0, "Already requested");

        uint256 requestId = COORDINATOR.requestRandomWords(
            keyHash,
            s_subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            numWords
        );
        
        matchData.vrfRequestId = requestId;
        vrfRequestToMatch[requestId] = _matchId;
    }

    /**
     * @dev Callback de VRF para resolver partido (backup)
     */
    function fulfillRandomWords(
        uint256 requestId,
        uint256[] memory randomWords
    ) internal override {
        uint256 matchId = vrfRequestToMatch[requestId];
        Match storage matchData = matches[matchId];
        
        require(matchData.id != 0, "Match not found");
        require(matchData.status == MatchStatus.Active, "Match not active");
        
        uint256 winningOption = randomWords[0] % matchData.predictionOptions.length; // 0, 1, o 2
        matchData.status = MatchStatus.Resolved;
        matchData.winningOption = winningOption;

        emit MatchResolved(matchId, winningOption, matchData.totalPool, true);
    }

    /**
     * @dev Reclamar recompensas por apuestas ganadoras
     */
    function claimReward(
        uint256 _matchId, 
        bool _crossChain,
        uint256 _destinationChainId,
        address _destinationReceiver
    ) external payable nonReentrant {
        Match storage matchData = matches[_matchId];
        require(matchData.status == MatchStatus.Resolved, "Match not resolved");
        
        uint256 userBet = userBets[_matchId][msg.sender][matchData.winningOption];
        require(userBet > 0, "No winning bet");

        // Calcular recompensa proporcional del pool de usuarios (96%)
        uint256 winningPool = matchData.optionPools[matchData.winningOption];
        
        require(winningPool > 0, "No winning pool");
        
        // Usar solo el pool de usuarios (96%) para recompensas
        uint256 reward = (userBet * matchData.userRewardPool) / winningPool;
        require(reward > 0, "No reward to claim");

        // Marcar apuesta como reclamada
        userBets[_matchId][msg.sender][matchData.winningOption] = 0;

        if (_crossChain && _destinationChainId != 0 && _destinationReceiver != address(0)) {
            require(
                supportedDestinationChains[_destinationChainId],
                "Destination chain not supported"
            );
            
            _sendCrossChainReward(_destinationReceiver, reward, _destinationChainId, _matchId);
            
            emit CrossChainRewardSent(_matchId, msg.sender, reward, _destinationChainId);
        } else {
            (bool success, ) = payable(msg.sender).call{value: reward}("");
            require(success, "Transfer failed");
            emit RewardClaimed(_matchId, msg.sender, reward);
        }
    }

    /**
     * @dev Configurar sistema de votación
     */
    function setVotingSystem(address _votingSystem) external onlyOwner {
        require(_votingSystem != address(0), "Invalid voting system address");
        votingSystem = _votingSystem;
    }

    /**
     * @dev Configurar Staking Pool
     */
    function setStakingPool(address _stakingPool) external onlyOwner {
        require(_stakingPool != address(0), "Invalid staking pool address");
        stakingPool = _stakingPool;
        emit StakingPoolSet(_stakingPool);
    }

    /**
     * @dev Configurar requisito mínimo de stake
     */
    function setMinStakeRequired(uint256 _minStake) external onlyOwner {
        minStakeRequired = _minStake;
    }

    /**
     * @dev Configurar fees
     */
    function setFees(uint256 _creatorFee, uint256 _platformFee) external onlyOwner {
        require(_creatorFee + _platformFee <= 1000, "Total fees cannot exceed 10%");
        creatorFee = _creatorFee;
        platformFee = _platformFee;
        emit FeesUpdated(_creatorFee, _platformFee);
    }

    /**
     * @dev Obtener información del partido
     */
    function getMatch(uint256 _matchId) 
        external 
        view 
        returns (
            uint256 id,
            string memory team1,
            string memory team2,
            string memory title,
            string[] memory predictionOptions,
            uint256 startTime,
            uint256 endTime,
            uint256 totalPool,
            MatchStatus status,
            uint256 winningOption,
            bool autoResolve,
            address creator,
            uint256 creatorReward,
            uint256 platformReward,
            uint256 userRewardPool,
            uint256 minStakeRequired
        ) 
    {
        Match storage matchData = matches[_matchId];
        return (
            matchData.id,
            matchData.team1,
            matchData.team2,
            matchData.title,
            matchData.predictionOptions,
            matchData.startTime,
            matchData.endTime,
            matchData.totalPool,
            matchData.status,
            matchData.winningOption,
            matchData.autoResolve,
            matchData.creator,
            matchData.creatorReward,
            matchData.platformReward,
            matchData.userRewardPool,
            matchData.minStakeRequired
        );
    }

    /**
     * @dev Obtener apuestas de usuario
     */
    function getUserBets(uint256 _matchId, address _user) 
        external 
        view 
        returns (uint256[3] memory bets) 
    {
        bets[0] = userBets[_matchId][_user][0]; // Team1
        bets[1] = userBets[_matchId][_user][1]; // Team2
        bets[2] = userBets[_matchId][_user][2]; // Draw
    }

    /**
     * @dev Obtener partidos de usuario
     */
    function getUserMatches(address _user) external view returns (uint256[] memory) {
        return userMatches[_user];
    }

    /**
     * @dev Enviar recompensa cross-chain usando Hyperlane
     */
    function _sendCrossChainReward(
        address _receiver,
        uint256 _amount,
        uint256 /* _destinationChainId */,
        uint256 _matchId
    ) internal {
        bytes memory data = abi.encode(
            _receiver,
            _amount,
            _matchId
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
        uint256 _destinationChainSelector,
        bool _supported
    ) external onlyOwner {
        supportedDestinationChains[_destinationChainSelector] = _supported;
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

    /**
     * @dev Obtener opciones de predicción de un partido
     */
    function getPredictionOptions(uint256 _matchId) 
        external 
        view 
        returns (string[] memory) 
    {
        return matches[_matchId].predictionOptions;
    }

    /**
     * @dev Obtener pool de una opción específica
     */
    function getOptionPool(uint256 _matchId, uint256 _option) 
        external 
        view 
        returns (uint256) 
    {
        require(_option < matches[_matchId].predictionOptions.length, "Invalid option");
        return matches[_matchId].optionPools[_option];
    }

    /**
     * @dev Obtener pools de todas las opciones
     */
    function getAllOptionPools(uint256 _matchId) 
        external 
        view 
        returns (uint256[] memory pools) 
    {
        Match storage matchData = matches[_matchId];
        uint256 numOptions = matchData.predictionOptions.length;
        pools = new uint256[](numOptions);
        
        for (uint256 i = 0; i < numOptions; i++) {
            pools[i] = matchData.optionPools[i];
        }
        
        return pools;
    }

    /**
     * @dev Resolver partido con datos reales del partido
     */
    function resolveMatchWithRealData(
        uint256 _matchId,
        uint256 _homeScore,
        uint256 _awayScore
    ) external onlyOwner {
        Match storage matchData = matches[_matchId];
        require(matchData.status == MatchStatus.Active, "Match not active");
        require(block.timestamp >= matchData.endTime, "Match not ended");
        
        // Determinar ganador basado en resultado real
        uint256 winningOption;
        if (_homeScore > _awayScore) {
            winningOption = 0; // Team1 gana
        } else if (_awayScore > _homeScore) {
            winningOption = 1; // Team2 gana
        } else {
            winningOption = 2; // Empate (si existe esta opción)
        }
        
        // Validar que la opción ganadora existe
        require(winningOption < matchData.predictionOptions.length, "Winning option not available");
        
        matchData.status = MatchStatus.Resolved;
        matchData.winningOption = winningOption;

        emit MatchResolved(_matchId, winningOption, matchData.totalPool, false);
    }

    /**
     * @dev Resolver partido con opción específica (para casos especiales)
     */
    function resolveMatchWithOption(
        uint256 _matchId,
        uint256 _winningOption
    ) external onlyOwner {
        Match storage matchData = matches[_matchId];
        require(matchData.status == MatchStatus.Active, "Match not active");
        require(block.timestamp >= matchData.endTime, "Match not ended");
        require(_winningOption < matchData.predictionOptions.length, "Invalid winning option");
        
        matchData.status = MatchStatus.Resolved;
        matchData.winningOption = _winningOption;

        emit MatchResolved(_matchId, _winningOption, matchData.totalPool, false);
    }
}