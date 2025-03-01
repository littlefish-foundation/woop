import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
  connectWallet,
  disconnectWallet,
  getAvailableWallets,
  signAndSubmitTransaction,
  verifyWalletOwnership,
  WalletInfo,
  WalletState
} from '@/lib/cardano';
import { Wallet, Transaction } from '@meshsdk/core';
import { useToast } from '@/hooks/use-toast';

// Context type
interface CardanoWalletContextType {
  walletState: WalletState;
  availableWallets: string[];
  loadingWallets: boolean;
  connect: (walletName: string) => Promise<void>;
  disconnect: () => Promise<void>;
  verifyOwnership: (message: string) => Promise<string>;
  sign: (transaction: Transaction) => Promise<string>;
}

// Create context
export const CardanoWalletContext = createContext<CardanoWalletContextType | null>(null);

// Provider component
export function CardanoWalletProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [walletState, setWalletState] = useState<WalletState>({
    wallet: null,
    walletInfo: null,
    connecting: false,
    error: null,
  });
  const [availableWallets, setAvailableWallets] = useState<string[]>([]);
  const [loadingWallets, setLoadingWallets] = useState<boolean>(true);

  // Load available wallets
  useEffect(() => {
    const fetchWallets = async () => {
      try {
        const wallets = await getAvailableWallets();
        setAvailableWallets(wallets);
      } catch (error) {
        console.error('Error loading wallets:', error);
        toast({
          title: 'Wallet Error',
          description: 'Failed to load available wallets',
          variant: 'destructive',
        });
      } finally {
        setLoadingWallets(false);
      }
    };

    fetchWallets();
  }, [toast]);

  // Connect to wallet
  const connect = async (walletName: string) => {
    try {
      setWalletState(prev => ({ ...prev, connecting: true, error: null }));
      
      const { wallet, walletInfo } = await connectWallet(walletName);
      
      setWalletState({
        wallet,
        walletInfo,
        connecting: false,
        error: null,
      });
      
      // Save wallet name to localStorage
      localStorage.setItem('cardanoWallet', walletName);
      
      toast({
        title: 'Wallet Connected',
        description: `Connected to ${walletName}`,
      });
    } catch (error) {
      console.error('Connection error:', error);
      setWalletState(prev => ({
        ...prev,
        connecting: false,
        error: error instanceof Error ? error.message : 'Failed to connect wallet',
      }));
      
      toast({
        title: 'Connection Failed',
        description: error instanceof Error ? error.message : 'Failed to connect wallet',
        variant: 'destructive',
      });
    }
  };

  // Disconnect wallet
  const disconnect = async () => {
    try {
      await disconnectWallet();
      setWalletState({
        wallet: null,
        walletInfo: null,
        connecting: false,
        error: null,
      });
      
      // Remove from localStorage
      localStorage.removeItem('cardanoWallet');
      
      toast({
        title: 'Wallet Disconnected',
        description: 'Successfully disconnected wallet',
      });
    } catch (error) {
      console.error('Disconnect error:', error);
      toast({
        title: 'Disconnect Failed',
        description: error instanceof Error ? error.message : 'Failed to disconnect wallet',
        variant: 'destructive',
      });
    }
  };

  // Verify wallet ownership
  const verifyOwnership = async (message: string) => {
    if (!walletState.wallet) {
      throw new Error('No wallet connected');
    }
    
    try {
      return await verifyWalletOwnership(walletState.wallet, message);
    } catch (error) {
      console.error('Verification error:', error);
      toast({
        title: 'Verification Failed',
        description: error instanceof Error ? error.message : 'Failed to verify wallet ownership',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Sign transaction
  const sign = async (transaction: Transaction) => {
    if (!walletState.wallet) {
      throw new Error('No wallet connected');
    }
    
    try {
      const txHash = await signAndSubmitTransaction(walletState.wallet, transaction);
      
      toast({
        title: 'Transaction Submitted',
        description: `Transaction hash: ${txHash.substring(0, 10)}...`,
      });
      
      return txHash;
    } catch (error) {
      console.error('Transaction error:', error);
      toast({
        title: 'Transaction Failed',
        description: error instanceof Error ? error.message : 'Failed to submit transaction',
        variant: 'destructive',
      });
      throw error;
    }
  };

  // Auto-connect to last used wallet on startup
  useEffect(() => {
    const autoConnect = async () => {
      const savedWallet = localStorage.getItem('cardanoWallet');
      if (savedWallet && availableWallets.includes(savedWallet)) {
        try {
          await connect(savedWallet);
        } catch (error) {
          console.error('Auto-connect failed:', error);
          // Don't show toast for auto-connect failures
        }
      }
    };

    if (availableWallets.length > 0 && !walletState.wallet && !walletState.connecting) {
      autoConnect();
    }
  }, [availableWallets]);

  // Context value
  const value: CardanoWalletContextType = {
    walletState,
    availableWallets,
    loadingWallets,
    connect,
    disconnect,
    verifyOwnership,
    sign,
  };

  return (
    <CardanoWalletContext.Provider value={value}>
      {children}
    </CardanoWalletContext.Provider>
  );
}

// Hook for using the context
export function useCardanoWallet() {
  const context = useContext(CardanoWalletContext);
  if (!context) {
    throw new Error('useCardanoWallet must be used within a CardanoWalletProvider');
  }
  return context;
}