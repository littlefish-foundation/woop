/**
 * This is an implementation of the MeshSDK wallet provider.
 * It uses the actual MeshSDK to interact with Cardano wallets.
 */

import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { initPolyfills } from '@/lib/polyfills';
// Import mesh-specific polyfills
import '@/lib/mesh-polyfill';

// Add type declaration for cardano property on Window
declare global {
  interface Window {
    cardano?: {
      nami?: any;
      eternl?: any;
      flint?: any;
      vespr?: any;
      [key: string]: any;
    };
  }
}

// Types for wallet integration
export interface Asset {
  unit: string;
  quantity: string;
  fingerprint?: string;
  policyId?: string;
  assetName?: string;
}

export interface WalletInfo {
  address: string;
  handle: string | null;
  handles: string[] | null;
  name: string;
  balance: {
    lovelace: string;
    assets: Asset[];
  };
  network: number; // 0 = testnet, 1 = mainnet
  rewardAddress: string | null;
}

export interface WalletState {
  wallet: any | null;
  walletInfo: WalletInfo | null;
  connecting: boolean;
  error: string | null;
}

// Context type
interface MeshWalletContextType {
  walletState: WalletState;
  availableWallets: Array<{ name: string; icon: string; version: string }>;
  loadingWallets: boolean;
  connect: (walletName: string) => Promise<void>;
  disconnect: () => Promise<void>;
  verifyOwnership: (message: string) => Promise<string>;
  signTransaction: (tx: any) => Promise<string>;
  refreshWalletInfo: () => Promise<void>;
}

export const MeshWalletContext = createContext<MeshWalletContextType | null>(null);

