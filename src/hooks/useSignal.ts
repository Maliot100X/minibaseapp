import { useEffect, useState } from 'react';
import { SIGNAL_ADDRESS, signalAbi } from '../lib/contracts';
import { publicClient } from '../lib/wagmi';
import { formatUnits } from 'viem';

interface SignalState {
  balance: bigint;
  decimals: number;
}

const empty: SignalState = {
  balance: 0n,
  decimals: 18,
};

export const useSignal = (address: string | null) => {
  const [state, setState] = useState<SignalState>(empty);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSignal = async () => {
      if (!address) {
        setState(empty);
        setError(null);
        return;
      }

      setLoading(true);
      try {
        const user = address as `0x${string}`;

        const balance = await publicClient.readContract({
          address: SIGNAL_ADDRESS,
          abi: signalAbi,
          functionName: 'balanceOf',
          args: [user],
          blockTag: 'latest',
        }) as bigint;

        let decimals = 18;
        try {
          const raw = await publicClient.readContract({
            address: SIGNAL_ADDRESS,
            abi: signalAbi as any,
            functionName: 'decimals',
            blockTag: 'latest',
          });
          decimals = Number(raw);
        } catch {
          decimals = 18;
        }

        setState({ balance, decimals });
        setError(null);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Failed to load SIGNAL balance');
      } finally {
        setLoading(false);
      }
    };

    fetchSignal();
  }, [address]);

  const formatted = formatUnits(state.balance, state.decimals);

  return {
    ...state,
    loading,
    error,
    formatted,
  };
};

