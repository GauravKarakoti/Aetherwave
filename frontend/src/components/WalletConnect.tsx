import React from 'react';

interface WalletConnectProps {
  onConnect: () => void;
}

export const WalletConnect: React.FC<WalletConnectProps> = ({ onConnect }) => {
  const features = [
    '🎯 Real-time esports prediction markets',
    '⚡ Instant micro-betting on game events',
    '🔒 Fully decentralized on Linera blockchain',
    '🎮 Live updates during matches'
  ];

  return (
    <div className="wallet-connect">
      <div className="welcome-section">
        <div className="welcome-header">
          <h1>Welcome to Aetherwave</h1>
          <p className="subtitle">The future of esports betting is here</p>
        </div>

        <div className="features-grid">
          {features.map((feature, index) => (
            <div key={index} className="feature-card">
              <div className="feature-icon">
                {feature.split(' ')[0]}
              </div>
              <div className="feature-text">
                {feature.split(' ').slice(1).join(' ')}
              </div>
            </div>
          ))}
        </div>

        <div className="demo-notice">
          <h3>🚧 Demo Mode</h3>
          <p>
            This is a demonstration of Aetherwave running on the Linera testnet. 
            Connect with a mock wallet to experience real-time esports prediction markets.
          </p>
        </div>

        <div className="connect-section">
          <button className="connect-button" onClick={onConnect}>
            <span className="button-icon">🔗</span>
            Connect to Linera Wallet
          </button>
          <p className="connect-hint">
            You'll receive 1000 TEST tokens to start betting
          </p>
        </div>

        <div className="how-it-works">
          <h3>How It Works</h3>
          <div className="steps">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <strong>Connect Your Wallet</strong>
                <p>Link your Linera wallet to access the platform</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <strong>Browse Markets</strong>
                <p>Find prediction markets for live esports events</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <strong>Place Your Bets</strong>
                <p>Bet YES or NO on micro-events as they happen</p>
              </div>
            </div>
            <div className="step">
              <div className="step-number">4</div>
              <div className="step-content">
                <strong>Win Instantly</strong>
                <p>Get paid out automatically when markets resolve</p>
              </div>
            </div>
          </div>
        </div>

        <div className="supported-games">
          <h3>Supported Esports</h3>
          <div className="games-list">
            <div className="game">League of Legends</div>
            <div className="game">Dota 2</div>
            <div className="game">Counter-Strike 2</div>
            <div className="game">Valorant</div>
            <div className="game">StarCraft II</div>
            <div className="game">Rocket League</div>
          </div>
        </div>
      </div>
    </div>
  );
};