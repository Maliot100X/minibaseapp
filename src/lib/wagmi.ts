import { createPublicClient, createWalletClient, http, custom } from 'viem';
import type { Chain } from 'viem';
import { baseSepoliaChain } from './chain';

const rpcUrl =
  (import.meta as any).env.VITE_BASE_SEPOLIA_RPC || 'https://sepolia.base.org';

export const publicClient = createPublicClient({
  chain: baseSepoliaChain as Chain,
  transport: http(rpcUrl),
});

export const createSignalWalletClient = () => {
  if (typeof window === 'undefined') return null;
  const anyWindow = window as any;
  if (!anyWindow.ethereum) return null;
  return createWalletClient({
    chain: baseSepoliaChain as Chain,
    transport: custom(anyWindow.ethereum),
  });
};
