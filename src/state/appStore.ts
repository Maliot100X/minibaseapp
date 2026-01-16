import { useSyncExternalStore } from 'react';
import type { FrameContext } from '../lib/farcaster';

export type WalletSource = 'farcaster' | 'base' | 'metamask' | 'none';

export interface AppState {
  farcasterContext: FrameContext | null;
  fid: number | null;
  username: string | null;
  xUsername: string | null;
  farcasterDisplayName: string | null;
  farcasterPfpUrl: string | null;
  farcasterBio: string | null;
  farcasterWallets: string[];
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
  taskCooldowns: { [key: string]: number };
  syncPoints: () => void;
  startMining: () => void;
  completeTask: (taskId: string, reward: number) => void;
  completeRefreshTask: (taskId: string, reward: number, cooldownMs: number) => void;
  upgradeTier: (newTier: number) => void;
  deductPoints: (amount: number) => void;
  setStaked: (staked: boolean, amount?: number, multiplier?: number, unlockTime?: number) => void;
}

type Listener = () => void;

const DEFAULT_STATE = {
  points: 0,
  accumulatedPoints: 0,
  tier: 0,
  isStaked: false,
  stakeAmount: 0,
  stakeMultiplier: 1,
  stakeUnlockTime: 0,
  miningActive: false,
  lastActivation: 0,
  tasks: {},
  taskCooldowns: {},
  xUsername: null,
  farcasterDisplayName: null,
  farcasterPfpUrl: null,
  farcasterBio: null,
  farcasterWallets: [],
};

const loadStateForAddress = (address: string | null) => {
  if (!address) return { ...DEFAULT_STATE };
  try {
    const key = `minerState_${address.toLowerCase()}`;
    const saved = localStorage.getItem(key);
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...DEFAULT_STATE, ...parsed };
    }
  } catch (error) {
    console.error('Failed to load state for address', address, error);
  }
  return { ...DEFAULT_STATE };
};

// Load global settings (non-user specific)
const loadGlobalState = () => {
  try {
    const saved = localStorage.getItem('minerGlobalState');
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error(e);
  }
  return {
    activeAddress: null,
    walletSource: 'none',
    custodyAddress: null,
    baseEmbeddedAddress: null,
  };
};

const globalState = loadGlobalState();
const initialState = loadStateForAddress(globalState.activeAddress);

const state: AppState = {
  farcasterContext: null,
  fid: null,
  username: null,
  xUsername: initialState.xUsername,
  farcasterDisplayName: initialState.farcasterDisplayName,
  farcasterPfpUrl: initialState.farcasterPfpUrl,
  farcasterBio: initialState.farcasterBio,
  farcasterWallets: initialState.farcasterWallets,
  custodyAddress: globalState.custodyAddress,
  baseEmbeddedAddress: globalState.baseEmbeddedAddress,
  activeAddress: globalState.activeAddress,
  walletSource: globalState.walletSource,
  contextReady: false,
  points: initialState.points,
  accumulatedPoints: initialState.accumulatedPoints,
  tier: initialState.tier,
  isStaked: initialState.isStaked,
  stakeAmount: initialState.stakeAmount,
  stakeMultiplier: initialState.stakeMultiplier,
  stakeUnlockTime: initialState.stakeUnlockTime,
  miningActive: initialState.miningActive,
  lastActivation: initialState.lastActivation,
  tasks: initialState.tasks,
  taskCooldowns: initialState.taskCooldowns,
  syncPoints: () => {}, 
  startMining: () => {},
  completeTask: () => {},
  completeRefreshTask: () => {},
  upgradeTier: () => {},
  deductPoints: () => {},
  setStaked: () => {},
};

const listeners = new Set<Listener>();

const persist = () => {
  // Persist global state
  localStorage.setItem('minerGlobalState', JSON.stringify({
    activeAddress: state.activeAddress,
    walletSource: state.walletSource,
    custodyAddress: state.custodyAddress,
    baseEmbeddedAddress: state.baseEmbeddedAddress,
  }));

  // Persist user specific state
  if (state.activeAddress) {
    const key = `minerState_${state.activeAddress.toLowerCase()}`;
    localStorage.setItem(key, JSON.stringify({
      points: state.points,
      accumulatedPoints: state.accumulatedPoints,
      tier: state.tier,
      isStaked: state.isStaked,
      stakeAmount: state.stakeAmount,
      stakeMultiplier: state.stakeMultiplier,
      stakeUnlockTime: state.stakeUnlockTime,
      miningActive: state.miningActive,
      lastActivation: state.lastActivation,
      tasks: state.tasks,
      taskCooldowns: state.taskCooldowns,
      xUsername: state.xUsername,
      farcasterDisplayName: state.farcasterDisplayName,
      farcasterPfpUrl: state.farcasterPfpUrl,
      farcasterBio: state.farcasterBio,
      farcasterWallets: state.farcasterWallets,
    }));
  }
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

const completeRefreshTask = (taskId: string, reward: number, cooldownMs: number) => {
  const now = Date.now();
  const last = state.taskCooldowns[taskId] || 0;
  if (now - last < cooldownMs) {
    return;
  }
  state.taskCooldowns[taskId] = now;
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
state.completeRefreshTask = completeRefreshTask;
state.upgradeTier = upgradeTier;
state.deductPoints = deductPoints;
state.setStaked = setStaked;

export const appStore = {
  getState: () => state,
  setState: (newState: Partial<AppState>) => {
    // Check if address is changing
    if (newState.activeAddress !== undefined && newState.activeAddress !== state.activeAddress) {
      // 1. Persist current state to the OLD address
      persist();

      // 2. Load state for the NEW address
      const loadedState = loadStateForAddress(newState.activeAddress);

      // 3. Update state: apply new address/globals first, then overwrite with loaded user data
      Object.assign(state, newState);
      Object.assign(state, loadedState);
    } else {
      Object.assign(state, newState);
    }
    
    persist();
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
