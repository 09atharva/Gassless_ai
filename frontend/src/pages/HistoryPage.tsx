import { useAccount } from 'wagmi';
import { Link, useLocation } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { History, ExternalLink, Zap, Trash2, TrendingUp, GitBranch, LayoutDashboard, Bot } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTransactionHistory } from '@/hooks/use-transaction-history';
import { formatDistanceToNow } from 'date-fns';
import { cn } from '@/lib/utils';
import { ConnectButton } from '@rainbow-me/rainbowkit';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0 },
};

function getActionColor(action: string) {
  if (action.toLowerCase().includes('faucet')) return { dot: 'bg-amber-400', badge: 'bg-amber-500/10 text-amber-400 border-amber-500/20' };
  if (action.toLowerCase().includes('mint')) return { dot: 'bg-purple-400', badge: 'bg-purple-500/10 text-purple-400 border-purple-500/20' };
  if (action.toLowerCase().includes('ai') || action.toLowerCase().includes('payment')) return { dot: 'bg-blue-400', badge: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
  if (action.toLowerCase().includes('sgip')) return { dot: 'bg-cyan-400', badge: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20' };
  return { dot: 'bg-slate-400', badge: 'bg-slate-500/10 text-slate-400 border-slate-500/20' };
}

export default function HistoryPage() {
  const { isConnected } = useAccount();
  const { pathname } = useLocation();
  const { history, clearHistory } = useTransactionHistory();

  const totalGasSaved = history.reduce((acc, tx) => {
    const match = tx.gasSaved.match(/\$(\d+\.?\d*)/);
    return acc + (match ? parseFloat(match[1]) : 0);
  }, 0);

  const sgipCount = history.filter(tx => tx.action.toLowerCase().includes('sgip')).length;

  if (!isConnected) {
    return (
      <div className="flex min-h-screen bg-[#0e131f] text-slate-200">
        <Navbar />
        <main className="flex flex-1 items-center justify-center p-6 z-10 min-h-screen">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="w-full max-w-md glass-metal border border-white/5 text-center p-8 rounded-3xl relative overflow-hidden shadow-2xl">
              <div className="sweep-border-top" />
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600/20 to-cyan-500/20 shadow-lg border border-blue-500/20">
                <History className="h-8 w-8 text-cyan-400" />
              </div>
              <CardTitle className="text-2xl font-black mb-3 text-white">Connect Your Wallet</CardTitle>
              <CardDescription className="text-slate-400 mb-6">
                Connect your wallet to inspect your historical gasless blockchain interactions.
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
          className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-white/5 pb-6"
        >
          <div>
            <h1 className="font-display text-4xl md:text-5xl font-black text-white tracking-tight">Execution Ledger</h1>
            <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-semibold">
              Historical records of gasless transaction pipelines on Base Sepolia
            </p>
          </div>
          {history.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearHistory}
              className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 rounded-xl"
            >
              <Trash2 className="mr-2 h-4 w-4" /> Clear History
            </Button>
          )}
        </motion.div>

        {/* Stats row */}
        {history.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 sm:grid-cols-4 gap-4"
          >
            {[
              { label: 'Total Operations', value: history.length, icon: History, color: 'text-blue-400', bg: 'bg-blue-500/10' },
              { label: 'Gas Saved', value: `$${totalGasSaved.toFixed(2)}`, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
              { label: 'SGIP Pipelines', value: sgipCount, icon: GitBranch, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
              { label: 'Success Rate', value: '100%', icon: Zap, color: 'text-purple-400', bg: 'bg-purple-500/10' },
            ].map(stat => (
              <div key={stat.label} className="glass-metal rounded-2xl p-5 relative overflow-hidden border border-white/5">
                <div className="sweep-border-top" />
                <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${stat.bg} mb-3`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <p className={`text-2xl font-black font-display ${stat.color}`}>{stat.value}</p>
                <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-widest font-semibold">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        )}

        {/* Transaction cards */}
        {history.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-24 text-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-900 border border-white/5 shadow-inner">
              <History className="h-8 w-8 text-slate-600 animate-pulse" />
            </div>
            <p className="text-slate-400 font-semibold">No transactions found</p>
            <p className="text-slate-500 text-xs uppercase tracking-widest">Start by minting your membership or using the AI assistant!</p>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-3"
          >
            {history.map((tx) => {
              const { dot, badge } = getActionColor(tx.action);
              const gasDollar = tx.gasSaved.match(/\$[\d.]+/)?.[0];
              return (
                <motion.div
                  key={tx.hash}
                  variants={itemVariants}
                  className="glass-metal rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 border border-white/5 hover:border-white/10 transition-colors"
                >
                  {/* Dot + icon */}
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="relative shrink-0">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5">
                        <Zap className="h-5 w-5 text-slate-400" />
                      </div>
                      <span className={`absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-slate-900 ${dot}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="font-bold text-white text-sm truncate">{tx.action}</p>
                      <p className="text-[10px] text-slate-500 mt-1 font-mono uppercase font-bold tracking-wider">
                        {tx.hash.slice(0, 12)}... · {formatDistanceToNow(tx.timestamp)} ago
                      </p>
                    </div>
                  </div>

                  {/* Right side */}
                  <div className="flex items-center gap-3 shrink-0 ml-auto w-full sm:w-auto justify-end">
                    {/* Gas saved */}
                    {gasDollar && (
                      <div className="flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-[10px] uppercase tracking-wider font-bold text-emerald-400">
                        <Zap className="h-3 w-3 animate-pulse" /> {gasDollar} saved
                      </div>
                    )}

                    {/* Status badge */}
                    <Badge className={`${badge} border text-[9px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full`}>{tx.status}</Badge>

                    {/* Basescan link */}
                    <a
                      href={`https://sepolia.basescan.org/tx/${tx.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-slate-400 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all duration-300"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </main>
    </div>
  );
}
