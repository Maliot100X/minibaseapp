import { useSyncExternalStore } from 'react';
import type { FrameContext } from '../lib/farcaster';

export type WalletSource = 'farcaster' | 'base' | 'metamask' | 'none';

export interface AppState {
  farcasterContext: FrameContext | null;
  fid: number | null;
  username: string | null;
  xUsername: string | null;
  custodyAddress: string | null;
  baseEmbeddedAddress: string | null;
  activeAddress: string | null;
  walletSource: WalletSource;
  contextReady: boolean;
  points: number;
  accumulatedPoints: number;
  tier: number;
  isStaked: boolean;
  stakeAmount: number;
  stakeMultiplier: number;
  stakeUnlockTime: number;
  miningActive: boolean;
  lastActivation: number;
  tasks: { [key: string]: boolean };
  syncPoints: () => void;
  startMining: () => void;
  completeTask: (taskId: string, reward: number) => void;
  upgradeTier: (newTier: number) => void;
  deductPoints: (amount: number) => void;
  setStaked: (staked: boolean, amount?: number, multiplier?: number, unlockTime?: number) => void;
}

type Listener = () => void;

const loadState = () => {
  try {
    const saved = localStorage.getItem('minerState');
    if (saved) return JSON.parse(saved);
  } catch (error) {
    console.error(error);
  }
  return { 
    points: 0, 
    accumulatedPoints: 0,
    tier: 0, 
    isStaked: false,
    stakeAmount: 0,
    stakeMultiplier: 1,
    stakeUnlockTime: 0,
    miningActive: false,
    lastActivation: 0,
    tasks: {}
  };
};

const savedState = loadState();

const state: AppState = {
  farcasterContext: null,
  fid: null,
  username: null,
  xUsername: null,
  custodyAddress: null,
  baseEmbeddedAddress: null,
  activeAddress: null,
  walletSource: 'none',
  contextReady: false,
  points: savedState.points,
  accumulatedPoints: savedState.accumulatedPoints ?? savedState.points ?? 0,
  tier: savedState.tier,
  isStaked: !!savedState.isStaked,
  stakeAmount: savedState.stakeAmount || 0,
  stakeMultiplier: savedState.stakeMultiplier || 1,
  stakeUnlockTime: savedState.stakeUnlockTime || 0,
  miningActive: !!savedState.miningActive,
  lastActivation: savedState.lastActivation || 0,
  tasks: savedState.tasks || {},
  syncPoints: () => {}, // placeholder, init below
  startMining: () => {},
  completeTask: () => {},
  upgradeTier: () => {},
  deductPoints: () => {},
  setStaked: () => {},
};

const listeners = new Set<Listener>();

const persist = () => {
  localStorage.setItem('minerState', JSON.stringify({
    points: state.points,
    accumulatedPoints: state.accumulatedPoints,
    tier: state.tier,
    isStaked: state.isStaked,
    stakeAmount: state.stakeAmount,
    stakeMultiplier: state.stakeMultiplier,
    stakeUnlockTime: state.stakeUnlockTime,
    miningActive: state.miningActive,
    lastActivation: state.lastActivation,
    tasks: state.tasks
  }));
};

const getTierMultiplier = (tier: number) => {
  switch (tier) {
    case 0:
      return 1.0;
    case 1:
      return 3.0;
    case 2:
      return 5.0;
    case 3:
      return 10.0;
    case 4:
      return 25.0;
    case 5:
      return 50.0;
    default:
      return 1.0;
  }
};

const syncPoints = () => {
  if (!state.miningActive) {
    return;
  }

  const now = Date.now();
  const sessionDurationMs = 24 * 60 * 60 * 1000;
  const sessionEnd = state.lastActivation + sessionDurationMs;
  const effectiveNow = now > sessionEnd ? sessionEnd : now;

  if (effectiveNow <= state.lastActivation) {
    return;
  }

  const elapsedSeconds = (effectiveNow - state.lastActivation) / 1000;
  const baseRatePerSecond = 100 / 86400;
  const tierMult = getTierMultiplier(state.tier);
  const multiplier = tierMult * state.stakeMultiplier;
  const earned = elapsedSeconds * baseRatePerSecond * multiplier;

  state.points += earned;
  state.accumulatedPoints = state.points;
  state.lastActivation = effectiveNow;

  if (effectiveNow === sessionEnd) {
    state.miningActive = false;
  }

  persist();
  listeners.forEach((l) => l());
};

const startMining = () => {
  const now = Date.now();
  state.miningActive = true;
  state.lastActivation = now;
  persist();
  listeners.forEach((l) => l());
};

const completeTask = (taskId: string, reward: number) => {
  if (state.tasks[taskId]) return; // already completed
  
  state.tasks[taskId] = true;
  state.points += reward;
  persist();
  listeners.forEach((l) => l());
};

const upgradeTier = (newTier: number) => {
  syncPoints(); // settle pending points first
  state.tier = newTier;
  persist();
  listeners.forEach((l) => l());
};

const deductPoints = (amount: number) => {
  syncPoints();
  if (state.points >= amount) {
    state.points -= amount;
    persist();
    listeners.forEach((l) => l());
  }
};

const setStaked = (staked: boolean, amount?: number, multiplier?: number, unlockTime?: number) => {
  syncPoints();
  state.isStaked = staked;
  if (staked) {
    state.stakeAmount = amount || state.stakeAmount;
    state.stakeMultiplier = multiplier || state.stakeMultiplier || 1;
    state.stakeUnlockTime = unlockTime || state.stakeUnlockTime;
  } else {
    state.stakeAmount = 0;
    state.stakeMultiplier = 1;
    state.stakeUnlockTime = 0;
  }
  persist();
  listeners.forEach((l) => l());
};

// Bind methods
state.syncPoints = syncPoints;
state.startMining = startMining;
state.completeTask = completeTask;
state.upgradeTier = upgradeTier;
state.deductPoints = deductPoints;
state.setStaked = setStaked;

export const appStore = {
  getState: () => state,
  setState: (newState: Partial<AppState>) => {
    Object.assign(state, newState);
    listeners.forEach((l) => l());
  },
  subscribe: (listener: Listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
};

export const useAppStore = <T>(selector: (state: AppState) => T): T => {
  return useSyncExternalStore(
    appStore.subscribe,
    () => selector(state)
  );
};
