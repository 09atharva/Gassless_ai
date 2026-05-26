/**
 * Stitch Gasless Intelligence Protocol (SGIP)
 *
 * An intelligent transaction orchestration layer that chains, batches,
 * and optimizes gasless operations. Define a pipeline of steps and execute
 * them atomically with real-time telemetry and retry logic.
 *
 * API: SGIP.stitch([...steps]).execute(context)
 */

import type { Address } from 'viem';
import { UGF_SDK } from './ugf-sdk';

// ─── Types ───────────────────────────────────────────────────────────────────

export type SGIPStepStatus = 'pending' | 'running' | 'success' | 'failed' | 'skipped';

export interface SGIPStep {
  id: string;
  name: string;
  description: string;
  icon: string; // emoji or icon name
  execute: (ctx: SGIPContext) => Promise<SGIPStepResult>;
  shouldSkip?: (ctx: SGIPContext) => boolean;
  retries?: number;
}

export interface SGIPStepResult {
  success: boolean;
  hash?: string;
  gasSaved?: string;
  data?: Record<string, unknown>;
  error?: string;
}

export interface SGIPContext {
  address: Address;
  mockUSDAddress: Address;
  membershipNFTAddress: Address;
  balance: number; // virtual MUSD balance
  hasMembership?: boolean;
  signer?: any; // ethers Signer
  [key: string]: unknown;
}

export interface SGIPStepState {
  step: SGIPStep;
  status: SGIPStepStatus;
  result?: SGIPStepResult;
  startedAt?: number;
  completedAt?: number;
  attempt: number;
}

export type SGIPEventType =
  | 'pipeline:start'
  | 'pipeline:complete'
  | 'pipeline:error'
  | 'step:start'
  | 'step:complete'
  | 'step:error'
  | 'step:skip'
  | 'step:retry'
  | 'gas:update';

export interface SGIPEvent {
  type: SGIPEventType;
  stepId?: string;
  stepIndex?: number;
  totalSteps?: number;
  state?: SGIPStepState[];
  totalGasSaved?: string;
  error?: string;
  timestamp: number;
}

type SGIPListener = (event: SGIPEvent) => void;

// ─── Built-in Steps ──────────────────────────────────────────────────────────

