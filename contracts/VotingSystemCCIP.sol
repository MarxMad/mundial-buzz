// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "./HyperlaneChilizBridge.sol";

/**
 * @title VotingSystemCCIP
 * @dev Sistema de votación cross-chain usando Chainlink CCIP
 * Permite votaciones distribuidas entre múltiples chains
 */
contract VotingSystemCCIP is ReentrancyGuard, Ownable, Pausable {
    
    struct Vote {
        address voter;
        uint256 amount;
        uint256 option;
        uint256 timestamp;
        bool claimed;
        uint64 sourceChain; // Chain donde se originó el voto
    }

    struct VotingCategory {
        string title;
        string description;
        string[] options;
        uint256 startTime;
        uint256 endTime;
        uint256 totalVotes;
        uint256 totalAmount;
        uint256 correctOption;
        bool resolved;
        bool active;
        uint256 minVoteAmount;
        uint256 rewardPool;
        bool crossChainEnabled; // Si permite votos cross-chain
        mapping(uint64 => uint256) chainVotes; // Votos por chain
        mapping(uint64 => uint256) chainAmounts; // Amounts por chain
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
    mapping(bytes32 => bool) public processedMessages; // Para evitar duplicados
    
    uint256 public nextCategoryId;
    uint256 public platformFeePercentage = 500; // 5%
    uint256 public constant BASIS_POINTS = 10000;
    uint256 public constant MIN_CROSS_CHAIN_AMOUNT = 0.1 ether;
    
    // Events
    event CategoryCreated(
        uint256 indexed categoryId,
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

    constructor(address _hyperlanebridge) {
        hyperlanebridge = HyperlaneChilizBridge(_hyperlanebridge);
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
            "Destination chain not allowlisted"
        );
        _;
    }

    /**
     * @dev Crear nueva categoría de votación
     */
    function createCategory(
        string memory _title,
        string memory _description,
        string[] memory _options,
        uint256 _duration,
        uint256 _minVoteAmount,
        bool _crossChainEnabled
    ) external onlyOwner whenNotPaused {
        require(_options.length >= 2 && _options.length <= 10, "Invalid options count");
        require(_duration > 0, "Invalid duration");
        require(_minVoteAmount > 0, "Invalid min vote amount");

        uint256 categoryId = nextCategoryId++;
        VotingCategory storage category = categories[categoryId];
        
        category.title = _title;
        category.description = _description;
        category.options = _options;
        category.startTime = block.timestamp;
        category.endTime = block.timestamp + _duration;
        category.minVoteAmount = _minVoteAmount;
        category.active = true;
        category.crossChainEnabled = _crossChainEnabled;

        emit CategoryCreated(
            categoryId,
            _title,
            category.startTime,
            category.endTime,
            _crossChainEnabled
        );
    }

    /**
     * @dev Votar en una categoría (local)
     */
    function vote(
        uint256 _categoryId,
        uint256 _option
    ) external payable nonReentrant whenNotPaused {
        _processVote(_categoryId, msg.sender, _option, msg.value, 0); // 0 = local chain
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
        require(_option < category.options.length, "Invalid option");
        require(_amount >= category.minVoteAmount, "Amount below minimum");

        // Registrar voto
        Vote memory newVote = Vote({
            voter: _voter,
            amount: _amount,
            option: _option,
            timestamp: block.timestamp,
            claimed: false,
            sourceChain: uint64(_sourceChain)
        });
        
        userVotes[_categoryId][_voter].push(newVote);
        
        // Actualizar estadísticas
        category.totalVotes++;
        category.totalAmount += _amount;
        category.rewardPool += _amount;
        
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
     * @dev Enviar voto cross-chain usando CCIP
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
     * @dev Recibir voto cross-chain via CCIP
     */
    /**
     * @dev Process cross-chain voting data received via Hyperlane
     * This function would be called by the HyperlaneChilizBridge contract
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
     * @dev Resolver categoría de votación
     */
    function resolveCategory(
        uint256 _categoryId,
        uint256 _correctOption
    ) external onlyOwner {
        VotingCategory storage category = categories[_categoryId];
        require(category.active, "Category not active");
        require(block.timestamp > category.endTime, "Voting not ended");
        require(!category.resolved, "Already resolved");
        require(_correctOption < category.options.length, "Invalid option");
        
        category.resolved = true;
        category.active = false;
        category.correctOption = _correctOption;
        
        // Calcular pool de recompensas (descontando platform fee)
        uint256 platformFee = (category.rewardPool * platformFeePercentage) / BASIS_POINTS;
        category.rewardPool -= platformFee;
        
        emit CategoryResolved(_categoryId, _correctOption, category.rewardPool);
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
        uint256 correctOptionAmount = optionStats[_categoryId][category.correctOption].amount;
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
        
        for (uint256 i = 0; i < category.options.length; i++) {
            if (category.totalAmount > 0) {
                optionStats[_categoryId][i].percentage = 
                    (optionStats[_categoryId][i].amount * 100) / category.totalAmount;
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