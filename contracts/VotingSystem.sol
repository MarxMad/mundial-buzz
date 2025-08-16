// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title VotingSystem
 * @dev Sistema de votación on-chain para predicciones del Mundial
 * Los usuarios pueden votar en diferentes categorías usando CHZ tokens
 */
contract VotingSystem is ReentrancyGuard, Ownable, Pausable {
    struct Vote {
        address voter;
        uint256 amount;
        uint256 option;
        uint256 timestamp;
        bool claimed;
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
    }

    struct VoteStats {
        uint256 votes;
        uint256 amount;
        uint256 percentage;
    }

    mapping(uint256 => VotingCategory) public categories;
    mapping(uint256 => mapping(uint256 => VoteStats)) public optionStats; // categoryId => optionId => stats
    mapping(uint256 => mapping(address => Vote[])) public userVotes; // categoryId => user => votes
    mapping(address => uint256) public userTotalRewards;
    
    uint256 public nextCategoryId;
    uint256 public platformFeePercentage = 500; // 5%
    uint256 public constant BASIS_POINTS = 10000;
    
    event CategoryCreated(
        uint256 indexed categoryId,
        string title,
        uint256 startTime,
        uint256 endTime
    );
    
    event VoteCast(
        uint256 indexed categoryId,
        address indexed voter,
        uint256 option,
        uint256 amount
    );
    
    event CategoryResolved(
        uint256 indexed categoryId,
        uint256 correctOption,
        uint256 totalRewards
    );
    
    event RewardClaimed(
        address indexed user,
        uint256 indexed categoryId,
        uint256 amount
    );
    
    event RewardPoolAdded(
        uint256 indexed categoryId,
        uint256 amount
    );

    constructor() {
        // Crear categorías iniciales para el Mundial 2026
        _createInitialCategories();
    }

    /**
     * @dev Crear nueva categoría de votación
     */
    function createCategory(
        string memory _title,
        string memory _description,
        string[] memory _options,
        uint256 _startTime,
        uint256 _endTime,
        uint256 _minVoteAmount
    ) external onlyOwner returns (uint256) {
        require(_options.length >= 2, "Need at least 2 options");
        require(_startTime < _endTime, "Invalid time range");
        require(_endTime > block.timestamp, "End time must be in future");
        
        uint256 categoryId = nextCategoryId++;
        
        categories[categoryId] = VotingCategory({
            title: _title,
            description: _description,
            options: _options,
            startTime: _startTime,
            endTime: _endTime,
            totalVotes: 0,
            totalAmount: 0,
            correctOption: 0,
            resolved: false,
            active: true,
            minVoteAmount: _minVoteAmount,
            rewardPool: 0
        });
        
        emit CategoryCreated(categoryId, _title, _startTime, _endTime);
        return categoryId;
    }

    /**
     * @dev Votar en una categoría
     */
    function vote(
        uint256 _categoryId,
        uint256 _option
    ) external payable nonReentrant whenNotPaused {
        VotingCategory storage category = categories[_categoryId];
        
        require(category.active, "Category not active");
        require(block.timestamp >= category.startTime, "Voting not started");
        require(block.timestamp <= category.endTime, "Voting ended");
        require(_option < category.options.length, "Invalid option");
        require(msg.value >= category.minVoteAmount, "Amount below minimum");
        
        // Crear voto
        Vote memory newVote = Vote({
            voter: msg.sender,
            amount: msg.value,
            option: _option,
            timestamp: block.timestamp,
            claimed: false
        });
        
        userVotes[_categoryId][msg.sender].push(newVote);
        
        // Actualizar estadísticas
        category.totalVotes++;
        category.totalAmount += msg.value;
        
        optionStats[_categoryId][_option].votes++;
        optionStats[_categoryId][_option].amount += msg.value;
        
        // Calcular porcentajes
        _updatePercentages(_categoryId);
        
        // Agregar al reward pool (menos fee de plataforma)
        uint256 platformFee = (msg.value * platformFeePercentage) / BASIS_POINTS;
        uint256 rewardAmount = msg.value - platformFee;
        category.rewardPool += rewardAmount;
        
        emit VoteCast(_categoryId, msg.sender, _option, msg.value);
    }

    /**
     * @dev Resolver categoría con la opción correcta
     */
    function resolveCategory(
        uint256 _categoryId,
        uint256 _correctOption
    ) external onlyOwner {
        VotingCategory storage category = categories[_categoryId];
        
        require(category.active, "Category not active");
        require(block.timestamp > category.endTime, "Voting still active");
        require(!category.resolved, "Already resolved");
        require(_correctOption < category.options.length, "Invalid option");
        
        category.correctOption = _correctOption;
        category.resolved = true;
        
        emit CategoryResolved(_categoryId, _correctOption, category.rewardPool);
    }

    /**
     * @dev Reclamar rewards por votos correctos
     */
    function claimRewards(uint256 _categoryId) external nonReentrant {
        VotingCategory storage category = categories[_categoryId];
        require(category.resolved, "Category not resolved");
        
        Vote[] storage votes = userVotes[_categoryId][msg.sender];
        require(votes.length > 0, "No votes found");
        
        uint256 totalReward = 0;
        uint256 correctOptionAmount = optionStats[_categoryId][category.correctOption].amount;
        
        for (uint256 i = 0; i < votes.length; i++) {
            if (!votes[i].claimed && votes[i].option == category.correctOption) {
                // Calcular reward proporcional
                uint256 reward = (votes[i].amount * category.rewardPool) / correctOptionAmount;
                totalReward += reward;
                votes[i].claimed = true;
            }
        }
        
        require(totalReward > 0, "No rewards to claim");
        
        userTotalRewards[msg.sender] += totalReward;
        
        // Transferir rewards
        (bool success, ) = payable(msg.sender).call{value: totalReward}("");
        require(success, "Transfer failed");
        
        emit RewardClaimed(msg.sender, _categoryId, totalReward);
    }

    /**
     * @dev Agregar CHZ al reward pool de una categoría
     */
    function addRewardPool(uint256 _categoryId) external payable {
        require(msg.value > 0, "No amount sent");
        require(categories[_categoryId].active, "Category not active");
        
        categories[_categoryId].rewardPool += msg.value;
        
        emit RewardPoolAdded(_categoryId, msg.value);
    }

    /**
     * @dev Obtener información de una categoría
     */
    function getCategoryInfo(uint256 _categoryId)
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
            uint256 rewardPool
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
            category.rewardPool
        );
    }

    /**
     * @dev Obtener estadísticas de una opción
     */
    function getOptionStats(uint256 _categoryId, uint256 _option)
        external
        view
        returns (uint256 votes, uint256 amount, uint256 percentage)
    {
        VoteStats storage stats = optionStats[_categoryId][_option];
        return (stats.votes, stats.amount, stats.percentage);
    }

    /**
     * @dev Obtener votos de un usuario en una categoría
     */
    function getUserVotes(uint256 _categoryId, address _user)
        external
        view
        returns (Vote[] memory)
    {
        return userVotes[_categoryId][_user];
    }

    /**
     * @dev Calcular rewards pendientes de un usuario
     */
    function getPendingRewards(uint256 _categoryId, address _user)
        external
        view
        returns (uint256)
    {
        VotingCategory storage category = categories[_categoryId];
        if (!category.resolved) return 0;
        
        Vote[] storage votes = userVotes[_categoryId][_user];
        uint256 totalReward = 0;
        uint256 correctOptionAmount = optionStats[_categoryId][category.correctOption].amount;
        
        if (correctOptionAmount == 0) return 0;
        
        for (uint256 i = 0; i < votes.length; i++) {
            if (!votes[i].claimed && votes[i].option == category.correctOption) {
                uint256 reward = (votes[i].amount * category.rewardPool) / correctOptionAmount;
                totalReward += reward;
            }
        }
        
        return totalReward;
    }

    /**
     * @dev Actualizar porcentajes de votación
     */
    function _updatePercentages(uint256 _categoryId) internal {
        VotingCategory storage category = categories[_categoryId];
        
        for (uint256 i = 0; i < category.options.length; i++) {
            if (category.totalAmount > 0) {
                optionStats[_categoryId][i].percentage = 
                    (optionStats[_categoryId][i].amount * BASIS_POINTS) / category.totalAmount;
            }
        }
    }

    /**
     * @dev Crear categorías iniciales para el Mundial 2026
     */
    function _createInitialCategories() internal {
        // Campeón del Mundial
        string[] memory championOptions = new string[](8);
        championOptions[0] = "Brasil";
        championOptions[1] = "Argentina";
        championOptions[2] = "Francia";
        championOptions[3] = "España";
        championOptions[4] = "Inglaterra";
        championOptions[5] = "Alemania";
        championOptions[6] = "Países Bajos";
        championOptions[7] = "Otro";
        
        categories[0] = VotingCategory({
            title: "Campeón del Mundial 2026",
            description: "¿Qué selección ganará la Copa del Mundo FIFA 2026?",
            options: championOptions,
            startTime: block.timestamp,
            endTime: block.timestamp + 365 days, // 1 año
            totalVotes: 0,
            totalAmount: 0,
            correctOption: 0,
            resolved: false,
            active: true,
            minVoteAmount: 0.1 ether,
            rewardPool: 0
        });
        
        // Máximo Goleador
        string[] memory scorerOptions = new string[](6);
        scorerOptions[0] = "Kylian Mbappé";
        scorerOptions[1] = "Erling Haaland";
        scorerOptions[2] = "Lionel Messi";
        scorerOptions[3] = "Vinícius Jr.";
        scorerOptions[4] = "Harry Kane";
        scorerOptions[5] = "Otro";
        
        categories[1] = VotingCategory({
            title: "Máximo Goleador del Mundial 2026",
            description: "¿Quién será el máximo goleador del torneo?",
            options: scorerOptions,
            startTime: block.timestamp,
            endTime: block.timestamp + 365 days,
            totalVotes: 0,
            totalAmount: 0,
            correctOption: 0,
            resolved: false,
            active: true,
            minVoteAmount: 0.05 ether,
            rewardPool: 0
        });
        
        nextCategoryId = 2;
    }

    /**
     * @dev Configurar fee de plataforma
     */
    function setPlatformFee(uint256 _feePercentage) external onlyOwner {
        require(_feePercentage <= 1000, "Fee too high"); // Max 10%
        platformFeePercentage = _feePercentage;
    }

    /**
     * @dev Retirar fees de plataforma
     */
    function withdrawPlatformFees() external onlyOwner {
        uint256 balance = address(this).balance;
        uint256 totalRewardPools = 0;
        
        // Calcular total en reward pools
        for (uint256 i = 0; i < nextCategoryId; i++) {
            if (categories[i].active && !categories[i].resolved) {
                totalRewardPools += categories[i].rewardPool;
            }
        }
        
        uint256 availableFees = balance - totalRewardPools;
        require(availableFees > 0, "No fees to withdraw");
        
        (bool success, ) = payable(owner()).call{value: availableFees}("");
        require(success, "Transfer failed");
    }

    /**
     * @dev Pausar/despausar contrato
     */
    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    /**
     * @dev Desactivar categoría
     */
    function deactivateCategory(uint256 _categoryId) external onlyOwner {
        categories[_categoryId].active = false;
    }
}