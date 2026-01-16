import { useEffect, useState } from 'react';
import { appStore, useAppStore } from '../state/appStore';

interface WalletState {
  address: string | null;
  isReadOnly: boolean;
  hasFarcasterWallet: boolean;
  hasBaseEnv: boolean;
  chainId: number | null;
  isBaseSepolia: boolean;
  switchToBaseSepolia: () => Promise<void>;
  connectBaseWallet: () => Promise<void>;
}

export const useWallet = (): WalletState => {
  const activeAddress = useAppStore((s) => s.activeAddress);
  const custodyAddress = useAppStore((s) => s.custodyAddress);
  const [hasBaseEnv, setHasBaseEnv] = useState(false);
  const [chainId, setChainId] = useState<number | null>(null);

  const BASE_SEPOLIA_DECIMAL = 84532;
  const BASE_SEPOLIA_HEX = '0x14A34';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const anyWindow = window as any;
      const hasBase = !!(anyWindow.base && anyWindow.base.miniApp);
      setHasBaseEnv(hasBase);

       const eth = anyWindow.ethereum;
       if (eth && eth.request) {
         const readChain = async () => {
           try {
             const raw = await eth.request({ method: 'eth_chainId' });
             const id = typeof raw === 'string' ? parseInt(raw, 16) : Number(raw);
             setChainId(Number.isNaN(id) ? null : id);
           } catch {
             setChainId(null);
           }
         };

         readChain();

         const handleChainChanged = (rawId: string | number) => {
           const id = typeof rawId === 'string' ? parseInt(rawId, 16) : Number(rawId);
           setChainId(Number.isNaN(id) ? null : id);
         };

         eth.on?.('chainChanged', handleChainChanged);

         return () => {
           eth.removeListener?.('chainChanged', handleChainChanged);
         };
       }
    } else {
      setHasBaseEnv(false);
    }
  }, []);

  const connectBaseWallet = async () => {
    if (typeof window === 'undefined') return;
    const anyWindow = window as any;
    if (!anyWindow.base || !anyWindow.base.miniApp || !anyWindow.ethereum || !anyWindow.ethereum.request) {
      return;
    }

    try {
      const accounts: string[] = await anyWindow.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts && accounts.length > 0) {
        appStore.setState({
          baseEmbeddedAddress: accounts[0],
          activeAddress: accounts[0],
          walletSource: 'base',
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const switchToBaseSepolia = async () => {
    if (typeof window === 'undefined') return;
    const anyWindow = window as any;
    const eth = anyWindow.ethereum;
    if (!eth || !eth.request) return;

    try {
      await eth.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: BASE_SEPOLIA_HEX }],
      });
    } catch (error: any) {
      if (error && error.code === 4902) {
        const rpcUrl =
          (import.meta as any).env.VITE_BASE_SEPOLIA_RPC ||
          'https://base-sepolia.g.alchemy.com/v2/wY-wCVXDnFCO_NWLr8aC5';

        try {
          await eth.request({
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

  return {
    address: activeAddress,
    isReadOnly: !activeAddress,
    hasFarcasterWallet: !!custodyAddress,
    hasBaseEnv,
    chainId,
    isBaseSepolia: chainId === BASE_SEPOLIA_DECIMAL,
    switchToBaseSepolia,
    connectBaseWallet,
  };
};
