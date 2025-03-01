# ADA Handle Name Support

This document provides detailed information about ADA Handle name support in the Littlefish Foundation Platform.

## What is ADA Handle?

[ADA Handle](https://adahandle.com/) is a Cardano Native Token NFT that serves as a human-readable identifier for Cardano addresses. It allows users to replace complex addresses like `addr1q8zsjx7vxkl4esfejafhxthyew8c54c9ch95gkv3nz37sxrc9ty742qncmffaesxqarvqjmxmy36d9aht2duhmhvekgq3jd3w2` with simple names like `$climate` or `$web3`.

## How ADA Handle Names Work

ADA Handle names are implemented as unique NFTs on the Cardano blockchain with the following properties:

- **Policy ID**: `f0ff48bbb7bbe9d59a40f1ce90e9e9d0ff5002ec48f232b49ca0fb9a`
- **Format**: Names start with `$` character
- **Uniqueness**: Each handle name is unique on the Cardano blockchain
- **Ownership**: Users own their handles as NFTs in their wallets

## Platform Integration

The Littlefish Foundation Platform integrates ADA Handle names across the application:

### 1. Wallet Connection

When a user connects their Cardano wallet, the platform:

1. Retrieves the wallet address
2. Checks for ADA Handle NFTs in the wallet
3. If a handle is found, it's extracted and stored with the wallet info
4. The UI is updated to display the handle name prominently

### 2. Handle Display in UI

When a handle name is available:

- **Wallet Button**: Shows `$handlename` instead of the truncated address
- **Wallet Dropdown**: Displays the handle in a special teal badge
- **Address Display**: Full address is still shown below the handle
- **Connection Status**: Notifications include the handle name

### 3. Technical Implementation

#### Handle Resolution Process

1. The server checks for assets in the connected address
2. It filters for assets with the ADA Handle policy ID
3. For matching assets, it extracts the name from the hex-encoded asset name
4. The handle name is returned to the frontend for display

#### API Endpoint

```
GET /api/handle/:address
```

Response format:

```json
{
  "handle": "climate",
  "policyId": "f0ff48bbb7bbe9d59a40f1ce90e9e9d0ff5002ec48f232b49ca0fb9a",
  "fingerprint": "asset1...",
  "metadata": {
    "name": "$climate",
    "description": "..."
  }
}
```

## User Benefits

ADA Handle integration provides several benefits:

1. **Improved User Experience**: Easy identification with human-readable names
2. **Enhanced Recognizability**: Users can establish consistent identity across the platform
3. **Simplified Sharing**: Easier to share and remember than full addresses
4. **Community Integration**: Brings native Cardano features into the platform

## Getting an ADA Handle

Users can obtain their own ADA Handle:

1. Visit [adahandle.com](https://adahandle.com/)
2. Search for available handle names
3. Purchase a handle (payment in ADA)
4. The handle NFT will be sent to your Cardano wallet

**Note**: Handles are priced in ADA and represent a unique NFT on the Cardano blockchain.

## Blockchain Verification

To verify a handle's authenticity:

1. Check that it's under the correct policy ID
2. Verify it's owned by the associated address
3. Confirm it follows the standard format (lowercase, allowed characters)

## Future Enhancements

Planned improvements for handle name support:

1. **Handle Search**: Ability to search users by their handle names
2. **Handle Verification**: Visual indicators for verified handles
3. **Enhanced Metadata**: Utilizing additional metadata from handle NFTs
4. **Handle-to-Address Lookup**: Reverse lookup from handle to address
5. **Multiple Handle Support**: Support for users with multiple handles

## Testing in Demo Mode

For testing purposes, the platform includes:

- Random handle name generation (60% chance on wallet connection)
- Sample handle names from various categories
- Simulated handle metadata

## Additional Resources

- [ADA Handle Official Website](https://adahandle.com/)
- [ADA Handle NFT Explorer](https://cardanoscan.io/tokenPolicy/f0ff48bbb7bbe9d59a40f1ce90e9e9d0ff5002ec48f232b49ca0fb9a)
- [Cardano Blockchain Explorer](https://cardanoscan.io/)
- [Blockfrost API Documentation](https://blockfrost.dev/)