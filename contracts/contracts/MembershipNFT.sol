// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MembershipNFT is ERC721, Ownable {
    uint256 private _nextTokenId;
    string private _baseTokenURI;

    struct MemberInfo {
        uint256 gasSavedUSD;
        uint256 tier; // 0: Basic, 1: Silver, 2: Gold, 3: Platinum
    }

    mapping(uint256 => MemberInfo) public memberData;
    mapping(address => uint256) public userToTokenId;
    mapping(address => bool) public hasMinted;

    event MembershipMinted(address indexed user, uint256 tokenId);
    event GasSavedUpdated(uint256 indexed tokenId, uint256 totalGasSaved);
    event TierUpgraded(uint256 indexed tokenId, uint256 newTier);

    constructor(string memory baseTokenURI) ERC721("GaslessAI Membership", "GAIM") Ownable(msg.sender) {
        _baseTokenURI = baseTokenURI;
    }

    function mintMembership() public {
        require(!hasMinted[msg.sender], "Already a member");
        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        
        memberData[tokenId] = MemberInfo(0, 0);
        userToTokenId[msg.sender] = tokenId;
        hasMinted[msg.sender] = true;
        
        emit MembershipMinted(msg.sender, tokenId);
    }

    function updateGasSaved(uint256 tokenId, uint256 gasAmountUSD) public onlyOwner {
        memberData[tokenId].gasSavedUSD += gasAmountUSD;
        emit GasSavedUpdated(tokenId, memberData[tokenId].gasSavedUSD);
        
        // Auto-upgrade tiers based on savings
        uint256 currentGas = memberData[tokenId].gasSavedUSD;
        uint256 newTier = 0;
        if (currentGas >= 100) newTier = 3;
        else if (currentGas >= 50) newTier = 2;
        else if (currentGas >= 20) newTier = 1;
        
        if (newTier > memberData[tokenId].tier) {
            memberData[tokenId].tier = newTier;
            emit TierUpgraded(tokenId, newTier);
        }
    }

    function getMemberInfo(address user) public view returns (uint256 tier, uint256 gasSavedUSD) {
        uint256 tokenId = userToTokenId[user];
        return (memberData[tokenId].tier, memberData[tokenId].gasSavedUSD);
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    function setBaseURI(string memory baseTokenURI) public onlyOwner {
        _baseTokenURI = baseTokenURI;
    }
}
