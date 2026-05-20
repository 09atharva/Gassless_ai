import { useAccount } from 'wagmi';
import { Navbar } from '@/components/Navbar';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { History, ExternalLink, Zap, Trash2 } from 'lucide-react';
import { useTransactionHistory } from '@/hooks/use-transaction-history';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';

export default function HistoryPage() {
  const { isConnected } = useAccount();
  const { history, clearHistory } = useTransactionHistory();

  if (!isConnected) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex flex-1 items-center justify-center p-6">
          <Card className="w-full max-w-md border-white/10 bg-slate-900/50 backdrop-blur-sm text-center">
            <CardHeader>
              <CardTitle>Connect Wallet</CardTitle>
              <CardDescription>Connect to view your transaction history.</CardDescription>
            </CardHeader>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className="container mx-auto flex-1 p-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Transaction History</h1>
            <p className="text-slate-400">All your gasless activities on Base Sepolia.</p>
          </div>
          <Button variant="outline" size="sm" onClick={clearHistory} className="border-red-500/50 text-red-500 hover:bg-red-500/10">
            <Trash2 className="mr-2 h-4 w-4" /> Clear History
          </Button>
        </div>

        <Card className="border-white/10 bg-slate-900/50">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="border-b border-white/10 bg-white/5 text-xs font-medium uppercase text-slate-400">
                  <tr>
                    <th className="px-6 py-4">Action</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Gas Saved</th>
                    <th className="px-6 py-4">Time</th>
                    <th className="px-6 py-4">Hash</th>
                    <th className="px-6 py-4">Link</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {history.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-500 italic">
                        No transactions found. Start by minting your membership!
                      </td>
                    </tr>
                  ) : (
                    history.map((tx) => (
                      <tr key={tx.hash} className="transition-colors hover:bg-white/5">
                        <td className="px-6 py-4 font-medium text-white">{tx.action}</td>
                        <td className="px-6 py-4">
                          <Badge className="bg-green-500/10 text-green-500 border-none">
                            {tx.status}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-green-500 font-medium">
                          <div className="flex items-center gap-1">
                            <Zap className="h-3 w-3" />
                            {tx.gasSaved.split(' ')[2]}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-400">
                          {formatDistanceToNow(tx.timestamp)} ago
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-500 font-mono">
                          {tx.hash.slice(0, 10)}...
                        </td>
                        <td className="px-6 py-4">
                          <a 
                            href={`https://sepolia.basescan.org/tx/${tx.hash}`} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-400"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