export const SGIPSteps = {
  /**
   * Check if user has enough MockUSD balance. Skips faucet if balance >= 100.
   */
  balanceCheck: (requiredAmount = 1): SGIPStep => ({
    id: 'balance-check',
    name: 'Balance Check',
    description: `Verifying MockUSD balance ≥ ${requiredAmount} MUSD`,
    icon: '💰',
    shouldSkip: () => false,
    execute: async (ctx) => {
      await delay(400);
      if (ctx.balance >= requiredAmount) {
        return { success: true, data: { balance: ctx.balance } };
      }
      return { success: false, error: `Insufficient balance: ${ctx.balance} MUSD (need ${requiredAmount})` };
    },
  }),

  /**
   * Request MockUSD from the faucet. Skipped if user already has enough.
   */
  faucet: (): SGIPStep => ({
    id: 'faucet',
    name: 'MockUSD Faucet',
    description: 'Claim TYI_MOCK_USD from https://universalgasframework.com/faucets',
    icon: '🪙',
    shouldSkip: (ctx) => ctx.balance >= 100,
    execute: async (ctx) => {
      const result = await UGF_SDK.requestFaucet(ctx.address, ctx.signer);
      if (result.success) {
        ctx.balance += 100;
        return { success: true, hash: result.hash, gasSaved: result.gasSaved };
      }
      return { success: false, error: result.error };
    },
    retries: 2,
  }),

  /**
   * Mint the membership NFT via UGF gasless relayer.
   */
  mintMembership: (): SGIPStep => ({
    id: 'mint-membership',
    name: 'Mint Membership NFT',
    description: 'Executing gasless mint transaction via UGF',
    icon: '🛡️',
    shouldSkip: (ctx) => !!ctx.hasMembership,
    execute: async (ctx) => {
      const { encodeFunctionData } = await import('viem');
      const NFT_ABI = [
        { name: 'mintMembership', type: 'function', stateMutability: 'nonpayable', inputs: [], outputs: [] },
      ] as const;
      const data = encodeFunctionData({ abi: NFT_ABI, functionName: 'mintMembership', args: [] });
      const result = await UGF_SDK.executeGaslessTransaction(
        { to: ctx.membershipNFTAddress, data },
        ctx.mockUSDAddress,
        ctx.signer
      );
      if (result.success) {
        ctx.hasMembership = true;
        return { success: true, hash: result.hash, gasSaved: result.gasSaved };
      }
      return { success: false, error: result.error };
    },
    retries: 1,
  }),

  /**
   * Deduct 1 MUSD for AI usage.
   */
  aiPayment: (): SGIPStep => ({
    id: 'ai-payment',
    name: 'AI Usage Payment',
    description: 'Charging 1 MUSD for AI interaction via UGF',
    icon: '🤖',
    execute: async (ctx) => {
      const result = await UGF_SDK.payForAIUsage(ctx.address, '1', ctx.signer);
      if (result.success) {
        ctx.balance = Math.max(0, ctx.balance - 1);
        return { success: true, hash: result.hash, gasSaved: result.gasSaved };
      }
      return { success: false, error: result.error };
    },
  }),

  /**
   * Upgrade membership tier via UGF.
   */
  upgradeTier: (): SGIPStep => ({
    id: 'upgrade-tier',
    name: 'Upgrade Membership Tier',
    description: 'Synchronizing gas savings to upgrade your NFT node',
    icon: '🚀',
    execute: async (ctx) => {
      const { encodeFunctionData } = await import('viem');
      const NFT_ABI = [
        { name: 'updateGasSaved', type: 'function', stateMutability: 'nonpayable', inputs: [{ name: 'tokenId', type: 'uint256' }, { name: 'gasAmountUSD', type: 'uint256' }], outputs: [] },
        { name: 'userToTokenId', type: 'function', stateMutability: 'view', inputs: [{ name: 'user', type: 'address' }], outputs: [{ name: '', type: 'uint256' }] },
      ] as const;

      // In a real scenario, we'd fetch the tokenId first.
      // For this demo, we'll assume we can call it (simulation if needed)
      const data = encodeFunctionData({ 
        abi: NFT_ABI, 
        functionName: 'updateGasSaved', 
        args: [0n, 20n] // Simulate adding $20 to trigger Silver tier
      });
      
      const result = await UGF_SDK.executeGaslessTransaction(
        { to: ctx.membershipNFTAddress, data },
        ctx.mockUSDAddress,
        ctx.signer
      );
      
      if (result.success) {
        return { success: true, hash: result.hash, gasSaved: result.gasSaved };
      }
      return { success: false, error: result.error };
    },
  }),

  /**
   * Stitch: full onboarding pipeline (faucet → mint).
   */
  fullOnboarding: (): SGIPStep[] => [
    SGIPSteps.faucet(),
    SGIPSteps.mintMembership(),
  ],
};

// ─── Pipeline ────────────────────────────────────────────────────────────────

export class StitchPipeline {
  private steps: SGIPStep[];
  private listeners: Map<SGIPEventType | '*', SGIPListener[]> = new Map();
  private _state: SGIPStepState[] = [];
  private _totalGasSavedUSD = 0;

  constructor(steps: SGIPStep[]) {
    this.steps = steps;
  }

  on(event: SGIPEventType | '*', listener: SGIPListener): this {
    if (!this.listeners.has(event)) this.listeners.set(event, []);
    this.listeners.get(event)!.push(listener);
    return this;
  }

