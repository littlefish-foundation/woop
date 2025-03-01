import { useState } from 'react';
import { useCardanoWallet } from '@/hooks/use-cardano-wallet';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2 } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { useAuth } from '@/hooks/use-auth';

export function WalletAuth() {
  const { toast } = useToast();
  const { walletState, verifyOwnership } = useCardanoWallet();
  const { user, loginMutation } = useAuth();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [showDialog, setShowDialog] = useState(false);

  // Generate a random challenge message
  const generateChallenge = () => {
    const timestamp = new Date().toISOString();
    return `Authenticate with Littlefish Foundation: ${timestamp}`;
  };

  const handleWalletAuth = async () => {
    if (!walletState.wallet || !walletState.walletInfo) {
      toast({
        title: 'Wallet Required',
        description: 'Please connect your Cardano wallet first',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsAuthenticating(true);
      setShowDialog(true);
      
      // Step 1: Generate a challenge
      const challenge = generateChallenge();
      
      // Step 2: Sign the challenge with wallet
      const signature = await verifyOwnership(challenge);
      
      // Step 3: Verify the signature and authenticate on backend
      const response = await apiRequest('POST', '/api/wallet-auth', {
        address: walletState.walletInfo.address,
        message: challenge,
        signature,
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Authentication failed');
      }
      
      const authData = await response.json();
      
      // If we have a token, use it to authenticate the user
      if (authData.token) {
        // For a token-based auth system, store the token
        localStorage.setItem('authToken', authData.token);
        
        // If we have user info, update the auth context
        if (authData.user) {
          // Update auth context with the user
          loginMutation.mutate(authData.user);
        }
      }
      
      toast({
        title: 'Authentication Successful',
        description: 'You are now authenticated with your Cardano wallet',
      });
    } catch (error) {
      console.error('Wallet authentication error:', error);
      toast({
        title: 'Authentication Failed',
        description: error instanceof Error 
          ? error.message 
          : 'Failed to authenticate with wallet',
        variant: 'destructive',
      });
    } finally {
      setIsAuthenticating(false);
      setShowDialog(false);
    }
  };

  // If user is already authenticated with a wallet, show that info
  if (user?.walletAddress && walletState.walletInfo?.address === user.walletAddress) {
    return (
      <Button 
        variant="ghost" 
        className="gap-2 text-green-700" 
        disabled
      >
        ✓ Wallet Authenticated
      </Button>
    );
  }

  return (
    <>
      <Button 
        variant="secondary" 
        className="gap-2" 
        disabled={!walletState.wallet || isAuthenticating}
        onClick={handleWalletAuth}
      >
        {isAuthenticating && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
        Authenticate with Wallet
      </Button>
      
      {/* Authentication in progress dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Wallet Authentication</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center justify-center p-6">
            <Loader2 className="h-16 w-16 animate-spin text-primary mb-4" />
            <p className="text-center mb-2">
              Please check your wallet extension and approve the signature request.
            </p>
            <p className="text-sm text-muted-foreground text-center">
              You'll be asked to sign a message to verify wallet ownership.
              This does not make any transaction or spend any funds.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}