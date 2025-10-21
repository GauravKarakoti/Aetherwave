import React from 'react';
import { Market } from '../App';

interface MarketListProps {
  markets: Market[];
  onPlaceBet: (market: Market) => void;
}

export const MarketList: React.FC<MarketListProps> = ({ markets, onPlaceBet }) => {
  const calculateOdds = (yesPool: number, noPool: number, side: 'yes' | 'no'): number => {
    const total = yesPool + noPool;
    if (total === 0) return 0.5;
    
    if (side === 'yes') {
      return noPool / total;
    } else {
      return yesPool / total;
    }
  };

  if (markets.length === 0) {
    return (
      <div className="market-list empty">
        <p>No active markets found.</p>
        <p>Create the first market to get started!</p>
      </div>
    );
  }

  return (
    <div className="market-list">
      {markets.map((market) => (
        <div key={market.id} className="market-card">
          <div className="market-header">
            <h3>{market.description}</h3>
            <span className={`status ${market.status.toLowerCase()}`}>
              {market.status}
            </span>
          </div>
          
          <div className="market-odds">
            <div className="odds-section">
              <span className="side">YES</span>
              <span className="odds">
                {calculateOdds(market.yesPool, market.noPool, 'yes').toFixed(2)}
              </span>
              <span className="pool">Pool: {market.yesPool}</span>
            </div>
            <div className="odds-section">
              <span className="side">NO</span>
              <span className="odds">
                {calculateOdds(market.yesPool, market.noPool, 'no').toFixed(2)}
              </span>
              <span className="pool">Pool: {market.noPool}</span>
            </div>
          </div>
          
          {market.status === 'Open' && (
            <button 
              className="bet-button"
              onClick={() => onPlaceBet(market)}
            >
              Place Bet
            </button>
          )}
          
          {market.resolution !== undefined && (
            <div className="resolution">
              Result: {market.resolution ? 'YES' : 'NO'}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};