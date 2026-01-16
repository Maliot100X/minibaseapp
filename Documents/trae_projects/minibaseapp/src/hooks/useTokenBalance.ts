import { useState, useEffect } from 'react';
import { publicClient } from '../config/client';
import { SIGNAL_TOKEN_ADDRESS, signalAbi } from '../config/contracts';
import { formatUnits } from 'viem';

export const useTokenBalance = (address: string | null) => {
  const [balance, setBalance] = useState<string>('0');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = async () => {
    if (!address) return;
    setLoading(true);
    try {
      const data = await publicClient.readContract({
        address: SIGNAL_TOKEN_ADDRESS,
        abi: signalAbi,
        functionName: 'balanceOf',
        args: [address as `0x${string}`],
      });
      setBalance(formatUnits(data, 18)); // Assuming 18 decimals, can verify with decimals()
      setError(null);
    } catch (err) {
      console.error(err);
      setError('Failed to fetch balance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBalance();
    const interval = setInterval(fetchBalance, 10000); // Refresh every 10s
    return () => clearInterval(interval);
  }, [address]);

  return { balance, loading, error, refetch: fetchBalance };
};
