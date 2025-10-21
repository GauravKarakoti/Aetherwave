import { useState, useCallback } from 'react';

interface WalletState {
  isConnected: boolean;
  address: string | null;
  balance: number;
}

export const useLineraWallet = () => {
  const [wallet, setWallet] = useState<WalletState>({
    isConnected: false,
    address: null,
    balance: 0,
  });

  const connect = useCallback(async () => {
    try {
      // Mock connection for development
      // In production, this would use the actual Linera wallet
      const mockAddress = `user_${Math.random().toString(36).substr(2, 9)}`;
      const mockBalance = 1000; // Starting test balance
      
      setWallet({
        isConnected: true,
        address: mockAddress,
        balance: mockBalance,
      });
      
      console.log('Connected to Linera wallet:', mockAddress);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  }, []);

  const disconnect = useCallback(() => {
    setWallet({
      isConnected: false,
      address: null,
      balance: 0,
    });
  }, []);

  return {
    isConnected: wallet.isConnected,
    address: wallet.address,
    balance: wallet.balance,
    connect,
    disconnect,
  };
};