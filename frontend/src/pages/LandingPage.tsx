import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/Navbar';
import { Shield, Zap, Bot, ArrowRight, Coins, GitBranch, TrendingUp, Lock } from 'lucide-react';
import NFTCard3D from '@/components/3d/NFTCard3D';

const features = [
  {
    name: 'Gasless Transactions',
    description: 'Pay gas with MockUSD. No ETH needed on Base Sepolia.',
    icon: Zap,
    color: 'text-neon-blue',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
  },
  {
    name: 'SGIP Protocol',
    description: 'Stitch multiple gasless ops into atomic pipelines automatically.',
    icon: GitBranch,
    color: 'text-neon-cyan',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
  },
  {
    name: 'AI Wallet Agent',
    description: 'Gemini-powered AI that takes real blockchain actions for you.',
    icon: Bot,
    color: 'text-neon-purple',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
  },
  {
    name: 'NFT Memberships',
    description: 'Mint on-chain membership NFTs with zero ETH required.',
    icon: Shield,
    color: 'text-neon-emerald',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
  {
    name: 'MockUSD Faucet',
    description: 'Claim free MockUSD gaslessly to start your Web3 journey.',
    icon: Coins,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
  {
    name: 'On-chain Savings',
    description: 'Real-time gas savings tracking across all your transactions.',
    icon: TrendingUp,
    color: 'text-neon-emerald',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
];

const sgipSteps = [
  { step: '01', title: 'Define Pipeline', code: 'SGIP.stitch([FaucetStep, MintStep])' },
  { step: '02', title: 'Intelligent Route', code: '.route({ skipIf: hasBalance })' },
  { step: '03', title: 'Atomic Execute', code: '.execute(walletContext)' },
  { step: '04', title: 'Live Telemetry', code: '.on("step:complete", update)' },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0 },
};

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col hero-gradient">
      <Navbar />

      <main className="flex-1">
        {/* ── Hero Section ───────────────────────────────────────────── */}
        <section className="relative overflow-hidden px-6 pt-20 pb-16 sm:pt-28 lg:px-8">
          {/* Ambient glow orbs */}
          <div className="absolute left-1/2 top-24 -translate-x-1/2 w-[600px] h-[300px] bg-blue-600/10 blur-[100px] rounded-full pointer-events-none" />
          <div className="absolute left-1/4 top-40 w-[300px] h-[200px] bg-purple-600/8 blur-[80px] rounded-full pointer-events-none" />

          <div className="mx-auto max-w-7xl">
            <div className="grid items-center gap-12 lg:grid-cols-2">
              {/* Left copy */}
              <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.div variants={itemVariants}>
                  <Badge className="mb-6 border-blue-500/30 bg-blue-500/10 text-blue-400 text-xs font-semibold px-3 py-1.5 gap-1.5">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
                    Live on Base Sepolia · SGIP v1.0
                  </Badge>
                </motion.div>

                <motion.h1
                  variants={itemVariants}
                  className="font-display text-5xl font-black leading-[1.05] tracking-tight text-white sm:text-6xl xl:text-7xl"
                >
                  Gasless AI
                  <span className="block gradient-text neon-text-blue">Membership</span>
                  <span className="block text-white">Wallet</span>
                </motion.h1>

                <motion.p variants={itemVariants} className="mt-6 text-lg leading-8 text-slate-400 max-w-lg">
                  Mint NFT memberships and pay gas with <span className="text-blue-400 font-semibold">MockUSD</span> instead of ETH.
                  Powered by the <span className="text-cyan-400 font-semibold">Stitch Gasless Intelligence Protocol</span> and an on-chain AI agent.
                </motion.p>

                <motion.div variants={itemVariants} className="mt-10 flex flex-wrap items-center gap-4">
                  <Link to="/dashboard">
                    <Button
                      size="lg"
                      className="group relative overflow-hidden bg-blue-600 hover:bg-blue-500 font-semibold px-8 h-12 shadow-neon-blue transition-all duration-300"
                    >
                      <span className="relative z-10 flex items-center gap-2">
                        Launch App <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                      </span>
                    </Button>
                  </Link>
                  <Link to="/mint">
                    <Button
                      variant="outline"
                      size="lg"
                      className="border-white/15 bg-white/5 hover:bg-white/10 hover:border-blue-500/40 font-semibold px-8 h-12 backdrop-blur-sm transition-all duration-300"
                    >
                      <Shield className="mr-2 h-4 w-4 text-blue-400" />
                      Mint NFT
                    </Button>
                  </Link>
                </motion.div>

                {/* Stats strip */}
                <motion.div variants={itemVariants} className="mt-12 flex flex-wrap gap-8">
                  {[
                    { label: 'Gas Saved', value: '$12,840', color: 'text-emerald-400' },
                    { label: 'Memberships', value: '3,240+', color: 'text-blue-400' },
                    { label: 'Pipelines Run', value: '18K+', color: 'text-purple-400' },
                  ].map(stat => (
                    <div key={stat.label}>
                      <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{stat.label}</p>
                    </div>
                  ))}
                </motion.div>
              </motion.div>

              {/* Right 3D card */}
              <motion.div
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="relative flex items-center justify-center"
              >
                <div className="absolute inset-0 bg-blue-600/5 blur-3xl rounded-full" />
                <NFTCard3D className="w-full max-w-xs h-[420px]" />
                {/* Floating badges */}
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -left-4 top-1/4 glass rounded-2xl px-3 py-2 text-xs font-semibold text-emerald-400 border border-emerald-500/20"
                >
                  ⚡ Gas Saved: $8.50
                </motion.div>
                <motion.div
                  animate={{ y: [0, 6, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                  className="absolute -right-4 bottom-1/3 glass rounded-2xl px-3 py-2 text-xs font-semibold text-blue-400 border border-blue-500/20"
                >
                  🛡️ Member NFT #1337
                </motion.div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ── SGIP Protocol Section ────────────────────────────────────── */}
        <section className="py-20 px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <Badge className="mb-4 border-cyan-500/30 bg-cyan-500/10 text-cyan-400">
                <GitBranch className="mr-1.5 h-3 w-3" /> Stitch Gasless Intelligence Protocol
              </Badge>
              <h2 className="font-display text-4xl font-black text-white sm:text-5xl">
                Smart Transaction <span className="gradient-text">Orchestration</span>
              </h2>
              <p className="mt-4 text-slate-400 max-w-xl mx-auto">
                SGIP chains multiple gasless operations into declarative pipelines with intelligent skipping, retries, and real-time telemetry.
              </p>
            </motion.div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {sgipSteps.map((s, i) => (
                <motion.div
                  key={s.step}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="glass-card glass-hover rounded-2xl p-6 group cursor-default"
                >
                  <div className="text-4xl font-black text-blue-600/30 font-display mb-4">{s.step}</div>
                  <h3 className="font-semibold text-white mb-3">{s.title}</h3>
                  <code className="block text-xs text-cyan-400/80 bg-cyan-500/5 border border-cyan-500/10 rounded-lg px-3 py-2 font-mono">
                    {s.code}
                  </code>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Features Grid ─────────────────────────────────────────────── */}
        <section className="py-20 px-6 lg:px-8 bg-white/[0.015]">
          <div className="mx-auto max-w-7xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <h2 className="font-display text-4xl font-black text-white sm:text-5xl">
                Everything you need
              </h2>
              <p className="mt-4 text-slate-400">Built for the next generation of Web3 users.</p>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
            >
              {features.map((feature) => (
                <motion.div
                  key={feature.name}
                  variants={itemVariants}
                  className={`glass-card glass-hover rounded-2xl p-6 border ${feature.border}`}
                >
                  <div className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${feature.bg} mb-4`}>
                    <feature.icon className={`h-5 w-5 ${feature.color}`} />
                  </div>
                  <h3 className="font-semibold text-white mb-2">{feature.name}</h3>
                  <p className="text-sm text-slate-400">{feature.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── CTA Section ───────────────────────────────────────────────── */}
        <section className="py-24 px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="glass-card rounded-3xl p-12 border border-blue-500/15 shadow-neon-blue"
            >
              <Lock className="h-10 w-10 text-blue-400 mx-auto mb-6" />
              <h2 className="font-display text-3xl font-black text-white mb-4">
                Start your gasless journey today
              </h2>
              <p className="text-slate-400 mb-8">
                Connect your wallet, claim MockUSD from the faucet, and let SGIP handle the rest.
              </p>
              <Link to="/dashboard">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-500 font-bold px-10 h-12 shadow-neon-blue">
                  Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </motion.div>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 py-8 px-6 text-center">
        <p className="text-sm text-slate-600">
          © 2026 GaslessAI · Built with SGIP + UGF on Base Sepolia
        </p>
      </footer>
    </div>
  );
}