export function MeshWalletProvider({ children }: { children: ReactNode }) {
  // Initialize required polyfills
  useEffect(() => {
    initPolyfills();
  }, []);
  
  const { toast } = useToast();
  
  // State management for wallet connection
  const [walletState, setWalletState] = useState<WalletState>({
    wallet: null,
    walletInfo: null,
    connecting: false,
    error: null,
  });
  const [availableWallets, setAvailableWallets] = useState<Array<{ name: string; icon: string; version: string }>>([]);
  const [loadingWallets, setLoadingWallets] = useState<boolean>(true);
  const [meshSDK, setMeshSDK] = useState<any>(null);
  
  // Load MeshSDK and available wallets on component mount
  useEffect(() => {
    const loadMeshSDK = async () => {
      try {
        setLoadingWallets(true);
        
        // Ensure polyfills are initialized before importing MeshSDK
        initPolyfills();
        
        // Dynamically import MeshSDK to avoid SSR issues
        const { BrowserWallet } = await import('@meshsdk/core');
        setMeshSDK({ BrowserWallet });
        
        // Get available wallets
        const wallets = await BrowserWallet.getInstalledWallets();
        setAvailableWallets(wallets);
      } catch (error) {
        console.error('Failed to load MeshSDK:', error);
        // Fallback to empty wallets list
        setAvailableWallets([]);
      } finally {
        setLoadingWallets(false);
      }
    };
    
    loadMeshSDK();
  }, []);
  
  // Fetch handle information from Blockfrost
  const fetchHandleInfo = async (address: string): Promise<{ handle: string | null; handles: string[] | null }> => {
    try {
      const response = await fetch(`/api/handle/${address}`);
      if (!response.ok) {
        throw new Error('Failed to fetch handle info');
      }
      
      const data = await response.json();
      return {
        handle: data.handle,
        handles: data.handles
      };
    } catch (error) {
      console.error('Error fetching handle info:', error);
      return { handle: null, handles: null };
    }
  };
  
  // Refresh wallet info (balance, etc.)
  const refreshWalletInfo = async () => {
    if (!walletState.wallet || !walletState.walletInfo) {
      return;
    }
    
    try {
      const walletAPI = walletState.wallet;
      
      // Get wallet address
      const address = await walletAPI.getChangeAddress();
      
      // Get wallet balance
      const lovelace = await walletAPI.getLovelace();
      const assets = await walletAPI.getAssets();
      
      // Format assets for our interface
      const formattedAssets = Object.entries(assets).map(([unit, quantity]) => ({
        unit,
        quantity: String(quantity) // Ensure quantity is a string
      }));
      
      // Get handle info
      const { handle, handles } = await fetchHandleInfo(address);
      
      // Update wallet info
      setWalletState(prev => ({
        ...prev,
        walletInfo: {
          ...prev.walletInfo!,
          address,
          handle,
          handles,
          balance: {
            lovelace: lovelace.toString(),
            assets: formattedAssets
          }
        }
      }));
      
      toast({
        title: 'Wallet Updated',
        description: 'Wallet information has been refreshed',
      });
    } catch (error) {
      console.error('Error refreshing wallet info:', error);
      toast({
        title: 'Error',
        description: 'Failed to refresh wallet information',
        variant: 'destructive',
      });
    }
  };
  
  // Connect to wallet
  const connect = async (walletName: string) => {
    if (!meshSDK) {
      toast({
        title: 'SDK Not Loaded',
        description: 'MeshSDK is not loaded yet. Please try again.',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      setWalletState(prev => ({ ...prev, connecting: true, error: null }));
      
      // Connect to wallet using MeshSDK
      const { BrowserWallet } = meshSDK;
      const walletAPI = await BrowserWallet.enable(walletName);
      
      // Get wallet address
      const address = await walletAPI.getChangeAddress();
      
      // Get reward address
      let rewardAddress = null;
      try {
        const rewardAddresses = await walletAPI.getRewardAddresses();
        rewardAddress = rewardAddresses[0] || null;
      } catch (error) {
        console.error('Failed to get reward address:', error);
      }
      
      // Get wallet balance
      const lovelace = await walletAPI.getLovelace();
      const assets = await walletAPI.getAssets();
      
      // Format assets for our interface
      const formattedAssets = Object.entries(assets).map(([unit, quantity]) => ({
        unit,
        quantity: String(quantity) // Ensure quantity is a string
      }));
      
      // Get handle info
      const { handle, handles } = await fetchHandleInfo(address);
      
      // Update wallet state
      setWalletState({
        wallet: walletAPI,
        walletInfo: {
          address,
          handle,
          handles,
          name: walletName,
          balance: {
            lovelace: lovelace.toString(),
            assets: formattedAssets
          },
          network: 1, // mainnet
          rewardAddress
        },
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
      console.error('Failed to connect wallet:', error);
      setWalletState(prev => ({
        ...prev,
        connecting: false,
        error: error instanceof Error ? error.message : 'Unknown error connecting wallet',
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
      console.error('Failed to disconnect wallet:', error);
      
      toast({
        title: 'Disconnect Failed',
        description: error instanceof Error ? error.message : 'Failed to disconnect wallet',
        variant: 'destructive',
      });
    }
  };
  
  // Sign message for wallet verification
  const verifyOwnership = async (message: string): Promise<string> => {
    if (!walletState.wallet) {
      throw new Error('Wallet not connected');
    }
    
    try {
      // Use the wallet's signData method
      const signature = await walletState.wallet.signData(walletState.walletInfo?.address || '', message);
      
      return JSON.stringify(signature);
    } catch (error) {
      console.error('Failed to sign message:', error);
      throw error;
    }
  };
  
  // Sign transaction
  const signTransaction = async (tx: any): Promise<string> => {
    if (!walletState.wallet) {
      throw new Error('Wallet not connected');
    }
    
    try {
      // Use the wallet's signTx method
      const signedTx = await walletState.wallet.signTx(tx);
      
      toast({
        title: 'Transaction Signed',
        description: 'Transaction has been signed successfully',
      });
      
      return signedTx;
    } catch (error) {
      console.error('Failed to sign transaction:', error);
      throw error;
    }
  };
  
  // Auto-connect to last used wallet on startup
  useEffect(() => {
    const autoConnect = async () => {
      const savedWallet = localStorage.getItem('cardanoWallet');
      if (savedWallet && meshSDK && availableWallets.some(wallet => wallet.name === savedWallet)) {
        try {
          await connect(savedWallet);
        } catch (error) {
          console.error('Auto-connect failed:', error);
          // Don't show toast for auto-connect failures
        }
      }
    };

    if (availableWallets.length > 0 && !walletState.wallet && !walletState.connecting && meshSDK) {
      autoConnect();
    }
  }, [availableWallets, walletState.wallet, walletState.connecting, meshSDK]);
  
  return (
    <MeshWalletContext.Provider
      value={{
        walletState,
        availableWallets,
        loadingWallets,
        connect,
        disconnect,
        verifyOwnership,
        signTransaction,
        refreshWalletInfo
      }}
    >
      {children}
    </MeshWalletContext.Provider>
  );
}

export function useMeshWallet() {
  const context = useContext(MeshWalletContext);
  if (!context) {
    throw new Error('useMeshWallet must be used within a MeshWalletProvider');
  }
  return context;
}