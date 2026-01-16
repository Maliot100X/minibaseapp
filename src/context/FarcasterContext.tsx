import React, { createContext, useContext, useEffect } from 'react';
import { farcasterSdk, type FrameContext } from '../lib/farcaster';
import { appStore, useAppStore } from '../state/appStore';

interface FarcasterContextType {
  context: FrameContext | null;
  userAddress: string | null;
  username: string | null;
  fid: number | null;
  displayName: string | null;
  pfpUrl: string | null;
  bio: string | null;
  wallets: string[];
  isLoaded: boolean;
  sync: () => Promise<void>;
}

const FarcasterContext = createContext<FarcasterContextType>({
  context: null,
  userAddress: null,
  username: null,
  fid: null,
  displayName: null,
  pfpUrl: null,
  bio: null,
  wallets: [],
  isLoaded: false,
  sync: async () => {},
});

export const useFarcaster = () => useContext(FarcasterContext);

export const FarcasterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const context = useAppStore((s) => s.farcasterContext);
  const username = useAppStore((s) => s.username);
  const fid = useAppStore((s) => s.fid);
  const activeAddress = useAppStore((s) => s.activeAddress);
  const custodyAddress = useAppStore((s) => s.custodyAddress);
  const isLoaded = useAppStore((s) => s.contextReady);
  const displayName = useAppStore((s) => s.farcasterDisplayName);
  const pfpUrl = useAppStore((s) => s.farcasterPfpUrl);
  const bio = useAppStore((s) => s.farcasterBio);
  const wallets = useAppStore((s) => s.farcasterWallets);

  const sync = async () => {
    try {
      const ctx = await farcasterSdk.context;
      if (ctx && ctx.user) {
        const userAny = ctx.user as any;
        const custodyAddress = userAny.custody_address || userAny.custodyAddress;
        const verifiedRaw = userAny.verified_addresses || userAny.verifiedAddresses || [];
        const verified = Array.isArray(verifiedRaw)
          ? verifiedRaw
              .map((v: any) =>
                typeof v === 'string'
                  ? v
                  : v?.address || v?.value || null
              )
              .filter((v: string | null): v is string => !!v)
          : [];
        const allWallets = [
          custodyAddress,
          ...verified,
        ].filter((v, i, arr) => v && arr.indexOf(v) === i) as string[];
        const displayName =
          userAny.display_name ||
          userAny.displayName ||
          ctx.user.username ||
          null;
        const pfpUrl = userAny.pfp_url || userAny.pfpUrl || null;
        const bio =
          userAny.bio ||
          (userAny.profile && userAny.profile.bio) ||
          null;
        const fallback =
          custodyAddress ||
          (userAny.verified_addresses && userAny.verified_addresses.length > 0
            ? userAny.verified_addresses[0]
            : null);

        appStore.setState({
          farcasterContext: ctx as FrameContext,
          fid: ctx.user.fid,
          username: ctx.user.username ?? null,
          farcasterDisplayName: displayName,
          farcasterPfpUrl: pfpUrl,
          farcasterBio: bio,
          farcasterWallets: allWallets,
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
          farcasterDisplayName: null,
          farcasterPfpUrl: null,
          farcasterBio: null,
          farcasterWallets: [],
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
        userAddress: custodyAddress || activeAddress,
        username,
        fid,
        displayName,
        pfpUrl,
        bio,
        wallets,
        isLoaded,
        sync,
      }}
    >
      {children}
    </FarcasterContext.Provider>
  );
};
