import { createPublicClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';

export const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(
    import.meta.env.VITE_BASE_SEPOLIA_RPC || 'https://sepolia.base.org'
  ),
});
