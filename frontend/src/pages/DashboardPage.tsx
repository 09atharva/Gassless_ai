import { useAccount, useReadContract, useBalance } from 'wagmi';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Wallet, Zap, Shield, TrendingUp, History, Bot, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTransactionHistory } from '@/hooks/use-transaction-history';
import { formatDistanceToNow } from 'date-fns';

const MOCK_USD_ADDRESS = (import.meta.env.VITE_MOCK_USD_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`;

export default function DashboardPage() {
  const { address, isConnected } = useAccount();
  const { history } = useTransactionHistory();
  
  const { data: musdBalance } = useBalance({
    address: address,
    token: MOCK_USD_ADDRESS,
  });

  // Calculate Virtual Balance for Demo (Faucet - Usage)
  const virtualEarned = history.filter(tx => tx.action.includes('Faucet')).length * 100;
  const virtualSpent = history.filter(tx => tx.action.includes('AI Payment')).length * 1;

  const displayBalance = musdBalance 
    ? (parseFloat(musdBalance.formatted) + virtualEarned - virtualSpent).toFixed(2)
    : (virtualEarned - virtualSpent).toFixed(2);

  const totalGasSaved = history.reduce((acc, tx) => {
    // Extract numerical value from "0.0024 ETH ($8.50)"
    const match = tx.gasSaved.match(/\$(\d+\.\d+)/);
    return acc + (match ? parseFloat(match[1]) : 0);
  }, 0);

  if (!isConnected) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex flex-1 items-center justify-center p-6">
          <Card className="w-full max-w-md border-white/10 bg-slate-900/50 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold">Connect Your Wallet</CardTitle>
              <CardDescription>
                Please connect your wallet to access the dashboard and view your gasless activity.
              </CardDescription>
            </CardHeader>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className="container mx-auto flex-1 space-y-8 p-6 pt-12">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Badge variant="outline" className="border-blue-500/50 text-blue-500">
            <Zap className="mr-1 h-3 w-3 fill-current" /> Base Sepolia
          </Badge>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {/* Wallet Balance Card */}
          <Card className="border-white/10 bg-slate-900/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">MockUSD Balance</CardTitle>
              <Wallet className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {displayBalance} MUSD
              </div>
              <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                <Sparkles className="h-3 w-3 text-blue-500" /> Demo Mode Active
              </p>
            </CardContent>
          </Card>

          {/* NFT Membership Card */}
          <Card className="border-white/10 bg-slate-900/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Membership</CardTitle>
              <Shield className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">Active</div>
              <p className="text-xs text-slate-500 mt-1">Premium Tier</p>
            </CardContent>
          </Card>

          {/* Gas Saved Card */}
          <Card className="border-white/10 bg-slate-900/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Total Gas Saved</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${totalGasSaved.toFixed(2)}</div>
              <p className="text-xs text-slate-500 mt-1">Through gasless transactions</p>
            </CardContent>
          </Card>

          {/* Transactions Count Card */}
          <Card className="border-white/10 bg-slate-900/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-slate-400">Transactions</CardTitle>
              <History className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{history.length}</div>
              <p className="text-xs text-slate-500 mt-1">Successful gasless ops</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Activity */}
          <Card className="lg:col-span-2 border-white/10 bg-slate-900/50">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
              <CardDescription>Your latest gasless transactions on Base Sepolia.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {history.length === 0 ? (
                  <div className="flex h-32 items-center justify-center text-slate-500 italic">
                    No transactions yet.
                  </div>
                ) : (
                  history.slice(0, 5).map((tx, i) => (
                    <div key={tx.hash} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 p-4 transition-colors hover:bg-white/10">
                      <div className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600/20 text-blue-500">
                          <Zap className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-medium">{tx.action}</p>
                          <p className="text-xs text-slate-500">
                            {formatDistanceToNow(tx.timestamp)} ago • Hash: {tx.hash.slice(0, 6)}...{tx.hash.slice(-4)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium text-green-500">+{tx.gasSaved.split(' ')[2]} saved</p>
                        <Badge variant="secondary" className="mt-1 bg-green-500/10 text-green-500 border-none">
                          Success
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* AI Assistant Widget */}
          <Card className="border-white/10 bg-slate-900/50 h-fit">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot className="h-5 w-5 text-blue-500" />
                AI Assistant
              </CardTitle>
              <CardDescription>Ask me anything about your wallet.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-lg bg-white/5 p-4 text-sm text-slate-300">
                "Hi! I see you've saved ${totalGasSaved.toFixed(2)} in gas fees. That's enough for a coffee! ☕"
              </div>
              <div className="grid grid-cols-1 gap-2">
                <button className="rounded-md border border-white/10 px-3 py-2 text-left text-xs transition-colors hover:bg-white/5">
                  How did I save gas?
                </button>
                <button className="rounded-md border border-white/10 px-3 py-2 text-left text-xs transition-colors hover:bg-white/5">
                  What is MockUSD?
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
