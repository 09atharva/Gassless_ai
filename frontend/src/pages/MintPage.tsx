import { useState, useCallback } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Zap, CheckCircle2, Coins, Sparkles, LayoutDashboard, Bot, History, GitBranch } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { SGIP, type SGIPStepState } from '@/lib/sgip';
import { useTransactionHistory } from '@/hooks/use-transaction-history';
import { useToast } from '@/hooks/use-toast';
import NFTCard3D from '@/components/3d/NFTCard3D';
import SGIPPanel from '@/components/SGIPPanel';
import { TooltipProvider } from '@/components/ui/tooltip';
import { useTilt } from '@/hooks/useTilt';
import { cn } from '@/lib/utils';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const MEMBERSHIP_NFT_ADDRESS = (import.meta.env.VITE_MEMBERSHIP_NFT_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`;
const MOCK_USD_ADDRESS = (import.meta.env.VITE_MOCK_USD_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`;

export default function MintPage() {
  const { address, isConnected } = useAccount();
  const { pathname } = useLocation();
  const [sgipSteps, setSgipSteps] = useState<SGIPStepState[]>([]);
  const [sgipRunning, setSgipRunning] = useState(false);
  const [sgipGas, setSgipGas] = useState<string | undefined>();
  const [sgipError, setSgipError] = useState<string | undefined>();
  const [mintSuccess, setMintSuccess] = useState(false);
  const [faucetSuccess, setFaucetSuccess] = useState(false);
  const { addTransaction, history } = useTransactionHistory();
  const { toast } = useToast();
  const navigate = useNavigate();

  const { style: tiltStyle, glareStyle: tiltGlare, onMouseMove: onTiltMouseMove, onMouseLeave: onTiltMouseLeave } = useTilt(6);

  const { data: musdBalance } = useBalance({ address: address, token: MOCK_USD_ADDRESS });

  const virtualEarned = history.filter(tx => tx.action.includes('Faucet')).length * 100;
  const virtualSpent = history.filter(tx => tx.action.includes('AI Payment')).length * 1;
  const displayBalance = musdBalance
    ? (parseFloat(musdBalance.formatted) + virtualEarned - virtualSpent).toFixed(2)
    : (virtualEarned - virtualSpent).toFixed(2);

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
      balance: parseFloat(displayBalance),
    });

    setSgipRunning(false);
    if (ok) {
      setMintSuccess(true);
      toast({ title: '🛡️ Membership Minted!', description: `Saved $${pipeline.totalGasSavedUSD.toFixed(2)} in gas via SGIP!` });
    } else {
      setSgipError('Pipeline failed. Please try again.');
      toast({ title: 'Mint Failed', variant: 'destructive' });
    }
  }, [address, displayBalance, addTransaction, toast]);

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
      <div className="flex min-h-screen bg-[#0e131f] text-slate-200">
        <Navbar />
        <main className="flex flex-1 items-center justify-center p-6 z-10 min-h-screen">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="w-full max-w-md glass-metal border border-white/5 text-center p-8 rounded-3xl relative overflow-hidden shadow-2xl">
              <div className="sweep-border-top" />
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600/20 to-cyan-500/20 shadow-lg border border-blue-500/20">
                <Zap className="h-8 w-8 text-cyan-400" />
              </div>
              <CardTitle className="text-2xl font-black mb-3 text-white">Connect Your Wallet</CardTitle>
              <CardDescription className="text-slate-400 mb-6">
                Connect your wallet to forge your membership neural node and unlock the GaslessAI dashboard.
              </CardDescription>
              <div className="flex justify-center">
                <ConnectButton showBalance={false} chainStatus="icon" />
              </div>
            </Card>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="flex min-h-screen bg-[#0e131f] text-slate-200">
        {/* Desktop Side Navigation */}
        <nav className="hidden md:flex flex-col bg-[#080e1a]/60 backdrop-blur-2xl border-r border-white/5 shadow-2xl h-screen w-64 fixed left-0 top-0 z-40">
          <div className="p-6">
            <Link to="/" className="flex items-center gap-2.5">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-neon-blue">
                <GitBranch className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-black font-display text-white">
                Gasless<span className="gradient-text">AI</span>
              </span>
            </Link>
            <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-2 font-bold">Pro Tier Node</p>
          </div>
          
          <div className="flex-grow py-6 flex flex-col gap-1.5 px-4">
            {[
              { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
              { name: 'Forge (Mint)', href: '/mint', icon: Zap },
              { name: 'AI Core', href: '/ai-assistant', icon: Bot },
              { name: 'Ledger', href: '/history', icon: History },
            ].map(item => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 font-medium text-sm",
                    isActive
                      ? "bg-blue-600/10 text-cyan-400 border-r-2 border-cyan-400"
                      : "text-slate-400 hover:text-white hover:bg-white/5"
                  )}
                >
                  <Icon className={cn("h-4 w-4", isActive ? "text-cyan-400" : "")} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </div>

          <div className="p-6 border-t border-white/5">
            <ConnectButton showBalance={false} chainStatus="icon" />
          </div>
        </nav>

        {/* Mobile Navbar */}
        <div className="md:hidden w-full fixed top-0 left-0 right-0 z-40">
          <Navbar />
        </div>

        {/* Main Content Canvas */}
        <main className="flex-grow ml-0 md:ml-64 p-6 md:p-12 relative z-10 w-full max-w-[1440px] mx-auto min-h-screen space-y-12 pt-20 md:pt-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-6"
          >
            <div>
              <div className="flex items-center gap-3 mb-2">
                <span className="w-2 h-2 rounded-full bg-cyan-400 pulse-dot"></span>
                <span className="text-[10px] text-cyan-400 uppercase tracking-widest font-bold">Network Live</span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-black text-white tracking-tight">Genesis Neural Node</h1>
              <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-semibold">
                Forge your perpetual license to the GaslessAI ecosystem.
              </p>
            </div>
          </motion.div>

          {/* Showcase & Minting UI Section */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left: Interaction Area */}
            <div className="lg:col-span-7 flex flex-col gap-8">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-white font-display">Autonomous Allocation</h2>
                <p className="text-sm text-slate-400 leading-relaxed">
                  Deploy your autonomous agent core to the blockchain. This cryptographic node acts as a decentralized intelligence license, unlocking full premium access to GaslessAI models and gasless transaction routing logic.
                </p>
              </div>

              {/* Minting Controls Card */}
              <div className="glass-metal rounded-2xl p-8 space-y-6 relative overflow-hidden border border-white/5 sweep-border-top">
                <div className="grid grid-cols-2 gap-6 relative z-10">
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Mint Price</p>
                    <p className="text-2xl font-black font-display text-white">
                      Free <span className="text-slate-500 text-sm line-through font-normal ml-2">0.05 ETH</span>
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">Allocation Available</p>
                    <p className="text-2xl font-black font-display text-white">
                      1,204 <span className="text-slate-500 text-sm font-normal">/ 5,000</span>
                    </p>
                  </div>
                </div>

                <div className="space-y-2 relative z-10 border-t border-white/5 pt-6">
                  <div className="flex justify-between text-xs text-slate-400 font-semibold uppercase tracking-wider">
                    <span>Processing Allocation</span>
                    <span className="text-cyan-400">{sgipRunning ? 'Executing SGIP...' : 'Ready'}</span>
                  </div>
                  {/* Progress beam */}
                  <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,0.5)]"
                      initial={{ width: '25%' }}
                      animate={sgipRunning ? { width: ['25%', '95%', '100%'] } : { width: '25%' }}
                      transition={sgipRunning ? { repeat: Infinity, duration: 4, ease: 'easeInOut' } : {}}
                    />
                  </div>
                </div>

                {/* Mint fee preview list */}
                <div className="space-y-3.5 border-t border-white/5 pt-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                  <div className="flex justify-between items-center">
                    <span>Base Gas Fee (Standard)</span>
                    <span className="text-slate-500 line-through">0.0024 ETH</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>You Pay via SGIP</span>
                    <span className="text-cyan-400 font-bold">0 MockUSD</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>Gas Saved</span>
                    <span className="text-emerald-400 font-bold">~$8.50</span>
                  </div>
                </div>

                <Button
                  onClick={runMintPipeline}
                  disabled={sgipRunning || mintSuccess}
                  className="w-full h-14 text-sm font-bold bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white rounded-xl shadow-neon-blue hover:shadow-neon-cyan transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                  {sgipRunning ? (
                    <><Sparkles className="h-4.5 w-4.5 animate-spin" /> Executing SGIP...</>
                  ) : mintSuccess ? (
                    <><CheckCircle2 className="h-4.5 w-4.5" /> Membership Minted!</>
                  ) : (
                    <><Zap className="h-4.5 w-4.5" /> Forge Node via SGIP</>
                  )}
                </Button>
              </div>

              {/* SGIP steps container inside left column */}
              <AnimatePresence>
                {sgipSteps.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <SGIPPanel
                      steps={sgipSteps}
                      totalGasSaved={sgipGas}
                      isRunning={sgipRunning}
                      error={sgipError}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Faucet/MUSD Fallback warning card */}
              <div className="glass-metal border-l-4 border-amber-500/50 rounded-2xl p-6 relative overflow-hidden border border-white/5">
                <div className="flex gap-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 border border-amber-500/20">
                    <Coins className="h-5 w-5 text-amber-400" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-white text-sm">Need MockUSD?</h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Claim 100 MUSD gaslessly to cover your minting pipeline and AI core interactions.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={runFaucetOnly}
                      disabled={sgipRunning || faucetSuccess}
                      className="mt-3.5 border-amber-500/30 text-amber-400 hover:bg-amber-500/10 hover:border-amber-500/50 gap-2 font-bold text-xs uppercase tracking-wider h-9"
                    >
                      {faucetSuccess ? (
                        <><CheckCircle2 className="h-3.5 w-3.5" /> Received!</>
                      ) : sgipRunning ? (
                        <><Sparkles className="h-3.5 w-3.5 animate-spin" /> Requesting...</>
                      ) : (
                        <><Coins className="h-3.5 w-3.5" /> Claim 100 MUSD</>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Holographic Showcase Card */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
              {/* Radial Backdrop Glow */}
              <div className="absolute w-[85%] h-[85%] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none" />

              <div 
                className="holographic-card-container w-full max-w-[380px] aspect-[3/4] rounded-2xl glass-card relative overflow-hidden shadow-[0_30px_60px_-20px_rgba(0,0,0,0.8)] border border-white/10"
                style={tiltStyle}
                onMouseMove={onTiltMouseMove}
                onMouseLeave={onTiltMouseLeave}
              >
                {/* Glare overlay — follows cursor */}
                <div className="card-glare" style={tiltGlare} />
                {/* Sweep top overlay */}
                <div className="sweep-border-top" />

                {/* 3D Content Layers */}
                <div className="absolute inset-4 rounded-xl overflow-hidden border border-white/5 bg-slate-950/40">
                  {/* NFT Card Canvas */}
                  <NFTCard3D className="w-full h-full" />
                </div>

                {/* Info Text overlays */}
                <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                  <div>
                    <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest mb-0.5">Tier I</p>
                    <p className="text-lg font-black text-white leading-tight font-display">Genesis Node</p>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-slate-900/80 backdrop-blur-md flex items-center justify-center border border-white/10 shadow-lg">
                    <Zap className="h-4.5 w-4.5 text-cyan-400 animate-pulse" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="w-full h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-4" />

          {/* Minting Sequence Timeline */}
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="text-center space-y-2">
              <h2 className="text-2xl md:text-3xl font-black text-white font-display">Minting Sequence</h2>
              <p className="text-sm text-slate-500">The autonomous protocol ensures mathematically secure provenance.</p>
            </div>

            <div className="relative pl-8 md:pl-0 pt-6">
              {/* Central Line */}
              <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px bg-white/5 -translate-x-1/2" />

              <div className="space-y-16">
                {[
                  {
                    phase: 'Phase 01',
                    title: 'Initialize Core',
                    desc: 'Secure wallet connection establishes the encrypted tunnel for asset allocation.',
                    iconBg: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
                    stepIdx: 0,
                  },
                  {
                    phase: 'Phase 02',
                    title: 'Forge Asset',
                    desc: 'The smart contract allocates unique neural weights to your specific token ID.',
                    iconBg: 'bg-purple-500/10 border-purple-500/20 text-purple-400',
                    stepIdx: 1,
                  },
                  {
                    phase: 'Phase 03',
                    title: 'Verify Ledger',
                    desc: 'Cryptographic confirmation anchors your node directly to the immutable layer.',
                    iconBg: 'bg-cyan-500/10 border-cyan-500/20 text-cyan-400',
                    stepIdx: 2,
                  },
                ].map((step, idx) => {
                  const stepState = sgipSteps[step.stepIdx];
                  const isCompleted = stepState?.status === 'success';
                  const isCurrent = stepState?.status === 'running';

                  return (
                    <div 
                      key={step.phase} 
                      className={cn(
                        "relative flex flex-col md:flex-row items-center md:justify-between transition-all duration-500",
                        idx % 2 === 0 ? "" : "md:flex-row-reverse",
                        isCompleted || isCurrent ? "opacity-100" : "opacity-40"
                      )}
                    >
                      {/* Text */}
                      <div className={cn(
                        "md:w-[45%] mb-4 md:mb-0",
                        idx % 2 === 0 ? "text-left md:text-right pr-0 md:pr-8" : "text-left pl-0 md:pl-8"
                      )}>
                        <p className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest mb-1">{step.phase}</p>
                        <h3 className="text-lg font-bold text-white font-display">{step.title}</h3>
                        <p className="text-xs text-slate-400 mt-1 max-w-sm leading-relaxed">{step.desc}</p>
                      </div>

                      {/* Timeline Dot Node */}
                      <div className={cn(
                        "absolute left-0 md:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full border-2 transition-all duration-500 z-10",
                        isCompleted 
                          ? "bg-cyan-400 border-cyan-400 shadow-[0_0_12px_rgba(34,211,238,0.8)]" 
                          : isCurrent 
                          ? "bg-blue-500 border-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)] animate-pulse" 
                          : "bg-slate-900 border-white/20"
                      )} />

                      {/* Box Card indicator */}
                      <div className={cn(
                        "md:w-[45%] flex",
                        idx % 2 === 0 ? "pl-0 md:pl-8 justify-start" : "pr-0 md:pr-8 justify-end"
                      )}>
                        <div className={cn(
                          "glass-metal p-5 rounded-2xl border border-white/5 transition-all duration-300 shadow-lg",
                          isCompleted && "border-cyan-500/20 bg-cyan-500/5",
                          isCurrent && "border-blue-500/30 bg-blue-500/5 animate-pulse"
                        )}>
                          <Zap className={cn("h-6 w-6", isCompleted ? "text-cyan-400" : isCurrent ? "text-blue-400" : "text-slate-600")} />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
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
                className="w-full max-w-md glass-metal rounded-3xl p-10 text-center border border-emerald-500/20 shadow-[0_0_60px_rgba(52,211,153,0.2)] relative overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="sweep-border-top" />
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.1, type: 'spring' }}
                  className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/20 ring-2 ring-emerald-500/30 border border-emerald-500/20"
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
                <Button 
                  className="w-full bg-blue-600 hover:bg-blue-500 h-12 font-bold rounded-xl shadow-neon-blue"
                  onClick={() => navigate('/dashboard')}
                >
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
