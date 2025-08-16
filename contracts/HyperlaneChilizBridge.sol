// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@hyperlane-xyz/core/contracts/interfaces/IMailbox.sol";
import "@hyperlane-xyz/core/contracts/interfaces/IInterchainGasPaymaster.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title HyperlaneChilizBridge
 * @dev Bridge contract for Chiliz Chain using Hyperlane for cross-chain messaging
 * Connects Chiliz to Ethereum, which then uses CCIP to reach other networks
 */
contract HyperlaneChilizBridge is Ownable, ReentrancyGuard {
    IMailbox public immutable mailbox;
    IInterchainGasPaymaster public immutable gasPaymaster;
    
    // Base domain for Hyperlane
    uint32 public constant BASE_DOMAIN = 8453; // Base mainnet domain
    
    // Base hub contract address
    address public baseHubContract;
    
    // Message types
    enum MessageType {
        PREDICTION_RESULT,
        VOTING_DATA,
        REWARD_CLAIM,
        STAKING_UPDATE
    }
    
    struct CrossChainMessage {
        MessageType messageType;
        address sender;
        bytes data;
        uint256 timestamp;
    }
    
    // Events
    event MessageSentToBase(
        bytes32 indexed messageId,
        MessageType messageType,
        address indexed sender,
        bytes data
    );
    
    event MessageReceivedFromEthereum(
        bytes32 indexed messageId,
        MessageType messageType,
        address indexed sender,
        bytes data
    );
    
    event BaseHubUpdated(address indexed oldHub, address indexed newHub);
    
    constructor(
        address _mailbox,
        address _gasPaymaster,
        address _baseHubContract
    ) Ownable(msg.sender) {
        mailbox = IMailbox(_mailbox);
        gasPaymaster = IInterchainGasPaymaster(_gasPaymaster);
        baseHubContract = _baseHubContract;
    }
    
    /**
     * @dev Send message to Base hub via Hyperlane
     */
    function sendToBase(
        MessageType messageType,
        bytes calldata data
    ) external payable nonReentrant {
        CrossChainMessage memory message = CrossChainMessage({
            messageType: messageType,
            sender: msg.sender,
            data: data,
            timestamp: block.timestamp
        });
        
        bytes memory encodedMessage = abi.encode(message);
        
        // Send message via Hyperlane
        bytes32 messageId = mailbox.dispatch(
            BASE_DOMAIN,
            _addressToBytes32(baseHubContract),
            encodedMessage
        );
        
        // Pay for gas on destination chain
        if (msg.value > 0) {
            gasPaymaster.payForGas{value: msg.value}(
                messageId,
                BASE_DOMAIN,
                200000, // Gas limit for processing on Base
                msg.sender
            );
        }
        
        emit MessageSentToBase(messageId, messageType, msg.sender, data);
    }
    
    /**
     * @dev Handle incoming messages from Ethereum hub
     */
    function handle(
        uint32 _origin,
        bytes32 _sender,
        bytes calldata _body
    ) external {
        require(msg.sender == address(mailbox), "Only mailbox can call");
        require(_origin == BASE_DOMAIN, "Only from Base");
        require(_sender == _addressToBytes32(baseHubContract), "Only from hub");
        
        CrossChainMessage memory message = abi.decode(_body, (CrossChainMessage));
        
        // Process message based on type
        _processIncomingMessage(message);
        
        emit MessageReceivedFromEthereum(
            keccak256(_body),
            message.messageType,
            message.sender,
            message.data
        );
    }
    
    /**
     * @dev Process incoming cross-chain messages
     */
    function _processIncomingMessage(CrossChainMessage memory message) internal pure {
        if (message.messageType == MessageType.PREDICTION_RESULT) {
            _handlePredictionResult(message.sender, message.data);
        } else if (message.messageType == MessageType.VOTING_DATA) {
            _handleVotingData(message.sender, message.data);
        } else if (message.messageType == MessageType.REWARD_CLAIM) {
            _handleRewardClaim(message.sender, message.data);
        } else if (message.messageType == MessageType.STAKING_UPDATE) {
            _handleStakingUpdate(message.sender, message.data);
        }
    }
    
    /**
     * @dev Handle prediction result from other chains
     */
    function _handlePredictionResult(address /* _sender */, bytes memory /* data */) internal pure {
        // (uint256 _marketId, uint8 _result, uint256 _timestamp) = abi.decode(
        //     data,
        //     (uint256, uint8, uint256)
        // );
        
        // Update local prediction market with cross-chain result
        // This would interact with PredictionMarketCCIP contract
        // Implementation depends on specific business logic
    }
    
    /**
     * @dev Handle voting data from other chains
     */
    function _handleVotingData(address /* _sender */, bytes memory /* data */) internal pure {
        // (uint256 _categoryId, uint256 _optionId, uint256 _votes) = abi.decode(
        //     data,
        //     (uint256, uint256, uint256)
        // );
        
        // Update local voting system with cross-chain votes
        // This would interact with VotingSystemCCIP contract
    }
    
    /**
     * @dev Handle reward claims from other chains
     */
    function _handleRewardClaim(address /* _sender */, bytes memory /* data */) internal pure {
        // (address _recipient, uint256 _amount, uint256 _marketId) = abi.decode(
        //     data,
        //     (address, uint256, uint256)
        // );
        
        // Process cross-chain reward claim
        // Transfer CHZ tokens to recipient
    }
    
    /**
     * @dev Handle staking updates from other chains
     */
    function _handleStakingUpdate(address /* _sender */, bytes memory /* data */) internal pure {
        // (address _staker, uint256 _amount, bool _isStake) = abi.decode(
        //     data,
        //     (address, uint256, bool)
        // );
        
        // Update staking information from cross-chain
        // This would interact with StakingPool contract
    }
    
    /**
     * @dev Update Base hub address
     */
    function updateBaseHub(address _newHub) external onlyOwner {
        address oldHub = baseHubContract;
        baseHubContract = _newHub;
        emit BaseHubUpdated(oldHub, _newHub);
    }
    
    /**
     * @dev Estimate gas cost for cross-chain message
     */
    function estimateGasCost(
        MessageType /* messageType */,
        bytes calldata /* data */
    ) external view returns (uint256) {
        // CrossChainMessage memory message = CrossChainMessage({
        //     messageType: messageType,
        //     sender: msg.sender,
        //     data: data,
        //     timestamp: block.timestamp
        // });
        
        // bytes memory encodedMessage = abi.encode(message);
        
        return gasPaymaster.quoteGasPayment(
            BASE_DOMAIN,
            200000 // Gas limit
        );
    }
    
    /**
     * @dev Convert address to bytes32
     */
    function _addressToBytes32(address _addr) internal pure returns (bytes32) {
        return bytes32(uint256(uint160(_addr)));
    }
    
    /**
     * @dev Emergency withdrawal function
     */
    function emergencyWithdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    /**
     * @dev Receive function to accept ETH for gas payments
     */
    receive() external payable {}
}