// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";

/**
 * @title StakingPool
 * @dev Contrato para staking de CHZ tokens con rewards
 * Los usuarios pueden hacer stake de CHZ y ganar rewards por participar
 */
contract StakingPool is ReentrancyGuard, Ownable, Pausable {
    struct UserStake {
        uint256 amount;
        uint256 rewardDebt;
        uint256 lastStakeTime;
        uint256 lockEndTime;
    }

    struct PoolInfo {
        uint256 totalStaked;
        uint256 rewardPerSecond;
        uint256 lastRewardTime;
        uint256 accRewardPerShare;
        uint256 lockDuration;
        uint256 minStakeAmount;
    }

    mapping(address => UserStake) public userStakes;
    mapping(address => uint256) public userRewardsClaimed;
    
    PoolInfo public poolInfo;
    uint256 public constant PRECISION = 1e12;
    uint256 public totalRewardsDistributed;
    uint256 public rewardBalance;
    
    // Multipliers para diferentes períodos de lock
    mapping(uint256 => uint256) public lockMultipliers; // duration => multiplier (basis points)
    
    event Staked(address indexed user, uint256 amount, uint256 lockDuration);
    event Unstaked(address indexed user, uint256 amount);
    event RewardClaimed(address indexed user, uint256 amount);
    event RewardsAdded(uint256 amount);
    event EmergencyWithdraw(address indexed user, uint256 amount);

    constructor(
        uint256 _rewardPerSecond,
        uint256 _lockDuration,
        uint256 _minStakeAmount
    ) {
        poolInfo = PoolInfo({
            totalStaked: 0,
            rewardPerSecond: _rewardPerSecond,
            lastRewardTime: block.timestamp,
            accRewardPerShare: 0,
            lockDuration: _lockDuration,
            minStakeAmount: _minStakeAmount
        });
        
        // Configurar multipliers por defecto
        lockMultipliers[7 days] = 10000;    // 1x (100%)
        lockMultipliers[30 days] = 12000;   // 1.2x (120%)
        lockMultipliers[90 days] = 15000;   // 1.5x (150%)
        lockMultipliers[180 days] = 20000;  // 2x (200%)
    }

    /**
     * @dev Actualizar pool rewards
     */
    function updatePool() public {
        if (block.timestamp <= poolInfo.lastRewardTime) {
            return;
        }
        
        if (poolInfo.totalStaked == 0) {
            poolInfo.lastRewardTime = block.timestamp;
            return;
        }
        
        uint256 timeElapsed = block.timestamp - poolInfo.lastRewardTime;
        uint256 reward = timeElapsed * poolInfo.rewardPerSecond;
        
        // Solo agregar rewards si hay balance disponible
        if (reward > rewardBalance) {
            reward = rewardBalance;
        }
        
        if (reward > 0) {
            poolInfo.accRewardPerShare += (reward * PRECISION) / poolInfo.totalStaked;
            rewardBalance -= reward;
            totalRewardsDistributed += reward;
        }
        
        poolInfo.lastRewardTime = block.timestamp;
    }

    /**
     * @dev Hacer stake de CHZ tokens
     */
    function stake(uint256 _lockDuration) external payable nonReentrant whenNotPaused {
        require(msg.value >= poolInfo.minStakeAmount, "Amount below minimum");
        require(lockMultipliers[_lockDuration] > 0, "Invalid lock duration");
        
        updatePool();
        
        UserStake storage user = userStakes[msg.sender];
        
        // Si el usuario ya tiene stake, reclamar rewards pendientes
        if (user.amount > 0) {
            uint256 pending = (user.amount * poolInfo.accRewardPerShare) / PRECISION - user.rewardDebt;
            if (pending > 0) {
                _safeTransfer(msg.sender, pending);
                userRewardsClaimed[msg.sender] += pending;
                emit RewardClaimed(msg.sender, pending);
            }
        }
        
        // Aplicar multiplier basado en lock duration
        uint256 effectiveAmount = (msg.value * lockMultipliers[_lockDuration]) / 10000;
        
        user.amount += effectiveAmount;
        user.lastStakeTime = block.timestamp;
        user.lockEndTime = block.timestamp + _lockDuration;
        user.rewardDebt = (user.amount * poolInfo.accRewardPerShare) / PRECISION;
        
        poolInfo.totalStaked += effectiveAmount;
        
        emit Staked(msg.sender, msg.value, _lockDuration);
    }

    /**
     * @dev Retirar stake y rewards
     */
    function unstake(uint256 _amount) external nonReentrant {
        UserStake storage user = userStakes[msg.sender];
        require(user.amount >= _amount, "Insufficient staked amount");
        require(block.timestamp >= user.lockEndTime, "Tokens still locked");
        
        updatePool();
        
        // Calcular rewards pendientes
        uint256 pending = (user.amount * poolInfo.accRewardPerShare) / PRECISION - user.rewardDebt;
        
        user.amount -= _amount;
        user.rewardDebt = (user.amount * poolInfo.accRewardPerShare) / PRECISION;
        poolInfo.totalStaked -= _amount;
        
        // Transferir stake original (sin multiplier)
        uint256 originalAmount = (_amount * 10000) / lockMultipliers[user.lockEndTime - user.lastStakeTime];
        _safeTransfer(msg.sender, originalAmount);
        
        // Transferir rewards si hay
        if (pending > 0) {
            _safeTransfer(msg.sender, pending);
            userRewardsClaimed[msg.sender] += pending;
            emit RewardClaimed(msg.sender, pending);
        }
        
        emit Unstaked(msg.sender, originalAmount);
    }

    /**
     * @dev Reclamar solo rewards sin retirar stake
     */
    function claimRewards() external nonReentrant {
        updatePool();
        
        UserStake storage user = userStakes[msg.sender];
        uint256 pending = (user.amount * poolInfo.accRewardPerShare) / PRECISION - user.rewardDebt;
        
        require(pending > 0, "No rewards to claim");
        
        user.rewardDebt = (user.amount * poolInfo.accRewardPerShare) / PRECISION;
        
        _safeTransfer(msg.sender, pending);
        userRewardsClaimed[msg.sender] += pending;
        
        emit RewardClaimed(msg.sender, pending);
    }

    /**
     * @dev Retiro de emergencia (pierde rewards)
     */
    function emergencyWithdraw() external nonReentrant {
        UserStake storage user = userStakes[msg.sender];
        uint256 amount = user.amount;
        require(amount > 0, "No stake to withdraw");
        
        // Calcular amount original sin multiplier
        uint256 lockDuration = user.lockEndTime - user.lastStakeTime;
        uint256 originalAmount = (amount * 10000) / lockMultipliers[lockDuration];
        
        user.amount = 0;
        user.rewardDebt = 0;
        poolInfo.totalStaked -= amount;
        
        _safeTransfer(msg.sender, originalAmount);
        
        emit EmergencyWithdraw(msg.sender, originalAmount);
    }

    /**
     * @dev Agregar rewards al pool (solo owner)
     */
    function addRewards() external payable onlyOwner {
        require(msg.value > 0, "No rewards to add");
        rewardBalance += msg.value;
        emit RewardsAdded(msg.value);
    }

    /**
     * @dev Ver rewards pendientes de un usuario
     */
    function pendingRewards(address _user) external view returns (uint256) {
        UserStake storage user = userStakes[_user];
        uint256 accRewardPerShare = poolInfo.accRewardPerShare;
        
        if (block.timestamp > poolInfo.lastRewardTime && poolInfo.totalStaked != 0) {
            uint256 timeElapsed = block.timestamp - poolInfo.lastRewardTime;
            uint256 reward = timeElapsed * poolInfo.rewardPerSecond;
            
            if (reward > rewardBalance) {
                reward = rewardBalance;
            }
            
            accRewardPerShare += (reward * PRECISION) / poolInfo.totalStaked;
        }
        
        return (user.amount * accRewardPerShare) / PRECISION - user.rewardDebt;
    }

    /**
     * @dev Obtener información del usuario
     */
    function getUserInfo(address _user) 
        external 
        view 
        returns (
            uint256 stakedAmount,
            uint256 pendingReward,
            uint256 lockEndTime,
            uint256 totalClaimed
        ) 
    {
        UserStake storage user = userStakes[_user];
        return (
            user.amount,
            this.pendingRewards(_user),
            user.lockEndTime,
            userRewardsClaimed[_user]
        );
    }

    /**
     * @dev Transferencia segura de CHZ
     */
    function _safeTransfer(address _to, uint256 _amount) internal {
        require(_amount <= address(this).balance, "Insufficient contract balance");
        (bool success, ) = payable(_to).call{value: _amount}("");
        require(success, "Transfer failed");
    }

    /**
     * @dev Configurar nuevo reward rate (solo owner)
     */
    function setRewardPerSecond(uint256 _rewardPerSecond) external onlyOwner {
        updatePool();
        poolInfo.rewardPerSecond = _rewardPerSecond;
    }

    /**
     * @dev Configurar multiplier para lock duration (solo owner)
     */
    function setLockMultiplier(uint256 _duration, uint256 _multiplier) external onlyOwner {
        require(_multiplier >= 10000, "Multiplier must be at least 1x");
        lockMultipliers[_duration] = _multiplier;
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
     * @dev Retirar CHZ no utilizados (solo owner)
     */
    function withdrawUnusedFunds(uint256 _amount) external onlyOwner {
        require(_amount <= address(this).balance - rewardBalance, "Cannot withdraw reward funds");
        _safeTransfer(owner(), _amount);
    }
}