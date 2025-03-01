# Cardano Wallet Integration Guide

This document provides an in-depth explanation of how the Cardano wallet integration works in the Littlefish Foundation platform, particularly focusing on the handle name support implementation.

## Overview

The platform integrates with Cardano wallets to enable seamless blockchain interactions. The integration includes:

1. Wallet connection and authentication
2. Balance checking
3. Transaction signing
4. Handle name resolution and display

## Wallet Connection Flow

1. **Available Wallets Detection**: The application detects available Cardano wallet extensions in the browser.
2. **Connection Dialog**: Users select their preferred wallet from the available options.
3. **Connection Process**: The application connects to the selected wallet using the CIP-30 standard.
4. **Address & Balance Retrieval**: Once connected, the wallet's address and balance are fetched.
5. **Handle Name Resolution**: The system checks if the wallet address has an associated handle name.

## ADA Handle Name Support

ADA Handle is an NFT-based naming system for Cardano that allows users to associate human-readable names with their addresses.

### Technical Implementation

**Policy ID**: `f0ff48bbb7bbe9d59a40f1ce90e9e9d0ff5002ec48f232b49ca0fb9a`

The handle resolution process works as follows:

1. When a wallet connects, we query the API endpoint `/api/handle/:address`
2. The endpoint fetches the assets associated with the address from Blockfrost API
3. It filters for assets matching the ADA Handle policy ID
4. The asset name (in hex) is converted to a string to get the handle name
5. If a handle is found, it's returned to the frontend with related metadata

### Code Implementation

**Server Side**:

```typescript
// Endpoint in server/routes.ts
app.get("/api/handle/:address", async (req, res) => {
  try {
    const { address } = req.params;
    
    // Get assets for the address from Blockfrost
    const assets = await fetchAssetsFromBlockfrost(address);
    
    // Cardano Handle policy ID
    const handlePolicyId = 'f0ff48bbb7bbe9d59a40f1ce90e9e9d0ff5002ec48f232b49ca0fb9a';
    
    // Look for assets with the handle policy ID
    const handleAssets = assets.filter(asset => 
      asset.unit.startsWith(handlePolicyId) && 
      asset.quantity === "1" // Handle NFTs always have quantity 1
    );
    
    if (handleAssets.length === 0) {
      return res.json({ handle: null });
    }
    
    // Extract handle name from asset name
    const handleAsset = handleAssets[0];
    const assetName = handleAsset.unit.replace(handlePolicyId, '');
    const handle = Buffer.from(assetName, 'hex').toString();
    
    return res.json({ 
      handle,
      policyId: handlePolicyId,
      // Additional metadata
    });
  } catch (error) {
    // Error handling
  }
});
```

**Client Side**:

```typescript
// In wallet hook
const connect = async (walletName: string) => {
  // Connect to wallet...
  
  // Fetch handle info for the address
  const handleResponse = await fetch(`/api/handle/${address}`);
  const handleInfo = await handleResponse.json();
  
  // Create wallet info with handle
  const walletInfo = {
    address: address,
    handle: handleInfo?.handle || null,
    name: walletName,
    balance: walletBalance,
    network: network
  };
  
  // Update state
  setWalletState({
    wallet: walletObj,
    walletInfo,
    connecting: false,
    error: null
  });
};
```

## UI Implementation

The handle name is displayed in several places:

1. **Wallet Button**: Shows the handle with $ prefix (e.g., `$web3`) if available, otherwise shows a truncated address
2. **Wallet Dropdown**: Shows the handle in a teal badge, with the full address below
3. **Connection Status**: Includes the handle name in the connection notification

### Handle Display Component

```tsx
<span className="truncate max-w-[100px]">
  {walletState.walletInfo?.handle 
    ? `$${walletState.walletInfo.handle}`
    : `${walletState.walletInfo?.address.substring(0, 8)}...${walletState.walletInfo?.address.substring(walletState.walletInfo.address.length - 4)}`
  }
</span>
```

## Blockfrost API Integration

The platform uses Blockfrost as the API provider for Cardano blockchain data. The API is accessed through a server-side proxy to protect the API key.

### Setup:

1. Obtain a Blockfrost API key from [blockfrost.io](https://blockfrost.io)
2. Set the API key in the environment variables as `BLOCKFROST_API_KEY`
3. The server proxies requests to Blockfrost and returns the data to the frontend

### Key Endpoints:

- `/api/blockfrost/address/:address` - Fetches balance and assets for an address
- `/api/handle/:address` - Resolves handle names for an address

## Testing Mode

For development and testing, the platform includes:

1. **Mock Wallet Connections**: Simulates wallet connections without requiring a real wallet
2. **Random Handle Generation**: Randomly generates handle names for testing the UI
3. **Simulated Blockchain Interactions**: Mock transaction signing and verification

## Security Considerations

1. **Wallet Verification**: Production implementations should verify wallet ownership using signed messages
2. **API Key Protection**: Blockfrost API key is only used server-side and never exposed to clients
3. **Handle Validation**: Handle names are validated before display to prevent injection attacks

## Troubleshooting

Common issues:

1. **Handle Not Showing**: Ensure the Blockfrost API key is valid and has access to mainnet
2. **Connection Errors**: Check for CORS issues or network connectivity problems
3. **Balance Discrepancies**: The balance shown might differ from wallet extensions due to caching

## Future Improvements

1. **Multi-wallet Support**: Enhanced support for multiple connected wallets
2. **CNS Name Support**: Add support for Cardano Name Service domains
3. **Direct CIP-30 Integration**: Replace mock functionality with direct wallet API calls in production