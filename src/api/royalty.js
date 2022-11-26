import { ethers } from "ethers";
import RoyaltyAbi from "../abi/royalty.json";
import MarketplaceAbi from "../abi/marketplace.json";
import { BASE_POINT } from "../constants";

const getRoyaltyContract = async () => {

    if (!window.ethereum) return null;

    const contract = new ethers.Contract(
        RoyaltyAbi.address,
        RoyaltyAbi.abi,
        new ethers.providers.Web3Provider(window.ethereum)
    );

    return contract;
}

export const mintRoyalty= async (signer, { recipient, royaltyFee, royaltyReciever, uri } = {}) => {

    const contract = await getRoyaltyContract();

    console.log({ recipient, royaltyFee, royaltyReciever, uri });

    const txn = await contract?.connect(signer).mint(recipient, uri, royaltyReciever, royaltyFee);

    return await txn.wait();
}


export const approveNFTForListing = async( {signer, tokenId}) => {
    const contract = await getRoyaltyContract();

    const txn = await contract.connect(signer).approve(MarketplaceAbi.address, tokenId);

    await txn.wait();


}

export const getNFTS = async (ownerAddress) => {
    const contract = await getRoyaltyContract();

    const numberOfTokens = await contract?._tokenIds();
    console.log(numberOfTokens);

    const nfts = [];
    for (let i = 1; i <= numberOfTokens; i++) {
        const nft = new Promise(async (resolve) => {
            try {
                const [uri, owner] = await Promise.all( [getTokenURI(i), contract?.ownerOf(i) ]);

                if(owner !== ownerAddress) resolve(null);

                const metadata = await getNFTData(uri);

                if(!metadata) return null;

                const price = ethers.utils.formatEther(metadata?.attributes[0].value);
                const royalty = metadata?.attributes[1].value / BASE_POINT *100;
                const recipient = metadata?.attributes[2].value;

                resolve({ ...metadata, tokenId: i, price, royalty, recipient});
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


export async function getTokenURI( tokenId) {
    const contract = await getRoyaltyContract();
    return await contract?.tokenURI(tokenId);
}

//fetch data from ipfs
export const getNFTData = async (ipfsHash) => {
    if (!ipfsHash) {
        return null;
    }

    console.log(`https://ipfs.io/ipfs/${ipfsHash}`);

    const response = await fetch(`https://ipfs.io/ipfs/${ipfsHash}`, {
        method: "GET",
    });

    return await response.json();
};