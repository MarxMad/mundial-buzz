// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import {IRouterClient} from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol";
import {OwnerIsCreator} from "@chainlink/contracts-ccip/src/v0.8/shared/access/OwnerIsCreator.sol";
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import {CCIPReceiver} from "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPReceiver.sol";
import {IERC20} from "@chainlink/contracts-ccip/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@chainlink/contracts-ccip/src/v0.8/vendor/openzeppelin-solidity/v4.8.3/contracts/token/ERC20/utils/SafeERC20.sol";
import {IMailbox} from "@hyperlane-xyz/core/contracts/interfaces/IMailbox.sol";
import {IInterchainGasPaymaster} from "@hyperlane-xyz/core/contracts/interfaces/IInterchainGasPaymaster.sol";

/**
 * @title BaseCCIPHub
 * @notice Hub contract deployed on Base that receives messages from Chiliz via Hyperlane
 *         and redistributes them to other networks using Chainlink CCIP
 * @dev This contract acts as a bridge between Hyperlane (Chiliz) and CCIP (other networks)
 */
contract BaseCCIPHub is CCIPReceiver, OwnerIsCreator {
    using SafeERC20 for IERC20;

    // ============================================================================
    // STATE VARIABLES
    // ============================================================================

    IRouterClient private s_router;
    IMailbox private s_hyperlaneMailbox;
    IInterchainGasPaymaster private s_hyperlaneGasPaymaster;
    
    // Chiliz domain for Hyperlane
    uint32 public constant CHILIZ_DOMAIN = 88882;
    
    // Supported CCIP destination chains
    mapping(uint64 => bool) public supportedCCIPChains;
    
    // Chiliz bridge contract address
    address public chilizBridgeContract;
    
    // Message routing
    struct RouteConfig {
        uint64 ccipChainSelector;
        address destinationContract;
        bool isActive;
    }
    
    mapping(bytes32 => RouteConfig) public routes; // messageType => RouteConfig
    
    // ============================================================================
    // EVENTS
    // ============================================================================

    event MessageReceivedFromChiliz(
        uint32 indexed origin,
        bytes32 indexed sender,
        bytes message
    );
    
    event MessageSentToCCIP(
        uint64 indexed destinationChainSelector,
        address indexed destinationContract,
        bytes32 messageType,
        bytes message
    );
    
    event MessageReceivedFromCCIP(
        bytes32 indexed messageId,
        uint64 indexed sourceChainSelector,
        address sender,
        bytes message
    );
    
    event RouteConfigured(
        bytes32 indexed messageType,
        uint64 ccipChainSelector,
        address destinationContract
    );
    
    event ChilizBridgeUpdated(address indexed newBridge);

    // ============================================================================
    // ERRORS
    // ============================================================================

    error UnsupportedDestinationChain(uint64 destinationChainSelector);
    error InvalidRouteConfig();
    error UnauthorizedSender(address sender);
    error InsufficientBalance(uint256 required, uint256 available);

    // ============================================================================
    // CONSTRUCTOR
    // ============================================================================

    constructor(
        address _router,
        address _hyperlaneMailbox,
        address _hyperlaneGasPaymaster,
        address _chilizBridgeContract
    ) CCIPReceiver(_router) {
        s_router = IRouterClient(_router);
        s_hyperlaneMailbox = IMailbox(_hyperlaneMailbox);
        s_hyperlaneGasPaymaster = IInterchainGasPaymaster(_hyperlaneGasPaymaster);
        chilizBridgeContract = _chilizBridgeContract;
        
        // Configure supported CCIP chains (Base is supported)
        supportedCCIPChains[16015286601757825753] = true; // Ethereum Sepolia
        supportedCCIPChains[12532609583862916517] = true; // Polygon Mumbai
        supportedCCIPChains[14767482510784806043] = true; // Avalanche Fuji
        supportedCCIPChains[6101244977088475029] = true;  // Arbitrum Sepolia
    }

    // ============================================================================
    // HYPERLANE MESSAGE HANDLING (FROM CHILIZ)
    // ============================================================================

    /**
     * @notice Handle incoming messages from Chiliz via Hyperlane
     * @param _origin The domain of the origin chain (should be CHILIZ_DOMAIN)
     * @param _sender The sender on the origin chain
     * @param _message The message payload
     */
    function handle(
        uint32 _origin,
        bytes32 _sender,
        bytes calldata _message
    ) external {
        require(msg.sender == address(s_hyperlaneMailbox), "Only Hyperlane mailbox");
        require(_origin == CHILIZ_DOMAIN, "Only from Chiliz");
        require(_sender == bytes32(uint256(uint160(chilizBridgeContract))), "Unauthorized sender");
        
        emit MessageReceivedFromChiliz(_origin, _sender, _message);
        
        // Decode message to determine routing
        (bytes32 messageType, bytes memory payload) = abi.decode(_message, (bytes32, bytes));
        
        // Route message to appropriate CCIP destinations
        _routeMessageToCCIP(messageType, payload);
    }

    // ============================================================================
    // CCIP MESSAGE HANDLING
    // ============================================================================

    /**
     * @notice Handle incoming CCIP messages from other chains
     * @param any2EvmMessage The CCIP message
     */
    function _ccipReceive(
        Client.Any2EVMMessage memory any2EvmMessage
    ) internal override {
        emit MessageReceivedFromCCIP(
            any2EvmMessage.messageId,
            any2EvmMessage.sourceChainSelector,
            abi.decode(any2EvmMessage.sender, (address)),
            any2EvmMessage.data
        );
        
        // Forward message to Chiliz via Hyperlane
        _forwardMessageToChiliz(any2EvmMessage.data);
    }

    // ============================================================================
    // INTERNAL ROUTING FUNCTIONS
    // ============================================================================

    /**
     * @notice Route message from Chiliz to appropriate CCIP destinations
     * @param messageType The type of message (prediction, voting, staking, etc.)
     * @param payload The message payload
     */
    function _routeMessageToCCIP(bytes32 messageType, bytes memory payload) internal {
        RouteConfig memory route = routes[messageType];
        
        if (!route.isActive) {
            // If no specific route, broadcast to all supported chains
            _broadcastToCCIPChains(messageType, payload);
            return;
        }
        
        // Send to specific destination
        _sendCCIPMessage(route.ccipChainSelector, route.destinationContract, messageType, payload);
    }
    
    /**
     * @notice Broadcast message to all supported CCIP chains
     * @param messageType The message type
     * @param payload The message payload
     */
    function _broadcastToCCIPChains(bytes32 messageType, bytes memory payload) internal {
        uint64[] memory chainSelectors = new uint64[](4);
        chainSelectors[0] = 16015286601757825753; // Ethereum Sepolia
        chainSelectors[1] = 12532609583862916517; // Polygon Mumbai
        chainSelectors[2] = 14767482510784806043; // Avalanche Fuji
        chainSelectors[3] = 6101244977088475029;  // Arbitrum Sepolia
        
        for (uint i = 0; i < chainSelectors.length; i++) {
            if (supportedCCIPChains[chainSelectors[i]]) {
                // Use a default contract address or skip if not configured
                address destinationContract = address(0); // TODO: Configure per chain
                if (destinationContract != address(0)) {
                    _sendCCIPMessage(chainSelectors[i], destinationContract, messageType, payload);
                }
            }
        }
    }
    
    /**
     * @notice Send CCIP message to specific destination
     * @param destinationChainSelector The CCIP chain selector
     * @param destinationContract The destination contract address
     * @param messageType The message type
     * @param payload The message payload
     */
    function _sendCCIPMessage(
        uint64 destinationChainSelector,
        address destinationContract,
        bytes32 messageType,
        bytes memory payload
    ) internal {
        if (!supportedCCIPChains[destinationChainSelector]) {
            revert UnsupportedDestinationChain(destinationChainSelector);
        }
        
        // Encode message with type
        bytes memory message = abi.encode(messageType, payload);
        
        // Create CCIP message
        Client.EVM2AnyMessage memory evm2AnyMessage = Client.EVM2AnyMessage({
            receiver: abi.encode(destinationContract),
            data: message,
            tokenAmounts: new Client.EVMTokenAmount[](0),
            extraArgs: Client._argsToBytes(
                Client.EVMExtraArgsV1({gasLimit: 500_000})
            ),
            feeToken: address(0) // Pay in native token
        });
        
        // Calculate fee
        uint256 fees = s_router.getFee(destinationChainSelector, evm2AnyMessage);
        
        if (address(this).balance < fees) {
            revert InsufficientBalance(fees, address(this).balance);
        }
        
        // Send message
        s_router.ccipSend{value: fees}(
            destinationChainSelector,
            evm2AnyMessage
        );
        
        emit MessageSentToCCIP(
            destinationChainSelector,
            destinationContract,
            messageType,
            message
        );
    }
    
    /**
     * @notice Forward CCIP message back to Chiliz via Hyperlane
     * @param message The message to forward
     */
    function _forwardMessageToChiliz(bytes memory message) internal {
        // Send message to Chiliz via Hyperlane
        bytes32 messageId = s_hyperlaneMailbox.dispatch(
            CHILIZ_DOMAIN,
            bytes32(uint256(uint160(chilizBridgeContract))),
            message
        );
        
        // Pay for gas (optional, can be done separately)
        s_hyperlaneGasPaymaster.payForGas{value: 0.01 ether}(
            messageId,
            CHILIZ_DOMAIN,
            200_000, // gas amount
            msg.sender
        );
    }

    // ============================================================================
    // ADMIN FUNCTIONS
    // ============================================================================

    /**
     * @notice Configure message routing
     * @param messageType The message type to route
     * @param ccipChainSelector The destination CCIP chain
     * @param destinationContract The destination contract address
     */
    function configureRoute(
        bytes32 messageType,
        uint64 ccipChainSelector,
        address destinationContract
    ) external onlyOwner {
        if (!supportedCCIPChains[ccipChainSelector] || destinationContract == address(0)) {
            revert InvalidRouteConfig();
        }
        
        routes[messageType] = RouteConfig({
            ccipChainSelector: ccipChainSelector,
            destinationContract: destinationContract,
            isActive: true
        });
        
        emit RouteConfigured(messageType, ccipChainSelector, destinationContract);
    }
    
    /**
     * @notice Update Chiliz bridge contract address
     * @param newBridge The new bridge contract address
     */
    function updateChilizBridge(address newBridge) external onlyOwner {
        require(newBridge != address(0), "Invalid bridge address");
        chilizBridgeContract = newBridge;
        emit ChilizBridgeUpdated(newBridge);
    }
    
    /**
     * @notice Add or remove supported CCIP chain
     * @param chainSelector The CCIP chain selector
     * @param supported Whether the chain is supported
     */
    function setSupportedCCIPChain(uint64 chainSelector, bool supported) external onlyOwner {
        supportedCCIPChains[chainSelector] = supported;
    }
    
    /**
     * @notice Withdraw contract balance
     */
    function withdraw() external onlyOwner {
        payable(owner()).transfer(address(this).balance);
    }
    
    /**
     * @notice Withdraw ERC20 tokens
     * @param token The token contract address
     * @param amount The amount to withdraw
     */
    function withdrawToken(address token, uint256 amount) external onlyOwner {
        IERC20(token).safeTransfer(owner(), amount);
    }

    // ============================================================================
    // VIEW FUNCTIONS
    // ============================================================================

    /**
     * @notice Get route configuration for message type
     * @param messageType The message type
     * @return The route configuration
     */
    function getRoute(bytes32 messageType) external view returns (RouteConfig memory) {
        return routes[messageType];
    }
    
    /**
     * @notice Check if chain is supported for CCIP
     * @param chainSelector The CCIP chain selector
     * @return Whether the chain is supported
     */
    function isCCIPChainSupported(uint64 chainSelector) external view returns (bool) {
        return supportedCCIPChains[chainSelector];
    }

    // ============================================================================
    // RECEIVE FUNCTION
    // ============================================================================

    receive() external payable {}
}