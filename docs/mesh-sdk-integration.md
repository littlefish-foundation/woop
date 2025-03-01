# MeshSDK Integration Plan

This document outlines the plan for integrating MeshSDK with the Littlefish Foundation platform to enable seamless Cardano wallet connectivity.

## Current Status

- Custom mock wallet implementation is operational and provides a smooth UX
- Initial attempts to integrate MeshSDK resulted in "global is not defined" errors in browser environment
- Polyfill infrastructure is in place but requires proper configuration

## Integration Steps

### Phase 1: Infrastructure (Completed)
- ✅ Install required packages: `@meshsdk/core`, `@meshsdk/react`
- ✅ Create polyfill module to handle NodeJS-to-browser compatibility
- ✅ Create placeholder implementation of `MeshWalletConnect` component

### Phase 2: Implementation
1. Update `main.tsx` to initialize polyfills:
   ```typescript
   import { initPolyfills } from '@/lib/polyfills';
   initPolyfills();
   // Rest of the imports
   ```

2. Create a proper MeshProvider wrapper in a new hook:
   ```typescript
   // In src/hooks/use-mesh-wallet.tsx
   import { MeshProvider } from '@meshsdk/react';
   
   export function MeshWalletProvider({ children }: { children: ReactNode }) {
     return (
       <MeshProvider>
         {children}
       </MeshProvider>
     );
   }
   ```

3. Update the MeshWalletConnect component to use MeshSDK hooks:
   ```typescript
   // In src/components/wallet/mesh-wallet-connect.tsx
   import { CardanoWallet, useWallet } from '@meshsdk/react';
   ```

4. Add proper wallet state management and asset display
   - Create functions to fetch wallet balance and assets
   - Display NFTs owned by the wallet
   - Implement transaction signing

### Phase 3: Server Integration
1. Create API endpoints for wallet verification:
   - `/api/verify-wallet` to verify wallet signatures
   - `/api/link-wallet` to associate a wallet with a user account

2. Update user schema to store wallet address and verification status

3. Create server-side utilities for Cardano transactions:
   - Generate policy IDs
   - Mint and distribute NFTs
   - Validate on-chain transactions

## Wallet Functions to Implement

The following functions need to be implemented using MeshSDK:

1. **Connect wallet**
   - List available wallets
   - Connect to selected wallet
   - Retrieve wallet information (address, balance)

2. **Verify wallet ownership**
   - Challenge-response signature verification
   - Link wallet address to user account

3. **Transaction handling**
   - Create and sign transactions
   - Submit transactions to the network
   - Track transaction status

4. **NFT operations**
   - List NFTs in wallet
   - Create NFTs representing Actions
   - Transfer NFTs between wallets

## Testing Plan

1. Unit tests for wallet connectivity functions
2. Integration tests for wallet-to-backend operations
3. User flow tests for common operations:
   - Connect wallet
   - Verify ownership
   - Purchase Action NFT
   - View owned NFTs

## Resources

- [MeshSDK Documentation](https://meshjs.dev/apis/react)
- [Cardano Developer Portal](https://developers.cardano.org/)
- [Attached documentation for wallet integration](../attached_assets/Pasted-In-order-for-dApps-to-communicate-with-the-user-s-wallet-we-need-a-way-to-connect-to-their-wallet--1740849968051.txt)