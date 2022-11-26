import { useRef, useState } from "react";
import { useSigner } from "wagmi";
import {  ethers } from "ethers";
import { listNFT, updateListing } from "../api/marketplace";
import { approveNFTForListing } from "../api/royalty";

export default function ListNFTForm({tokenId, action="list"}) {
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);
    const { data: signer } = useSigner();
    const useForm = useRef();

    const onSubmit = async (e, values) => {
        e.preventDefault();

        try {
            setLoading(true);
            const { price } = formData;

            if(action === "list"){

                await approveNFTForListing({signer, tokenId});
    
                await listNFT({signer, tokenId, price: ethers.utils.parseEther(price) });
            }else if(action === "update"){
                await updateListing({signer, tokenId, price: ethers.utils.parseEther(price)})
            }


            useForm.current.reset()
        } catch (error) {
            // message.error(error.message);
            throw error;
        } finally {
            setLoading(false);
        }
    }

    const handleInputChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    return (
        <form ref={useForm} onSubmit={onSubmit}>
          
            <div className="input-group mb-3">
                <label htmlFor="formFileSm" className="form-label">Selling Price: &nbsp;</label>
                <input disabled={loading} type="number" name="price" step={0.000001} min={0.000001} onChange={handleInputChange} className="form-control" placeholder="Price in eth" aria-label="Price in eth" aria-describedby="button-addon2" />
                <button className="btn btn-outline-secondary" type="button" id="button-addon2">ETH</button>
            </div>
            
            <div className="mb-3">
                <button className="btn btn-success btn-round" type="submit" disabled={loading} >List NFT {loading && <div className="spinner-border text-light" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>}</button>
            </div>
        </form>
    )
}