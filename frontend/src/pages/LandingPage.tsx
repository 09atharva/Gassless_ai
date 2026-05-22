/**
 * LandingPage — Cinematic immersive landing experience.
 *
 * Full-screen hero with parallax text that fades on scroll,
 * the 3D neural sphere visible behind everything (Scene3D),
 * staggered feature card reveals, SGIP protocol section,
 * and a glass-metal CTA — all scroll-driven via framer-motion.
 */
import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Navbar } from '@/components/Navbar';
import { Shield, Zap, Bot, ArrowRight, Coins, GitBranch, TrendingUp, Lock } from 'lucide-react';
import { useTilt } from '@/hooks/useTilt';
import { cn } from '@/lib/utils';

/* ── Data ────────────────────────────────────────────────────────────── */

const features = [
  {
    name: 'Neural Routing',
    description: 'Intelligent transaction pathways optimized by deep learning algorithms to guarantee absolute lowest execution costs across all rollups.',
    icon: Zap,
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    border: 'border-cyan-500/20',
  },
  {
    name: 'Abstracted Gas',
    description: 'Operate entirely without native tokens. The protocol handles all underlying fee markets invisibly while you focus on execution.',
    icon: GitBranch,
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
  },
  {
    name: 'Cryptographic Core',
    description: 'Military-grade MPC wallets woven directly into the atmospheric operating system. Your assets remain secure, liquid, and accessible.',
    icon: Shield,
    color: 'text-purple-400',
    bg: 'bg-purple-500/10',
    border: 'border-purple-500/20',
  },
  {
    name: 'AI Wallet Agent',
    description: 'Gemini-powered AI that takes real blockchain actions for you. Speak naturally and watch it execute gasless operations.',
    icon: Bot,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
  },
  {
    name: 'MockUSD Faucet',
    description: 'Claim free MockUSD gaslessly to start your Web3 journey. No ETH needed, ever.',
    icon: Coins,
    color: 'text-amber-400',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/20',
  },
  {
    name: 'On-chain Savings',
    description: 'Real-time gas savings tracking across all your transactions. Every operation is metered and reported.',
    icon: TrendingUp,
    color: 'text-rose-400',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
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
  visible: { opacity: 1, transition: { staggerChildren: 0.12 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] } },
};

/* ── Tilt Card Component ─────────────────────────────────────────────── */

interface TiltCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

function TiltCard({ children, className, ...props }: TiltCardProps) {
  const { style, glareStyle, onMouseMove, onMouseLeave } = useTilt(5);
  return (
    <div
      className={cn(
        'glass-card rounded-2xl p-6 border border-white/10 relative overflow-hidden',
        'hover:border-white/20',
        className
      )}
      style={style}
      onMouseMove={onMouseMove}
      onMouseLeave={onMouseLeave}
      {...props}
    >
      {/* Glare overlay — follows cursor */}
      <div
        className="card-glare"
        style={glareStyle}
      />
      <div className="sweep-border-top" />
      {/* Content sits above the noise/glare layers */}
      <div className="relative z-[2]">
        {children}
      </div>
    </div>
  );
}

/* ── Landing Page ────────────────────────────────────────────────────── */

