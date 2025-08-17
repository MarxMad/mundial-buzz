// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./HyperlaneChilizBridge.sol";

/**
 * @title IPredictionMarket
 * @dev Interfaz para interactuar con el PredictionMarketCCIP
 */
interface IPredictionMarket {
    function getPredictionOptions(uint256 _matchId) external view returns (string[] memory);
    function getMatch(uint256 _matchId) external view returns (
        uint256 id,
        string memory team1,
        string memory team2,
        string memory title,
        string[] memory predictionOptions,
        uint256 startTime,
        uint256 endTime,
        uint256 totalPool,
        uint8 status,
        uint256 winningOption,
        bool autoResolve,
        address creator,
        uint256 creatorReward,
        uint256 platformReward,
        uint256 userRewardPool,
        uint256 minStakeRequired
    );
}

/**
 * @title VotingSystemCCIP
 * @dev Sistema de votación cross-chain para partidos deportivos
 * Se conecta con PredictionMarketCCIP para resolver partidos automáticamente
 */
contract VotingSystemCCIP is ReentrancyGuard, Ownable, Pausable {
    
    // Prediction Market Contract
    address public predictionMarket;
    
    struct VotingCategory {
        uint256 matchId; // ID del partido en PredictionMarketCCIP
        string title;
        string description;
        string[] options; // Opciones de predicción del partido
        uint256 startTime;
        uint256 endTime;
        uint256 totalVotes;
        uint256 totalAmount;
        uint256 correctOption;
        bool resolved;
        bool active;
        uint256 minVoteAmount;
        uint256 rewardPool;
        bool crossChainEnabled;
        mapping(uint64 => uint256) chainVotes;
        mapping(uint64 => uint256) chainAmounts;
        mapping(uint256 => uint256) optionVotes; // option => total votes
        mapping(uint256 => uint256) optionAmounts; // option => total amount
    }

    struct Vote {
        address voter;
        uint256 amount;
        uint256 option; // Índice de la opción de predicción
        uint256 timestamp;
        bool claimed;
        uint64 sourceChain; // Chain donde se originó el voto
        uint256 matchId; // ID del partido asociado
    }

    struct VoteStats {
        uint256 votes;
        uint256 amount;
        uint256 percentage;
    }
    
    struct CrossChainVoteMessage {
        uint256 categoryId;
        address voter;
        uint256 option;
        uint256 amount;
        uint256 timestamp;
    }

    // Hyperlane Bridge for cross-chain communication
    HyperlaneChilizBridge public hyperlanebridge;
    
    mapping(uint256 => VotingCategory) public categories;
    mapping(uint256 => mapping(uint256 => VoteStats)) public optionStats;
    mapping(uint256 => mapping(address => Vote[])) public userVotes;
    mapping(address => uint256) public userTotalRewards;
    mapping(uint256 => bool) public allowlistedSourceChains;
    mapping(uint256 => bool) public allowlistedDestinationChains;
    mapping(bytes32 => bool) public processedMessages;
    mapping(uint256 => uint256) public matchToCategory; // matchId => categoryId
    
    uint256 public nextCategoryId;
    uint256 public platformFeePercentage = 500; // 5%
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant MIN_CROSS_CHAIN_AMOUNT = 0.1 ether;
    
    // Events
    event CategoryCreated(
        uint256 indexed categoryId,
        uint256 indexed matchId,
        string title,
        uint256 startTime,
        uint256 endTime,
        bool crossChainEnabled
    );
    
    event VoteCast(
        uint256 indexed categoryId,
        address indexed voter,
        uint256 indexed option,
        uint256 amount,
        uint64 sourceChain
    );
    
    event CategoryResolved(
        uint256 indexed categoryId,
        uint256 correctOption,
        uint256 totalRewardPool
    );
    
    event RewardClaimed(
        uint256 indexed categoryId,
        address indexed voter,
        uint256 amount
    );
    
    event CrossChainVoteSent(
        bytes32 indexed messageId,
        uint64 indexed destinationChain,
        uint256 categoryId,
        address voter,
        uint256 option,
        uint256 amount
    );
    
    event CrossChainVoteReceived(
        bytes32 indexed messageId,
        uint64 indexed sourceChain,
        uint256 categoryId,
        address voter,
        uint256 option,
        uint256 amount
    );

    event MatchResolvedFromVoting(
        uint256 indexed categoryId,
        uint256 indexed matchId,
        uint256 winningOption
    );

    constructor(address _hyperlanebridge) Ownable(msg.sender) {
        hyperlanebridge = HyperlaneChilizBridge(_hyperlanebridge);
    }

    modifier onlyPredictionMarket() {
        require(msg.sender == predictionMarket, "Only prediction market can call");
        _;
    }

    modifier onlyAllowlistedSourceChain(uint256 _sourceChainSelector) {
        require(
            allowlistedSourceChains[_sourceChainSelector],
            "Source chain not allowlisted"
        );
        _;
    }

    modifier onlyAllowlistedDestinationChain(uint256 _destinationChainSelector) {
        require(
            allowlistedDestinationChains[_destinationChainSelector],
            "Destination chain not allowed"
        );
        _;
    }

    /**
     * @dev Crear nueva categoría de votación para un partido
     */
    function createCategoryForMatch(
        uint256 _matchId,
        string memory _title,
        string memory _description,
        uint256 _duration,
        uint256 _minVoteAmount,
        bool _crossChainEnabled
    ) external onlyOwner whenNotPaused {
        require(_matchId > 0, "Invalid match ID");
        require(bytes(_title).length > 0, "Title required");
        require(_duration > 0, "Invalid duration");
        require(_minVoteAmount > 0, "Invalid min vote amount");

        // Obtener opciones de predicción del partido
        string[] memory predictionOptions = IPredictionMarket(predictionMarket).getPredictionOptions(_matchId);
        require(predictionOptions.length > 0, "Match not found or no prediction options");

        uint256 categoryId = nextCategoryId++;
        VotingCategory storage category = categories[categoryId];
        
        category.matchId = _matchId;
        category.title = _title;
        category.description = _description;
        category.options = predictionOptions; // Usar opciones del partido
        category.startTime = block.timestamp;
        category.endTime = block.timestamp + _duration;
        category.minVoteAmount = _minVoteAmount;
        category.active = true;
        category.crossChainEnabled = _crossChainEnabled;

        // Mapear partido a categoría
        matchToCategory[_matchId] = categoryId;

        emit CategoryCreated(
            categoryId,
            _matchId,
            _title,
            category.startTime,
            category.endTime,
            _crossChainEnabled
        );
    }

    /**
     * @dev Votar en una categoría con monto específico
     */
    function voteWithAmount(
        uint256 _categoryId,
        uint256 _option,
        uint256 _amount
    ) external payable nonReentrant whenNotPaused {
        require(msg.value == _amount, "Amount must match msg.value");
        _processVote(_categoryId, msg.sender, _option, _amount, 0); // 0 = local chain
    }

    /**
     * @dev Votar cross-chain
     */
    function voteCrossChain(
        uint256 _categoryId,
        uint256 _option,
        uint256 _destinationChainSelector
    ) external payable nonReentrant whenNotPaused 
        onlyAllowlistedDestinationChain(_destinationChainSelector) {
        
        VotingCategory storage category = categories[_categoryId];
        require(category.active, "Category not active");
        require(category.crossChainEnabled, "Cross-chain not enabled for this category");
        require(msg.value >= MIN_CROSS_CHAIN_AMOUNT, "Insufficient amount for cross-chain vote");
        
        // Crear mensaje para enviar
        CrossChainVoteMessage memory voteMessage = CrossChainVoteMessage({
            categoryId: _categoryId,
            voter: msg.sender,
            option: _option,
            amount: msg.value,
            timestamp: block.timestamp
        });
        
        _sendCrossChainVote(voteMessage, _destinationChainSelector);
    }

    /**
     * @dev Procesar voto (local o cross-chain)
     */
    function _processVote(
        uint256 _categoryId,
        address _voter,
        uint256 _option,
        uint256 _amount,
        uint256 _sourceChain
    ) internal {
        VotingCategory storage category = categories[_categoryId];
        require(category.active, "Category not active");
        require(block.timestamp >= category.startTime, "Voting not started");
        require(block.timestamp <= category.endTime, "Voting ended");
        require(_option < category.options.length, "Invalid option"); // Changed from <= 2 to < category.options.length
        require(_amount >= category.minVoteAmount, "Amount below minimum");

        // Registrar voto
        Vote memory newVote = Vote({
            voter: _voter,
            amount: _amount,
            option: _option,
            timestamp: block.timestamp,
            claimed: false,
            sourceChain: uint64(_sourceChain),
            matchId: category.matchId // Asignar el matchId de la categoría
        });
        
        userVotes[_categoryId][_voter].push(newVote);
        
        // Actualizar estadísticas
        category.totalVotes++;
        category.totalAmount += _amount;
        category.rewardPool += _amount;
        category.optionVotes[_option]++;
        category.optionAmounts[_option] += _amount;
        
        if (_sourceChain != 0) {
            category.chainVotes[uint64(_sourceChain)]++;
            category.chainAmounts[uint64(_sourceChain)] += _amount;
        }
        
        optionStats[_categoryId][_option].votes++;
        optionStats[_categoryId][_option].amount += _amount;
        
        // Calcular porcentajes
        _updatePercentages(_categoryId);
        
        emit VoteCast(_categoryId, _voter, _option, _amount, uint64(_sourceChain));
    }

    /**
     * @dev Resolver categoría automáticamente cuando termina la votación
     * Y comunicar resultado al PredictionMarketCCIP
     */
    function resolveCategoryAndMatch(uint256 _categoryId) external onlyOwner {
        VotingCategory storage category = categories[_categoryId];
        require(category.active, "Category not active");
        require(block.timestamp > category.endTime, "Voting not ended");
        require(!category.resolved, "Already resolved");
        
        // Determinar opción ganadora por votos
        uint256 winningOption = _determineWinningOption(_categoryId);
        require(winningOption < category.options.length, "Invalid winning option"); // Changed from <= 2 to < category.options.length
        
        category.resolved = true;
        category.active = false;
        category.correctOption = winningOption;
        
        // Calcular pool de recompensas (descontando platform fee)
        uint256 platformFee = (category.rewardPool * platformFeePercentage) / BASIS_POINTS;
        category.rewardPool -= platformFee;
        
        emit CategoryResolved(_categoryId, winningOption, category.rewardPool);
        
        // Resolver partido en PredictionMarketCCIP
        if (category.matchId != 0 && predictionMarket != address(0)) {
            // Llamar a la función del contrato de predicciones
            // Esta función debe ser implementada en PredictionMarketCCIP
            emit MatchResolvedFromVoting(_categoryId, category.matchId, winningOption);
        }
    }

    /**
     * @dev Determinar opción ganadora por votos
     */
    function _determineWinningOption(uint256 _categoryId) internal view returns (uint256) {
        VotingCategory storage category = categories[_categoryId];
        
        uint256 maxVotes = 0;
        uint256 winningOption = 0;
        
        for (uint256 i = 0; i < category.options.length; i++) { // Changed from 3 to category.options.length
            if (category.optionVotes[i] > maxVotes) {
                maxVotes = category.optionVotes[i];
                winningOption = i;
            }
        }
        
        return winningOption;
    }

    /**
     * @dev Obtener opción ganadora de una categoría
     */
    function getWinningOption(uint256 _categoryId) external view returns (uint256) {
        VotingCategory storage category = categories[_categoryId];
        require(category.resolved, "Category not resolved");
        return category.correctOption;
    }

    /**
     * @dev Configurar contrato de predicciones
     */
    function setPredictionMarket(address _predictionMarket) external onlyOwner {
        require(_predictionMarket != address(0), "Invalid prediction market address");
        predictionMarket = _predictionMarket;
    }

    /**
     * @dev Enviar voto cross-chain usando Hyperlane
     */
    function _sendCrossChainVote(
        CrossChainVoteMessage memory _voteMessage,
        uint256 _destinationChainSelector
    ) internal {
        bytes memory data = abi.encode(_voteMessage);
        
        // Send message via Hyperlane bridge
        hyperlanebridge.sendToBase{value: msg.value}(
            HyperlaneChilizBridge.MessageType.VOTING_DATA,
            data
        );

        emit CrossChainVoteSent(
            bytes32(0),
            _destinationChainSelector,
            _voteMessage.categoryId,
            _voteMessage.voter,
            _voteMessage.option,
            _voteMessage.amount
        );
    }

    /**
     * @dev Recibir voto cross-chain via Hyperlane
     */
    function processCrossChainVotingData(
        bytes memory data
    ) external {
        require(msg.sender == address(hyperlanebridge), "Only bridge can call");
        
        CrossChainVoteMessage memory voteMessage = abi.decode(
            data,
            (CrossChainVoteMessage)
        );
        
        // Procesar el voto
        _processVote(
            voteMessage.categoryId,
            voteMessage.voter,
            voteMessage.option,
            voteMessage.amount,
            1 // Default source chain
        );
        
        emit CrossChainVoteReceived(
            bytes32(0),
            1,
            voteMessage.categoryId,
            voteMessage.voter,
            voteMessage.option,
            voteMessage.amount
        );
    }

    /**
     * @dev Reclamar recompensas por votos correctos
     */
    function claimRewards(uint256 _categoryId) external nonReentrant {
        VotingCategory storage category = categories[_categoryId];
        require(category.resolved, "Category not resolved");
        
        Vote[] storage votes = userVotes[_categoryId][msg.sender];
        require(votes.length > 0, "No votes found");
        
        uint256 totalReward = 0;
        uint256 correctOptionAmount = category.optionAmounts[category.correctOption];
        require(correctOptionAmount > 0, "No correct votes");
        
        for (uint256 i = 0; i < votes.length; i++) {
            if (!votes[i].claimed && votes[i].option == category.correctOption) {
                uint256 reward = (votes[i].amount * category.rewardPool) / correctOptionAmount;
                totalReward += reward;
                votes[i].claimed = true;
            }
        }
        
        require(totalReward > 0, "No rewards to claim");
        
        userTotalRewards[msg.sender] += totalReward;
        
        (bool success, ) = payable(msg.sender).call{value: totalReward}("");
        require(success, "Transfer failed");
        
        emit RewardClaimed(_categoryId, msg.sender, totalReward);
    }

    /**
     * @dev Actualizar porcentajes de opciones
     */
    function _updatePercentages(uint256 _categoryId) internal {
        VotingCategory storage category = categories[_categoryId];
        
        for (uint256 i = 0; i < category.options.length; i++) { // Changed from 3 to category.options.length
            if (category.totalAmount > 0) {
                optionStats[_categoryId][i].percentage = 
                    (category.optionAmounts[i] * 100) / category.totalAmount;
            }
        }
    }

    /**
     * @dev Configurar chains permitidas
     */
    function allowlistSourceChain(
        uint256 _sourceChainSelector,
        bool allowed
    ) external onlyOwner {
        allowlistedSourceChains[_sourceChainSelector] = allowed;
    }
    
    function allowlistDestinationChain(
        uint256 _destinationChainSelector,
        bool allowed
    ) external onlyOwner {
        allowlistedDestinationChains[_destinationChainSelector] = allowed;
    }

    /**
     * @dev Obtener información de categoría
     */
    function getCategory(uint256 _categoryId)
        external
        view
        returns (
            uint256 matchId,
            string memory title,
            string memory description,
            string[] memory options,
            uint256 startTime,
            uint256 endTime,
            uint256 totalVotes,
            uint256 totalAmount,
            bool resolved,
            bool active,
            bool crossChainEnabled
        )
    {
        VotingCategory storage category = categories[_categoryId];
        return (
            category.matchId,
            category.title,
            category.description,
            category.options,
            category.startTime,
            category.endTime,
            category.totalVotes,
            category.totalAmount,
            category.resolved,
            category.active,
            category.crossChainEnabled
        );
    }

    /**
     * @dev Obtener estadísticas de opción
     */
    function getOptionStats(uint256 _categoryId, uint256 _option)
        external
        view
        returns (VoteStats memory)
    {
        return optionStats[_categoryId][_option];
    }

    /**
     * @dev Obtener votos de usuario
     */
    function getUserVotes(uint256 _categoryId, address _user)
        external
        view
        returns (Vote[] memory)
    {
        return userVotes[_categoryId][_user];
    }

    /**
     * @dev Obtener información de votación para un partido
     */
    function getVotingInfoForMatch(uint256 _matchId) 
        external 
        view 
        returns (
            uint256 categoryId,
            string memory title,
            string[] memory options,
            uint256 startTime,
            uint256 endTime,
            uint256 totalVotes,
            uint256 totalAmount,
            bool active,
            bool resolved
        ) 
    {
        categoryId = matchToCategory[_matchId];
        if (categoryId == 0) {
            return (0, "", new string[](0), 0, 0, 0, 0, false, false);
        }
        
        VotingCategory storage category = categories[categoryId];
        return (
            categoryId,
            category.title,
            category.options,
            category.startTime,
            category.endTime,
            category.totalVotes,
            category.totalAmount,
            category.active,
            category.resolved
        );
    }

    /**
     * @dev Obtener estadísticas de votación para un partido
     */
    function getVotingStatsForMatch(uint256 _matchId) 
        external 
        view 
        returns (
            uint256[] memory optionVotes,
            uint256[] memory optionAmounts,
            uint256[] memory optionPercentages
        ) 
    {
        uint256 categoryId = matchToCategory[_matchId];
        require(categoryId > 0, "No voting category found for this match");
        
        VotingCategory storage category = categories[categoryId];
        uint256 numOptions = category.options.length;
        
        optionVotes = new uint256[](numOptions);
        optionAmounts = new uint256[](numOptions);
        optionPercentages = new uint256[](numOptions);
        
        for (uint256 i = 0; i < numOptions; i++) {
            optionVotes[i] = category.optionVotes[i];
            optionAmounts[i] = category.optionAmounts[i];
            
            if (category.totalAmount > 0) {
                optionPercentages[i] = (category.optionAmounts[i] * 100) / category.totalAmount;
            }
        }
        
        return (optionVotes, optionAmounts, optionPercentages);
    }

    /**
     * @dev Obtener categoría por ID de partido
     */
    function getCategoryByMatch(uint256 _matchId) external view returns (uint256) {
        return matchToCategory[_matchId];
    }

    /**
     * @dev Retirar fees de plataforma
     */
    function withdrawPlatformFees() external onlyOwner {
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