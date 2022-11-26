import { ConnectButton } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';


export default function Navbar() {
    const {address} = useAccount();
    return (
        <>
            <nav className="navbar navbar-expand-lg bg-light">
                <div className="container">
                    <a className="navbar-brand" href="/">RoyaltyNFTs</a>
                    <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
                        <span className="navbar-toggler-icon"></span>
                    </button>
                    <div className="collapse navbar-collapse justify-content-between" id="navbarNav">
                        <ul className="navbar-nav">
                            <li className="nav-item">
                                <a className="nav-link active" aria-current="page" href="/marketplace">Marketplace</a>
                            </li>
                        </ul>
                        <ul className="navbar-nav ">
                            <li className="nav-item">
                                <ConnectButton />
                            </li>
                            {address &&
                                <li className="nav-item">
                                <a className="nav-link" href="/dashboard">Dashboard
                                    <i className="bi bi-person-lines-fill"></i>
                                </a>
                            </li>}
                        </ul>
                    </div>
                </div>
            </nav>
        </>
    )
}