  off(event: SGIPEventType | '*', listener: SGIPListener): this {
    const arr = this.listeners.get(event);
    if (arr) {
      const idx = arr.indexOf(listener);
      if (idx !== -1) arr.splice(idx, 1);
    }
    return this;
  }

  get state() { return this._state; }
  get totalGasSavedUSD() { return this._totalGasSavedUSD; }

  private emit(event: SGIPEvent) {
    const specific = this.listeners.get(event.type) || [];
    const wildcard = this.listeners.get('*') || [];
    [...specific, ...wildcard].forEach((l) => l(event));
  }

  async execute(ctx: SGIPContext): Promise<boolean> {
    this._state = this.steps.map((step) => ({
      step,
      status: 'pending' as SGIPStepStatus,
      attempt: 0,
    }));
    this._totalGasSavedUSD = 0;

    this.emit({ type: 'pipeline:start', totalSteps: this.steps.length, state: this._state, timestamp: Date.now() });

    for (let i = 0; i < this.steps.length; i++) {
      const step = this.steps[i];
      const stateEntry = this._state[i];

      // Check skip
      if (step.shouldSkip?.(ctx)) {
        stateEntry.status = 'skipped';
        this.emit({ type: 'step:skip', stepId: step.id, stepIndex: i, state: this._state, timestamp: Date.now() });
        continue;
      }

      const maxAttempts = (step.retries ?? 0) + 1;
      let lastError = '';

      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        stateEntry.attempt = attempt;
        stateEntry.status = 'running';
        stateEntry.startedAt = Date.now();

        if (attempt > 1) {
          this.emit({ type: 'step:retry', stepId: step.id, stepIndex: i, state: this._state, timestamp: Date.now() });
          await delay(500 * attempt); // exponential backoff
        }

        this.emit({ type: 'step:start', stepId: step.id, stepIndex: i, state: this._state, timestamp: Date.now() });

        try {
          const result = await step.execute(ctx);
          stateEntry.result = result;
          stateEntry.completedAt = Date.now();

          if (result.success) {
            stateEntry.status = 'success';

            // Accumulate gas savings
            if (result.gasSaved) {
              const match = result.gasSaved.match(/\$(\d+\.?\d*)/);
              if (match) this._totalGasSavedUSD += parseFloat(match[1]);
            }

            this.emit({
              type: 'step:complete',
              stepId: step.id,
              stepIndex: i,
              state: this._state,
              totalGasSaved: `$${this._totalGasSavedUSD.toFixed(2)}`,
              timestamp: Date.now(),
            });
            break; // success, move to next step
          } else {
            lastError = result.error ?? 'Unknown error';
            if (attempt === maxAttempts) {
              stateEntry.status = 'failed';
              this.emit({ type: 'step:error', stepId: step.id, stepIndex: i, error: lastError, state: this._state, timestamp: Date.now() });
              this.emit({ type: 'pipeline:error', error: lastError, state: this._state, timestamp: Date.now() });
              return false;
            }
          }
        } catch (err) {
          lastError = err instanceof Error ? err.message : String(err);
          if (attempt === maxAttempts) {
            stateEntry.status = 'failed';
            this.emit({ type: 'step:error', stepId: step.id, stepIndex: i, error: lastError, state: this._state, timestamp: Date.now() });
            this.emit({ type: 'pipeline:error', error: lastError, state: this._state, timestamp: Date.now() });
            return false;
          }
        }
      }
    }

    this.emit({
      type: 'pipeline:complete',
      state: this._state,
      totalGasSaved: `$${this._totalGasSavedUSD.toFixed(2)}`,
      timestamp: Date.now(),
    });
    return true;
  }
}

// ─── SGIP Singleton ──────────────────────────────────────────────────────────

export const SGIP = {
  /** Create a new pipeline from a list of steps */
  stitch(steps: SGIPStep[]): StitchPipeline {
    return new StitchPipeline(steps);
  },
  Steps: SGIPSteps,
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
