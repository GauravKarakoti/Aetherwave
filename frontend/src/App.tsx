import { useState, useEffect } from 'react';
import { useLineraWallet } from './hooks/useLineraWallet';
import { MarketList } from './components/MarketList';
import { WalletConnect } from './components/WalletConnect';
import { PlaceBetModal } from './components/PlaceBetModal';
import AetherwaveClient from './lib/aetherwaveClient';
import './App.css';

export interface Market {
  id: string;
  description: string;
  yesPool: number;
  noPool: number;
  status: string;
  resolution?: boolean;
}

function App() {
  const { isConnected, address, balance, connect } = useLineraWallet();
  const [markets, setMarkets] = useState<Market[]>([]);
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  const [showBetModal, setShowBetModal] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isConnected) {
      loadMarkets();
    }
  }, [isConnected]);

  const loadMarkets = async () => {
    try {
      setLoading(true);
      const client = new AetherwaveClient();
      const marketData = await client.getMarkets();
      setMarkets(marketData);
    } catch (error) {
      console.error('Failed to load markets:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePlaceBet = (market: Market) => {
    setSelectedMarket(market);
    setShowBetModal(true);
  };

  const handleBetPlaced = () => {
    setShowBetModal(false);
    setSelectedMarket(null);
    loadMarkets(); // Refresh data
  };

  if (!isConnected) {
    return (
      <div className="app">
        <div className="header">
          <h1>🎯 Aetherwave</h1>
          <p>Live Esports Prediction Micro-Markets</p>
        </div>
        <WalletConnect onConnect={connect} />
      </div>
    );
  }

  return (
    <div className="app">
      <div className="header">
        <h1>🎯 Aetherwave</h1>
        <div className="wallet-info">
          <span>Connected: {address?.slice(0, 8)}...{address?.slice(-6)}</span>
          <span>Balance: {balance} TEST</span>
        </div>
      </div>

      <div className="main-content">
        <div className="section">
          <h2>Active Markets</h2>
          {loading ? (
            <div className="loading">Loading markets...</div>
          ) : (
            <MarketList 
              markets={markets} 
              onPlaceBet={handlePlaceBet}
            />
          )}
        </div>
      </div>

      {showBetModal && selectedMarket && (
        <PlaceBetModal
          market={selectedMarket}
          userBalance={balance}
          onClose={() => setShowBetModal(false)}
          onBetPlaced={handleBetPlaced}
        />
      )}
    </div>
  );
}

export default App;