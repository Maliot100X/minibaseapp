import { useState } from 'react';
// import { createWalletClient, custom } from 'viem';
// import { baseSepolia } from 'viem/chains';
// import { SIGNAL_TOKEN_ADDRESS, signalAbi } from '../config/contracts';
// import { publicClient } from '../config/client';

export const useSwapPoints = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  const swap = async (points: string) => {
    void points;
    setLoading(true);
    setError(null);
    setTxHash(null);

    try {
        // Legacy hook, disabling logic to pass build. Use Swap.tsx instead.
        throw new Error("Use Swap.tsx");
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Swap failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { swap, loading, error, txHash };
};
