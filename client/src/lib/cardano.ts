// Types for our mock wallet implementation
export interface Asset {
  unit: string;
  quantity: string;
}

export interface WalletInfo {
  address: string;
  name: string;
  balance: {
    lovelace: string; // in lovelaces
    assets: Asset[];
  };
  network: number; // 0 = testnet, 1 = mainnet
}

// Mock wallet type to avoid importing from meshsdk
export interface Wallet {
  name: string;
  id: string;
  icon?: string;
  version?: string;
  apiVersion?: string;
  // We'll add methods as needed
}

export interface WalletState {
  wallet: Wallet | null;
  walletInfo: WalletInfo | null;
  connecting: boolean;
  error: string | null;
}

// Mock Transaction type
export interface Transaction {
  id: string;
  // Other properties as needed
}

// Get available wallets - mock implementation
export const getAvailableWallets = async (): Promise<string[]> => {
  // Return mock list of wallets
  return ['Nami', 'Eternl', 'Flint', 'Yoroi'];
};

// Connect to wallet - mock implementation
export const connectWallet = async (walletName: string): Promise<{ wallet: Wallet, walletInfo: WalletInfo }> => {
  try {
    // Simulate connection delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Create a mock wallet
    const wallet: Wallet = { 
      name: walletName, 
      id: `wallet-${Date.now()}`,
      icon: '',
      version: '1.0.0',
      apiVersion: '1.0.0'
    };
    
    // Generate a mock wallet address
    const mockAddress = `addr1q${Array(50).fill(0).map(() => 
      'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 36)]
    ).join('')}`;
    
    // Create mock wallet info
    const walletInfo: WalletInfo = {
      address: mockAddress,
      name: walletName,
      balance: {
        lovelace: '150000000', // 150 ADA
        assets: []
      },
      network: 0 // testnet
    };
    
    return { wallet, walletInfo };
  } catch (error) {
    console.error('Error connecting to wallet:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to connect to wallet');
  }
};

// Verify wallet ownership via signature - mock implementation
export const verifyWalletOwnership = async (wallet: Wallet, message: string): Promise<string> => {
  try {
    // Simulate verification delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Generate a mock signature
    const mockSignature = `sig-${Date.now()}-${Math.random().toString(36).substring(2, 15)}`;
    
    return mockSignature;
  } catch (error) {
    console.error('Error signing message:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to verify wallet ownership');
  }
};

// Create a mock transaction
export const createActionNftTx = async (
  wallet: Wallet,
  actionId: number,
  metadata: Record<string, any>
): Promise<Transaction> => {
  // Simulate transaction creation delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return mock transaction
  return {
    id: `tx-${Date.now()}-${actionId}`
  };
};

// Sign and submit a transaction - mock implementation
export const signAndSubmitTransaction = async (
  wallet: Wallet,
  transaction: Transaction
): Promise<string> => {
  try {
    // Simulate signing and submission delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Return mock transaction hash
    return `txhash-${transaction.id}-${Date.now()}`;
  } catch (error) {
    console.error('Error signing/submitting transaction:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to sign or submit transaction');
  }
};

// Disconnect wallet - mock implementation
export const disconnectWallet = async (): Promise<void> => {
  // Simulate disconnection delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return Promise.resolve();
};

// Helper to format ADA value (from lovelace)
export const formatAdaValue = (lovelace: string): string => {
  const ada = parseInt(lovelace) / 1_000_000;
  return `${ada.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })} ₳`;
};