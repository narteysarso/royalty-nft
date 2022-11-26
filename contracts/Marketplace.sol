// SPDX-License-Identifier: MIT
pragma solidity ^0.8.15;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract Marketplace {
    using Counters for Counters.Counter;

    Counters.Counter public listingId;
    
    struct Listing {
        uint256 tokenId;
        uint256 price;
        address seller;
        address nftAddress;
        bool sold;
    }

    mapping(uint256 => Listing) public listings;

    mapping(address => mapping(uint256 => uint256)) public listingsOf;

    modifier isNFTOwner(address nftAddress, uint256 tokenId) {
        require(
            IERC721(nftAddress).ownerOf(tokenId) == msg.sender,
            "MRKT: Not the owner"
        );
        _;
    }

    modifier isNotListed(address nftAddress, uint256 tokenId) {
        require(
            listings[listingsOf[nftAddress][tokenId]].price == 0,
            "MRKT: Already listed"
        );
        _;
    }

    modifier isNotSold(address nftAddress, uint256 tokenId) {
        require(
            !listings[listingsOf[nftAddress][tokenId]].sold,
            "MRKT: Already listed"
        );
        _;
    }

    modifier isListed(address nftAddress, uint256 tokenId) {
        require(listings[listingsOf[nftAddress][tokenId]].price > 0, "MRKT: Not listed");
        _;
    }

    event ListingCreated(
        address nftAddress,
        uint256 tokenId,
        uint256 price,
        address seller
    );

    event ListingCanceled(address nftAddress, uint256 tokenId, address seller);

    event ListingUpdated(
        address nftAddress,
        uint256 tokenId,
        uint256 newPrice,
        address seller
    );

    event ListingPurchased(
        address nftAddress,
        uint256 tokenId,
        address seller,
        address buyer
    );

    function createListing(
        address nftAddress,
        uint256 tokenId,
        uint256 price
    )
        external
        isNotListed(nftAddress, tokenId)
        isNFTOwner(nftAddress, tokenId)
    {
        require(price > 0, "MRKT: Price must be > 0");
        IERC721 nftContract = IERC721(nftAddress);
        require(
            nftContract.isApprovedForAll(msg.sender, address(this)) ||
                nftContract.getApproved(tokenId) == address(this),
            "MRKT: No approval for NFT"
        );

        listingId.increment();

        listings[listingId.current()] = Listing({
            tokenId: tokenId,
            price: price,
            seller: msg.sender,
            nftAddress: nftAddress,
            sold: false
        });

        listingsOf[nftAddress][tokenId] = listingId.current();

        emit ListingCreated(nftAddress, tokenId, price, msg.sender);
    }

    function cancelListing(address nftAddress, uint256 tokenId)
        external
        isListed(nftAddress, tokenId)
        isNFTOwner(nftAddress, tokenId)
        isNotSold(nftAddress, tokenId)
    {
        
        delete listings[listingsOf[nftAddress][tokenId]];
        delete listingsOf[nftAddress][tokenId];
        
        emit ListingCanceled(nftAddress, tokenId, msg.sender);
    }

    function updateListing(
        address nftAddress,
        uint256 tokenId,
        uint256 newPrice
    ) external isListed(nftAddress, tokenId) isNFTOwner(nftAddress, tokenId) isNotSold(nftAddress, tokenId) {
        require(newPrice > 0, "MRKT: Price must be > 0");
        listings[listingsOf[nftAddress][tokenId]].price = newPrice;
        emit ListingUpdated(nftAddress, tokenId, newPrice, msg.sender);
    }

    function purchaseListing(address nftAddress, uint256 tokenId)
        external
        payable
        isListed(nftAddress, tokenId)
        isNotSold(nftAddress, tokenId)
    {
        Listing memory listing = listings[listingsOf[nftAddress][tokenId]];
        require(msg.value >= listing.price, "MRKT: Incorrect ETH supplied");

		listings[listingsOf[nftAddress][tokenId]].sold = true;

        IERC721(nftAddress).safeTransferFrom(
            listing.seller,
            msg.sender,
            tokenId
        );
        (bool sent, ) = payable(listing.seller).call{value: msg.value}("");
        require(sent, "Failed to transfer eth");

        emit ListingPurchased(nftAddress, tokenId, listing.seller, msg.sender);
    }
}