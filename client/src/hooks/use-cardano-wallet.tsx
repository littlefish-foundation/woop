import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useToast } from '@/hooks/use-toast';

// Mock interfaces for Cardano wallet integration
export interface Asset {
  unit: string;
  quantity: string;
}

export interface WalletInfo {
  address: string;
  name: string;
  balance: {
    lovelace: string;
    assets: Asset[];
  };
  network: number; // 0 = testnet, 1 = mainnet
}

export interface WalletState {
  wallet: any | null;
  walletInfo: WalletInfo | null;
  connecting: boolean;
  error: string | null;
}

// Mock Transaction type
type Transaction = any;

// Utility to format ADA values
export const formatAdaValue = (lovelace: string): string => {
  const adaValue = parseInt(lovelace) / 1000000;
  return `${adaValue.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 6 })} ₳`;
};

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

  // Mock implementation for available wallets
  useEffect(() => {
    // Simulate loading wallets
    const mockWallets = ['Nami', 'Eternl', 'Flint', 'Yoroi', 'Vespr', 'Lace', 'GeroWallet', 'Typhon'];
    
    setTimeout(() => {
      setAvailableWallets(mockWallets);
      setLoadingWallets(false);
    }, 1000);
  }, []);

  // Mock wallet connection
  const connect = async (walletName: string) => {
    try {
      setWalletState(prev => ({ ...prev, connecting: true, error: null }));
      
      // Simulate connection delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate a mock wallet address
      const mockAddress = `addr1q${Array(50).fill(0).map(() => 
        'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 36)]
      ).join('')}`;
      
      // Create mock wallet info
      const walletInfo: WalletInfo = {
        address: mockAddress,
        name: walletName,
        balance: {
          lovelace: '28240000', // 28.24 ADA
          assets: []
        },
        network: 0 // testnet
      };
      
      // Update state
      setWalletState({
        wallet: { name: walletName, id: Date.now() }, // Mock wallet object
        walletInfo,
        connecting: false,
        error: null
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

  // Mock wallet disconnection
  const disconnect = async () => {
    try {
      // Simulate disconnection delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
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

  // Mock verification
  const verifyOwnership = async (message: string) => {
    if (!walletState.wallet) {
      throw new Error('No wallet connected');
    }
    
    try {
      // Simulate verification delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a mock signature
      const mockSignature = `sig-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      
      return mockSignature;
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

  // Mock transaction signing
  const sign = async (transaction: Transaction) => {
    if (!walletState.wallet) {
      throw new Error('No wallet connected');
    }
    
    try {
      // Simulate signing delay
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      // Generate a mock transaction hash
      const txHash = `tx-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
      
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
  }, [availableWallets, walletState.wallet, walletState.connecting]);

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