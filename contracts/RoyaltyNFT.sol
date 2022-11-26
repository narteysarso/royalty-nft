// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Royalty.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract RoyaltyNFT is ERC721URIStorage, ERC721Royalty, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter public _tokenIds;

    constructor() ERC721("RoyaltyNFTs", "RNFT") {
        _setDefaultRoyalty(msg.sender, 10000);
    }

    function _mint(address recipient, string memory _tokenURI)
        internal
        returns (uint256)
    {
        _tokenIds.increment();

        uint256 newItemId = _tokenIds.current();
        _safeMint(recipient, newItemId);
        _setTokenURI(newItemId, _tokenURI);

        return newItemId;
    }

    function mint(
        address recipient,
        string memory _tokenURI,
        address royaltyReceiver,
        uint96 royaltyFee
    ) public returns (uint256) {
        uint256 tokenId = _mint(recipient, _tokenURI);
        _setTokenRoyalty(tokenId, royaltyReceiver, royaltyFee);
        
        return tokenId;
    }

    function supportsInterface(bytes4 interfaceId)
        public
        view
        virtual
        override(ERC721, ERC721Royalty)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    function tokenURI(uint256 tokenId)
        public
        view
        virtual
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    function _burn(uint256 tokenId)
        internal
        virtual
        override(ERC721URIStorage, ERC721Royalty)
    {
        super._burn(tokenId);
        _resetTokenRoyalty(tokenId);
    }

    function burn(uint256 tokenId) public {
        require(ownerOf(tokenId) == msg.sender, "Not the owner of tokenId");
        _burn(tokenId);
    }
}
