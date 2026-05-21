import { useState, useRef, useEffect, useCallback } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { Navbar } from '@/components/Navbar';
import { Card, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, User, Send, Loader2, Sparkles, Zap, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTransactionHistory } from '@/hooks/use-transaction-history';
import { SGIP, type SGIPStepState } from '@/lib/sgip';
import { useToast } from '@/hooks/use-toast';

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
      const response = await fetch('/api/ai/chat', {
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
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting to my brain right now. Please check the AI server is running." }]);
    } finally {
      setIsLoading(false);
    }
  }, [input, isLoading, currentBalance, address, history, messages.length, addTransaction, executeBlockchainAction, toast]);

  if (!isConnected) {
    return (
      <div className="flex min-h-screen flex-col hero-gradient">
        <Navbar />
        <main className="flex flex-1 items-center justify-center p-6">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
            <div className="w-full max-w-md glass-card rounded-2xl border-0 p-8 text-center">
              <AIOrb3D className="h-32 mx-auto mb-4" />
              <h2 className="font-display text-2xl font-black text-white mb-2">Connect Wallet</h2>
              <p className="text-slate-400 text-sm">Connect to talk to your Gemini-powered AI wallet agent.</p>
            </div>
          </motion.div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col hero-gradient">
      <Navbar />

      <main className="container mx-auto flex max-w-4xl flex-1 flex-col p-4 pb-4 pt-8 gap-4">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <AIOrb3D isActive={isLoading} className="w-16 h-16 shrink-0" />
            <div>
              <h1 className="font-display text-2xl font-black text-white">AI Wallet Agent</h1>
              <p className="text-sm text-slate-400">
                Balance: <span className="text-blue-400 font-bold">{currentBalance.toFixed(2)} MUSD</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-blue-500/10 px-4 py-1.5 text-xs font-semibold text-blue-400 border border-blue-500/20">
            <Sparkles className="h-3 w-3" /> 1 MUSD/msg · Gemini
          </div>
        </motion.div>

        {/* Chat card */}
        <Card className="flex flex-1 flex-col overflow-hidden glass-card border-0 rounded-2xl shadow-2xl" style={{ minHeight: '60vh' }}>
          <ScrollArea className="flex-1 p-5">
            <div className="space-y-5">
              {messages.map((message, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex max-w-[80%] gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    {/* Avatar */}
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full shadow-lg ${
                      message.role === 'user' ? 'bg-slate-700' : 'bg-blue-600 shadow-neon-blue'
                    }`}>
                      {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </div>

                    <div className="space-y-2">
                      {/* Message bubble */}
                      <div className={`relative rounded-2xl px-4 py-3 text-sm shadow-lg ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white rounded-tr-sm'
                          : 'bg-white/5 text-slate-200 border border-white/8 rounded-tl-sm'
                      }`}>
                        <div className="whitespace-pre-wrap leading-relaxed">{message.content}</div>

                        {message.isAction && (
                          <div className={`mt-3 flex items-center gap-2 border-t border-white/10 pt-2.5 text-xs`}>
                            {message.actionStatus === 'pending' ? (
                              <span className="flex items-center gap-1.5 text-blue-400">
                                <Loader2 className="h-3 w-3 animate-spin" /> Executing SGIP transaction...
                              </span>
                            ) : message.actionStatus === 'success' ? (
                              <span className="flex items-center gap-1.5 text-emerald-400">
                                <CheckCircle2 className="h-3 w-3" /> SGIP action complete!
                              </span>
                            ) : message.actionStatus === 'failed' ? (
                              <span className="text-red-400">❌ Action failed</span>
                            ) : (
                              <span className="flex items-center gap-1.5 text-blue-400">
                                <Zap className="h-3 w-3" /> Taking action via SGIP...
                              </span>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Inline SGIP panel */}
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

              {/* Loading indicator */}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="flex items-center gap-1.5 rounded-2xl bg-white/5 border border-white/8 px-4 py-3">
                      {[0, 1, 2].map(i => (
                        <span key={i} className="inline-block h-2 w-2 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                      ))}
                    </div>
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          {/* Footer */}
          <CardFooter className="flex-col gap-3 border-t border-white/5 p-4 bg-white/[0.02]">
            {/* Suggestion chips */}
            <div className="flex w-full flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => setInput(s)}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-400 transition-all hover:bg-blue-600 hover:text-white hover:border-blue-600"
                >
                  {s}
                </button>
              ))}
            </div>

            {/* Input row */}
            <div className="flex w-full gap-2">
              <Input
                placeholder="Tell me what to do (e.g. 'Mint my NFT')"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="border-white/10 bg-white/5 focus-visible:ring-blue-600 rounded-xl"
              />
              <Button
                onClick={handleSend}
                disabled={isLoading || !input.trim()}
                className="bg-blue-600 hover:bg-blue-500 shadow-neon-blue rounded-xl px-4"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>

            <p className="text-center text-xs text-slate-600 w-full">
              MUSD balance: <span className="text-blue-400 font-semibold">{currentBalance.toFixed(2)}</span> · Each message costs 1 MUSD via SGIP
            </p>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
