import { createPublicClient, createWalletClient, http, custom } from 'viem';
import type { Chain } from 'viem';
import { baseSepoliaChain, baseMainnetChain } from './chain';

const sepoliaRpcUrl =
  (import.meta as any).env.VITE_BASE_SEPOLIA_RPC || 'https://sepolia.base.org';

const mainnetRpcUrl =
  (import.meta as any).env.VITE_BASE_MAINNET_RPC || 'https://mainnet.base.org';

export const publicClient = createPublicClient({
  chain: baseSepoliaChain as Chain,
  transport: http(sepoliaRpcUrl),
});

export const publicMainnetClient = createPublicClient({
  chain: baseMainnetChain as Chain,
  transport: http(mainnetRpcUrl),
});

export const createSignalWalletClient = (chainId?: number) => {
  if (typeof window === 'undefined') return null;
  const anyWindow = window as any;
  if (!anyWindow.ethereum) return null;
  
  const targetChain = chainId === 8453 ? baseMainnetChain : baseSepoliaChain;

  return createWalletClient({
    chain: targetChain as Chain,
    transport: custom(anyWindow.ethereum),
  });
};
