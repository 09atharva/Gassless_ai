import { useAccount } from 'wagmi';
import { Navbar } from '@/components/Navbar';
import { Card, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { History, ExternalLink, Zap, Trash2, TrendingUp, GitBranch } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTransactionHistory } from '@/hooks/use-transaction-history';
import { formatDistanceToNow } from 'date-fns';

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
  const { history, clearHistory } = useTransactionHistory();

  const totalGasSaved = history.reduce((acc, tx) => {
    const match = tx.gasSaved.match(/\$(\d+\.?\d*)/);
    return acc + (match ? parseFloat(match[1]) : 0);
  }, 0);

  const sgipCount = history.filter(tx => tx.action.toLowerCase().includes('sgip')).length;

  if (!isConnected) {
    return (
      <div className="flex min-h-screen flex-col hero-gradient">
        <Navbar />
        <main className="flex flex-1 items-center justify-center p-6">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="w-full max-w-md glass-card border-0 text-center p-8">
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600/20">
                <History className="h-8 w-8 text-blue-400" />
              </div>
              <CardTitle className="text-2xl font-black mb-3">Connect Wallet</CardTitle>
              <CardDescription className="text-slate-400">Connect to view your gasless transaction history.</CardDescription>
            </Card>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col hero-gradient">
      <Navbar />

      <main className="container mx-auto flex-1 p-6 py-10 max-w-6xl space-y-8">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-3xl font-black text-white">Transaction History</h1>
            <p className="text-slate-400 mt-1 text-sm">All your gasless SGIP operations on Base Sepolia</p>
          </div>
          {history.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearHistory}
              className="border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50"
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
              { label: 'Total Operations', value: history.length, icon: History, color: 'text-blue-400', bg: 'bg-blue-500/15' },
              { label: 'Gas Saved', value: `$${totalGasSaved.toFixed(2)}`, icon: TrendingUp, color: 'text-emerald-400', bg: 'bg-emerald-500/15' },
              { label: 'SGIP Pipelines', value: sgipCount, icon: GitBranch, color: 'text-cyan-400', bg: 'bg-cyan-500/15' },
              { label: 'Success Rate', value: '100%', icon: Zap, color: 'text-purple-400', bg: 'bg-purple-500/15' },
            ].map(stat => (
              <div key={stat.label} className="glass-card rounded-2xl p-4">
                <div className={`flex h-8 w-8 items-center justify-center rounded-xl ${stat.bg} mb-3`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
                <p className={`text-xl font-black font-display ${stat.color}`}>{stat.value}</p>
                <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </motion.div>
        )}

        {/* Transaction cards */}
        {history.length === 0 ? (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center justify-center py-24 text-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-800">
              <History className="h-8 w-8 text-slate-600" />
            </div>
            <p className="text-slate-500 font-medium">No transactions yet</p>
            <p className="text-slate-600 text-sm">Start by minting your membership or using the AI assistant!</p>
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
                  className="glass-card glass-hover rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4"
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
                      <p className="font-semibold text-white truncate">{tx.action}</p>
                      <p className="text-xs text-slate-500 mt-0.5 font-mono">
                        {tx.hash.slice(0, 12)}... · {formatDistanceToNow(tx.timestamp)} ago
                      </p>
                    </div>
                  </div>

                  {/* Right side */}
                  <div className="flex items-center gap-3 shrink-0 ml-auto">
                    {/* Gas saved */}
                    {gasDollar && (
                      <div className="flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-400">
                        <Zap className="h-3 w-3" /> {gasDollar} saved
                      </div>
                    )}

                    {/* Status badge */}
                    <Badge className={`${badge} border text-xs`}>{tx.status}</Badge>

                    {/* Basescan link */}
                    <a
                      href={`https://sepolia.basescan.org/tx/${tx.hash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
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
