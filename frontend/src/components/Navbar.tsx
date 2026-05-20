import { Link } from 'react-router-dom';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import { Wallet, LayoutDashboard, Zap, History, Bot } from 'lucide-react';
import { useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';

const navItems = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Mint', href: '/mint', icon: Zap },
  { name: 'AI Assistant', href: '/ai-assistant', icon: Bot },
  { name: 'History', href: '/history', icon: History },
];

export function Navbar() {
  const location = useLocation();
  const pathname = location.pathname;

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-slate-950/80 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-2">
          <Link to="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 font-bold text-white">
              G
            </div>
            <span className="hidden text-xl font-bold sm:block">GaslessAI</span>
          </Link>
          
          <div className="ml-8 hidden items-center gap-1 md:flex">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors hover:bg-white/5 hover:text-white",
                  pathname === item.href ? "bg-white/10 text-white" : "text-slate-400"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Link>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-4">
          <ConnectButton showBalance={false} chainStatus="icon" />
        </div>
      </div>
    </nav>
  );
}
