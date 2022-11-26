import { ethers } from "ethers";
import {  useEffect, useState } from "react";
import { useAccount, useSigner } from "wagmi";
import { getAllListings, purchaseListing } from "../api/marketplace";
import { IPFS_BASE_URI } from "../constants";


const NFTCard = ({
    title,
    description,
    image = "",
    nftAddress,
    price,
    tokenId,
    royalty,
    seller }) => {
    const {data: signer} = useSigner();

    const [loading, setLoading] = useState(false);

    const handleBuy = async ({nftAddress, tokenId, price}) => {
        try {
            console.log({nftAddress, tokenId, price})
            setLoading(true)
            await purchaseListing({signer, nftAddress, tokenId, price : ethers.utils.parseEther(price)  });
            window.location.reload();
        } catch (error) {
            console.log(error)
        }finally{
            setLoading(false);
        }
    }

    return (
        <div className="col-xs-12 col-sm-8 col-md-4 col-lg-3 mb-2">
            <div className="card">
                <img src={`${IPFS_BASE_URI}/${image.split("//")[1]}`} className="card-img-top img-fluid" alt="..." />
                <div className="card-body">
                    <h5 className="card-title">{title}</h5>
                    <p className="card-text">{description}</p>
                </div>
                <ul className="list-group list-group-flush">
                    <li className="list-group-item">Price: {price} </li>
                    <li className="list-group-item">Royalty rate: {royalty * 100}  %</li>
                    <li className="list-group-item">Seller: {seller}</li>
                </ul>
                <div className="card-body">
                    <button type="button" disabled={loading} onClick={() => handleBuy({nftAddress,tokenId, price})} className="btn btn-block btn-primary">
                        Buy
                        {loading && <div className="spinner-border text-light" role="status">
                            <span className="visually-hidden">Loading...</span>
                        </div>}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default function Marketplace() {
    const [nfts, setNfts] = useState();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const { address } = useAccount();

    useEffect(() => {
        (async () => {
            try {
                if(!address) return;
                setLoading(true);
                const listings = await getAllListings();
                setNfts(listings.filter(item => item !== null));

            } catch (error) {
                console.log(error);
                setError(error);
            } finally {
                setLoading(false);
            }
        })()

    }, [address])

    if (loading) return (
        <div className="container">
            <div className="alert alert-primary" role="alert">
                Loading ... <div className="spinner-border text-light" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        </div>
    );

    if(!nfts?.length){
        return (
            <div className="container mt-3">
                <div className="row justify-content-center">
                    <div class="alert alert-warning" role="alert">
                        Empty
                    </div>
                </div>

            </div>
        )
    }

    return (
        <div className="container mt-3">
            <div className="row">
                {error && <div className="alert alert-warning" role="alert">${error?.message}</div>}
                {
                    nfts?.map((nft) => nft ? <NFTCard {...nft} /> : "")
                }
            </div>
        </div>
    )
}