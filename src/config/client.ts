import { createPublicClient, http } from 'viem';
import { base } from 'viem/chains';

export const publicClient = createPublicClient({
  chain: base,
  transport: http(
    import.meta.env.VITE_BASE_MAINNET_RPC || 'https://mainnet.base.org'
  ),
});
