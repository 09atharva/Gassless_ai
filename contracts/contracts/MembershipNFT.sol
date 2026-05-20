// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract MembershipNFT is ERC721, Ownable {
    uint256 private _nextTokenId;
    string private _baseTokenURI;

    event MembershipMinted(address indexed user, uint256 tokenId);

    constructor(string memory baseTokenURI) ERC721("GaslessAI Membership", "GAIM") Ownable(msg.sender) {
        _baseTokenURI = baseTokenURI;
    }

    function mintMembership() public {
        uint256 tokenId = _nextTokenId++;
        _safeMint(msg.sender, tokenId);
        emit MembershipMinted(msg.sender, tokenId);
    }

    function _baseURI() internal view override returns (string memory) {
        return _baseTokenURI;
    }

    function setBaseURI(string memory baseTokenURI) public onlyOwner {
        _baseTokenURI = baseTokenURI;
    }
}
