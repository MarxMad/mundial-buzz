// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";

/**
 * @title StakingPool
 * @dev Sistema de staking seguro para participación en predicciones deportivas
 * Los usuarios hacen stake de CHZ para participar en la plataforma
 */
contract StakingPool is ReentrancyGuard, Ownable, Pausable {
    using SafeMath for uint256;
    
    struct Staker {
        uint256 stakedAmount;
        uint256 stakingTimestamp;
        uint256 lastRewardClaim;
        uint256 totalRewardsClaimed;
        bool isActive;
    }
    
    struct StakingTier {
        uint256 minAmount;
        uint256 multiplier;
        string name;
    }
    
    // Mapeo de usuarios a información de staking
    mapping(address => Staker) public stakers;
    
    // Tiers de staking con multiplicadores
    StakingTier[] public stakingTiers;
    
    // Configuración
    uint256 public minStakeAmount = 100 * 10**18; // 100 CHZ mínimo (actualizado)
    uint256 public stakingPeriod = 7 days; // Período mínimo de lock
    uint256 public rewardRate = 500; // 5% APY base
    uint256 public totalStaked;
    uint256 public totalRewardsDistributed;
    
    // Events
    event Staked(address indexed user, uint256 amount, uint256 timestamp);
    event Unstaked(address indexed user, uint256 amount, uint256 timestamp);
    event RewardsClaimed(address indexed user, uint256 amount);
    event StakingTierUpdated(uint256 tierIndex, uint256 minAmount, uint256 multiplier);
    
    constructor() Ownable(msg.sender) {
        // Inicializar tiers de staking (actualizados para coincidir con frontend)
        stakingTiers.push(StakingTier({
            minAmount: 100 * 10**18,   // 100 CHZ
            multiplier: 100,            // 1x
            name: "Bronze"
        }));
        
        stakingTiers.push(StakingTier({
            minAmount: 500 * 10**18,   // 500 CHZ
            multiplier: 120,            // 1.2x
            name: "Silver"
        }));
        
        stakingTiers.push(StakingTier({
            minAmount: 1000 * 10**18,  // 1000 CHZ
            multiplier: 150,            // 1.5x
            name: "Gold"
        }));
        
        stakingTiers.push(StakingTier({
            minAmount: 2500 * 10**18,  // 2500 CHZ
            multiplier: 200,            // 2x
            name: "Platinum"
        }));
    }
    
    /**
     * @dev Hacer stake de CHZ
     */
    function stake() external payable nonReentrant whenNotPaused {
        require(msg.value >= minStakeAmount, "Amount below minimum stake");
        require(!stakers[msg.sender].isActive, "Already staked");
        
        Staker storage staker = stakers[msg.sender];
        staker.stakedAmount = msg.value;
        staker.stakingTimestamp = block.timestamp;
        staker.lastRewardClaim = block.timestamp;
        staker.isActive = true;
        
        totalStaked = totalStaked.add(msg.value);
        
        emit Staked(msg.sender, msg.value, block.timestamp);
    }
    
    /**
     * @dev Retirar stake (después del período de lock)
     */
    function unstake() external nonReentrant {
        Staker storage staker = stakers[msg.sender];
        require(staker.isActive, "Not staked");
        require(
            block.timestamp >= staker.stakingTimestamp.add(stakingPeriod),
            "Staking period not completed"
        );
        
        // Guardar valores antes de resetear
        uint256 stakedAmount = staker.stakedAmount;
        
        // Calcular recompensas pendientes
        uint256 pendingRewards = calculateRewards(msg.sender);
        uint256 totalToReturn = stakedAmount.add(pendingRewards);
        
        // Resetear staker
        staker.isActive = false;
        staker.stakedAmount = 0;
        staker.stakingTimestamp = 0;
        staker.lastRewardClaim = 0;
        
        // Actualizar totales (CORREGIDO)
        totalStaked = totalStaked.sub(stakedAmount);
        totalRewardsDistributed = totalRewardsDistributed.add(pendingRewards);
        
        // Transferir fondos
        (bool success, ) = payable(msg.sender).call{value: totalToReturn}("");
        require(success, "Transfer failed");
        
        emit Unstaked(msg.sender, stakedAmount, block.timestamp);
        if (pendingRewards > 0) {
            emit RewardsClaimed(msg.sender, pendingRewards);
        }
    }
    
    /**
     * @dev Reclamar recompensas sin retirar stake
     */
    function claimRewards() external nonReentrant {
        Staker storage staker = stakers[msg.sender];
        require(staker.isActive, "Not staked");
        
        uint256 pendingRewards = calculateRewards(msg.sender);
        require(pendingRewards > 0, "No rewards to claim");
        
        staker.lastRewardClaim = block.timestamp;
        staker.totalRewardsClaimed = staker.totalRewardsClaimed.add(pendingRewards);
        totalRewardsDistributed = totalRewardsDistributed.add(pendingRewards);
        
        (bool success, ) = payable(msg.sender).call{value: pendingRewards}("");
        require(success, "Transfer failed");
        
        emit RewardsClaimed(msg.sender, pendingRewards);
    }
    
    /**
     * @dev Calcular recompensas pendientes (CORREGIDO)
     */
    function calculateRewards(address _user) public view returns (uint256) {
        Staker storage staker = stakers[_user];
        if (!staker.isActive || staker.stakedAmount == 0) return 0;
        
        uint256 timeStaked = block.timestamp.sub(staker.lastRewardClaim);
        
        // Calcular recompensas por día (CORREGIDO)
        uint256 daysStaked = timeStaked.div(1 days);
        if (daysStaked == 0) return 0;
        
        // Obtener multiplicador del tier
        uint256 tierMultiplier = getTierMultiplier(staker.stakedAmount);
        
        // Calcular recompensas diarias (CORREGIDO)
        // rewardRate = 500 (5%) / 365 días = ~0.0137% por día
        uint256 dailyRewardRate = rewardRate.div(365);
        uint256 baseReward = staker.stakedAmount.mul(dailyRewardRate).mul(daysStaked).div(10000);
        uint256 totalReward = baseReward.mul(tierMultiplier).div(100);
        
        return totalReward;
    }
    
    /**
     * @dev Obtener multiplicador del tier basado en cantidad staked
     */
    function getTierMultiplier(uint256 _stakedAmount) public view returns (uint256) {
        for (uint256 i = stakingTiers.length - 1; i >= 0; i--) {
            if (_stakedAmount >= stakingTiers[i].minAmount) {
                return stakingTiers[i].multiplier;
            }
        }
        return 100; // Default 1x
    }
    
    /**
     * @dev Obtener tier del usuario (CORREGIDO)
     */
    function getUserTier(address _user) external view returns (string memory) {
        Staker storage staker = stakers[_user];
        if (!staker.isActive) return "None";
        
        // Buscar el tier más alto que el usuario califique
        for (uint256 i = stakingTiers.length - 1; i >= 0; i--) {
            if (staker.stakedAmount >= stakingTiers[i].minAmount) {
                return stakingTiers[i].name;
            }
        }
        
        return "None";
    }
    
    /**
     * @dev Obtener información completa del staker
     */
    function getStakerInfo(address _user) external view returns (
        uint256 stakedAmount,
        uint256 stakingTimestamp,
        uint256 lastRewardClaim,
        uint256 totalRewardsClaimed,
        bool isActive,
        uint256 pendingRewards,
        string memory tierName,
        uint256 tierMultiplier
    ) {
        Staker storage staker = stakers[_user];
        return (
            staker.stakedAmount,
            staker.stakingTimestamp,
            staker.lastRewardClaim,
            staker.totalRewardsClaimed,
            staker.isActive,
            calculateRewards(_user),
            getUserTier(_user),
            getTierMultiplier(staker.stakedAmount)
        );
    }
    
    /**
     * @dev Verificar si usuario tiene stake mínimo
     */
    function isUserStaked(address _user) external view returns (bool) {
        return stakers[_user].isActive && stakers[_user].stakedAmount >= minStakeAmount;
    }
    
    /**
     * @dev Obtener stake del usuario
     */
    function getUserStake(address _user) external view returns (uint256) {
        return stakers[_user].stakedAmount;
    }
    
    /**
     * @dev Obtener información de tier
     */
    function getStakingTier(uint256 _tierIndex) external view returns (
        uint256 minAmount,
        uint256 multiplier,
        string memory name
    ) {
        require(_tierIndex < stakingTiers.length, "Invalid tier index");
        StakingTier storage tier = stakingTiers[_tierIndex];
        return (tier.minAmount, tier.multiplier, tier.name);
    }
    
    /**
     * @dev Configurar tier de staking (solo owner)
     */
    function setStakingTier(
        uint256 _tierIndex,
        uint256 _minAmount,
        uint256 _multiplier,
        string memory _name
    ) external onlyOwner {
        require(_tierIndex < stakingTiers.length, "Invalid tier index");
        require(_multiplier >= 100, "Multiplier must be >= 100");
        
        stakingTiers[_tierIndex] = StakingTier({
            minAmount: _minAmount,
            multiplier: _multiplier,
            name: _name
        });
        
        emit StakingTierUpdated(_tierIndex, _minAmount, _multiplier);
    }
    
    /**
     * @dev Configurar parámetros de staking (solo owner)
     */
    function setStakingParams(
        uint256 _minStakeAmount,
        uint256 _stakingPeriod,
        uint256 _rewardRate
    ) external onlyOwner {
        require(_minStakeAmount > 0, "Min stake amount must be > 0");
        require(_stakingPeriod > 0, "Staking period must be > 0");
        require(_rewardRate > 0, "Reward rate must be > 0");
        
        minStakeAmount = _minStakeAmount;
        stakingPeriod = _stakingPeriod;
        rewardRate = _rewardRate;
    }
    
    /**
     * @dev Retirar fees acumuladas (solo owner)
     */
    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        uint256 availableFees = balance.sub(totalStaked);
        require(availableFees > 0, "No fees to withdraw");
        
        (bool success, ) = payable(owner()).call{value: availableFees}("");
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