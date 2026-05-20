import { useState } from 'react';
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, Shield, Loader2, CheckCircle2, Coins } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { UGF_SDK } from '@/lib/ugf-sdk';
import { useTransactionHistory } from '@/hooks/use-transaction-history';
import { useToast } from '@/hooks/use-toast';
import { encodeFunctionData, parseEther } from 'viem';
import { useNavigate } from 'react-router-dom';

const MEMBERSHIP_NFT_ADDRESS = (import.meta.env.VITE_MEMBERSHIP_NFT_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`;
const MOCK_USD_ADDRESS = (import.meta.env.VITE_MOCK_USD_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`;

const NFT_ABI = [
  {
    name: 'mintMembership',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
  },
] as const;

const MOCK_USD_ABI = [
  {
    name: 'mint',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'to', type: 'address' },
      { name: 'amount', type: 'uint256' },
    ],
    outputs: [],
  },
] as const;

export default function MintPage() {
  const { address, isConnected } = useAccount();
  const [isMinting, setIsMinting] = useState(false);
  const [mintSuccess, setMintSuccess] = useState(false);
  const { addTransaction } = useTransactionHistory();
  const { toast } = useToast();
  const navigate = useNavigate();

  const { writeContractAsync: faucetWrite } = useWriteContract();

  const handleMint = async () => {
    if (!isConnected) return;
    
    setIsMinting(true);
    try {
      // 1. Prepare the transaction data
      const data = encodeFunctionData({
        abi: NFT_ABI,
        functionName: 'mintMembership',
        args: [],
      });

      // 2. Execute via UGF Mock SDK (Simulating gasless UX)
      const response = await UGF_SDK.executeGaslessTransaction(
        {
          to: MEMBERSHIP_NFT_ADDRESS,
          data: data,
        },
        MOCK_USD_ADDRESS
      );

      if (response.success) {
        setMintSuccess(true);
        addTransaction({
          hash: response.hash!,
          action: 'Mint Membership NFT',
          timestamp: Date.now(),
          gasSaved: response.gasSaved,
          status: 'success',
        });
        toast({
          title: "Mint Successful!",
          description: `You saved ${response.gasSaved} in gas fees.`,
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Mint Failed",
        description: "Something went wrong during the gasless transaction.",
        variant: "destructive",
      });
    } finally {
      setIsMinting(false);
    }
  };

  const [isFauceting, setIsFauceting] = useState(false);
  const handleFaucet = async () => {
    if (!address) return;
    setIsFauceting(true);
    try {
      // Use UGF SDK to simulate a gasless faucet request
      const response = await UGF_SDK.requestFaucet(address);
      
      if (response.success) {
        addTransaction({
          hash: response.hash!,
          action: 'MockUSD Faucet',
          timestamp: Date.now(),
          gasSaved: response.gasSaved,
          status: 'success',
        });

        toast({
          title: "Gasless Faucet Success",
          description: `100 MockUSD added! You saved ${response.gasSaved} in gas fees via UGF.`,
        });
      }
    } catch (error) {
      console.error(error);
      toast({
        title: "Faucet Failed",
        description: "Could not request MockUSD even via gasless relayer.",
        variant: "destructive",
      });
    } finally {
      setIsFauceting(false);
    }
  };

  if (!isConnected) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex flex-1 items-center justify-center p-6">
          <Card className="w-full max-w-md border-white/10 bg-slate-900/50 backdrop-blur-sm text-center">
            <CardHeader>
              <CardTitle>Connect Wallet</CardTitle>
              <CardDescription>Connect to mint your gasless membership.</CardDescription>
            </CardHeader>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className="container mx-auto flex flex-1 items-center justify-center p-6">
        <div className="grid w-full max-w-4xl gap-8 md:grid-cols-2">
          {/* Mint Card */}
          <Card className="overflow-hidden border-white/10 bg-slate-900/50 backdrop-blur-sm">
            <div className="aspect-square w-full bg-gradient-to-br from-blue-600/20 to-purple-600/20 flex items-center justify-center p-12">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              >
                <Shield className="h-32 w-32 text-blue-500 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]" />
              </motion.div>
            </div>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-2xl font-bold">Member NFT</CardTitle>
                <Badge className="bg-blue-600 hover:bg-blue-600">Gasless</Badge>
              </div>
              <CardDescription>
                Unlock premium AI features and exclusive rewards.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm text-slate-400">
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span>Price</span>
                  <span className="font-medium text-white">Free</span>
                </div>
                <div className="flex items-center justify-between border-b border-white/5 pb-2">
                  <span>Gas Fee</span>
                  <div className="flex items-center gap-1 text-green-500 font-medium line-through">
                    0.0024 ETH
                  </div>
                </div>
                <div className="flex items-center justify-between text-blue-500 font-bold">
                  <span>You Pay</span>
                  <span>0 MockUSD</span>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button 
                onClick={handleMint} 
                disabled={isMinting || mintSuccess} 
                className="w-full bg-blue-600 hover:bg-blue-700 h-12 text-lg font-bold"
              >
                {isMinting ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    Executing UGF Tx...
                  </>
                ) : mintSuccess ? (
                  <>
                    <CheckCircle2 className="mr-2 h-5 w-5" />
                    Minted Successfully
                  </>
                ) : (
                  "Mint Membership NFT"
                )}
              </Button>
            </CardFooter>
          </Card>

          {/* Explanation Card */}
          <div className="flex flex-col justify-center space-y-6">
            <div>
              <h2 className="text-3xl font-bold text-white">How it works</h2>
              <p className="mt-4 text-slate-400">
                We use the <span className="text-blue-500 font-semibold">Universal Gasless Framework (UGF)</span> to eliminate the need for ETH.
              </p>
            </div>

            <div className="space-y-4">
              {[
                { step: 1, title: 'Check Balance', desc: 'UGF checks your MockUSD balance.' },
                { step: 2, title: 'Authorize', desc: 'You authorize a gasless transaction.' },
                { step: 3, title: 'Execute', desc: 'UGF pays the gas in ETH, charging you MockUSD.' },
                { step: 4, title: 'Complete', desc: 'The NFT is minted to your wallet on Base Sepolia.' },
              ].map((item) => (
                <div key={item.step} className="flex gap-4">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600/20 text-blue-500 font-bold">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="font-semibold text-white">{item.title}</h3>
                    <p className="text-sm text-slate-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-6">
              <div className="flex items-start gap-4">
                <Coins className="h-6 w-6 text-blue-500 mt-1" />
                <div className="space-y-2">
                  <h3 className="font-bold">Need MockUSD?</h3>
                  <p className="text-sm text-slate-400">
                    Get 100 MockUSD for testing your gasless transactions on Base Sepolia.
                  </p>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleFaucet}
                    disabled={isFauceting}
                    className="border-blue-500/50 hover:bg-blue-500/10"
                  >
                    {isFauceting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                    Get MockUSD Faucet
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <AnimatePresence>
        {mintSuccess && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 p-6"
            onClick={() => setMintSuccess(false)}
          >
            <Card className="w-full max-w-md border-blue-500 bg-slate-900 text-center p-8">
              <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-500/20 text-green-500">
                <CheckCircle2 className="h-12 w-12" />
              </div>
              <h2 className="text-3xl font-bold mb-2">Welcome, Member!</h2>
              <p className="text-slate-400 mb-8">
                Your NFT has been minted gaslessly. You can now access all AI features.
              </p>
              <Button className="w-full bg-blue-600" onClick={() => navigate('/dashboard')}>
                Go to Dashboard
              </Button>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
