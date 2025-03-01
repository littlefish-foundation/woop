import { useState } from 'react';
import { useMeshWallet } from '@/hooks/use-mesh-wallet';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

export function WalletTest() {
  const { toast } = useToast();
  const { walletState, verifyOwnership } = useMeshWallet();
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  // Generate a test message
  const generateTestMessage = () => {
    const timestamp = new Date().toISOString();
    return `Test message signing at: ${timestamp}`;
  };

  const handleTest = async () => {
    if (!walletState.wallet || !walletState.walletInfo) {
      toast({
        title: 'Wallet Required',
        description: 'Please connect your Cardano wallet first',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsTesting(true);
      setTestResult(null);
      
      // Generate a test message
      const message = generateTestMessage();
      
      // Sign the message with wallet
      const signature = await verifyOwnership(message);
      
      // Display the result
      setTestResult(JSON.stringify({
        message,
        signature: signature.substring(0, 50) + '...',
        address: walletState.walletInfo.address,
      }, null, 2));
      
      toast({
        title: 'Test Successful',
        description: 'Message was successfully signed with your wallet',
      });
    } catch (error) {
      console.error('Wallet test error:', error);
      setTestResult(JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error',
      }, null, 2));
      
      toast({
        title: 'Test Failed',
        description: error instanceof Error 
          ? error.message 
          : 'Failed to sign message with wallet',
        variant: 'destructive',
      });
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Wallet Integration Test</CardTitle>
        <CardDescription>
          Test the MeshSDK wallet integration by signing a message
        </CardDescription>
      </CardHeader>
      <CardContent>
        {testResult && (
          <pre className="bg-gray-100 p-4 rounded-md overflow-auto text-xs">
            {testResult}
          </pre>
        )}
      </CardContent>
      <CardFooter>
        <Button 
          variant="default" 
          className="w-full" 
          disabled={!walletState.wallet || isTesting}
          onClick={handleTest}
        >
          {isTesting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
          Test Message Signing
        </Button>
      </CardFooter>
    </Card>
  );
} 