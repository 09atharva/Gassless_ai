import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Navbar } from '@/components/Navbar';
import { Shield, Zap, Bot, ArrowRight, Coins } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden px-6 pt-24 pb-32 sm:pt-32 lg:px-8">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_45%_at_50%_50%,rgba(37,99,235,0.1)_0%,rgba(15,23,42,0)_100%)]" />
          
          <div className="mx-auto max-w-2xl text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
                Gasless AI <span className="text-blue-500">Membership Wallet</span>
              </h1>
              <p className="mt-6 text-lg leading-8 text-slate-400">
                Mint NFT memberships and pay gas with MockUSD instead of ETH. 
                The future of Web3 UX is here, powered by AI and UGF.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link to="/dashboard">
                  <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                    Get Started <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
                <Link to="/mint">
                  <Button variant="outline" size="lg">
                    Mint Membership
                  </Button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-24 sm:py-32 bg-slate-900/50">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center">
              <h2 className="text-base font-semibold leading-7 text-blue-500">Experience Web3 Better</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Everything you need for a smooth onboarding
              </p>
            </div>
            
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-4">
                {[
                  {
                    name: 'Gasless Transactions',
                    description: 'Pay gas with MockUSD. No ETH needed on Base Sepolia.',
                    icon: Zap,
                  },
                  {
                    name: 'AI Wallet Assistant',
                    description: 'Get real-time insights and help with your transactions.',
                    icon: Bot,
                  },
                  {
                    name: 'NFT Memberships',
                    description: 'Unlock exclusive features with on-chain membership NFTs.',
                    icon: Shield,
                  },
                  {
                    name: 'MockUSD Faucet',
                    description: 'Get free MockUSD to start your gasless journey immediately.',
                    icon: Coins,
                  },
                ].map((feature) => (
                  <div key={feature.name} className="flex flex-col">
                    <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-white">
                      <feature.icon className="h-5 w-5 flex-none text-blue-500" aria-hidden="true" />
                      {feature.name}
                    </dt>
                    <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-slate-400">
                      <p className="flex-auto">{feature.description}</p>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 py-12 px-6 lg:px-8">
        <div className="mx-auto max-w-7xl overflow-hidden text-center">
          <p className="text-sm leading-5 text-slate-500">
            &copy; 2026 GaslessAI. Built for the Hackathon.
          </p>
        </div>
      </footer>
    </div>
  );
}
