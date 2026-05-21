import { useState, useCallback } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Wallet, Zap, Shield, TrendingUp, History, Bot, Sparkles, GitBranch, ArrowRight, Play } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTransactionHistory } from '@/hooks/use-transaction-history';
import { formatDistanceToNow } from 'date-fns';
import GasFlowViz from '@/components/3d/GasFlowViz';
import SGIPPanel from '@/components/SGIPPanel';
import { SGIP, type SGIPStepState } from '@/lib/sgip';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

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
  return (
    <motion.div
      variants={itemVariants}
      transition={{ delay }}
      className="glass-card glass-hover rounded-2xl p-5 group"
    >
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{title}</span>
        <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${iconBg}`}>
          <Icon className={`h-4 w-4 ${color}`} />
        </div>
      </div>
      <div className={`text-2xl font-black font-display ${color} animate-count-up`}>{value}</div>
      <p className="text-xs text-slate-500 mt-1">{sub}</p>
    </motion.div>
  );
}

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
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
      <div className="flex min-h-screen flex-col hero-gradient">
        <Navbar />
        <main className="flex flex-1 items-center justify-center p-6">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="w-full max-w-md glass-card border-0 text-center p-8">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600/20">
                <Wallet className="h-8 w-8 text-blue-400" />
              </div>
              <CardTitle className="text-2xl font-black mb-3">Connect Your Wallet</CardTitle>
              <CardDescription className="text-slate-400">
                Connect MetaMask to access your gasless dashboard and SGIP analytics.
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
      <div className="flex min-h-screen flex-col hero-gradient">
        <Navbar />

        <main className="container mx-auto flex-1 space-y-8 p-6 pt-10 max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-between"
          >
            <div>
              <h1 className="font-display text-3xl font-black text-white">Dashboard</h1>
              <p className="text-sm text-slate-500 mt-1">
                {address?.slice(0, 6)}...{address?.slice(-4)} · Base Sepolia
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge className="border-blue-500/30 bg-blue-500/10 text-blue-400 gap-1.5">
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
                Base Sepolia
              </Badge>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={runQuickPipeline}
                    disabled={sgipRunning}
                    size="sm"
                    className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 shadow-neon-blue font-semibold gap-2"
                  >
                    {sgipRunning
                      ? <><Sparkles className="h-3.5 w-3.5 animate-spin" /> Stitching...</>
                      : <><Play className="h-3.5 w-3.5" /> Run SGIP</>
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
            <MetricCard title="MockUSD Balance" value={`${displayBalance}`} sub="MUSD · Demo Mode" icon={Wallet} color="text-blue-400" iconBg="bg-blue-500/15" delay={0} />
            <MetricCard title="Membership" value="Active" sub="Premium Tier · GAIM #—" icon={Shield} color="text-purple-400" iconBg="bg-purple-500/15" delay={0.05} />
            <MetricCard title="Gas Saved" value={`$${totalGasSaved.toFixed(2)}`} sub="Via UGF + SGIP" icon={TrendingUp} color="text-emerald-400" iconBg="bg-emerald-500/15" delay={0.1} />
            <MetricCard title="Transactions" value={`${history.length}`} sub="Gasless operations" icon={History} color="text-amber-400" iconBg="bg-amber-500/15" delay={0.15} />
          </motion.div>

          {/* Gas savings progress */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="glass-card rounded-2xl p-5"
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-sm font-semibold text-white">Cumulative Gas Savings Progress</p>
                <p className="text-xs text-slate-500 mt-0.5">Target: $20.00 in gas fees saved</p>
              </div>
              <span className="text-emerald-400 font-black text-lg">${totalGasSaved.toFixed(2)}</span>
            </div>
            <Progress value={gasPct} className="h-2" />
            <div className="mt-2 flex justify-between text-xs text-slate-600">
              <span>$0</span><span>$20 goal</span>
            </div>
          </motion.div>

          {/* Gas Flow Viz + SGIP Panel */}
          <div className="grid gap-6 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="glass-card rounded-2xl p-5"
            >
              <div className="flex items-center gap-2 mb-1">
                <Zap className="h-4 w-4 text-cyan-400" />
                <span className="text-sm font-semibold text-white">Live Gas Flow</span>
                <Badge className="text-xs border-cyan-500/20 bg-cyan-500/10 text-cyan-400">UGF Relayer</Badge>
              </div>
              <p className="text-xs text-slate-500 mb-2">Real-time visualization of your gasless transaction flow</p>
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
                  className="glass-card rounded-2xl p-6 flex flex-col items-center justify-center text-center gap-4 border border-dashed border-white/10"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600/15">
                    <GitBranch className="h-7 w-7 text-blue-400" />
                  </div>
                  <div>
                    <p className="font-semibold text-white">SGIP Pipeline</p>
                    <p className="text-xs text-slate-500 mt-1">Click "Run SGIP" to execute the Faucet → Mint onboarding pipeline with live telemetry.</p>
                  </div>
                  <Button onClick={runQuickPipeline} size="sm" className="bg-blue-600 hover:bg-blue-500 gap-2">
                    <Play className="h-3.5 w-3.5" /> Run Pipeline
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Recent Activity + AI Widget */}
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2 glass-card border-0 rounded-2xl">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-semibold">Recent Activity</CardTitle>
                  <Link to="/history">
                    <Button variant="ghost" size="sm" className="text-xs text-slate-500 hover:text-blue-400 gap-1 h-7">
                      View all <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                </div>
                <CardDescription className="text-xs">Your latest gasless operations on Base Sepolia</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {history.length === 0 ? (
                    <div className="flex h-32 items-center justify-center text-slate-600 italic text-sm">
                      No transactions yet · Run SGIP to get started
                    </div>
                  ) : (
                    history.slice(0, 5).map((tx) => (
                      <div key={tx.hash} className="flex items-center justify-between rounded-xl border border-white/5 bg-white/3 p-3.5 transition-all hover:bg-white/6 hover:border-blue-500/20">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-600/15">
                            <Zap className="h-4 w-4 text-blue-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-white">{tx.action}</p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              {formatDistanceToNow(tx.timestamp)} ago · {tx.hash.slice(0, 8)}...
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-semibold text-emerald-400">
                            {tx.gasSaved.match(/\$[\d.]+/)?.[0]} saved
                          </p>
                          <Badge className="mt-1 bg-emerald-500/10 text-emerald-400 border-none text-xs">
                            Success
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>

            {/* AI Widget */}
            <Card className="glass-card border-0 rounded-2xl h-fit">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base font-semibold">
                  <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-600/20">
                    <Bot className="h-4 w-4 text-blue-400" />
                  </div>
                  AI Assistant
                </CardTitle>
                <CardDescription className="text-xs">Powered by Gemini · 1 MUSD/msg</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="rounded-xl bg-white/4 border border-white/5 p-3.5 text-sm text-slate-300 leading-relaxed">
                  💬 "You've saved <span className="text-emerald-400 font-semibold">${totalGasSaved.toFixed(2)}</span> in gas. That's {history.length} gasless transaction{history.length !== 1 ? 's' : ''} via UGF + SGIP!"
                </div>
                <div className="space-y-1.5">
                  {['How did I save gas?', 'Explain SGIP', 'Mint my NFT'].map(q => (
                    <Link to="/ai-assistant" key={q}>
                      <button className="w-full rounded-lg border border-white/8 px-3 py-2 text-left text-xs text-slate-400 transition-all hover:bg-blue-600/10 hover:border-blue-500/30 hover:text-blue-300">
                        {q}
                      </button>
                    </Link>
                  ))}
                </div>
                <Link to="/ai-assistant" className="block">
                  <Button size="sm" className="w-full bg-blue-600/20 hover:bg-blue-600/40 text-blue-400 border border-blue-500/20 font-semibold">
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
