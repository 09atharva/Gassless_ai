/**
 * SGIPPanel — Real-time SGIP pipeline status panel.
 * Shows animated step progress, gas savings accumulation, and errors.
 */
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2, SkipForward, RotateCcw, Zap, GitBranch } from 'lucide-react';
import type { SGIPStepState } from '@/lib/sgip';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface SGIPPanelProps {
  steps: SGIPStepState[];
  totalGasSaved?: string;
  isRunning?: boolean;
  error?: string;
  className?: string;
  compact?: boolean;
}

const statusConfig = {
  pending: { icon: <div className="h-4 w-4 rounded-full border-2 border-white/20" />, color: 'text-slate-500', bg: 'bg-white/5' },
  running: { icon: <Loader2 className="h-4 w-4 animate-spin text-blue-400" />, color: 'text-blue-400', bg: 'bg-blue-500/10' },
  success: { icon: <CheckCircle2 className="h-4 w-4 text-emerald-400" />, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
  failed:  { icon: <XCircle className="h-4 w-4 text-red-400" />, color: 'text-red-400', bg: 'bg-red-500/10' },
  skipped: { icon: <SkipForward className="h-4 w-4 text-slate-500" />, color: 'text-slate-500', bg: 'bg-white/5' },
};

export default function SGIPPanel({ steps, totalGasSaved, isRunning, error, className, compact }: SGIPPanelProps) {
  const completed = steps.filter(s => s.status === 'success' || s.status === 'skipped').length;
  const total = steps.length;
  const progress = total > 0 ? (completed / total) * 100 : 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-2xl border border-white/10 bg-slate-900/80 backdrop-blur-sm overflow-hidden',
        className
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/5 bg-white/3">
        <div className="flex items-center gap-2">
          <div className={cn('flex h-6 w-6 items-center justify-center rounded-lg', isRunning ? 'bg-blue-600' : 'bg-slate-700')}>
            <GitBranch className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-semibold text-white">SGIP Pipeline</span>
          {isRunning && (
            <span className="flex items-center gap-1 rounded-full bg-blue-500/20 px-2 py-0.5 text-xs text-blue-400 border border-blue-500/30">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
              Stitching...
            </span>
          )}
        </div>
        {totalGasSaved && (
          <div className="flex items-center gap-1 text-xs text-emerald-400 font-semibold">
            <Zap className="h-3 w-3" />
            {totalGasSaved} saved
          </div>
        )}
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="px-4 pt-3">
          <Progress value={progress} className="h-1.5" />
          <div className="mt-1.5 flex items-center justify-between text-xs text-slate-500">
            <span>{completed}/{total} steps complete</span>
            <span>{Math.round(progress)}%</span>
          </div>
        </div>
      )}

      {/* Steps */}
      <div className={cn('space-y-1 p-3', compact ? 'space-y-1' : 'space-y-2')}>
        {steps.map((s, i) => {
          const cfg = statusConfig[s.status];
          return (
            <motion.div
              key={s.step.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className={cn(
                'flex items-center gap-3 rounded-xl px-3 py-2.5 transition-all duration-300',
                cfg.bg,
                s.status === 'running' && 'border border-blue-500/30 shadow-[0_0_12px_rgba(59,130,246,0.15)]'
              )}
            >
              {/* Status icon */}
              <div className="shrink-0">{cfg.icon}</div>

              {/* Step info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-white">{s.step.icon} {s.step.name}</span>
                  {s.attempt > 1 && (
                    <span className="flex items-center gap-0.5 text-xs text-amber-400">
                      <RotateCcw className="h-2.5 w-2.5" /> retry {s.attempt}
                    </span>
                  )}
                </div>
                {!compact && (
                  <p className={cn('text-xs mt-0.5 truncate', cfg.color)}>{s.step.description}</p>
                )}
              </div>

              {/* Gas saved badge */}
              {s.status === 'success' && s.result?.gasSaved && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="shrink-0 rounded-full bg-emerald-500/15 px-2 py-0.5 text-xs font-semibold text-emerald-400 border border-emerald-500/20"
                >
                  {s.result.gasSaved.match(/\$[\d.]+/)?.[0]}
                </motion.div>
              )}

              {/* Duration */}
              {s.status === 'success' && s.startedAt && s.completedAt && (
                <span className="text-xs text-slate-600 shrink-0">
                  {((s.completedAt - s.startedAt) / 1000).toFixed(1)}s
                </span>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mx-3 mb-3 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-xs text-red-400"
          >
            ⚠ {error}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
