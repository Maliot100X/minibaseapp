import React, { useState } from 'react';
import { ArrowRightLeft, ExternalLink } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { useTokenBalance } from '../hooks/useTokenBalance';
import { useAppStore } from '../state/appStore';
import { createWalletClient, custom, parseUnits } from 'viem';
import { baseSepolia } from 'viem/chains';
import { SIGNAL_TOKEN_ADDRESS, signalAbi } from '../config/contracts';
import { publicClient } from '../config/client';

const Swap: React.FC = () => {
  const { address, isBaseSepolia, switchToBaseSepolia } = useWallet();
  const { balance, refetch } = useTokenBalance(address);
  const points = useAppStore((s) => s.points);
  const deductPoints = useAppStore((s) => s.deductPoints);
  const stakeMultiplier = useAppStore((s) => s.stakeMultiplier);

  const [amountToSwap, setAmountToSwap] = useState<string>('1000');
  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const parsedAmount = parseInt(amountToSwap || '0');
  const baseSignalOut = Math.floor(parsedAmount / 1000) * 100;
  const signalOut = Math.floor(baseSignalOut * (stakeMultiplier || 1));
  const isMultipleOfThousand = parsedAmount > 0 && parsedAmount % 1000 === 0;
  const hasEnoughPoints = points >= parsedAmount;
  const hasTreasuryBalance = (() => {
    const bal = parseFloat(balance || '0');
    return bal >= signalOut;
  })();
  const canSwap =
    !!address &&
    isBaseSepolia &&
    isMultipleOfThousand &&
    hasEnoughPoints &&
    parsedAmount >= 1000 &&
    hasTreasuryBalance;

  const handleSwap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address || !window.ethereum || !canSwap || !isBaseSepolia) return;

    setLoading(true);
    setError(null);
    setTxHash(null);

    const swapAmount = parsedAmount;

    try {
      // 1. Burn points locally
      deductPoints(swapAmount);

      // 2. Call ERC20.transfer from distributor wallet to user
      const client = createWalletClient({
        chain: baseSepolia,
        transport: custom(window.ethereum),
      });

      const [distributor] = await client.requestAddresses();
      const amountWei = parseUnits(signalOut.toString(), 18);

      const hash = await client.writeContract({
        address: SIGNAL_TOKEN_ADDRESS,
        abi: signalAbi,
        functionName: 'transfer',
        args: [address as `0x${string}`, amountWei],
        account: distributor,
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      if (receipt.status === 'success') {
        setTxHash(hash);
        refetch();
        // Record swap in local storage for Profile
        const currentTotal = localStorage.getItem('totalSwapped') || '0';
        const newTotal = parseFloat(currentTotal) + signalOut;
        localStorage.setItem('totalSwapped', newTotal.toString());
      } else {
        throw new Error('Transaction failed');
      }
    } catch (e: any) {
      console.error(e);
      setError(e.message || 'Swap failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center pt-safe px-4 pb-safe min-h-[80vh] space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-[20px] font-semibold">Swap Points</h1>
        <p className="text-xs text-gray-400">
          Exchange your hard-earned points for SIGNAL tokens.
        </p>
      </div>

      <div className="w-full max-w-sm bg-gray-900 p-6 rounded-xl border border-gray-800 space-y-6">
        {!isBaseSepolia && (
          <div className="bg-yellow-900/40 border border-yellow-700 text-yellow-200 text-xs rounded-lg p-3 flex items-center justify-between">
            <span>Wrong network. Please switch to Base Sepolia to swap.</span>
            <button
              type="button"
              onClick={switchToBaseSepolia}
              className="ml-3 px-3 py-1 bg-yellow-500 text-black text-[11px] font-semibold rounded"
            >
              Switch
            </button>
          </div>
        )}

        {/* Balance Info */}
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-400">Available Points</span>
          <span className="font-mono font-bold text-white">{Math.floor(points).toLocaleString()} PTS</span>
        </div>

        {/* Input */}
        <div className="space-y-2">
          <label className="text-[12px] text-gray-500 uppercase tracking-wider">Amount to Swap</label>
          <div className="relative">
            <input
              type="number"
              value={amountToSwap}
              onChange={(e) => setAmountToSwap(e.target.value)}
              step="1000"
              min="1000"
              className="w-full bg-black border border-gray-700 rounded-lg p-3 text-white focus:border-blue-500 outline-none pr-16 font-mono"
            />
            <span className="absolute right-3 top-3 text-gray-500 font-bold text-sm">PTS</span>
          </div>
          <div className="text-[10px] text-gray-500">
            Must be a multiple of 1000.
          </div>
        </div>

        {/* Output Estimate */}
        <div className="bg-gray-800/50 p-4 rounded-lg border border-gray-700 flex justify-between items-center">
          <span className="text-sm text-gray-400">You Receive</span>
          <div className="text-xl font-bold text-blue-400 font-mono">
            {signalOut} <span className="text-sm text-gray-500">SIGNAL</span>
          </div>
        </div>

        <button
          onClick={handleSwap}
          disabled={loading || !canSwap || !address}
          className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          {loading ? (
            <span>Swapping...</span>
          ) : (
            <>
              <ArrowRightLeft size={18} />
              <span>Swap Now</span>
            </>
          )}
        </button>

        {error && (
          <div className="text-center text-xs text-red-400 bg-red-900/20 p-2 rounded">
            {error}
          </div>
        )}

        {txHash && (
          <div className="text-center text-xs text-green-400 bg-green-900/20 p-2 rounded break-all">
            <div>Swap Complete!</div>
            <a
              href={`https://sepolia.basescan.org/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 underline mt-1"
            >
              <span>View on BaseScan</span>
              <ExternalLink size={12} />
            </a>
          </div>
        )}

        <div className="text-center text-[10px] text-gray-500">Rate: 1000 PTS = 100 SIGNAL</div>
      </div>
    </div>
  );
};

export default Swap;
