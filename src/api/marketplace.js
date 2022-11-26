import { ethers } from "ethers";
import MarketplaceAbi from "../abi/marketplace.json";
import RoyaltyAbi from "../abi/royalty.json";
import { BASE_POINT } from "../constants";
import { getNFTData, getTokenURI } from "./royalty";

const getMarketplaceContract = async () => {

    if (!window.ethereum) return null;

    const contract = new ethers.Contract(
        MarketplaceAbi.address,
        MarketplaceAbi.abi,
        new ethers.providers.Web3Provider(window.ethereum)
    );

    return contract;
}

export const getAllListings = async () => {

    const listingContract = await getMarketplaceContract();

    const numberOfListings = await listingContract?.listingId();

    const nfts = [];
    for (let i = 1; i <= numberOfListings; i++) {
        const nft = new Promise(async (resolve) => {
            try {
                const { nftAddress, price, seller, sold, tokenId } = await listingContract.listings(i);

                if (sold) {
                    resolve(null);
                }

                const uri = await getTokenURI(tokenId)

                const metadata = await getNFTData(uri);

                if (!metadata) resolve(null);


                const royalty = metadata?.attributes[1].value / BASE_POINT;

                resolve({ ...metadata, tokenId, price: ethers.utils.formatEther(price), royalty, seller, nftAddress });
            } catch (error) {
                console.log(error);
                resolve(null);
            }
        });
        nfts.push(nft);
    }

    const results = await Promise.all(nfts);

    return results;

}

export const listNFT = async ({ signer, tokenId, price }) => {
    const contract = await getMarketplaceContract();

    const txn = await contract.connect(signer).createListing(RoyaltyAbi.address, tokenId, price);

    await txn.wait();
}


export const getListing = async ({tokenId}) => {
    const contract = await getMarketplaceContract();

    const tokenIndex = await contract.listingsOf(RoyaltyAbi.address, tokenId,);

    if(tokenId < 1) return;

    const { nftAddress, price, seller, sold,} = await contract.listings(tokenIndex);

    return { nftAddress, price, seller, sold, tokenId };
}

export const updateListing = async ({ signer, tokenId, price }) => {
    const contract = await getMarketplaceContract();

    const txn = await contract.connect(signer).updateListing(RoyaltyAbi.address, tokenId, price);

    await txn.wait()

}

export const cancelListing = async ({ signer, tokenId }) => {

    const contract = await getMarketplaceContract();

    const txn = await contract.connect(signer).cancelListing(RoyaltyAbi.address, tokenId);

    await txn.wait();
}

export const purchaseListing = async ({ signer, nftAddress, tokenId, price }) => {
    const contract = await getMarketplaceContract();

    const txn = await contract.connect(signer).purchaseListing(nftAddress, tokenId, { value: price });

    await txn.wait();
}
