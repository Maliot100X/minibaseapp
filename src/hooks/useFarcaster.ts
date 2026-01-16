import type { FrameContext } from '../lib/farcaster';
import { useFarcaster as useFarcasterContext } from '../context/FarcasterContext';

interface HookFarcasterState {
  context: FrameContext | null;
  userAddress: string | null;
  username: string | null;
  fid: number | null;
  isLoaded: boolean;
   displayName: string | null;
   pfpUrl: string | null;
   bio: string | null;
   wallets: string[];
}

export const useFarcaster = (): HookFarcasterState => {
  const ctx = useFarcasterContext();
  return ctx as HookFarcasterState;
};
