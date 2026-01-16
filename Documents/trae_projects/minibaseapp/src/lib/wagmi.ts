import { createPublicClient, createWalletClient, http, custom } from 'viem';
import type { Chain } from 'viem';
import { baseSepoliaChain } from './chain';

const rpcUrl =
  (import.meta as any).env.VITE_BASE_SEPOLIA_RPC ||
  'https://base-sepolia.g.alchemy.com/v2/wY-wCVXDnFCO_NWLr8aC5';

export const publicClient = createPublicClient({
  chain: baseSepoliaChain as Chain,
  transport: http(rpcUrl),
});

export const createSignalWalletClient = () =>
  typeof window !== 'undefined' && (window as any).ethereum
    ? createWalletClient({
        chain: baseSepoliaChain as Chain,
        transport: custom((window as any).ethereum),
      })
    : null;
