import sdk from '@farcaster/frame-sdk';

export type FrameContext = Awaited<typeof sdk.context>;

export const farcasterSdk = sdk;

export const readyAndGetContext = async (): Promise<FrameContext> => {
  await sdk.actions.ready();
  const ctx = await sdk.context;
  return ctx;
};

export const getEthereumProvider = async (): Promise<any | null> => {
  if (typeof window === 'undefined') return null;

  const anySdk: any = sdk as any;
  if (anySdk.wallet && typeof anySdk.wallet.getEthereumProvider === 'function') {
    try {
      const provider = await anySdk.wallet.getEthereumProvider();
      if (provider) {
        const anyWindow = window as any;
        if (!anyWindow.ethereum) {
          anyWindow.ethereum = provider;
        }
        return provider;
      }
    } catch (error) {
      console.error('Failed to get mini app ethereum provider', error);
    }
  }

  const anyWindow = window as any;
  return anyWindow.ethereum || null;
};

export const requestFarcasterAddresses = async (): Promise<string[]> => {
  const anySdk: any = sdk as any;
  if (anySdk.wallet && typeof anySdk.wallet.requestAddresses === 'function') {
    try {
      const result = await anySdk.wallet.requestAddresses();
      if (!result) return [];
      if (Array.isArray(result)) {
        return result
          .map((v: any) =>
            typeof v === 'string'
              ? v
              : v && typeof v === 'object'
              ? v.address || v.value || null
              : null
          )
          .filter((v: string | null): v is string => !!v);
      }
      if (Array.isArray(result.addresses)) {
        return result.addresses
          .map((v: any) =>
            typeof v === 'string'
              ? v
              : v && typeof v === 'object'
              ? v.address || v.value || null
              : null
          )
          .filter((v: string | null): v is string => !!v);
      }
    } catch (error) {
      console.error('Failed to request Farcaster addresses', error);
    }
  }

  const provider = await getEthereumProvider();
  if (!provider || !(provider as any).request) return [];
  try {
    try {
      await (provider as any).request({
        method: 'wallet_revokePermissions',
        params: [{ eth_accounts: {} }],
      });
    } catch (e) {}
    await (provider as any).request({
      method: 'wallet_requestPermissions',
      params: [{ eth_accounts: {} }],
    });
    const accounts = await (provider as any).request({ method: 'eth_requestAccounts' });
    if (!accounts) return [];
    return Array.isArray(accounts) ? accounts : [];
  } catch (error) {
    console.error('Failed to request accounts from provider', error);
    return [];
  }
};
