import { useState, useRef, useEffect, useCallback } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { Link, useLocation } from 'react-router-dom';
import { Navbar } from '@/components/Navbar';
import { Card, CardFooter, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, User, Send, Loader2, Sparkles, Zap, CheckCircle2, LayoutDashboard, History, GitBranch } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTransactionHistory } from '@/hooks/use-transaction-history';
import { SGIP, type SGIPStepState } from '@/lib/sgip';
import { useToast } from '@/hooks/use-toast';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { cn } from '@/lib/utils';

import AIOrb3D from '@/components/3d/AIOrb3D';
import SGIPPanel from '@/components/SGIPPanel';

const MEMBERSHIP_NFT_ADDRESS = (import.meta.env.VITE_MEMBERSHIP_NFT_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`;
const MOCK_USD_ADDRESS = (import.meta.env.VITE_MOCK_USD_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`;

interface Message {
  role: 'assistant' | 'user';
  content: string;
  isAction?: boolean;
  actionStatus?: 'pending' | 'success' | 'failed';
  sgipSteps?: SGIPStepState[];
  sgipGas?: string;
}

const suggestions = [
  'I want to join the membership',
  'Give me some MockUSD',
  'How much gas have I saved?',
  'Explain SGIP to me',
  'What is UGF?',
];

export default function AIAssistantPage() {
  const { address, isConnected } = useAccount();
  const { pathname } = useLocation();
  const { history, addTransaction } = useTransactionHistory();
  const { toast } = useToast();

  const { data: musdBalance } = useBalance({ address: address, token: MOCK_USD_ADDRESS });

  const virtualEarned = history.filter(tx => tx.action.includes('Faucet')).length * 100;
  const virtualSpent = history.filter(tx => tx.action.includes('AI Payment')).length * 1;
  const currentBalance = (musdBalance ? parseFloat(musdBalance.formatted) : 0) + virtualEarned - virtualSpent;

  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: "Hi! I'm your Gasless AI Wallet Agent powered by Gemini.\n\nEach message costs 1 MUSD via SGIP. I can explain your wallet, guide you through gasless transactions, or take actions directly — like minting your NFT or fetching MockUSD from the faucet.",
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const executeBlockchainAction = useCallback(async (action: string, msgIdx: number) => {
    setMessages(prev => prev.map((m, i) => i === msgIdx ? { ...m, actionStatus: 'pending' as const } : m));

    const steps = action === 'MINT_MEMBERSHIP'
      ? [SGIP.Steps.mintMembership()]
      : action === 'GET_FAUCET'
      ? [SGIP.Steps.faucet()]
      : [];

    if (!steps.length) return;

    const pipeline = SGIP.stitch(steps);
    let latestSteps: SGIPStepState[] = [];
    let latestGas = '';

    pipeline.on('*', (event) => {
      if (event.state) {
        latestSteps = [...event.state];
        setMessages(prev => prev.map((m, i) => i === msgIdx ? { ...m, sgipSteps: latestSteps, sgipGas: event.totalGasSaved } : m));
      }
      if (event.totalGasSaved) latestGas = event.totalGasSaved;
    });

    const ok = await pipeline.execute({
      address: address!,
      mockUSDAddress: MOCK_USD_ADDRESS,
      membershipNFTAddress: MEMBERSHIP_NFT_ADDRESS,
      balance: currentBalance,
    });

    if (ok) {
      const finalStep = latestSteps[0];
      if (finalStep?.result?.hash) {
        addTransaction({
          hash: finalStep.result.hash,
          action: `AI: ${finalStep.step.name}`,
          timestamp: Date.now(),
          gasSaved: finalStep.result.gasSaved ?? '0 ETH ($0)',
          status: 'success',
        });
      }
      setMessages(prev => prev.map((m, i) =>
        i === msgIdx
          ? { ...m, actionStatus: 'success' as const, content: m.content + `\n\n✅ Done! Gas saved: ${latestGas || '$8.50'}` }
          : m
      ));
      toast({ title: '⚡ Action Complete', description: `Saved ${latestGas} via SGIP!` });
    } else {
      setMessages(prev => prev.map((m, i) =>
        i === msgIdx ? { ...m, actionStatus: 'failed' as const, content: m.content + '\n\n❌ Action failed. Please try again.' } : m
      ));
      toast({ title: 'Action Failed', variant: 'destructive' });
    }
  }, [address, currentBalance, addTransaction, toast]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isLoading) return;

    if (currentBalance < 1) {
      toast({
        title: '💸 Insufficient MUSD',
        description: 'You need 1 MUSD to use the AI. Ask me to "Give me some MockUSD"!',
        variant: 'destructive',
      });
      return;
    }

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Pay for AI usage via SGIP
      const payPipeline = SGIP.stitch([SGIP.Steps.aiPayment()]);
      await payPipeline.execute({
        address: address!,
        mockUSDAddress: MOCK_USD_ADDRESS,
        membershipNFTAddress: MEMBERSHIP_NFT_ADDRESS,
        balance: currentBalance,
      });
      const payResult = payPipeline.state[0]?.result;
      if (payResult?.hash) {
        addTransaction({
          hash: payResult.hash,
          action: 'Gasless AI Payment',
          timestamp: Date.now(),
          gasSaved: payResult.gasSaved ?? '0 ETH ($0.35)',
          status: 'success',
        });
      }

      // Call AI backend
      const API_BASE = import.meta.env.VITE_API_URL || '';
      const response = await fetch(`${API_BASE}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userMessage,
          context: {
            address,
            transactionHistory: history.slice(0, 5),
            network: 'Base Sepolia',
            balance: currentBalance.toFixed(2),
            sgipEnabled: true,
          },
        }),
      });

      const data = await response.json();
      console.log('AI Response:', data);
      if (data.error) {
        throw new Error(data.error);
      }
      let aiContent: string = data.text ?? 'Sorry, I could not generate a response.';
      const actionMatch = aiContent.match(/\{"action":\s*"([^"]+)"\}/);
      const action = actionMatch ? actionMatch[1] : null;
      const cleanContent = aiContent.replace(/\{"action":\s*"[^"]+"\}/, '').trim();

      setMessages(prev => {
        const newIdx = prev.length; // accurate index after push
        const msg: Message = { role: 'assistant', content: cleanContent, isAction: !!action };
        const next = [...prev, msg];
        if (action) {
          setTimeout(() => executeBlockchainAction(action, newIdx), 50);
        }
        return next;
      });
    } catch (err: any) {
      console.error('AI Chat Error:', err);
      const errMsg = err?.message || "I'm having trouble connecting to my brain right now.";
      setMessages(prev => [...prev, { role: 'assistant', content: `Sorry, ${errMsg}` }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, currentBalance, address, history, messages.length, addTransaction, executeBlockchainAction, toast]);

  if (!isConnected) {
    return (
      <div className="flex min-h-screen flex-col bg-[#0e131f] relative">
        <Navbar />
        <main className="flex flex-1 items-center justify-center p-6 z-10">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <Card className="w-full max-w-md glass-card border-0 text-center p-8 rounded-3xl relative overflow-hidden">
              <div className="sweep-border-top" />
              <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600/20 shadow-lg border border-blue-500/20">
                <Bot className="h-8 w-8 text-cyan-400" />
              </div>
              <CardTitle className="text-2xl font-black mb-3 text-white">Connect Wallet</CardTitle>
              <CardDescription className="text-slate-400">
                Connect your wallet to speak with your Gemini-powered AI agent.
              </CardDescription>
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

      {/* Main Content Area */}
      <main className="flex-grow ml-0 md:ml-64 flex flex-col h-screen relative z-10 pt-16 md:pt-0">
        {/* Top Header */}
        <header className="flex justify-between items-center w-full px-6 md:px-12 py-4 border-b border-white/5 bg-[#080e1a]/30 backdrop-blur-md shrink-0">
          <div className="flex items-center gap-3">
            <AIOrb3D isActive={isLoading} className="w-11 h-11 shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-white tracking-tight">Neural Core Agent</span>
                <span className="text-[9px] bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">active</span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Balance: <span className="text-cyan-400 font-bold">{currentBalance.toFixed(2)} MUSD</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-blue-500/10 px-4 py-1.5 text-[10px] font-bold text-cyan-400 border border-blue-500/20 uppercase tracking-widest">
            <Sparkles className="h-3 w-3 mr-1" /> 1 MUSD/msg
          </div>
        </header>

        {/* Chat History List */}
        <div className="flex-1 overflow-y-auto px-6 md:px-12 py-8 space-y-6 w-full max-w-5xl mx-auto">
          {messages.map((message, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex max-w-[80%] gap-3.5 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                {/* Avatar */}
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 shadow-lg ${
                  message.role === 'user'
                    ? 'bg-slate-800'
                    : 'bg-gradient-to-br from-blue-600 to-cyan-500 shadow-neon-blue'
                }`}>
                  {message.role === 'user' ? <User className="h-4 w-4 text-white" /> : <Bot className="h-4 w-4 text-white" />}
                </div>

                <div className="space-y-3">
                  {/* Message bubble */}
                  <div className={`relative rounded-2xl p-5 text-sm leading-relaxed shadow-xl border ${
                    message.role === 'user'
                      ? 'glass-bubble-user text-white'
                      : 'glass-bubble-ai text-slate-200 border-white/5'
                  }`}>
                    <div className="whitespace-pre-wrap">{message.content}</div>

                    {message.isAction && (
                      <div className="mt-4 flex items-center gap-2 border-t border-white/5 pt-3 text-xs uppercase tracking-wider font-semibold">
                        {message.actionStatus === 'pending' ? (
                          <span className="flex items-center gap-1.5 text-cyan-400">
                            <Loader2 className="h-3.5 w-3.5 animate-spin" /> Executing SGIP pipeline...
                          </span>
                        ) : message.actionStatus === 'success' ? (
                          <span className="flex items-center gap-1.5 text-emerald-400">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Pipeline executed!
                          </span>
                        ) : message.actionStatus === 'failed' ? (
                          <span className="text-rose-400">❌ Pipeline failed</span>
                        ) : (
                          <span className="flex items-center gap-1.5 text-cyan-400">
                            <Zap className="h-3.5 w-3.5" /> Stitching transaction...
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Inline SGIP progress tracker */}
                  {message.sgipSteps && message.sgipSteps.length > 0 && (
                    <SGIPPanel
                      steps={message.sgipSteps}
                      totalGasSaved={message.sgipGas}
                      isRunning={message.actionStatus === 'pending'}
                      compact
                      className="max-w-xs"
                    />
                  )}
                </div>
              </div>
            </motion.div>
          ))}

          {/* Loading bubble */}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-3.5">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-neon-blue">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="glass-bubble-ai px-5 py-4 rounded-2xl flex items-center space-x-2">
                  <span className="inline-block h-2 w-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="inline-block h-2 w-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="inline-block h-2 w-2 rounded-full bg-cyan-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}
          <div ref={scrollRef} />
        </div>

        {/* Input box */}
        <div className="w-full px-6 md:px-12 pb-8 pt-4 bg-gradient-to-t from-[#0e131f] via-[#0e131f]/90 to-transparent shrink-0">
          <div className="max-w-4xl mx-auto flex flex-col space-y-4">
            
            {/* Waveform indicator */}
            {isLoading && (
              <div className="flex justify-center items-end space-x-1.5 h-6 mb-2">
                <div className="w-1 bg-cyan-400 rounded-t-sm animate-wave" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-1 bg-cyan-400 rounded-t-sm animate-wave" style={{ animationDelay: '0.3s' }}></div>
                <div className="w-1 bg-blue-500 rounded-t-sm animate-wave" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-1 bg-cyan-400 rounded-t-sm animate-wave" style={{ animationDelay: '0.5s' }}></div>
                <div className="w-1 bg-cyan-400 rounded-t-sm animate-wave" style={{ animationDelay: '0.1s' }}></div>
                <div className="w-1 bg-blue-500 rounded-t-sm animate-wave" style={{ animationDelay: '0.4s' }}></div>
                <div className="w-1 bg-cyan-400 rounded-t-sm animate-wave" style={{ animationDelay: '0.2s' }}></div>
              </div>
            )}

            {/* Suggestions */}
            <div className="flex w-full flex-wrap gap-2 justify-center">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => setInput(s)}
                  className="rounded-full border border-white/5 bg-white/3 px-3 py-1.5 text-xs text-slate-400 transition-all hover:bg-cyan-500/10 hover:text-cyan-300 hover:border-cyan-500/20"
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Input form */}
            <div className="relative w-full group">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/10 via-blue-500/10 to-purple-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
              <div className="holographic-input relative flex items-center p-2 rounded-full border border-white/10 bg-black/40 backdrop-blur-xl">
                <input
                  placeholder="Command the AI Core..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  className="flex-grow bg-transparent border-none outline-none focus:ring-0 text-white placeholder-slate-500 px-5 text-sm"
                />
                <Button
                  onClick={handleSend}
                  disabled={isLoading || !input.trim()}
                  className="bg-cyan-500 hover:bg-cyan-400 text-black font-bold h-9 w-9 p-0 rounded-full transition-all shadow-[0_0_15px_rgba(34,211,238,0.4)] flex items-center justify-center shrink-0"
                >
                  <Send className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>

            <div className="text-center">
              <p className="text-[10px] text-slate-600 uppercase tracking-widest font-bold">Neural Net Active · Encrypted Node Session</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
