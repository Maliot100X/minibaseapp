import { useEffect, useState } from 'react';
import { appStore, useAppStore } from '../state/appStore';
import { getEthereumProvider, requestFarcasterAddresses } from '../lib/farcaster';

interface WalletState {
  address: string | null;
  isReadOnly: boolean;
  hasFarcasterWallet: boolean;
  hasBaseEnv: boolean;
  chainId: number | null;
  isBaseSepolia: boolean;
  isBaseMainnet: boolean;
  switchToBaseSepolia: () => Promise<void>;
  switchToBaseMainnet: () => Promise<void>;
  connectBaseWallet: () => Promise<void>;
}

export const useWallet = (): WalletState => {
  const activeAddress = useAppStore((s) => s.activeAddress);
  const custodyAddress = useAppStore((s) => s.custodyAddress);
  const [hasBaseEnv, setHasBaseEnv] = useState(false);
  const [chainId, setChainId] = useState<number | null>(null);

  const BASE_SEPOLIA_DECIMAL = 84532;
  const BASE_SEPOLIA_HEX = '0x14A34';
  const BASE_MAINNET_DECIMAL = 8453;
  const BASE_MAINNET_HEX = '0x2105';

  useEffect(() => {
    const init = async () => {
      const eth = await getEthereumProvider();
      const hasBase = !!(eth && (eth as any).request);
      setHasBaseEnv(hasBase);
      if (eth && (eth as any).request) {
        const readChain = async () => {
          try {
            const raw = await (eth as any).request({ method: 'eth_chainId' });
            const id = typeof raw === 'string' ? parseInt(raw, 16) : Number(raw);
            setChainId(Number.isNaN(id) ? null : id);
          } catch {
            setChainId(null);
          }
        };

        await readChain();

        const handleChainChanged = (rawId: string | number) => {
          const id = typeof rawId === 'string' ? parseInt(rawId, 16) : Number(rawId);
          setChainId(Number.isNaN(id) ? null : id);
        };

        (eth as any).on?.('chainChanged', handleChainChanged);

        return () => {
          (eth as any).removeListener?.('chainChanged', handleChainChanged);
        };
      } else {
        setHasBaseEnv(false);
      }
    };

    init();
  }, []);

  const connectBaseWallet = async () => {
    const accounts = await requestFarcasterAddresses();
    if (!accounts || accounts.length === 0) {
      alert('Wallet connection was declined or is unavailable.');
      return;
    }
    const address = accounts[0];
    appStore.setState({
      baseEmbeddedAddress: address,
      activeAddress: address,
      walletSource: 'base',
    });
  };

  const switchToBaseSepolia = async () => {
    const eth = await getEthereumProvider();
    if (!eth || !(eth as any).request) return;

    try {
      await (eth as any).request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: BASE_SEPOLIA_HEX }],
      });
    } catch (error: any) {
      if (error && error.code === 4902) {
        const rpcUrl =
          (import.meta as any).env.VITE_BASE_SEPOLIA_RPC ||
          'https://base-sepolia.g.alchemy.com/v2/wY-wCVXDnFCO_NWLr8aC5';

        try {
          await (eth as any).request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: BASE_SEPOLIA_HEX,
                chainName: 'Base Sepolia',
                nativeCurrency: {
                  name: 'Ether',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: [rpcUrl],
                blockExplorerUrls: ['https://base-sepolia.blockscout.com'],
              },
            ],
          });
        } catch (error) {
          console.error(error);
        }
      }
    }
  };

  const switchToBaseMainnet = async () => {
    const eth = await getEthereumProvider();
    if (!eth || !(eth as any).request) return;

    try {
      await (eth as any).request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: BASE_MAINNET_HEX }],
      });
    } catch (error: any) {
      if (error && error.code === 4902) {
        const rpcUrl =
          (import.meta as any).env.VITE_BASE_MAINNET_RPC ||
          'https://mainnet.base.org';

        try {
          await (eth as any).request({
            method: 'wallet_addEthereumChain',
            params: [
              {
                chainId: BASE_MAINNET_HEX,
                chainName: 'Base',
                nativeCurrency: {
                  name: 'Ether',
                  symbol: 'ETH',
                  decimals: 18,
                },
                rpcUrls: [rpcUrl],
                blockExplorerUrls: ['https://base.blockscout.com'],
              },
            ],
          });
        } catch (error) {
          console.error(error);
        }
      }
    }
  };

  return {
    address: activeAddress,
    isReadOnly: !activeAddress,
    hasFarcasterWallet: !!custodyAddress,
    hasBaseEnv,
    chainId,
    isBaseSepolia: chainId === BASE_SEPOLIA_DECIMAL,
    isBaseMainnet: chainId === BASE_MAINNET_DECIMAL,
    switchToBaseSepolia,
    switchToBaseMainnet,
    connectBaseWallet,
  };
};
