import { BigNumber } from "ethers";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAccount, useSigner } from "wagmi";
import { cancelListing, getListing } from "../api/marketplace";
import { getNFTS } from "../api/royalty";
import CreateNFTForm from "../components/CreateNFTForm";
import ListNFTForm from "../components/ListNFTForm";
import { IPFS_BASE_URI } from "../constants";

const CreateNFTModal = () => {
    const { address } = useAccount();
    return (
        <>
            <div className="col d-flex justify-content-end p-4">
                <button type="button" className="btn btn-primary" disabled={!address} data-bs-toggle="modal" data-bs-target="#createNFTModal" >Create NFT</button>
                <div className="modal fade" id="createNFTModal" tabIndex="-1" aria-labelledby="createNFTModal" aria-hidden="true">
                    <div className="modal-dialog">
                        <div className="modal-content">
                            <div className="modal-header">
                                <h1 className="modal-title fs-5" id="exampleModalLabel">New NFT</h1>
                                <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div className="modal-body">
                                <CreateNFTForm />
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}


const ListNFTModal = ({tokenId}) => {

    return (
        <div className="modal fade" id="listNFTModal" tabIndex="-1" aria-labelledby="listNFTModal" aria-hidden="true">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h1 className="modal-title fs-5" id="exampleModalLabel">New NFT</h1>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <ListNFTForm tokenId={tokenId}/>
                    </div>

                </div>
            </div>
        </div>
    )
}

const UpdateListNFTModal = ({tokenId}) => {

    return (
        <div className="modal fade" id="updateListNFTModal" tabIndex="-1" aria-labelledby="updateListNFTModal" aria-hidden="true">
            <div className="modal-dialog">
                <div className="modal-content">
                    <div className="modal-header">
                        <h1 className="modal-title fs-5" id="exampleModalLabel">Update NFT Listing</h1>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                    </div>
                    <div className="modal-body">
                        <ListNFTForm tokenId={tokenId} action="update" />
                    </div>

                </div>
            </div>
        </div>
    )
}


const NFTCard = ({
    title,
    description,
    image = "",
    price,
    royalty,
    tokenId,
    recipient, setTokenId }) => {
        const [listingDetails, setListingDetail] = useState(undefined);
        const [canceling, setCanceling] = useState(false);
        const {data: signer} = useSigner();

        useEffect(() => {
            (async() => {
                const listingDetails = await getListing({tokenId});

                if(!listingDetails) return;

                setListingDetail(listingDetails)
            })()
        })

        const handleCancelListing = async () => {
            try {
                setCanceling(true);
                await cancelListing({signer, tokenId});
            } catch (error) {
                console.log(error);
            }finally{
                setCanceling(false);
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
                    <li className="list-group-item">Royalty rate: {royalty} %</li>
                    <li className="list-group-item">Recipient: {recipient}</li>
                </ul>
                <div className="card-body">
                    {
                        listingDetails &&  
                         BigNumber.from(0).eq(listingDetails?.price)
                            ? 
                            <button type="button" className="btn btn-primary" onClick={() =>setTokenId(tokenId)} data-bs-toggle="modal" data-bs-target="#listNFTModal" >Sell NFT</button>
                            : 
                            <div className=" d-flex justify-content-between">
                                <button type="button" className="btn btn-warning" disabled={canceling}  onClick={handleCancelListing}>
                                    Cancel Listing
                                    {
                                        canceling && <div className="spinner-border text-light" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                    }
                                </button> 
                                <button type="button" className="btn btn-primary" onClick={() =>setTokenId(tokenId)} data-bs-toggle="modal" data-bs-target="#updateListNFTModal" >Update Listing</button> 
                            </div>
                            
                    }
                    
                </div>
            </div>
        </div>
    )
}

export default function Dashboard() {
    const [nfts, setNfts] = useState();
    const [loading, setLoading] = useState(false);
    const [tokenId, setTokenId] = useState();
    const [error, setError] = useState(null);

    const { address } = useAccount();

    useEffect(() => {
        (async () => {
            try {
                setLoading(true);
                const royaltyNFTs = await getNFTS(address);
                
                setNfts(royaltyNFTs.filter(item => item !== null));

            } catch (error) {
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
        <div className="container">
            <div className="row justify-content-end">
                <ListNFTModal tokenId={tokenId} />
                <UpdateListNFTModal tokenId={tokenId} />
                <CreateNFTModal />
            </div>
            <div className="row">
                {error && <div className="alert alert-warning" role="alert">${error?.message}</div>}

                {
                    nfts?.map((nft, idx) => nft ? <NFTCard {...nft} key={idx} setTokenId={setTokenId} /> : "")
                }
            </div>
        </div>
    )
}