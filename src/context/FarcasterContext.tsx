import React, { createContext, useContext, useEffect } from 'react';
import { farcasterSdk, type FrameContext } from '../lib/farcaster';
import { appStore, useAppStore } from '../state/appStore';

interface FarcasterContextType {
  context: FrameContext | null;
  userAddress: string | null;
  username: string | null;
  fid: number | null;
  isLoaded: boolean;
  sync: () => Promise<void>;
}

const FarcasterContext = createContext<FarcasterContextType>({
  context: null,
  userAddress: null,
  username: null,
  fid: null,
  isLoaded: false,
  sync: async () => {},
});

export const useFarcaster = () => useContext(FarcasterContext);

export const FarcasterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const context = useAppStore((s) => s.farcasterContext);
  const username = useAppStore((s) => s.username);
  const fid = useAppStore((s) => s.fid);
  const activeAddress = useAppStore((s) => s.activeAddress);
  const isLoaded = useAppStore((s) => s.contextReady);

  const sync = async () => {
    try {
      const ctx = await farcasterSdk.context;
      if (ctx && ctx.user) {
        const userAny = ctx.user as any;
        const custodyAddress = userAny.custody_address || userAny.custodyAddress;
        const fallback =
          custodyAddress ||
          (userAny.verified_addresses && userAny.verified_addresses.length > 0
            ? userAny.verified_addresses[0]
            : null);

        appStore.setState({
          farcasterContext: ctx as FrameContext,
          fid: ctx.user.fid,
          username: ctx.user.username ?? null,
          custodyAddress: fallback,
          activeAddress: fallback || null,
          walletSource: fallback ? 'farcaster' : appStore.getState().walletSource,
        });
      } else {
        appStore.setState({
          farcasterContext: ctx as FrameContext,
          fid: null,
          username: null,
          custodyAddress: null,
        });
      }
    } catch (error) {
      console.error('Failed to sync Farcaster context:', error);
    }
  };

  useEffect(() => {
    const init = async () => {
      try {
        await farcasterSdk.actions.ready();
        await sync();
      } catch (error) {
        console.error('Failed to initialize Farcaster SDK:', error);
      } finally {
        appStore.setState({ contextReady: true });
      }
    };

    init();
  }, []);

  return (
    <FarcasterContext.Provider
      value={{
        context,
        userAddress: activeAddress,
        username,
        fid,
        isLoaded,
        sync,
      }}
    >
      {children}
    </FarcasterContext.Provider>
  );
};
