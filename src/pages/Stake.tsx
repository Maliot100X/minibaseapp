import React, { useMemo, useState } from 'react';
import { Lock, TrendingUp, ShieldCheck } from 'lucide-react';
import { useWallet } from '../hooks/useWallet';
import { useTokenBalance } from '../hooks/useTokenBalance';
import { useAppStore } from '../state/appStore';
import { createWalletClient, custom, parseUnits } from 'viem';
import { baseSepolia } from 'viem/chains';
import { SIGNAL_TOKEN_ADDRESS, STAKING_VAULT_ADDRESS, signalAbi } from '../config/contracts';
import { publicClient } from '../config/client';

const Stake: React.FC = () => {
  const { address, isBaseSepolia, switchToBaseSepolia } = useWallet();
  const { balance, refetch } = useTokenBalance(address);
  const isStaked = useAppStore((s) => s.isStaked);
  const stakeMultiplier = useAppStore((s) => s.stakeMultiplier);
  const stakeUnlockTime = useAppStore((s) => s.stakeUnlockTime);
  const setStaked = useAppStore((s) => s.setStaked);

  const [loading, setLoading] = useState(false);
  const [txHash, setTxHash] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState<'idle' | 'approving' | 'staking'>('idle');
  const [amountInput, setAmountInput] = useState('100');
  const [lockDays, setLockDays] = useState<7 | 14 | 21>(7);

  const parsedAmount = useMemo(() => parseFloat(amountInput || '0'), [amountInput]);

  const computedMultiplier = useMemo(() => {
    if (lockDays === 7) return 1.1;
    if (lockDays === 14) return 1.25;
    if (lockDays === 21) return 1.5;
    return 1;
  }, [lockDays]);

  const unlockDate = useMemo(() => {
    const base = isStaked && stakeUnlockTime ? new Date(stakeUnlockTime) : new Date(Date.now() + lockDays * 24 * 60 * 60 * 1000);
    return base.toLocaleDateString();
  }, [isStaked, stakeUnlockTime, lockDays]);

  const handleStake = async () => {
    if (!address || !window.ethereum || !isBaseSepolia) return;
    if (!parsedAmount || parsedAmount <= 0) return;

    setLoading(true);
    setError(null);
    setTxHash(null);
    setStep('approving');

    try {
      const client = createWalletClient({
        chain: baseSepolia,
        transport: custom(window.ethereum),
      });

      const [account] = await client.requestAddresses();
      const amountWei = parseUnits(amountInput, 18);

      // 1. Approve
      const approveHash = await client.writeContract({
        address: SIGNAL_TOKEN_ADDRESS,
        abi: signalAbi,
        functionName: 'approve',
        args: [STAKING_VAULT_ADDRESS as `0x${string}`, amountWei],
        account,
      });

      await publicClient.waitForTransactionReceipt({ hash: approveHash });

      setStep('staking');

      // 2. Transfer (Stake)
      const transferHash = await client.writeContract({
        address: SIGNAL_TOKEN_ADDRESS,
        abi: signalAbi,
        functionName: 'transfer',
        args: [STAKING_VAULT_ADDRESS as `0x${string}`, amountWei],
        account,
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash: transferHash });

      if (receipt.status === 'success') {
        const now = Date.now();
        const unlockTime = now + lockDays * 24 * 60 * 60 * 1000;
        setTxHash(transferHash);
        setStaked(true, parsedAmount, computedMultiplier, unlockTime);
        refetch();
      } else {
        throw new Error("Staking transaction failed");
      }
    } catch (e: any) {
      console.error(e);
      setError(e.message || "Staking failed");
    } finally {
      setLoading(false);
      setStep('idle');
    }
  };

  return (
    <div className="flex flex-col items-center pt-safe px-4 pb-safe min-h-[80vh] space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-[20px] font-semibold">Staking Vault</h1>
        <p className="text-xs text-gray-400">
          Lock SIGNAL to boost your mining rate.
        </p>
      </div>

      <div className="w-full max-w-sm space-y-4">
        {!isBaseSepolia && (
          <div className="bg-yellow-900/40 border border-yellow-700 rounded-lg p-3 text-xs flex items-center justify-between">
            <span>Wrong network. Switch to Base Sepolia to stake.</span>
            <button
              type="button"
              onClick={switchToBaseSepolia}
              className="ml-3 px-3 py-1 bg-yellow-500 text-black text-[11px] font-semibold rounded"
            >
              Switch
            </button>
          </div>
        )}

        <div className={`p-6 rounded-xl border ${isStaked ? 'bg-blue-900/20 border-blue-500' : 'bg-gray-900 border-gray-800'} relative overflow-hidden`}>
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Lock size={64} />
          </div>
          
          <div className="relative z-10">
             <div className="text-sm text-gray-400 mb-1">Status</div>
             <div className={`text-2xl font-bold ${isStaked ? 'text-blue-400' : 'text-gray-500'}`}>
               {isStaked ? 'Active Staker' : 'Not Staked'}
             </div>
             {isStaked && (
               <div className="mt-4 flex items-center space-x-2 text-green-400 text-sm font-mono">
                 <TrendingUp size={16} />
                 <span>{stakeMultiplier.toFixed(2)}x Multiplier Active</span>
               </div>
             )}
          </div>
        </div>

        {!isStaked ? (
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 space-y-6">
            <div>
              <div className="flex justify-between items-center mb-2">
                 <span className="text-sm font-bold text-white">Stake SIGNAL</span>
                 <span className="text-xs text-gray-400">Bal: {parseFloat(balance || '0').toFixed(2)}</span>
              </div>
              <div className="text-xs text-gray-500">
                Choose lock period and amount to set multiplier.
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <div className="text-xs text-gray-400 mb-1">Amount</div>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={amountInput}
                  onChange={(e) => setAmountInput(e.target.value)}
                  className="w-full bg-black/40 border border-gray-700 rounded px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <div className="text-xs text-gray-400 mb-2">Lock Period</div>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setLockDays(7)}
                    className={`text-xs py-2 rounded border ${
                      lockDays === 7 ? 'bg-blue-600 border-blue-500 text-white' : 'bg-black/40 border-gray-700 text-gray-300'
                    }`}
                  >
                    7d
                  </button>
                  <button
                    type="button"
                    onClick={() => setLockDays(14)}
                    className={`text-xs py-2 rounded border ${
                      lockDays === 14 ? 'bg-blue-600 border-blue-500 text-white' : 'bg-black/40 border-gray-700 text-gray-300'
                    }`}
                  >
                    14d
                  </button>
                  <button
                    type="button"
                    onClick={() => setLockDays(21)}
                    className={`text-xs py-2 rounded border ${
                      lockDays === 21 ? 'bg-blue-600 border-blue-500 text-white' : 'bg-black/40 border-gray-700 text-gray-300'
                    }`}
                  >
                    21d
                  </button>
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>Multiplier</span>
                <span>{computedMultiplier.toFixed(2)}x</span>
              </div>
              <div className="flex justify-between text-xs text-gray-400">
                <span>Unlock Date</span>
                <span>{unlockDate}</span>
              </div>
            </div>

            <button
              onClick={handleStake}
              disabled={
                loading ||
                !address ||
                !isBaseSepolia ||
                parsedAmount <= 0 ||
                parseFloat(balance || '0') < parsedAmount
              }
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              {loading ? (
                <span>{step === 'approving' ? 'Approving...' : 'Staking...'}</span>
              ) : (
                <>
                  <Lock size={18} />
                  <span>Stake Now</span>
                </>
              )}
            </button>

          </div>
        ) : (
          <div className="bg-gray-900 p-6 rounded-xl border border-gray-800 text-center space-y-4">
             <ShieldCheck size={48} className="mx-auto text-green-500" />
             <div>
               <h3 className="text-white font-bold">Staking Active</h3>
               <p className="text-xs text-gray-400 mt-1">
                 Your mining and swap rate use this multiplier.
               </p>
             </div>
             <div className="p-3 bg-black/50 rounded-lg text-xs text-gray-500">
               Unlock Date: {stakeUnlockTime ? new Date(stakeUnlockTime).toLocaleDateString() : unlockDate}
             </div>
          </div>
        )}

        {error && (
          <div className="text-center text-xs text-red-400 bg-red-900/20 p-2 rounded">
            {error}
          </div>
        )}

        {txHash && (
          <div className="text-center text-xs text-green-400 bg-green-900/20 p-2 rounded break-all">
             Success! Tx: {txHash}
          </div>
        )}
      </div>
    </div>
  );
};

export default Stake;
