import { createPublicClient, http } from 'viem';
import { baseSepolia } from 'viem/chains';

export const publicClient = createPublicClient({
  chain: baseSepolia,
  transport: http(
    import.meta.env.VITE_BASE_SEPOLIA_RPC || 'https://base-sepolia.g.alchemy.com/v2/wY-wCVXDnFCO_NWLr8aC5'
  ),
});
