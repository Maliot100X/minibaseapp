import { useState } from 'react';
import { createSignalWalletClient, publicClient } from '../lib/wagmi';

interface TxState {
  hash: `0x${string}` | null;
  loading: boolean;
  error: string | null;
}

type ExecuteFn = (walletClient: any, account: `0x${string}`) => Promise<`0x${string}`>;

export const useTx = () => {
  const [state, setState] = useState<TxState>({
    hash: null,
    loading: false,
    error: null,
  });

  const sendTx = async (execute: ExecuteFn) => {
    setState((s) => ({ ...s, loading: true, error: null, hash: null }));

    try {
      const walletClient = createSignalWalletClient();
      if (!walletClient) {
        throw new Error('Wallet not available');
      }

      const [account] = await walletClient.requestAddresses();

      const hash = await execute(walletClient, account);
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      if (receipt.status !== 'success') {
        throw new Error('Transaction failed');
      }

      setState({ hash, loading: false, error: null });
      return hash;
    } catch (err: any) {
      console.error(err);
      setState({ hash: null, loading: false, error: err.message || 'Transaction failed' });
      throw err;
    }
  };

  return {
    ...state,
    sendTx,
  };
};

