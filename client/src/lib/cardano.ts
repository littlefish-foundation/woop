import { 
  BrowserWallet,
  Transaction,
  Wallet,
  Asset,
  ForgeScript,
  BlockfrostProvider,
  AppWallet,
  KoiosProvider,
  resolvePaymentKeyHash,
  resolveDatumHash
} from '@meshsdk/core';

// Types
export interface WalletInfo {
  address: string;
  name: string;
  balance: {
    lovelace: string; // in lovelaces
    assets: Asset[];
  };
  network: number; // 0 = testnet, 1 = mainnet
}

export interface WalletState {
  wallet: Wallet | null;
  walletInfo: WalletInfo | null;
  connecting: boolean;
  error: string | null;
}

// Get available wallets
export const getAvailableWallets = async (): Promise<string[]> => {
  return await BrowserWallet.getInstalledWallets();
};

// Connect to wallet
export const connectWallet = async (walletName: string): Promise<{ wallet: Wallet, walletInfo: WalletInfo }> => {
  try {
    const wallet = await BrowserWallet.enable(walletName);
    
    // Get wallet info
    const [address] = await wallet.getUsedAddresses();
    const balance = await wallet.getBalance();
    const network = await wallet.getNetworkId();
    
    const walletInfo: WalletInfo = {
      address,
      name: walletName,
      balance,
      network,
    };
    
    return { wallet, walletInfo };
  } catch (error) {
    console.error('Error connecting to wallet:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to connect to wallet');
  }
};

// Verify wallet ownership via signature
export const verifyWalletOwnership = async (wallet: Wallet, message: string): Promise<string> => {
  try {
    const address = (await wallet.getUsedAddresses())[0];
    const signature = await wallet.signData(address, message);
    return signature;
  } catch (error) {
    console.error('Error signing message:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to verify wallet ownership');
  }
};

// Create a transaction to mint an NFT representing an action
export const createActionNftTx = async (
  wallet: Wallet,
  actionId: number,
  metadata: Record<string, any>
): Promise<Transaction> => {
  // This is a simplified example. In production, you would use an actual Cardano node
  // or provider like Blockfrost and handle the transaction properly
  
  // Create a forge script (this is a simplified example)
  const forgingScript = ForgeScript.withOneSignature(
    await wallet.getPaymentAddress()
  );
  
  const tx = new Transaction({ initiator: wallet });
  
  // Define asset to mint
  const assetName = `ACTION${actionId}`;
  const assetQuantity = 1;
  
  // Add mint action to transaction
  tx.mintAsset(
    forgingScript,
    {
      assetName: assetName,
      assetQuantity: assetQuantity,
      metadata: metadata,
      label: '721', // Standard for NFTs
    }
  );
  
  return tx;
};

// Sign and submit a transaction
export const signAndSubmitTransaction = async (
  wallet: Wallet,
  transaction: Transaction
): Promise<string> => {
  try {
    const signedTx = await wallet.signTx(transaction);
    const txHash = await wallet.submitTx(signedTx);
    return txHash;
  } catch (error) {
    console.error('Error signing/submitting transaction:', error);
    throw new Error(error instanceof Error ? error.message : 'Failed to sign or submit transaction');
  }
};

// Disconnect wallet
export const disconnectWallet = async (): Promise<void> => {
  // In Mesh, there's no explicit disconnect method
  // We just remove the wallet reference
  return Promise.resolve();
};

// Helper to format ADA value (from lovelace)
export const formatAdaValue = (lovelace: string): string => {
  const ada = parseInt(lovelace) / 1_000_000;
  return `${ada.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 })} ₳`;
};