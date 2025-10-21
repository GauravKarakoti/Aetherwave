import React, { useState } from 'react';
import { Market } from '../App';

interface PlaceBetModalProps {
  market: Market;
  userBalance: number;
  onClose: () => void;
  onBetPlaced: () => void;
}

export const PlaceBetModal: React.FC<PlaceBetModalProps> = ({
  market,
  userBalance,
  onClose,
  onBetPlaced,
}) => {
  const [selectedSide, setSelectedSide] = useState<'yes' | 'no'>('yes');
  const [amount, setAmount] = useState('');
  const [isPlacing, setIsPlacing] = useState(false);

  const calculateOdds = (side: 'yes' | 'no'): number => {
    const total = market.yesPool + market.noPool;
    if (total === 0) return 0.5;
    
    if (side === 'yes') {
      return market.noPool / total;
    } else {
      return market.yesPool / total;
    }
  };

  const handlePlaceBet = async () => {
    if (!amount || parseFloat(amount) <= 0) return;
    
    const betAmount = parseFloat(amount);
    if (betAmount > userBalance) {
      alert('Insufficient balance');
      return;
    }

    setIsPlacing(true);
    try {
      // Mock bet placement - in production, this would call the Linera contract
      console.log(`Placing bet: ${selectedSide} ${betAmount} on market ${market.id}`);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert('Bet placed successfully!');
      onBetPlaced();
    } catch (error) {
      console.error('Failed to place bet:', error);
      alert('Failed to place bet');
    } finally {
      setIsPlacing(false);
    }
  };

  const odds = calculateOdds(selectedSide);
  const potentialPayout = amount ? (parseFloat(amount) / odds).toFixed(2) : '0';

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2>Place Bet</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-content">
          <div className="market-description">
            <strong>Market:</strong> {market.description}
          </div>
          
          <div className="bet-side-selection">
            <label>Select Side:</label>
            <div className="side-buttons">
              <button
                className={`side-button ${selectedSide === 'yes' ? 'selected' : ''}`}
                onClick={() => setSelectedSide('yes')}
              >
                YES (Odds: {calculateOdds('yes').toFixed(2)})
              </button>
              <button
                className={`side-button ${selectedSide === 'no' ? 'selected' : ''}`}
                onClick={() => setSelectedSide('no')}
              >
                NO (Odds: {calculateOdds('no').toFixed(2)})
              </button>
            </div>
          </div>
          
          <div className="amount-selection">
            <label>Amount:</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="Enter amount"
              min="1"
              max={userBalance}
            />
            <div className="balance">Available: {userBalance} TEST</div>
          </div>
          
          <div className="bet-summary">
            <div className="summary-item">
              <span>Potential Payout:</span>
              <span>{potentialPayout} TEST</span>
            </div>
            <div className="summary-item">
              <span>Potential Profit:</span>
              <span>{(parseFloat(potentialPayout) - (parseFloat(amount) || 0)).toFixed(2)} TEST</span>
            </div>
          </div>
        </div>
        
        <div className="modal-actions">
          <button onClick={onClose} disabled={isPlacing}>
            Cancel
          </button>
          <button 
            onClick={handlePlaceBet}
            disabled={isPlacing || !amount || parseFloat(amount) <= 0}
            className="primary"
          >
            {isPlacing ? 'Placing Bet...' : 'Place Bet'}
          </button>
        </div>
      </div>
    </div>
  );
};