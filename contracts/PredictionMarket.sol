// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title PredictionMarket
 * @dev Smart contract para mercados de predicción del Mundial FIFA 2026
 * Permite crear mercados, apostar y distribuir recompensas
 */
contract PredictionMarket is ReentrancyGuard, Ownable, Pausable {
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
        mapping(uint256 => uint256) optionPools; // option => total CHZ
        mapping(address => mapping(uint256 => uint256)) userBets; // user => option => amount
        mapping(address => bool) hasClaimed;
    }

    enum MarketStatus {
        Active,
        Closed,
        Resolved,
        Cancelled
    }

    mapping(uint256 => Market) public markets;
    mapping(address => uint256[]) public userMarkets;
    uint256 public nextMarketId = 1;
    uint256 public platformFee = 250; // 2.5% in basis points
    uint256 public constant MAX_OPTIONS = 10;
    uint256 public constant MIN_MARKET_DURATION = 1 hours;
    uint256 public constant MAX_CREATOR_FEE = 500; // 5% max

    event MarketCreated(
        uint256 indexed marketId,
        address indexed creator,
        string title,
        uint256 endTime
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
        uint256 totalPool
    );

    event RewardClaimed(
        uint256 indexed marketId,
        address indexed user,
        uint256 amount
    );

    constructor() {}

    /**
     * @dev Crear un nuevo mercado de predicción
     */
    function createMarket(
        string memory _title,
        string memory _description,
        string[] memory _options,
        uint256 _duration,
        uint256 _creatorFee
    ) external payable whenNotPaused {
        require(_options.length >= 2 && _options.length <= MAX_OPTIONS, "Invalid options count");
        require(_duration >= MIN_MARKET_DURATION, "Duration too short");
        require(_creatorFee <= MAX_CREATOR_FEE, "Creator fee too high");
        require(msg.value >= 0.01 ether, "Minimum creation fee required");

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

        userMarkets[msg.sender].push(marketId);

        emit MarketCreated(marketId, msg.sender, _title, market.endTime);
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
     * @dev Resolver un mercado (solo el creador)
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

        market.status = MarketStatus.Resolved;
        market.winningOption = _winningOption;

        emit MarketResolved(_marketId, _winningOption, market.totalPool);
    }

    /**
     * @dev Reclamar recompensas
     */
    function claimReward(uint256 _marketId) external nonReentrant {
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

        (bool success, ) = payable(msg.sender).call{value: reward}("");
        require(success, "Transfer failed");

        emit RewardClaimed(_marketId, msg.sender, reward);
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
            string[] memory options
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
            market.options
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
     * @dev Obtener apuesta del usuario
     */
    function getUserBet(uint256 _marketId, address _user, uint256 _option) 
        external 
        view 
        returns (uint256) 
    {
        return markets[_marketId].userBets[_user][_option];
    }

    /**
     * @dev Retirar fees (solo owner)
     */
    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
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
     * @dev Actualizar platform fee
     */
    function setPlatformFee(uint256 _newFee) external onlyOwner {
        require(_newFee <= 1000, "Fee too high"); // Max 10%
        platformFee = _newFee;
    }
}