export default function LandingPage() {
  const heroRef = useRef<HTMLElement>(null);

  // Parallax: scroll progress over the hero section
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  // Hero title transforms
  const heroTitleY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const heroTitleOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroTitleScale = useTransform(scrollYProgress, [0, 1], [1, 1.15]);

  // Subtitle transforms (slightly different timing)
  const heroSubY = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const heroSubOpacity = useTransform(scrollYProgress, [0, 0.4], [1, 0]);

  return (
    <div className="flex min-h-screen flex-col bg-transparent relative overflow-hidden">
      <Navbar />

      <main className="flex-1 relative z-10">
        {/* ─────────────────────────────────────────────────────────────
            HERO SECTION — Full-screen, centered, parallax on scroll
        ───────────────────────────────────────────────────────────── */}
        <section
          ref={heroRef}
          className="relative w-full h-screen flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Massive title — parallaxes up & fades */}
          <motion.h1
            style={{ y: heroTitleY, opacity: heroTitleOpacity, scale: heroTitleScale }}
            className="font-display text-[72px] sm:text-[96px] md:text-[120px] lg:text-[140px] font-black leading-[0.9] tracking-[-0.04em] text-center z-10 select-none"
          >
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-slate-600/40">
              GASLESS.
            </span>
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white via-white to-slate-600/40">
              AI.
            </span>
          </motion.h1>

          {/* Subtitle — parallaxes & fades with different timing */}
          <motion.p
            style={{ y: heroSubY, opacity: heroSubOpacity }}
            className="mt-8 text-base sm:text-lg text-slate-400 max-w-2xl text-center z-10 px-6 leading-relaxed"
          >
            The most advanced neural execution environment for high-net-worth
            Web3 infrastructure. Zero friction. Infinite depth.
          </motion.p>

          {/* CTA Buttons — fade with hero */}
          <motion.div
            style={{ opacity: heroSubOpacity }}
            className="mt-10 flex flex-wrap items-center justify-center gap-4 z-10"
          >
            <Link to="/dashboard">
              <Button
                size="lg"
                className="btn-luminous font-bold px-10 h-13 rounded-full text-white cursor-pointer transition-all duration-300 text-base"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Launch App <ArrowRight className="h-4 w-4" />
                </span>
              </Button>
            </Link>
            <Link to="/mint">
              <Button
                variant="outline"
                size="lg"
                className="border-white/10 bg-white/5 hover:bg-white/10 hover:border-cyan-500/40 font-semibold px-10 h-13 rounded-full backdrop-blur-sm transition-all duration-300 text-white text-base"
              >
                <Shield className="mr-2 h-4 w-4 text-cyan-400" /> Mint NFT
              </Button>
            </Link>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            style={{ opacity: heroSubOpacity }}
            className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 z-10"
          >
            <span className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-semibold">
              Scroll to explore
            </span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
              className="w-5 h-8 rounded-full border border-white/20 flex items-start justify-center pt-1.5"
            >
              <div className="w-1 h-2 rounded-full bg-cyan-400/80" />
            </motion.div>
          </motion.div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            CORE SYSTEMS — "Architected for Power" feature cards
        ───────────────────────────────────────────────────────────── */}
        <section className="relative w-full min-h-screen py-32 max-w-[1440px] mx-auto px-6 md:px-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7 }}
            className="mb-20 flex flex-col items-center text-center"
          >
            <span className="text-[10px] text-blue-400 uppercase tracking-[0.2em] font-bold mb-4">
              Core Systems
            </span>
            <h2 className="font-display text-4xl sm:text-5xl font-black text-white tracking-tight">
              Architected for Power
            </h2>
            <p className="mt-4 text-slate-400 max-w-lg">
              Atmospheric UI and cryptographic execution woven together.
            </p>
          </motion.div>

          {/* 3 Feature Cards — staggered, middle one offset down */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.slice(0, 3).map((feature, i) => (
              <motion.div
                key={feature.name}
                initial={{ opacity: 0, y: 80 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.7, delay: i * 0.15, ease: [0.25, 0.1, 0.25, 1] }}
                className={i === 1 ? 'md:translate-y-12' : ''}
              >
                <TiltCard className={cn('min-h-[260px] flex flex-col', feature.border)}>
                  <div
                    className={cn(
                      'inline-flex h-12 w-12 items-center justify-center rounded-xl mb-6',
                      feature.bg,
                      'border',
                      feature.border
                    )}
                  >
                    <feature.icon className={cn('h-5 w-5', feature.color)} />
                  </div>
                  <h3 className="font-semibold text-white text-xl mb-3 font-display">
                    {feature.name}
                  </h3>
                  <p className="text-sm text-slate-400 leading-relaxed flex-grow">
                    {feature.description}
                  </p>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            SGIP PROTOCOL — Pipeline orchestration steps
        ───────────────────────────────────────────────────────────── */}
        <section className="py-32 px-6 md:px-16 max-w-[1440px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <Badge className="mb-4 border-cyan-500/30 bg-cyan-500/10 text-cyan-400 px-3 py-1">
              <GitBranch className="mr-1.5 h-3.5 w-3.5" /> Stitch Gasless Intelligence Protocol
            </Badge>
            <h2 className="font-display text-4xl font-black text-white sm:text-5xl tracking-tight">
              Smart Transaction <span className="gradient-text">Orchestration</span>
            </h2>
            <p className="mt-4 text-slate-400 max-w-xl mx-auto">
              SGIP chains multiple gasless operations into declarative pipelines with
              intelligent skipping, retries, and live telemetry.
            </p>
          </motion.div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {sgipSteps.map((s, i) => (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ delay: i * 0.12, duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
              >
                <TiltCard className="group cursor-default min-h-[180px] flex flex-col justify-between">
                  <div>
                    <div className="text-4xl font-black text-blue-500/20 font-display mb-3">
                      {s.step}
                    </div>
                    <h3 className="font-semibold text-white text-base mb-3">{s.title}</h3>
                  </div>
                  <code className="block text-[11px] text-cyan-300/80 bg-cyan-500/5 border border-cyan-500/10 rounded-lg px-3 py-2 font-mono break-all">
                    {s.code}
                  </code>
                </TiltCard>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            FULL FEATURES GRID
        ───────────────────────────────────────────────────────────── */}
        <section className="py-24 px-6 md:px-16 bg-white/[0.01] border-y border-white/5">
          <div className="max-w-[1440px] mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <span className="text-[10px] text-blue-400 uppercase tracking-[0.2em] font-bold mb-3 block">
                Full Platform
              </span>
              <h2 className="font-display text-4xl font-black text-white sm:text-5xl tracking-tight">
                Everything You Need
              </h2>
              <p className="mt-4 text-slate-400">
                Six pillars of gasless Web3 infrastructure.
              </p>
            </motion.div>

            <motion.div
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3"
            >
              {features.map((feature) => (
                <motion.div key={feature.name} variants={itemVariants}>
                  <TiltCard className={cn('border border-white/5', feature.border)}>
                    <div
                      className={cn(
                        'inline-flex h-11 w-11 items-center justify-center rounded-xl mb-5',
                        feature.bg
                      )}
                    >
                      <feature.icon className={cn('h-5 w-5', feature.color)} />
                    </div>
                    <h3 className="font-semibold text-white text-lg mb-2">{feature.name}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
                  </TiltCard>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            STATS STRIP
        ───────────────────────────────────────────────────────────── */}
        <section className="py-20 px-6 md:px-16 max-w-[1440px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-wrap justify-center gap-16 md:gap-24"
          >
            {[
              { label: 'Gas Saved', value: '$12,840', color: 'text-emerald-400' },
              { label: 'Memberships', value: '3,240+', color: 'text-cyan-400' },
              { label: 'Pipelines Run', value: '18K+', color: 'text-purple-400' },
              { label: 'Uptime', value: '99.98%', color: 'text-blue-400' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className={`text-4xl sm:text-5xl font-black tracking-tight ${stat.color} font-display`}>
                  {stat.value}
                </p>
                <p className="text-[10px] text-slate-500 mt-2 uppercase tracking-[0.15em] font-bold">
                  {stat.label}
                </p>
              </div>
            ))}
          </motion.div>
        </section>

        {/* ─────────────────────────────────────────────────────────────
            CTA — Glass-metal call to action
        ───────────────────────────────────────────────────────────── */}
        <section className="py-28 px-6 lg:px-8 max-w-3xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <TiltCard className="rounded-3xl p-12 border border-blue-500/15 text-center items-center shadow-[0_0_60px_rgba(59,130,246,0.08)]">
              <Lock className="h-10 w-10 text-cyan-400 mb-6" />
              <h2 className="font-display text-3xl font-black text-white mb-4 tracking-tight">
                Start your gasless journey today
              </h2>
              <p className="text-slate-400 mb-8 max-w-md">
                Connect your wallet, claim MockUSD from the faucet, and let SGIP handle the rest.
              </p>
              <Link to="/dashboard">
                <Button
                  size="lg"
                  className="btn-luminous font-bold px-10 h-12 rounded-full text-white cursor-pointer"
                >
                  Get Started Free <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </TiltCard>
          </motion.div>
        </section>
      </main>

      {/* ─────────────────────────────────────────────────────────────
          FOOTER
      ───────────────────────────────────────────────────────────── */}
      <footer className="w-full px-6 md:px-16 py-12 flex flex-col md:flex-row justify-between items-center bg-[#090e1a]/80 border-t border-white/5 relative z-10 backdrop-blur-sm">
        <div className="text-2xl font-black text-blue-400 mb-6 md:mb-0 tracking-tighter font-display">
          GaslessAI
        </div>
        <div className="flex flex-wrap justify-center gap-8 mb-6 md:mb-0">
          {['Protocol', 'Governance', 'Security', 'Docs'].map((link) => (
            <a
              key={link}
              href="#"
              className="text-[10px] text-slate-500 hover:text-cyan-400 transition-colors uppercase tracking-[0.15em] font-bold"
            >
              {link}
            </a>
          ))}
        </div>
        <div className="text-[10px] text-slate-600 uppercase tracking-[0.1em]">
          © 2026 GaslessAI Protocol. Neural Systems Active.
        </div>
      </footer>
    </div>
  );
}
