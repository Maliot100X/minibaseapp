import { useState } from 'react';
import { createSignalWalletClient, publicClient, publicSepoliaClient } from '../lib/wagmi';
import { useWallet } from './useWallet';

interface TxState {
  hash: `0x${string}` | null;
  loading: boolean;
  error: string | null;
}

type ExecuteFn = (walletClient: any, account: `0x${string}`) => Promise<`0x${string}`>;

export const useTx = () => {
  const { chainId } = useWallet();
  const [state, setState] = useState<TxState>({
    hash: null,
    loading: false,
    error: null,
  });

  const sendTx = async (execute: ExecuteFn) => {
    setState((s) => ({ ...s, loading: true, error: null, hash: null }));

    try {
      const walletClient = createSignalWalletClient(chainId || undefined);
      if (!walletClient) {
        throw new Error('Wallet not available');
      }

      const [account] = await walletClient.requestAddresses();

      const hash = await execute(walletClient, account);
      
      // Use Sepolia client if explicitly on Sepolia, otherwise default to Mainnet
      const client = chainId === 84532 ? publicSepoliaClient : publicClient;
      const receipt = await client.waitForTransactionReceipt({ hash });

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

