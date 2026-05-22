import { useState, useCallback } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { Link, useLocation } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Wallet, Zap, Shield, TrendingUp, History, Bot, Sparkles, GitBranch, ArrowRight, Play, LayoutDashboard, Download } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTransactionHistory } from '@/hooks/use-transaction-history';
import { formatDistanceToNow } from 'date-fns';
import GasFlowViz from '@/components/3d/GasFlowViz';
import SGIPPanel from '@/components/SGIPPanel';
import { SGIP, type SGIPStepState } from '@/lib/sgip';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useTilt } from '@/hooks/useTilt';
import { cn } from '@/lib/utils';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const MOCK_USD_ADDRESS = (import.meta.env.VITE_MOCK_USD_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`;
const MEMBERSHIP_NFT_ADDRESS = (import.meta.env.VITE_MEMBERSHIP_NFT_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`;

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0 },
};

function MetricCard({
  title, value, sub, icon: Icon, color, iconBg, delay,
}: {
  title: string; value: string; sub: string;
  icon: React.FC<{ className?: string }>; color: string; iconBg: string; delay: number;
}) {
  const { style, onMouseMove, onMouseLeave } = useTilt(5);
  return (
    <motion.div
      variants={itemVariants}
      transition={{ delay }}
      className="glass-card rounded-2xl p-6 relative overflow-hidden group border border-white/5 sweep-border-top flex flex-col justify-between"
      style={style}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
    >
      <div>
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-widest">{title}</span>
          <div className={`flex h-9 w-9 items-center justify-center rounded-xl ${iconBg}`}>
            <Icon className={`h-4.5 w-4.5 ${color}`} />
          </div>
        </div>
        <div className={`text-3xl font-black font-display ${color} tracking-tight animate-count-up`}>{value}</div>
      </div>
      <p className="text-xs text-slate-500 mt-3 uppercase tracking-widest font-semibold">{sub}</p>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const { pathname } = useLocation();
  const { history, addTransaction } = useTransactionHistory();
  const { toast } = useToast();
  const [sgipSteps, setSgipSteps] = useState<SGIPStepState[]>([]);
  const [sgipRunning, setSgipRunning] = useState(false);
  const [sgipGas, setSgipGas] = useState<string | undefined>();
  const [sgipError, setSgipError] = useState<string | undefined>();
  const [showSgip, setShowSgip] = useState(false);

  const { data: musdBalance } = useBalance({ address: address, token: MOCK_USD_ADDRESS });

  const virtualEarned = history.filter(tx => tx.action.includes('Faucet')).length * 100;
  const virtualSpent = history.filter(tx => tx.action.includes('AI Payment')).length * 1;
  const displayBalance = musdBalance
    ? (parseFloat(musdBalance.formatted) + virtualEarned - virtualSpent).toFixed(2)
    : (virtualEarned - virtualSpent).toFixed(2);

  const totalGasSaved = history.reduce((acc, tx) => {
    const match = tx.gasSaved.match(/\$(\d+\.?\d*)/);
    return acc + (match ? parseFloat(match[1]) : 0);
  }, 0);

  const runQuickPipeline = useCallback(async () => {
    if (!address) return;
    setShowSgip(true);
    setSgipRunning(true);
    setSgipError(undefined);
    setSgipGas(undefined);

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
      toast({ title: '⚡ SGIP Pipeline Complete', description: `Saved ${pipeline.totalGasSavedUSD.toFixed(2)} in gas!` });
    } else {
      setSgipError('Pipeline failed — check individual step errors.');
      toast({ title: 'Pipeline Failed', variant: 'destructive' });
    }
  }, [address, displayBalance, addTransaction, toast]);

  if (!isConnected) {
    return (
      <div className="flex min-h-screen flex-col bg-[#0e131f] relative">
        <Navbar />
        <main className="flex flex-1 items-center justify-center p-6 z-10">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="w-full max-w-md glass-card border-0 text-center p-8 rounded-3xl relative overflow-hidden">
              <div className="sweep-border-top" />
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600/20 shadow-lg border border-blue-500/20">
                <Wallet className="h-8 w-8 text-cyan-400" />
              </div>
              <CardTitle className="text-2xl font-black mb-3 text-white">Connect Your Wallet</CardTitle>
              <CardDescription className="text-slate-400">
                Connect MetaMask or another web3 wallet to access your gasless dashboard and SGIP analytics.
              </CardDescription>
            </Card>
          </motion.div>
        </main>
      </div>
    );
  }

  const gasPct = Math.min((totalGasSaved / 20) * 100, 100);

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
        <main className="flex-grow ml-0 md:ml-64 p-6 md:p-12 relative z-10 w-full max-w-[1440px] mx-auto min-h-screen space-y-8 pt-20 md:pt-12">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-white/5 pb-6"
          >
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="pulse-dot"></div>
                <span className="text-[10px] text-cyan-400 uppercase tracking-widest font-bold">System Active</span>
              </div>
              <h1 className="font-display text-4xl md:text-5xl font-black text-white tracking-tight">Command Center</h1>
              <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-semibold">
                Node ID: {address?.slice(0, 6)}...{address?.slice(-4)} · Base Sepolia
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={runQuickPipeline}
                    disabled={sgipRunning}
                    size="default"
                    className="btn-luminous font-bold px-6 h-10 rounded-full text-white cursor-pointer transition-all duration-300"
                  >
                    {sgipRunning
                      ? <><Sparkles className="h-4 w-4 animate-spin mr-1.5" /> Stitching...</>
                      : <><Play className="h-4 w-4 mr-1.5" /> Run SGIP</>
                    }
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Run the Onboarding pipeline: Faucet → Mint Membership</TooltipContent>
              </Tooltip>
            </div>
          </motion.div>

          {/* Metric Cards */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
          >
            <MetricCard title="MockUSD Balance" value={`${displayBalance}`} sub="MUSD · Demo Mode" icon={Wallet} color="text-cyan-400" iconBg="bg-cyan-500/10" delay={0} />
            <MetricCard title="Membership" value="Active" sub="Premium Tier" icon={Shield} color="text-purple-400" iconBg="bg-purple-500/10" delay={0.05} />
            <MetricCard title="Gas Saved" value={`$${totalGasSaved.toFixed(2)}`} sub="Via UGF + SGIP" icon={TrendingUp} color="text-emerald-400" iconBg="bg-emerald-500/10" delay={0.1} />
            <MetricCard title="Transactions" value={`${history.length}`} sub="Gasless operations" icon={History} color="text-amber-400" iconBg="bg-amber-500/10" delay={0.15} />
          </motion.div>

          {/* Gas savings progress */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass-card rounded-2xl p-6 relative overflow-hidden border border-white/5"
          >
            <div className="sweep-border-top" />
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-sm font-semibold text-white">Cumulative Gas Savings Progress</p>
                <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-semibold">Target: $20.00 in gas fees saved</p>
              </div>
              <span className="text-emerald-400 font-black text-xl tracking-tight">${totalGasSaved.toFixed(2)}</span>
            </div>
            <Progress value={gasPct} className="h-2.5 bg-white/5" />
            <div className="mt-2.5 flex justify-between text-xs text-slate-500 font-medium uppercase tracking-wider">
              <span>$0</span><span>$20 goal reached</span>
            </div>
          </motion.div>

          {/* Gas Flow Viz + SGIP Panel */}
          <div className="grid gap-6 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card rounded-2xl p-6 relative overflow-hidden border border-white/5"
            >
              <div className="sweep-border-top" />
              <div className="flex items-center gap-2.5 mb-2">
                <Zap className="h-4.5 w-4.5 text-cyan-400" />
                <span className="text-sm font-semibold text-white">Live Gas Flow Telemetry</span>
                <Badge className="text-[10px] border-cyan-500/20 bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Relayer Active</Badge>
              </div>
              <p className="text-xs text-slate-500 mb-4 uppercase tracking-widest font-medium">Real-time visualization of your gasless transaction flow</p>
              <GasFlowViz />
            </motion.div>

            <AnimatePresence>
              {showSgip && sgipSteps.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <SGIPPanel
                    steps={sgipSteps}
                    totalGasSaved={sgipGas}
                    isRunning={sgipRunning}
                    error={sgipError}
                    className="h-full"
                  />
                </motion.div>
              )}
              {!showSgip && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="glass-card rounded-2xl p-8 flex flex-col items-center justify-center text-center gap-5 border border-dashed border-white/10"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600/15 border border-blue-500/20">
                    <GitBranch className="h-7 w-7 text-cyan-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-white text-base">SGIP Pipeline</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto leading-relaxed">
                      Stitch your faucet and mint actions into a single atomic sequence. Execute with live telemetry below.
                    </p>
                  </div>
                  <Button onClick={runQuickPipeline} size="sm" className="btn-luminous font-bold px-6 h-9 rounded-full text-white cursor-pointer">
                    <Play className="h-3.5 w-3.5 mr-1.5" /> Run Pipeline
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Recent Activity + AI Widget */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Live Execution Ledger */}
            <Card className="lg:col-span-2 glass-card border-0 rounded-2xl p-6 relative overflow-hidden">
              <div className="sweep-border-top" />
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Live Execution Ledger</h3>
                  <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-semibold">Latest gasless operations on Base Sepolia</p>
                </div>
                <Link to="/history">
                  <Button variant="ghost" size="sm" className="text-xs text-cyan-400 hover:text-white gap-1 h-8 px-3 rounded-full hover:bg-white/5">
                    View all <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/5 pb-2">
                      <th className="pb-3 font-semibold text-[10px] text-slate-500 uppercase tracking-widest font-normal">Hash</th>
                      <th className="pb-3 font-semibold text-[10px] text-slate-500 uppercase tracking-widest font-normal">Action</th>
                      <th className="pb-3 font-semibold text-[10px] text-slate-500 uppercase tracking-widest font-normal">Status</th>
                      <th className="pb-3 font-semibold text-[10px] text-slate-500 uppercase tracking-widest font-normal text-right">Gas Saved</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-slate-600 italic text-sm">
                          No transactions yet · Run SGIP to get started
                        </td>
                      </tr>
                    ) : (
                      history.slice(0, 5).map((tx) => (
                        <tr key={tx.hash} className="border-b border-white/5 hover:bg-white/3 transition-colors cursor-pointer group">
                          <td className="py-4 font-mono text-xs text-cyan-400 group-hover:text-white transition-colors">{tx.hash.slice(0, 10)}...</td>
                          <td className="py-4 text-xs text-slate-300 font-semibold">{tx.action}</td>
                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#22d3ee]"></div>
                              <span className="text-xs text-cyan-400 font-semibold uppercase tracking-wider">{tx.status}</span>
                            </div>
                          </td>
                          <td className="py-4 text-xs font-bold text-right text-emerald-400">
                            {tx.gasSaved.match(/\$[\d.]+/)?.[0] || '$0.00'}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card>

            {/* AI Widget */}
            <Card className="glass-card border-0 rounded-2xl h-fit p-6 relative overflow-hidden">
              <div className="sweep-border-top" />
              <CardHeader className="p-0 pb-4">
                <CardTitle className="flex items-center gap-2.5 text-xs font-semibold text-slate-500 uppercase tracking-widest">
                  <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-600/10 border border-blue-500/10">
                    <Bot className="h-4 w-4 text-cyan-400" />
                  </div>
                  Neural Core Agent
                </CardTitle>
                <CardDescription className="text-[10px] text-slate-500 uppercase tracking-widest font-semibold">1 MUSD/msg · active</CardDescription>
              </CardHeader>
              <CardContent className="p-0 space-y-4">
                <div className="rounded-xl bg-white/4 border border-white/5 p-4 text-sm text-slate-300 leading-relaxed font-medium">
                  💬 "You've saved <span className="text-emerald-400 font-black">${totalGasSaved.toFixed(2)}</span> in gas. That's {history.length} gasless transaction{history.length !== 1 ? 's' : ''} via UGF + SGIP!"
                </div>
                <div className="space-y-1.5">
                  {['How did I save gas?', 'Explain SGIP', 'Mint my NFT'].map(q => (
                    <Link to="/ai-assistant" key={q}>
                      <button className="w-full rounded-lg border border-white/8 px-3.5 py-2.5 text-left text-xs text-slate-400 transition-all hover:bg-cyan-600/10 hover:border-cyan-500/30 hover:text-cyan-300 font-medium">
                        {q}
                      </button>
                    </Link>
                  ))}
                </div>
                <Link to="/ai-assistant" className="block pt-2">
                  <Button size="sm" className="w-full bg-blue-600/10 hover:bg-blue-600/20 text-cyan-400 border border-blue-500/20 font-bold h-9 rounded-full uppercase tracking-wider text-[10px]">
                    Open AI Assistant <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </TooltipProvider>
  );
}
