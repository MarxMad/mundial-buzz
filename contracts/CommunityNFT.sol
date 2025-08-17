// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/Pausable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title CommunityNFT
 * @dev NFT para experiencias en vivo de partidos deportivos
 * Los usuarios pueden mintear NFTs de fotos y experiencias de partidos
 */
contract CommunityNFT is ERC721, ERC721URIStorage, Ownable, Pausable, ReentrancyGuard {
    using Counters for Counters.Counter;
    
    // Contador de tokens
    Counters.Counter private _tokenIds;
    
    // Estructura del NFT
    struct LiveExperience {
        uint256 tokenId;
        address creator;
        uint256 matchId;           // ID del partido relacionado
        string title;              // Título de la experiencia
        string description;        // Descripción de la experiencia
        string imageURI;           // URI de la imagen
        uint256 timestamp;         // Timestamp de creación
        string location;           // Ubicación del partido
        string category;           // Categoría (gol, celebración, etc.)
        bool verified;             // Si está verificado por la comunidad
        uint256 likes;             // Contador de likes
        uint256 shares;            // Contador de shares
    }
    
    // Mapeos
    mapping(uint256 => LiveExperience) public experiences;
    mapping(uint256 => mapping(address => bool)) public userLikes; // tokenId => user => liked
    mapping(uint256 => address[]) public tokenLikers; // tokenId => array de usuarios que dieron like
    mapping(address => uint256[]) public userExperiences; // user => array de tokenIds creados
    
    // Configuración
    uint256 public mintPrice = 0.01 ether; // Precio para mintear NFT
    uint256 public maxSupply = 10000; // Supply máximo de NFTs
    uint256 public maxPerUser = 100; // Máximo NFTs por usuario
    
    // Stats
    uint256 public totalMinted;
    uint256 public totalLikes;
    uint256 public totalShares;
    
    // Events
    event ExperienceMinted(
        uint256 indexed tokenId,
        address indexed creator,
        uint256 indexed matchId,
        string title,
        string imageURI
    );
    
    event ExperienceLiked(
        uint256 indexed tokenId,
        address indexed user,
        bool liked
    );
    
    event ExperienceShared(
        uint256 indexed tokenId,
        address indexed user
    );
    
    event ExperienceVerified(
        uint256 indexed tokenId,
        bool verified
    );
    
    event MintPriceUpdated(uint256 newPrice);
    event MaxSupplyUpdated(uint256 newMaxSupply);
    
    constructor() ERC721("Mundial Buzz Live Experiences", "MBLE") Ownable(msg.sender) {
        // Inicializar con token 0 para el equipo
        _mintExperience(
            msg.sender,
            0, // matchId especial para el equipo
            "Mundial Buzz Team",
            "NFT inaugural de Mundial Buzz",
            "ipfs://QmTeam...",
            "Stadium",
            "Team"
        );
    }
    
    /**
     * @dev Mintear nueva experiencia en vivo
     */
    function mintExperience(
        uint256 _matchId,
        string memory _title,
        string memory _description,
        string memory _imageURI,
        string memory _location,
        string memory _category
    ) external payable nonReentrant whenNotPaused {
        require(msg.value >= mintPrice, "Insufficient payment");
        require(totalMinted < maxSupply, "Max supply reached");
        require(balanceOf(msg.sender) < maxPerUser, "Max NFTs per user reached");
        require(bytes(_title).length > 0, "Title required");
        require(bytes(_imageURI).length > 0, "Image URI required");
        require(bytes(_location).length > 0, "Location required");
        require(bytes(_category).length > 0, "Category required");
        
        // Incrementar token ID
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        // Mintear NFT
        _mint(msg.sender, newTokenId);
        
        // Crear experiencia
        _mintExperience(
            msg.sender,
            _matchId,
            _title,
            _description,
            _imageURI,
            _location,
            _category
        );
        
        // Actualizar stats
        totalMinted++;
        
        emit ExperienceMinted(newTokenId, msg.sender, _matchId, _title, _imageURI);
    }
    
    /**
     * @dev Mintear experiencia (función interna)
     */
    function _mintExperience(
        address _creator,
        uint256 _matchId,
        string memory _title,
        string memory _description,
        string memory _imageURI,
        string memory _location,
        string memory _category
    ) internal {
        uint256 tokenId = _tokenIds.current();
        
        experiences[tokenId] = LiveExperience({
            tokenId: tokenId,
            creator: _creator,
            matchId: _matchId,
            title: _title,
            description: _description,
            imageURI: _imageURI,
            timestamp: block.timestamp,
            location: _location,
            category: _category,
            verified: false,
            likes: 0,
            shares: 0
        });
        
        // Agregar a experiencias del usuario
        userExperiences[_creator].push(tokenId);
    }
    
    /**
     * @dev Dar/quitar like a una experiencia
     */
    function toggleLike(uint256 _tokenId) external whenNotPaused {
        require(_exists(_tokenId), "Token does not exist");
        require(ownerOf(_tokenId) != msg.sender, "Cannot like your own experience");
        
        bool hasLiked = userLikes[_tokenId][msg.sender];
        LiveExperience storage experience = experiences[_tokenId];
        
        if (hasLiked) {
            // Quitar like
            userLikes[_tokenId][msg.sender] = false;
            experience.likes--;
            totalLikes--;
            
            // Remover de array de likers
            _removeLiker(_tokenId, msg.sender);
        } else {
            // Dar like
            userLikes[_tokenId][msg.sender] = true;
            experience.likes++;
            totalLikes++;
            
            // Agregar a array de likers
            tokenLikers[_tokenId].push(msg.sender);
        }
        
        emit ExperienceLiked(_tokenId, msg.sender, !hasLiked);
    }
    
    /**
     * @dev Compartir experiencia
     */
    function shareExperience(uint256 _tokenId) external whenNotPaused {
        require(_exists(_tokenId), "Token does not exist");
        
        LiveExperience storage experience = experiences[_tokenId];
        experience.shares++;
        totalShares++;
        
        emit ExperienceShared(_tokenId, msg.sender);
    }
    
    /**
     * @dev Verificar experiencia (solo owner)
     */
    function verifyExperience(uint256 _tokenId, bool _verified) external onlyOwner {
        require(_exists(_tokenId), "Token does not exist");
        
        experiences[_tokenId].verified = _verified;
        
        emit ExperienceVerified(_tokenId, _verified);
    }
    
    /**
     * @dev Obtener experiencia completa
     */
    function getExperience(uint256 _tokenId) external view returns (LiveExperience memory) {
        require(_exists(_tokenId), "Token does not exist");
        return experiences[_tokenId];
    }
    
    /**
     * @dev Obtener experiencias de un usuario
     */
    function getUserExperiences(address _user) external view returns (uint256[] memory) {
        return userExperiences[_user];
    }
    
    /**
     * @dev Obtener experiencias por partido
     */
    function getExperiencesByMatch(uint256 _matchId) external view returns (uint256[] memory) {
        uint256[] memory matchExperiences = new uint256[](totalMinted);
        uint256 count = 0;
        
        for (uint256 i = 1; i <= totalMinted; i++) {
            if (experiences[i].matchId == _matchId) {
                matchExperiences[count] = i;
                count++;
            }
        }
        
        // Redimensionar array
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = matchExperiences[i];
        }
        
        return result;
    }
    
    /**
     * @dev Obtener experiencias por categoría
     */
    function getExperiencesByCategory(string memory _category) external view returns (uint256[] memory) {
        uint256[] memory categoryExperiences = new uint256[](totalMinted);
        uint256 count = 0;
        
        for (uint256 i = 1; i <= totalMinted; i++) {
            if (keccak256(bytes(experiences[i].category)) == keccak256(bytes(_category))) {
                categoryExperiences[count] = i;
                count++;
            }
        }
        
        // Redimensionar array
        uint256[] memory result = new uint256[](count);
        for (uint256 i = 0; i < count; i++) {
            result[i] = categoryExperiences[i];
        }
        
        return result;
    }
    
    /**
     * @dev Obtener usuarios que dieron like
     */
    function getTokenLikers(uint256 _tokenId) external view returns (address[] memory) {
        require(_exists(_tokenId), "Token does not exist");
        return tokenLikers[_tokenId];
    }
    
    /**
     * @dev Verificar si usuario dio like
     */
    function hasUserLiked(uint256 _tokenId, address _user) external view returns (bool) {
        return userLikes[_tokenId][_user];
    }
    
    /**
     * @dev Obtener stats generales
     */
    function getStats() external view returns (
        uint256 _totalMinted,
        uint256 _totalLikes,
        uint256 _totalShares,
        uint256 _maxSupply,
        uint256 _mintPrice
    ) {
        return (totalMinted, totalLikes, totalShares, maxSupply, mintPrice);
    }
    
    /**
     * @dev Configurar precio de mint (solo owner)
     */
    function setMintPrice(uint256 _newPrice) external onlyOwner {
        mintPrice = _newPrice;
        emit MintPriceUpdated(_newPrice);
    }
    
    /**
     * @dev Configurar supply máximo (solo owner)
     */
    function setMaxSupply(uint256 _newMaxSupply) external onlyOwner {
        require(_newMaxSupply >= totalMinted, "New max supply too low");
        maxSupply = _newMaxSupply;
        emit MaxSupplyUpdated(_newMaxSupply);
    }
    
    /**
     * @dev Configurar máximo por usuario (solo owner)
     */
    function setMaxPerUser(uint256 _newMaxPerUser) external onlyOwner {
        maxPerUser = _newMaxPerUser;
    }
    
    /**
     * @dev Retirar fondos (solo owner)
     */
    function withdrawFunds() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
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
     * @dev Función helper para remover liker
     */
    function _removeLiker(uint256 _tokenId, address _user) internal {
        address[] storage likers = tokenLikers[_tokenId];
        for (uint256 i = 0; i < likers.length; i++) {
            if (likers[i] == _user) {
                likers[i] = likers[likers.length - 1];
                likers.pop();
                break;
            }
        }
    }
    
    /**
     * @dev Override de funciones ERC721
     */
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }
    
    function tokenURI(uint256 tokenId) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
    
    /**
     * @dev Recibir ETH
     */
    receive() external payable {}
}
