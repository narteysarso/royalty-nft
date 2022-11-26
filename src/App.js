import {
  getDefaultWallets,
  RainbowKitProvider,
} from '@rainbow-me/rainbowkit';
import {
  chain,
  configureChains,
  createClient,
  WagmiConfig,
} from 'wagmi';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';

import './App.css';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import MarketPlace from './pages/Marketplace';

const { chains, provider } = configureChains(
  [ chain.polygonMumbai],
  [
    alchemyProvider({ apiKey: process.env.REACT_APP_ALCHEMY_ID}),
    publicProvider()
  ]
);

const { connectors } = getDefaultWallets({
  appName: 'My RainbowKit App',
  chains
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider
})

function App() {
  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        <Navbar />
        {
          window.location.pathname.includes("dashboard") ? <Dashboard/> : <MarketPlace />
        }
      </RainbowKitProvider>
    </WagmiConfig>
  );
}

export default App;
