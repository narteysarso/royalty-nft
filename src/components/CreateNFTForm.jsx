import { useRef, useState } from "react";
import { NFTStorage, File } from "nft.storage";
import { mintRoyalty } from "../api/royalty";
import { useSigner } from "wagmi";
import { BigNumber, ethers } from "ethers";

export default function CreateNFTForm() {
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);
    const { data: signer } = useSigner();
    const useForm = useRef();

    const onSubmit = async (e, values) => {
        e.preventDefault();

        // console.log(formData.file);
        // return;

        try {
            setLoading(true);
            const { description, title, price, royalty, royaltyReciever, file: image } = formData;

            const royaltyFee = parseInt(royalty * 100);

            // create a new NFTStorage client using our API key
            const nftstorage = new NFTStorage({ token: process.env.REACT_APP_NFT_STORAGE_KEY })

            const { url: uri } = await nftstorage.store({
                name: title,
                image,
                description,
                attributes: [
                    {
                        trait_type: "price",
                        value: ethers.utils.parseEther(price)
                    }, {
                        trait_type: "royalty",
                        value: royaltyFee
                    }, {
                        trait_type: "royalty_recipient",
                        value: royaltyReciever
                    }
                ]
            });

            console.log(uri);
        

            await mintRoyalty(signer, { uri: uri.split("//")[1], recipient: await signer.getAddress(), royaltyFee, royaltyReciever });


            window.location.reload();
            useForm.current.reset()
        } catch (error) {
            console.log(error)
        } finally {
            setLoading(false);
        }
    }

    const handleInputChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

    return (
        <form ref={useForm} onSubmit={onSubmit}>
            <div className="mb-3">
                <label htmlFor="title" className="col-form-label">Title:</label>
                <input disabled={loading} name="title" type="text" onChange={handleInputChange} className="form-control" id="recipient-title" />
            </div>
            <div className="mb-3">
                <label htmlFor="formFileSm" className="form-label">Image: </label>
                <input disabled={loading} name="file" className="form-control form-control-sm" onChange={(e) => setFormData(prev => ({ ...prev, file: e.target.files[0] }))} id="formFileSm" type="file" />
            </div>
            <div className="input-group mb-3">
                <label htmlFor="formFileSm" className="form-label">Selling Price: &nbsp;</label>
                <input disabled={loading} type="number" name="price" step={0.000001} min={0.000001} onChange={handleInputChange} className="form-control" placeholder="Price in eth" aria-label="Price in eth" aria-describedby="button-addon2" />
                <button className="btn btn-outline-secondary" type="button" id="button-addon2">ETH</button>
            </div>
            <div className="input-group mb-3">
                <label htmlFor="formFileSm" className="form-label">Royalty: &nbsp;</label>
                <input disabled={loading} type="number" name="royalty" step={0.01} min={0.01} onChange={handleInputChange} className="form-control" placeholder="Royalty rate" aria-label="Amount htmlFor royalty" aria-describedby="button-addon3" />
                <button className="btn btn-outline-secondary" type="button" id="button-addon3">%</button>
            </div>
            <div className="mb-3">
                <label htmlFor="royalty-reciever" className="col-form-label">Royalty Reciever:</label>
                <input disabled={loading} name="royaltyReciever" type="text" onChange={handleInputChange} className="form-control" id="royalty-reciever" />
            </div>
            <div className="mb-3">
                <label htmlFor="message-text" className="col-form-label">Description:</label>
                <textarea disabled={loading} name="description" className="form-control" onChange={handleInputChange} id="message-text"></textarea>
            </div>

            <div className="mb-3">
                <button className="btn btn-success btn-round" type="submit" disabled={loading} >Create NFT {loading && <div className="spinner-border text-light" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>}</button>
            </div>
        </form>
    )
}