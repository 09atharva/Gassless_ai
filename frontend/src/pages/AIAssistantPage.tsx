import { useState, useRef, useEffect } from 'react';
import { useAccount, useBalance } from 'wagmi';
import { Navbar } from '@/components/Navbar';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Bot, User, Send, Loader2, Sparkles, Zap, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTransactionHistory } from '@/hooks/use-transaction-history';
import { UGF_SDK } from '@/lib/ugf-sdk';
import { useToast } from '@/hooks/use-toast';
import { encodeFunctionData } from 'viem';

const MEMBERSHIP_NFT_ADDRESS = (import.meta.env.VITE_MEMBERSHIP_NFT_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`;
const MOCK_USD_ADDRESS = (import.meta.env.VITE_MOCK_USD_ADDRESS || '0x0000000000000000000000000000000000000000') as `0x${string}`;

const NFT_ABI = [
  { name: 'mintMembership', type: 'function', stateMutability: 'nonpayable', inputs: [], outputs: [] },
] as const;

interface Message {
  role: 'assistant' | 'user';
  content: string;
  isAction?: boolean;
  actionStatus?: 'pending' | 'success' | 'failed';
}

export default function AIAssistantPage() {
  const { address, isConnected } = useAccount();
  const { history, addTransaction } = useTransactionHistory();
  const { toast } = useToast();
  
  const { data: musdBalance } = useBalance({
    address: address,
    token: MOCK_USD_ADDRESS,
  });

  // Calculate Virtual Balance for Demo (Faucet - Usage)
  const virtualEarned = history.filter(tx => tx.action.includes('Faucet')).length * 100;
  const virtualSpent = history.filter(tx => tx.action.includes('AI Payment')).length * 1;
  const currentBalance = (musdBalance ? parseFloat(musdBalance.formatted) : 0) + virtualEarned - virtualSpent;

  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi! I'm your Gasless AI Assistant. Each interaction costs 1 MUSD. You can use me to take actions or ask questions!" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const executeBlockchainAction = async (action: string, messageIndex: number) => {
    setMessages(prev => prev.map((m, i) => i === messageIndex ? { ...m, actionStatus: 'pending' } : m));
    
    try {
      if (action === 'MINT_MEMBERSHIP') {
        const data = encodeFunctionData({ abi: NFT_ABI, functionName: 'mintMembership', args: [] });
        const response = await UGF_SDK.executeGaslessTransaction({ to: MEMBERSHIP_NFT_ADDRESS, data }, MOCK_USD_ADDRESS);
        
        if (response.success) {
          addTransaction({ hash: response.hash!, action: 'AI: Mint Membership', timestamp: Date.now(), gasSaved: response.gasSaved, status: 'success' });
          setMessages(prev => prev.map((m, i) => i === messageIndex ? { ...m, actionStatus: 'success', content: m.content + "\n\n✅ Membership minted successfully!" } : m));
          toast({ title: "Action Success", description: "Membership NFT minted via UGF." });
        }
      } else if (action === 'GET_FAUCET') {
        const response = await UGF_SDK.requestFaucet(address!);
        if (response.success) {
          addTransaction({ hash: response.hash!, action: 'AI: Faucet Request', timestamp: Date.now(), gasSaved: response.gasSaved, status: 'success' });
          setMessages(prev => prev.map((m, i) => i === messageIndex ? { ...m, actionStatus: 'success', content: m.content + "\n\n✅ 100 MockUSD added to your wallet!" } : m));
          toast({ title: "Action Success", description: "100 MockUSD received gaslessly." });
        }
      }
    } catch (error) {
      console.error(error);
      setMessages(prev => prev.map((m, i) => i === messageIndex ? { ...m, actionStatus: 'failed', content: m.content + "\n\n❌ Action failed. Please try again." } : m));
      toast({ title: "Action Failed", description: "Blockchain interaction failed.", variant: "destructive" });
    }
  };

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    if (currentBalance < 1) {
      toast({
        title: "Insufficient MUSD",
        description: "You need at least 1 MUSD to use the AI. Use the faucet or ask me to get some!",
        variant: "destructive",
      });
      return;
    }

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // 1. Pay for AI Usage gaslessly via UGF
      const payResponse = await UGF_SDK.payForAIUsage(address!);
      if (payResponse.success) {
        addTransaction({
          hash: payResponse.hash!,
          action: 'Gasless AI Payment',
          timestamp: Date.now(),
          gasSaved: payResponse.gasSaved,
          status: 'success',
        });
      }

      // 2. Call AI Backend
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: userMessage,
          context: {
            address,
            transactionHistory: history.slice(0, 5),
            network: 'Base Sepolia',
          }
        }),
      });

      const data = await response.json();
      let aiContent = data.text;
      
      const actionMatch = aiContent.match(/\{"action":\s*"([^"]+)"\}/);
      const action = actionMatch ? actionMatch[1] : null;
      const cleanContent = aiContent.replace(/\{"action":\s*"[^"]+"\}/, '').trim();
      
      const newMsgIndex = messages.length + 1;
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: cleanContent,
        isAction: !!action
      }]);

      if (action) {
        await executeBlockchainAction(action, newMsgIndex);
      }

    } catch (error) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I'm having trouble connecting to my brain right now." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const suggestions = [
    "I want to join the membership",
    "Give me some MockUSD",
    "How much gas have I saved?",
    "What is UGF?"
  ];

  if (!isConnected) {
    return (
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="flex flex-1 items-center justify-center p-6">
          <Card className="w-full max-w-md border-white/10 bg-slate-900/50 backdrop-blur-sm text-center">
            <CardHeader>
              <CardTitle>Connect Wallet</CardTitle>
              <CardDescription>Connect to talk to your AI assistant.</CardDescription>
            </CardHeader>
          </Card>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-white">
      <Navbar />
      
      <main className="container mx-auto flex max-w-4xl flex-1 flex-col p-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]">
              <Bot className="h-7 w-7" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">AI Wallet Agent</h1>
              <p className="text-slate-400">Balance: <span className="text-blue-500 font-bold">{currentBalance.toFixed(2)} MUSD</span></p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-full bg-blue-500/10 px-4 py-1.5 text-xs font-medium text-blue-500 border border-blue-500/20">
            <Sparkles className="h-3 w-3" /> 1 MUSD / Msg
          </div>
        </div>

        <Card className="flex flex-1 flex-col overflow-hidden border-white/10 bg-slate-900/50 backdrop-blur-sm shadow-2xl">
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              {messages.map((message, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={i}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex max-w-[80%] gap-3 ${message.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                      message.role === 'user' ? 'bg-slate-700' : 'bg-blue-600'
                    }`}>
                      {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </div>
                    <div className={`relative rounded-2xl px-4 py-3 text-sm shadow-lg ${
                      message.role === 'user' 
                        ? 'bg-blue-600 text-white' 
                        : 'bg-white/5 text-slate-200 border border-white/10'
                    }`}>
                      <div className="whitespace-pre-wrap">{message.content}</div>
                      
                      {message.isAction && (
                        <div className="mt-3 flex items-center gap-2 border-t border-white/10 pt-3 text-xs">
                          {message.actionStatus === 'pending' ? (
                            <div className="flex items-center gap-2 text-blue-400">
                              <Loader2 className="h-3 w-3 animate-spin" />
                              <span>Executing UGF Transaction...</span>
                            </div>
                          ) : message.actionStatus === 'success' ? (
                            <div className="flex items-center gap-2 text-green-500">
                              <CheckCircle2 className="h-3 w-3" />
                              <span>Action complete!</span>
                            </div>
                          ) : message.actionStatus === 'failed' ? (
                            <div className="flex items-center gap-2 text-red-500">
                              <span>Action failed.</span>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 text-blue-500">
                              <Zap className="h-3 w-3" />
                              <span>Taking action...</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-600">
                      <Bot className="h-4 w-4" />
                    </div>
                    <div className="rounded-2xl bg-white/5 px-4 py-2 text-sm border border-white/10 shadow-lg">
                      <Loader2 className="h-4 w-4 animate-spin" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={scrollRef} />
            </div>
          </ScrollArea>

          <CardFooter className="flex-col gap-4 border-t border-white/10 p-4 bg-white/5">
            <div className="flex w-full flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => setInput(s)}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-slate-400 transition-all hover:bg-blue-600 hover:text-white hover:border-blue-600 shadow-sm"
                >
                  {s}
                </button>
              ))}
            </div>
            <div className="flex w-full gap-2">
              <Input
                placeholder="Tell me what to do (e.g. 'Mint my NFT')"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                className="border-white/10 bg-white/5 focus-visible:ring-blue-600"
              />
              <Button onClick={handleSend} disabled={isLoading || !input.trim()} className="bg-blue-600 hover:bg-blue-700 shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardFooter>
        </Card>
      </main>
    </div>
  );
}
