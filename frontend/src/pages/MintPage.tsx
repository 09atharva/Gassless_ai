import { useState, useCallback } from 'react';
import { useAccount } from 'wagmi';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, CheckCircle2, Coins, Info, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SGIP, type SGIPStepState } from '@/lib/sgip';
import { useTransactionHistory } from '@/hooks/use-transaction-history';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import NFTCard3D from '@/components/3d/NFTCard3D';
import SGIPPanel from '@/components/SGIPPanel';
import { TooltipProvider } from '@/components/ui/tooltip';

const MEMBERSHIP_NFT_ADDRESS = (import.meta.env.VITE_MEMBERSHIP_NFT_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`;
const MOCK_USD_ADDRESS = (import.meta.env.VITE_MOCK_USD_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`;

export default function MintPage() {
  const { address, isConnected } = useAccount();
  const [sgipSteps, setSgipSteps] = useState<SGIPStepState[]>([]);
  const [sgipRunning, setSgipRunning] = useState(false);
  const [sgipGas, setSgipGas] = useState<string | undefined>();
  const [sgipError, setSgipError] = useState<string | undefined>();
  const [mintSuccess, setMintSuccess] = useState(false);
  const [faucetSuccess, setFaucetSuccess] = useState(false);
  const { addTransaction, history } = useTransactionHistory();
  const { toast } = useToast();
  const navigate = useNavigate();

  const virtualBalance = history.filter(tx => tx.action.includes('Faucet')).length * 100
    - history.filter(tx => tx.action.includes('AI Payment')).length;

  const runMintPipeline = useCallback(async () => {
    if (!address) return;
    setSgipRunning(true);
    setSgipError(undefined);
    setSgipGas(undefined);
    setSgipSteps([]);

    const pipeline = SGIP.stitch([SGIP.Steps.faucet(), SGIP.Steps.mintMembership()]);

    pipeline.on('*', (event) => {
      if (event.state) setSgipSteps([...event.state]);
      if (event.totalGasSaved) setSgipGas(event.totalGasSaved);
      if (event.type === 'step:complete' && event.state) {
        const s = event.state[event.stepIndex!];
        if (s?.result?.hash) {
          addTransaction({
            hash: s.result.hash,
            action: `SGIP: ${s.step.name}`,
            timestamp: Date.now(),
            gasSaved: s.result.gasSaved ?? '0 ETH ($0)',
            status: 'success',
          });
        }
      }
    });

    const ok = await pipeline.execute({
      address: address!,
      mockUSDAddress: MOCK_USD_ADDRESS,
      membershipNFTAddress: MEMBERSHIP_NFT_ADDRESS,
      balance: virtualBalance,
    });

    setSgipRunning(false);
    if (ok) {
      setMintSuccess(true);
      toast({ title: '🛡️ Membership Minted!', description: `Saved $${pipeline.totalGasSavedUSD.toFixed(2)} in gas via SGIP!` });
    } else {
      setSgipError('Pipeline failed. Please try again.');
      toast({ title: 'Mint Failed', variant: 'destructive' });
    }
  }, [address, virtualBalance, addTransaction, toast]);

  const runFaucetOnly = useCallback(async () => {
    if (!address) return;
    setSgipRunning(true);
    setSgipError(undefined);

    const pipeline = SGIP.stitch([SGIP.Steps.faucet()]);
    pipeline.on('*', (e) => {
      if (e.state) setSgipSteps([...e.state]);
      if (e.totalGasSaved) setSgipGas(e.totalGasSaved);
    });
    const ok = await pipeline.execute({
      address: address!,
      mockUSDAddress: MOCK_USD_ADDRESS,
      membershipNFTAddress: MEMBERSHIP_NFT_ADDRESS,
      balance: 0,
    });

    setSgipRunning(false);
    if (ok) {
      setFaucetSuccess(true);
      addTransaction({ hash: `0x${Math.random().toString(16).slice(2)}`, action: 'MockUSD Faucet', timestamp: Date.now(), gasSaved: '0.0005 ETH ($1.75)', status: 'success' });
      toast({ title: '🪙 100 MUSD Received!', description: 'Gaslessly claimed via UGF.' });
    }
  }, [address, addTransaction, toast]);

  if (!isConnected) {
    return (
      <div className="flex min-h-screen flex-col hero-gradient">
        <Navbar />
        <main className="flex flex-1 items-center justify-center p-6">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="w-full max-w-md glass-card border-0 text-center p-8">
              <CardTitle className="text-2xl font-black mb-3">Connect Wallet</CardTitle>
              <CardDescription>Connect your wallet to mint your gasless membership NFT.</CardDescription>
            </Card>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex min-h-screen flex-col hero-gradient">
        <Navbar />

        <main className="container mx-auto flex flex-1 flex-col items-center justify-start p-6 py-10 max-w-6xl gap-8">
          {/* Page header */}
          <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="text-center">
            <Badge className="mb-3 border-blue-500/30 bg-blue-500/10 text-blue-400 gap-1.5 text-xs">
              <Zap className="h-3 w-3" /> SGIP Powered · Zero ETH Required
            </Badge>
            <h1 className="font-display text-4xl font-black text-white">Mint Your Membership</h1>
            <p className="mt-2 text-slate-400">Gaslessly join via the Stitch Gasless Intelligence Protocol</p>
          </motion.div>

          <div className="grid w-full gap-8 lg:grid-cols-[1fr_380px] xl:grid-cols-[1fr_420px]">
            {/* Left: how it works + SGIP panel */}
            <div className="space-y-6">
              {/* How it works */}
              <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
                <Card className="glass-card border-0 rounded-2xl">
                  <CardHeader>
                    <CardTitle className="text-lg font-bold">How SGIP Minting Works</CardTitle>
                    <CardDescription>One click — multiple gasless operations stitched together</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {[
                        { step: 1, title: 'Balance Intelligence', desc: 'SGIP checks your MUSD. Skips faucet if you have enough.', color: 'bg-blue-500/15 text-blue-400' },
                        { step: 2, title: 'Gasless Faucet', desc: 'If needed, claims 100 MUSD gaslessly via UGF relayer.', color: 'bg-cyan-500/15 text-cyan-400' },
                        { step: 3, title: 'Atomic Mint', desc: 'Mints your GAIM NFT with MUSD covering the gas fee.', color: 'bg-purple-500/15 text-purple-400' },
                        { step: 4, title: 'Live Telemetry', desc: 'Real-time step tracking & gas savings accumulation.', color: 'bg-emerald-500/15 text-emerald-400' },
                      ].map((item) => (
                        <div key={item.step} className="flex gap-4">
                          <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${item.color} font-bold text-sm`}>
                            {item.step}
                          </div>
                          <div className="pt-1">
                            <h3 className="font-semibold text-white text-sm">{item.title}</h3>
                            <p className="text-xs text-slate-400 mt-0.5">{item.desc}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              {/* SGIP pipeline panel */}
              <AnimatePresence>
                {sgipSteps.length > 0 && (
                  <SGIPPanel
                    steps={sgipSteps}
                    totalGasSaved={sgipGas}
                    isRunning={sgipRunning}
                    error={sgipError}
                  />
                )}
              </AnimatePresence>

              {/* Faucet card */}
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <Card className="glass-card border-0 rounded-2xl border-l-4 border-l-amber-500/50">
                  <CardContent className="pt-5">
                    <div className="flex items-start gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/15">
                        <Coins className="h-5 w-5 text-amber-400" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-white">Need MockUSD?</h3>
                        <p className="text-sm text-slate-400 mt-1">
                          Claim 100 MUSD gaslessly to cover your mint and AI interactions.
                        </p>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={runFaucetOnly}
                          disabled={sgipRunning || faucetSuccess}
                          className="mt-3 border-amber-500/30 text-amber-400 hover:bg-amber-500/10 gap-2"
                        >
                          {faucetSuccess ? (
                            <><CheckCircle2 className="h-3.5 w-3.5" /> Received!</>
                          ) : sgipRunning ? (
                            <><Sparkles className="h-3.5 w-3.5 animate-spin" /> Claiming...</>
                          ) : (
                            <><Coins className="h-3.5 w-3.5" /> Claim 100 MUSD</>
                          )}
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            </div>

            {/* Right: 3D NFT Card + Mint Action */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 }}
              className="flex flex-col gap-6"
            >
              <Card className="glass-card border-0 rounded-2xl overflow-hidden">
                {/* 3D Card */}
                <div className="relative h-72 bg-gradient-to-br from-blue-600/10 via-purple-600/5 to-transparent">
                  <NFTCard3D className="w-full h-full" />
                </div>

                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-black">GaslessAI Member NFT</CardTitle>
                    <Badge className="bg-blue-600 hover:bg-blue-600 text-white border-0">Gasless</Badge>
                  </div>
                  <CardDescription>Unlock premium AI features and exclusive rewards.</CardDescription>
                </CardHeader>

                <CardContent>
                  <div className="space-y-3 text-sm">
                    {[
                      { label: 'Mint Price', value: 'Free', valueClass: 'text-white font-bold' },
                      { label: 'Gas Fee (Normal)', value: '0.0024 ETH', valueClass: 'text-slate-500 line-through' },
                      { label: 'You Pay via SGIP', value: '0 MockUSD', valueClass: 'text-blue-400 font-bold' },
                      { label: 'Gas Savings', value: '~$8.50', valueClass: 'text-emerald-400 font-bold' },
                    ].map(row => (
                      <div key={row.label} className="flex justify-between items-center border-b border-white/5 pb-2">
                        <span className="text-slate-400">{row.label}</span>
                        <span className={row.valueClass}>{row.value}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>

                <CardFooter className="pt-0">
                  <Button
                    onClick={runMintPipeline}
                    disabled={sgipRunning || mintSuccess}
                    className="w-full h-12 text-base font-bold bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-neon-blue"
                  >
                    {sgipRunning ? (
                      <><Sparkles className="mr-2 h-5 w-5 animate-spin" /> Executing SGIP...</>
                    ) : mintSuccess ? (
                      <><CheckCircle2 className="mr-2 h-5 w-5" /> Membership Minted!</>
                    ) : (
                      <><Zap className="mr-2 h-5 w-5" /> Mint via SGIP</>
                    )}
                  </Button>
                </CardFooter>
              </Card>

              {/* Info callout */}
              <div className="flex items-start gap-3 rounded-2xl border border-blue-500/15 bg-blue-500/5 px-4 py-3">
                <Info className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-400">
                  The SGIP pipeline will automatically check your balance, claim MUSD if needed, and mint your NFT — all in a single gasless flow.
                </p>
              </div>
            </motion.div>
          </div>
        </main>

        {/* Success overlay */}
        <AnimatePresence>
          {mintSuccess && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-6"
              onClick={() => setMintSuccess(false)}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.85, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.85 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="w-full max-w-md glass-card rounded-3xl p-10 text-center border border-emerald-500/20 shadow-[0_0_60px_rgba(52,211,153,0.2)]"
                onClick={(e) => e.stopPropagation()}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: 'spring' }}
                  className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 ring-2 ring-emerald-500/30"
                >
                  <CheckCircle2 className="h-10 w-10 text-emerald-400" />
                </motion.div>
                <h2 className="font-display text-3xl font-black text-white mb-2">Welcome, Member!</h2>
                <p className="text-slate-400 mb-2">Your NFT has been minted gaslessly via SGIP.</p>
                {sgipGas && (
                  <p className="text-emerald-400 font-semibold text-sm mb-8">
                    Total gas saved: {sgipGas} 🎉
                  </p>
                )}
                <Button className="w-full bg-blue-600 hover:bg-blue-500 h-12 font-bold" onClick={() => navigate('/dashboard')}>
                  Go to Dashboard
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </TooltipProvider>
  );
}
